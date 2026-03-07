#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
import list from './git-confluence-space-list'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('space')
        .description('Commands for working with Confluence spaces')
        .addCommand(list())
        .action(() => program.help())
    return program
}

export default create

if (isMain('git-confluence-space')) {
    await create().parseAsync(Bun.argv)
}
