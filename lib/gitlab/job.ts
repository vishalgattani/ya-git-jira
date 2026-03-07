import { dlog } from "./dlog"
import { projectScopedGet, projectScopedGetText } from "./project"
import type { JSONValue } from "../json"

export type Job = JSONValue & {
    id: number
    name: string
    status: string
    stage: string
    ref: string
    web_url: string
    duration: number | null
    finished_at: string | null
    failure_reason: string | null
    pipeline: { id: number }
}

export async function getPipelineJobs(pipelineId: number): Promise<Array<Job>> {
    dlog(`getPipelineJobs pipelineId: ${pipelineId}`)
    return await projectScopedGet(`pipelines/${pipelineId}/jobs`) as Array<Job>
}

export async function getJob(jobId: number): Promise<Job> {
    dlog(`getJob jobId: ${jobId}`)
    return await projectScopedGet(`jobs/${jobId}`) as Job
}

export async function getJobLog(jobId: number): Promise<string> {
    dlog(`getJobLog jobId: ${jobId}`)
    return await projectScopedGetText(`jobs/${jobId}/trace`)
}
