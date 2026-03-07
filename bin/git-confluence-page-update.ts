#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { confluenceApi, confluenceApiWrite } from '../lib/confluence'
import type { Page } from '../lib/confluence'
import type { JSONValue } from '../lib/json'
import { isMain } from '../lib/is_main'
const version = await getPackageVersion()

async function readStdin(): Promise<string> {
    const chunks: Buffer[] = []
    for await (const chunk of Bun.stdin.stream()) {
        chunks.push(Buffer.from(chunk))
    }
    return Buffer.concat(chunks).toString('utf-8')
}

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('update')
        .description('Update a Confluence page')
        .argument('id', 'Page ID')
        .option('-t, --title <title>', 'New page title (defaults to current title)')
        .option('-f, --file <path>', 'Read body content from file (default: stdin)')
        .option('-m, --message <message>', 'Version message')
        .option('-v, --verbose', 'Verbose output')
        .action(async (id: string, options) => {
            const current = await confluenceApi(`pages/${id}`) as Page

            let content: string
            if (options.file) {
                const file = Bun.file(options.file)
                content = await file.text()
            } else {
                content = await readStdin()
            }

            if (!content.trim()) {
                console.error('No content provided. Pipe content via stdin or use --file.')
                process.exit(1)
            }

            const title = options.title || current.title
            const nextVersion = current.version.number + 1

            const body: JSONValue = {
                id,
                status: 'current',
                title,
                body: {
                    representation: 'storage',
                    value: content,
                },
                version: {
                    number: nextVersion,
                    message: options.message || '',
                },
            }

            const result = await confluenceApiWrite(`pages/${id}`, 'PUT', body) as Page
            if (options.verbose) {
                console.log(result)
            } else {
                console.log(`Updated page ${result.id} "${result.title}" to version ${result.version.number}`)
            }
        })
    return program
}

export default create

if (isMain('git-confluence-page-update')) {
    await create().parseAsync(Bun.argv)
}
