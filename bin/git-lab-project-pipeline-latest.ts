#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { getLatestPipeline, type Pipeline, getPipelineJobs, type Job } from '../lib/gitlab'
import { isMain } from '../lib/is_main'

const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('latest')
        .description('Show jobs for the latest pipeline on the current branch')
        .option('-v, --verbose', 'Verbose output')
        .action(async (options) => {
            const pipeline: Pipeline | undefined = await getLatestPipeline()
            if (!pipeline) {
                console.error('No pipeline found for the current branch')
                process.exit(1)
            }
            const { id, status, ref, web_url } = pipeline
            console.log(JSON.stringify({ id, status, ref, web_url }, null, 2))
            const jobs: Array<Job> = await getPipelineJobs(pipeline.id)
            if (!jobs || jobs.length === 0) {
                console.error(`No jobs found for pipeline ${pipeline.id}`)
                process.exit(1)
            }
            if (options.verbose) {
                console.log(JSON.stringify(jobs, null, 2))
            } else {
                const filtered = jobs.map((j: Job) => {
                    const { id, name, stage, status, duration, failure_reason } = j
                    return { id, name, stage, status, duration, failure_reason }
                })
                console.log(JSON.stringify(filtered, null, 2))
            }
        })
    return program
}

export default create

if (isMain('git-lab-project-pipeline-latest')) {
    await create().parseAsync(Bun.argv)
}
