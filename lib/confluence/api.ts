import type { JSONValue } from '../json'
import { getConfluenceConfig } from './config'

function getNextLink(link: string | null): string | undefined {
    if (!link) {
        return undefined
    }
    const regex = /<([^>]+)>; rel="next"/
    const match = link.match(regex)
    const next = match ? match[1] : undefined
    return next
}

export async function confluenceApi(endpoint: string): Promise<JSONValue> {
    if (endpoint.startsWith('/')) {
        console.warn(`confluenceApi: endpoint ${endpoint} starts with /, removing it`)
        endpoint = endpoint.slice(1)
    }
    const method = 'GET'
    const { host, token } = await getConfluenceConfig()
    const base = `https://${host}/wiki/api/v2`
    const uri = `${base}/${endpoint}`
    const auth = `Basic ${token}`
    const headers = new Headers()
    headers.append('Authorization', auth)
    headers.append('Accept', 'application/json')
    const options = {
        method,
        headers,
    }
    let request = new Request(uri, options)
    const response = await fetch(request)
    let link = getNextLink(response.headers.get('Link'))
    const body = await response.json() as JSONValue & { results?: Array<JSONValue> }
    if (!body.results) {
        return body
    }
    let result: Array<JSONValue> = body.results
    const origin = `https://${host}`
    while (link) {
        const url = link.startsWith('/') ? `${origin}${link}` : link
        let request = new Request(url, options)
        const next_response = await fetch(request)
        link = getNextLink(next_response.headers.get('Link'))
        const next_body = await next_response.json() as JSONValue & { results?: Array<JSONValue> }
        if (next_body.results) {
            result = result.concat(next_body.results)
        }
    }
    return result
}

export async function confluenceApiWrite(endpoint: string, method: string, body: JSONValue): Promise<JSONValue> {
    if (endpoint.startsWith('/')) {
        console.warn(`confluenceApiWrite: endpoint ${endpoint} starts with /, removing it`)
        endpoint = endpoint.slice(1)
    }
    const { host, token } = await getConfluenceConfig()
    const base = `https://${host}/wiki/api/v2`
    const uri = `${base}/${endpoint}`
    const auth = `Basic ${token}`
    const headers = new Headers()
    headers.append('Authorization', auth)
    headers.append('Accept', 'application/json')
    headers.append('Content-Type', 'application/json')
    const options = {
        method,
        headers,
        body: JSON.stringify(body),
    }
    const request = new Request(uri, options)
    const response = await fetch(request)
    if (!response.ok) {
        const text = await response.text()
        throw new Error(`Confluence API ${method} ${endpoint} failed (${response.status}): ${text}`)
    }
    const result = await response.json()
    return result
}

export async function confluenceSearch(cql: string): Promise<JSONValue> {
    const { host, token } = await getConfluenceConfig()
    const base = `https://${host}/wiki/rest/api`
    const auth = `Basic ${token}`
    const headers = new Headers()
    headers.append('Authorization', auth)
    headers.append('Accept', 'application/json')
    const options = { method: 'GET', headers }
    const origin = `https://${host}`

    let uri = `${base}/search?cql=${encodeURIComponent(cql)}&limit=25`
    let allResults: Array<JSONValue> = []

    while (uri) {
        const request = new Request(uri, options)
        const response = await fetch(request)
        const body = await response.json() as JSONValue & {
            results?: Array<JSONValue>
            _links?: { next?: string }
        }
        if (body.results) {
            allResults = allResults.concat(body.results)
        }
        const next = body._links?.next
        uri = next ? (next.startsWith('/') ? `${origin}${next}` : next) : ''
    }

    return allResults
}

export async function confluenceApiV1(endpoint: string): Promise<JSONValue> {
    if (endpoint.startsWith('/')) {
        console.warn(`confluenceApiV1: endpoint ${endpoint} starts with /, removing it`)
        endpoint = endpoint.slice(1)
    }
    const method = 'GET'
    const { host, token } = await getConfluenceConfig()
    const base = `https://${host}/wiki/rest/api`
    const uri = `${base}/${endpoint}`
    const auth = `Basic ${token}`
    const headers = new Headers()
    headers.append('Authorization', auth)
    headers.append('Accept', 'application/json')
    const options = {
        method,
        headers,
    }
    const request = new Request(uri, options)
    const response = await fetch(request)
    const result = await response.json()
    return result
}
