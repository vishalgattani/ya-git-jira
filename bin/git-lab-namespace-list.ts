#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { runMain } from '../lib/is_main'
import { getNamespaces } from '../lib/gitlab/namespace'

const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('list')
        .description('List namespaces for the current user')
        .action(async () => {
            const namespaces = await getNamespaces()
            console.log(JSON.stringify(namespaces, null, 2))
        })
    return program
}

export default create

await runMain('git-lab-namespace-list', create)
