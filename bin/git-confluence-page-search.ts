#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { confluenceApi, confluenceSearch } from '../lib/confluence'
import { getConfluenceConfig } from '../lib/confluence'
import type { Page, SearchResult } from '../lib/confluence'
import { isMain } from '../lib/is_main'
const version = await getPackageVersion()

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('search')
        .description('Search for Confluence pages by title (fuzzy by default)')
        .argument('query', 'Search query')
        .option('-v, --verbose', 'Verbose output')
        .option('--exact', 'Exact title match (uses v2 API)')
        .option('--full-text', 'Search page body content in addition to title')
        .action(async (query: string, options) => {
            const { host } = await getConfluenceConfig()

            if (options.exact) {
                const pages = await confluenceApi(`pages?title=${encodeURIComponent(query)}`) as Array<Page>
                if (options.verbose) {
                    console.log(pages)
                } else {
                    for (const page of pages) {
                        const url = `https://${host}/wiki/spaces/${page.spaceId}/pages/${page.id}`
                        console.log(`${page.id}\t${page.title}\t${url}`)
                    }
                }
                return
            }

            const field = options.fullText ? 'text' : 'title'
            const cql = `type=page AND ${field} ~ "${query}"`
            const results = await confluenceSearch(cql) as Array<SearchResult>
            if (options.verbose) {
                console.log(results)
            } else {
                for (const result of results) {
                    const id = result.content.id
                    const title = result.content.title
                    const url = `https://${host}${result.url}`
                    console.log(`${id}\t${title}\t${url}`)
                }
            }
        })
    return program
}

export default create

if (isMain('git-confluence-page-search')) {
    await create().parseAsync(Bun.argv)
}
