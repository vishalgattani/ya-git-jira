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
        .option('-b, --body-format <format>', 'Include page body (storage or atlas_doc_format)')
        .option('--body-only', 'Output only the body content value (requires --body-format)')
        .action(async (id: string, options) => {
            let endpoint = `pages/${id}`
            if (options.bodyFormat) {
                endpoint += `?body-format=${options.bodyFormat}`
            }
            const page = await confluenceApi(endpoint) as Page
            if (options.bodyOnly) {
                if (!options.bodyFormat) {
                    console.error('--body-only requires --body-format')
                    process.exit(1)
                }
                const body = page.body
                const content = options.bodyFormat === 'storage'
                    ? body?.storage?.value
                    : body?.atlas_doc_format?.value
                if (content) {
                    console.log(content)
                } else {
                    console.error('No body content returned')
                    process.exit(1)
                }
            } else if (options.verbose) {
                console.log(page)
            } else {
                const { host } = await getConfluenceConfig()
                const url = `https://${host}/wiki/spaces/${page.spaceId}/pages/${page.id}`
                const result: Record<string, unknown> = { id: page.id, title: page.title, spaceId: page.spaceId, url }
                if (page.body?.storage?.value) {
                    result.bodyLength = page.body.storage.value.length
                }
                console.log(result)
            }
        })
    return program
}

export default create

if (isMain('git-confluence-page-show')) {
    await create().parseAsync(Bun.argv)
}
