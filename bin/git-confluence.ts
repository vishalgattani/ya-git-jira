#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { isMain } from '../lib/is_main'
import whoami from './git-confluence-whoami'
import space from './git-confluence-space'
import page from './git-confluence-page'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('confluence')
        .description('Commands for working with Confluence')
        .addCommand(whoami())
        .addCommand(space())
        .addCommand(page())
    return program
}

export default create

if (isMain('git-confluence')) {
    await create().parseAsync(Bun.argv)
}
