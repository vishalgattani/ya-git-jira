import type { JSONValue } from './json'
import { getGitlabConfig } from './gitlab/config'
import { getJiraConfig } from './jira'
import { getConfluenceConfig } from './confluence/config'

export interface ApiResponse {
    status: number
    headers: Headers
    body: JSONValue
}

interface ServiceDef {
    getConfig: () => Promise<{ host: string; token: string }>
    basePath: string
    authHeader: (token: string) => [string, string]
}

const services: Record<string, ServiceDef> = {
    gitlab: {
        getConfig: getGitlabConfig,
        basePath: '/api/v4',
        authHeader: (token) => ['Private-Token', token],
    },
    jira: {
        getConfig: getJiraConfig,
        basePath: '/rest/api/3',
        authHeader: (token) => ['Authorization', `Basic ${token}`],
    },
    confluence: {
        getConfig: getConfluenceConfig,
        basePath: '/wiki/api/v2',
        authHeader: (token) => ['Authorization', `Basic ${token}`],
    },
}

export const serviceNames = Object.keys(services)

export function getService(name: string): ServiceDef {
    const svc = services[name]
    if (!svc) {
        throw new Error(`Unknown service: ${name}. Expected one of: ${serviceNames.join(', ')}`)
    }
    return svc
}

export interface RequestOptions {
    raw?: boolean
    data?: string
}

export async function apiRequest(
    serviceName: string,
    method: string,
    endpoint: string,
    options?: RequestOptions,
): Promise<ApiResponse> {
    const svc = getService(serviceName)
    const { host, token } = await svc.getConfig()
    const [headerName, headerValue] = svc.authHeader(token)

    let path = endpoint
    if (path.startsWith('/')) {
        path = path.slice(1)
    }

    let url: string
    if (options?.raw) {
        url = `https://${host}/${path}`
    } else {
        url = `https://${host}${svc.basePath}/${path}`
    }

    const headers = new Headers()
    headers.append(headerName, headerValue)
    headers.append('Accept', 'application/json')

    const fetchOptions: RequestInit = { method, headers }
    if (options?.data) {
        headers.append('Content-Type', 'application/json')
        fetchOptions.body = options.data
    }

    const request = new Request(url, fetchOptions)
    const response = await fetch(request)

    if (!response.ok) {
        const text = await response.text()
        let body: JSONValue
        try {
            body = JSON.parse(text) as JSONValue
        } catch {
            throw new Error(`${serviceName} API ${method} ${endpoint} failed (${response.status}): ${text}`)
        }
        return { status: response.status, headers: response.headers, body }
    }

    const body = await response.json() as JSONValue

    return {
        status: response.status,
        headers: response.headers,
        body,
    }
}

function getNextLink(link: string | null): string | undefined {
    if (!link) {
        return undefined
    }
    const regex = /<([^>]+)>; rel="next"/
    const match = link.match(regex)
    return match ? match[1] : undefined
}

export async function apiPaginate(
    serviceName: string,
    endpoint: string,
    options?: RequestOptions,
): Promise<ApiResponse> {
    const svc = getService(serviceName)
    const { host, token } = await svc.getConfig()
    const [headerName, headerValue] = svc.authHeader(token)

    let path = endpoint
    if (path.startsWith('/')) {
        path = path.slice(1)
    }

    let url: string
    if (options?.raw) {
        url = `https://${host}/${path}`
    } else {
        url = `https://${host}${svc.basePath}/${path}`
    }

    const headers = new Headers()
    headers.append(headerName, headerValue)
    headers.append('Accept', 'application/json')
    const fetchOptions = { method: 'GET', headers }

    const origin = `https://${host}`
    let allResults: Array<JSONValue> = []
    let lastStatus = 0
    let lastHeaders: Headers = new Headers()

    while (url) {
        const request = new Request(url, fetchOptions)
        const response = await fetch(request)
        lastStatus = response.status
        lastHeaders = response.headers

        if (!response.ok) {
            const text = await response.text()
            let body: JSONValue
            try {
                body = JSON.parse(text) as JSONValue
            } catch {
                throw new Error(`${serviceName} API paginate ${endpoint} failed (${response.status}): ${text}`)
            }
            return { status: response.status, headers: response.headers, body }
        }

        const body = await response.json() as JSONValue

        // handle array responses (gitlab style)
        if (Array.isArray(body)) {
            allResults = allResults.concat(body)
        // handle envelope responses with .results (confluence style)
        } else if (body && typeof body === 'object' && 'results' in body) {
            const envelope = body as { results?: Array<JSONValue>; _links?: { next?: string } }
            if (Array.isArray(envelope.results)) {
                allResults = allResults.concat(envelope.results)
            }
            // confluence v1 pagination via _links.next
            const linksNext = envelope._links?.next
            if (linksNext) {
                url = linksNext.startsWith('/') ? `${origin}${linksNext}` : linksNext
                continue
            }
        } else {
            // single object response -- no pagination possible
            return { status: response.status, headers: response.headers, body }
        }

        // standard Link header pagination
        const nextLink = getNextLink(response.headers.get('Link'))
        if (nextLink) {
            url = nextLink.startsWith('/') ? `${origin}${nextLink}` : nextLink
        } else {
            url = ''
        }
    }

    return { status: lastStatus, headers: lastHeaders, body: allResults }
}
