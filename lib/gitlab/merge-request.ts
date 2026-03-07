import { projectScopedGet } from './project'
import type { JSONValue } from '../json'
import { whoami } from './user'
import { gitlabApi } from './api'

export type MergeRequest = JSONValue & {
    id: number
    iid: number
    title : string
    description : string
    state : string
    draft: boolean
    source_branch: string
    target_branch: string
    web_url: string
    merge_status: string
    author: { username: string }
    labels: string[]
}

export async function getMergeRequest(id: string): Promise<MergeRequest> {
    return await projectScopedGet(`merge_requests/${id}`) as MergeRequest
}

export async function getMyMergeRequestsInProgress() : Promise<Array<MergeRequest>>
{
    const me = await whoami()
    return await gitlabApi(`merge_requests?state=opened&author_id=${me.id}`) as Array<MergeRequest>
}

export async function getMyMergeRequestsToReview() : Promise<Array<MergeRequest>>
{
    const me = await whoami()
    return await gitlabApi(`merge_requests?state=opened&reviewer_id=${me.id}`) as Array<MergeRequest>
}

/**
 * List open merge requests for a specific project and source branch.
 * @param projectPath - Full project path (e.g. "etagen-internal/eta-lib/base")
 * @param sourceBranch - Source branch name to filter on
 */
export async function getMergeRequestsByBranch(
    projectPath: string,
    sourceBranch: string,
): Promise<Array<MergeRequest>> {
    const project = encodeURIComponent(projectPath)
    const branch = encodeURIComponent(sourceBranch)
    return await gitlabApi(
        `projects/${project}/merge_requests?state=opened&source_branch=${branch}`
    ) as Array<MergeRequest>
}
