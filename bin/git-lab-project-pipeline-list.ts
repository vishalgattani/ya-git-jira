#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { getProjectPipelines, type Pipeline } from "../lib/gitlab"
import { runMain } from '../lib/is_main'
import debug from 'debug'

const version = await getPackageVersion()
const dlog = debug('git-lab-project-pipeline-list')

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('list')
        .description('List recent successful pipelines')
        .option('-v, --verbose', 'Verbose output')
        .option('-d, --days <days>', 'Number of days to look back', '7')
        .option('-s, --status <status>', 'Status of pipelines to list: success | runnning | ', 'success')
        .action(async (options) => {
            const pipelines: Array<Pipeline> = await getProjectPipelines(options)
            dlog(`pipelines:`, pipelines)
            if (!pipelines) {
                console.error(`No pipelines!`)
                process.exit(1)
            }
            if (options.verbose) {
                console.log(JSON.stringify(pipelines, null, 2))
            }
            else {
                let filtered = pipelines.map((p: Pipeline) => {
                    const { id, web_url, updated_at, ref, sha } = p
                    return { id, web_url, updated_at, ref, sha }
                })
                console.log(JSON.stringify(filtered, null, 2))
            }
        })
    return program
}

export default create

await runMain('git-lab-project-pipeline-list', create)
