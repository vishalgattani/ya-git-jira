import { getConfig } from '../git'

export interface ConfluenceConfig {
    host: string
    token: string
}

const gitEmailP = getConfig('user.email')
const jiraEmailP = getConfig('jira.user')
const confluenceEmailP = getConfig('confluence.user', { expectQuiet: true })
const jiraHostP = getConfig('jira.host')
const confluenceHostP = getConfig('confluence.host', { expectQuiet: true })
const jiraTokenP = getConfig('jira.token')
const confluenceTokenP = getConfig('confluence.token', { expectQuiet: true })

export async function getConfluenceConfig(): Promise<ConfluenceConfig> {
    const host = await confluenceHostP || await jiraHostP
    if (!host) throw new Error('confluence.host or jira.host not in git config (see: gitj confluence --help)')
    const user = await confluenceEmailP || await jiraEmailP || await gitEmailP
    if (!user) throw new Error('confluence.user, jira.user, or user.email not in git config (see: gitj confluence --help)')
    const pat = await confluenceTokenP || await jiraTokenP
    if (!pat) throw new Error('confluence.token or jira.token not in git config (see: gitj confluence --help)')
    const token = Buffer.from(`${user}:${pat}`).toString('base64')
    return { host, token }
}
