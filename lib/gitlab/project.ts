import { getGitlabConfig } from "./config"
import { getRemote } from "../git"
import { gitlabApi } from "./api"
import { type JSONValue } from "../json"
import path from 'node:path'
import { dlog } from "./dlog"

export type Project = JSONValue & {
    id: number
    name: string
    path: string
    path_with_namespace: string
    visibility: string
    ssh_url_to_repo: string
}

export async function getProjects(match: string): Promise<Array<Project>> {
    let search = ''
    if (match) {
        const m = encodeURIComponent(match)
        search = `&search=${m}`
    }
    const projects = await gitlabApi(`projects?membership=true&simple=true${search}`)
    if (!projects) {
        throw new Error(`No projects!`)
    } else if (!Array.isArray(projects)) {
        console.log(projects)
        throw new Error(`Projects is not an array!`)
    }
    const projs = projects as Array<Project>

    const filtered = projs.filter((p: Project): boolean => {
        return p.path_with_namespace.toLowerCase().includes(match.toLowerCase())
    })
    return filtered
}

// git@gitlab.com:etagen-internal/linear-generator-config.git
export async function findProject(ssh_url: string): Promise<Project | undefined> {
    const parts = ssh_url.split(':')
    if (parts.length != 2) {
        throw new Error(`${ssh_url} is invalid, could not be split into two parts at :`)
    }
    const name = path.basename(parts[1], '.git')

    const projects = await getProjects(name) as Array<Project>
    const project = projects.find((p: Project): boolean => {
        return p.ssh_url_to_repo === ssh_url
    })
    return project
}

async function projectScopedRequest(endpoint: string): Promise<Response> {
    if (endpoint.startsWith("/")) {
        console.warn(`gitlabApi: endpoint ${endpoint} starts with /, removing it`)
        endpoint = endpoint.slice(1)
    }
    const method = "GET"
    const { host, token } = await getGitlabConfig()
    const remote = await getRemote()
    const project = await findProject(remote)
    if (!project) {
        throw new Error(`Could not find project for remote ${remote}`)
    }
    const base = `https://${host}/api/v4/projects/${project.id}`
    const sep = endpoint.includes('?') ? '&' : '?'
    const uri = `${base}/${endpoint}${sep}per_page=100`
    dlog(`projectScopedRequest uri: ${uri}`)
    const headers = new Headers()
    headers.append('Private-Token', token)
    const options = {
        method,
        headers,
    }
    const request = new Request(uri, options)
    return await fetch(request)
}

export async function projectScopedGet(endpoint: string): Promise<JSONValue> {
    const response = await projectScopedRequest(endpoint)
    return await response.json()
}

export async function projectScopedGetText(endpoint: string): Promise<string> {
    const response = await projectScopedRequest(endpoint)
    return await response.text()
}
