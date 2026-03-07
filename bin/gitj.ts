#!/usr/bin/env bun

// This is the root of the CLI. It's a proxy for git and not strictly
// necessary, but it's useful to have for testing
// It's job is to parse the first command
// from the command line and then call the appropriate subcommand.

import { Command } from 'commander'
import { formatCommandTree } from '../lib/help.ts'
import { getPackageVersion } from '../lib/package'
import api from './git-api'
import bump from './git-bump'
import confluence from './git-confluence'
import jira from './git-jira'
import lab from './git-lab'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .option('--help-all', 'Show full command tree')
        .addCommand(api())
        .addCommand(bump())
        .addCommand(confluence())
        .addCommand(jira())
        .addCommand(lab())
        .action(() => {
            if (program.opts().helpAll) {
                console.log(formatCommandTree(program))
                return
            }
            program.help()
        })
    return program
}

const command = create()
await command.parseAsync(Bun.argv)
