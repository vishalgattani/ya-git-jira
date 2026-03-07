#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { getJobLog } from '../lib/gitlab'
import { isMain } from '../lib/is_main'

const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('log')
        .description('Download a job log')
        .requiredOption('-j, --job <id>', 'Job ID')
        .option('-t, --tail <lines>', 'Show only the last N lines')
        .action(async (options) => {
            const jobId = parseInt(options.job, 10)
            if (isNaN(jobId)) {
                console.error(`Invalid job ID: ${options.job}`)
                process.exit(1)
            }
            const log = await getJobLog(jobId)
            if (!log) {
                console.error(`No log output for job ${jobId}`)
                process.exit(1)
            }
            if (options.tail) {
                const n = parseInt(options.tail, 10)
                if (isNaN(n)) {
                    console.error(`Invalid --tail value: ${options.tail}`)
                    process.exit(1)
                }
                const lines = log.split('\n')
                const tail = lines.slice(-n)
                process.stdout.write(tail.join('\n'))
            } else {
                process.stdout.write(log)
            }
        })
    return program
}

export default create

if (isMain('git-lab-project-pipeline-log')) {
    await create().parseAsync(Bun.argv)
}
