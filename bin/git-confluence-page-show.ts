#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { confluenceApi } from '../lib/confluence'
import { getConfluenceConfig } from '../lib/confluence'
import type { Page } from '../lib/confluence'
import { isMain } from '../lib/is_main'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('show')
        .description('Show information about a Confluence page')
        .argument('id', 'Page ID')
        .option('-v, --verbose', 'Verbose output')
        .action(async (id: string, options) => {
            const page = await confluenceApi(`pages/${id}`) as Page
            if (options.verbose) {
                console.log(page)
            } else {
                const { host } = await getConfluenceConfig()
                const url = `https://${host}/wiki/spaces/${page.spaceId}/pages/${page.id}`
                console.log({ id: page.id, title: page.title, spaceId: page.spaceId, url })
            }
        })
    return program
}

export default create

if (isMain('git-confluence-page-show')) {
    await create().parseAsync(Bun.argv)
}
