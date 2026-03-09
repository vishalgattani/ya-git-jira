#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { getProjects, type Project } from "../lib/gitlab/project"
import { isMain } from '../lib/is_main'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('list')
        .description('List projects for current user')
        .option('-v, --verbose', 'Verbose output')
        .option('-m, --match <match>', 'Match projects with paths containing <match>')
        .action(async (options) => {
            const projects: Array<Project> = await getProjects(options.match)
            if (!projects) {
                console.error(`No projects!`)
                process.exit(1)
            }
            if (options.verbose) {
                console.log(JSON.stringify(projects, null, 2))
            }
            else {
                let filtered = projects.map((p: Project) => {
                    const { id, name, path_with_namespace, ssh_url_to_repo } = p
                    return { id, name, path_with_namespace, ssh_url_to_repo }
                })
                console.log(JSON.stringify(filtered, null, 2))
            }
        })
    return program
}

export default create

if (isMain('git-lab-project-list')) {
    await create().parseAsync(Bun.argv)
}
