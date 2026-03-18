#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { getMergeRequestsByBranch, type MergeRequest } from "../lib/gitlab"
import { findProject } from '../lib/gitlab/project'
import { getRemote, getCurrentBranch } from '../lib/git'
import { runMain } from '../lib/is_main'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('list')
        .description('List open merge requests for a project and branch')
        .option('-v, --verbose', 'Verbose output')
        .option('-p, --project <path>', 'Project path (e.g. etagen-internal/eta-lib/base). Defaults to current directory remote.')
        .option('-b, --branch <branch>', 'Source branch to filter on. Defaults to current branch.')
        .action(async (options) => {
            let projectPath = options.project
            if (!projectPath) {
                const remote = await getRemote()
                const project = await findProject(remote)
                if (!project) {
                    console.error(`Could not resolve project from remote: ${remote}`)
                    process.exit(1)
                }
                projectPath = project.path_with_namespace
            }

            const branch = options.branch || await getCurrentBranch()

            const mrs: Array<MergeRequest> = await getMergeRequestsByBranch(projectPath, branch)
            if (!mrs.length) {
                console.error(`No open MRs for branch '${branch}' in ${projectPath}`)
                process.exit(0)
            }
            if (options.verbose) {
                console.log(JSON.stringify(mrs, null, 2))
            }
            else {
                const filtered = mrs.map(m => {
                    const { iid, title, web_url, source_branch, target_branch, state, draft } = m
                    return { iid, title, web_url, source_branch, target_branch, state, draft }
                })
                console.log(JSON.stringify(filtered, null, 2))
            }
        })
    return program
}

export default create

await runMain('git-lab-project-mr-list', create)
