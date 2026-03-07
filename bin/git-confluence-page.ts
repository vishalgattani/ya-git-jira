#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
import search from './git-confluence-page-search'
import show from './git-confluence-page-show'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('page')
        .description('Commands for working with Confluence pages')
        .addCommand(search())
        .addCommand(show())
        .action(() => program.help())
    return program
}

export default create

if (isMain('git-confluence-page')) {
    await create().parseAsync(Bun.argv)
}
