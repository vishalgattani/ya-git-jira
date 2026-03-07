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
        .name('search')
        .description('Search for Confluence pages by title')
        .argument('query', 'Title search query')
        .option('-v, --verbose', 'Verbose output')
        .action(async (query: string, options) => {
            const pages = await confluenceApi(`pages?title=${encodeURIComponent(query)}`) as Array<Page>
            if (options.verbose) {
                console.log(pages)
            } else {
                const { host } = await getConfluenceConfig()
                for (const page of pages) {
                    const url = `https://${host}/wiki/spaces/${page.spaceId}/pages/${page.id}`
                    console.log(`${page.id}\t${page.title}\t${url}`)
                }
            }
        })
    return program
}

export default create

if (isMain('git-confluence-page-search')) {
    await create().parseAsync(Bun.argv)
}
