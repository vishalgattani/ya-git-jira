#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { getPipelineJobs, type Job } from '../lib/gitlab'
import { isMain } from '../lib/is_main'

const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('jobs')
        .description('List jobs for a pipeline')
        .requiredOption('-p, --pipeline <id>', 'Pipeline ID')
        .option('-v, --verbose', 'Verbose output')
        .action(async (options) => {
            const pipelineId = parseInt(options.pipeline, 10)
            if (isNaN(pipelineId)) {
                console.error(`Invalid pipeline ID: ${options.pipeline}`)
                process.exit(1)
            }
            const jobs: Array<Job> = await getPipelineJobs(pipelineId)
            if (!jobs || jobs.length === 0) {
                console.error(`No jobs found for pipeline ${pipelineId}`)
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

if (isMain('git-lab-project-pipeline-jobs')) {
    await create().parseAsync(Bun.argv)
}
