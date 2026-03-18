#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { runMain } from '../lib/is_main'
import { apiRequest, apiPaginate, serviceNames } from '../lib/api.ts'

const version = await getPackageVersion()

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('api')
        .description('make an authenticated API request')
        .argument('<service>', `service name (${serviceNames.join(', ')})`)
        .argument('<endpoint>', 'API endpoint path (e.g. /user, /myself)')
        .option('-X, --method <method>', 'HTTP method (default: GET, auto-promotes to POST with --data)')
        .option('-d, --data <json>', 'request body as JSON string')
        .option('--raw', 'don\'t prepend the default base path')
        .option('--paginate', 'follow pagination links and return all results')
        .option('-v, --verbose', 'show response status and headers on stderr')
        .action(async (service: string, endpoint: string, options) => {
            let method = options.method?.toUpperCase() ?? (options.data ? 'POST' : 'GET')
            if (!httpMethods.includes(method)) {
                console.error(`Unknown HTTP method: ${method}`)
                process.exit(1)
            }

            if (options.paginate && method !== 'GET') {
                console.error('--paginate only works with GET requests')
                process.exit(1)
            }

            const requestOptions = {
                raw: options.raw,
                data: options.data,
            }

            let result
            if (options.paginate) {
                result = await apiPaginate(service, endpoint, requestOptions)
            } else {
                result = await apiRequest(service, method, endpoint, requestOptions)
            }

            if (options.verbose) {
                console.error(`HTTP ${result.status}`)
                result.headers.forEach((value, key) => {
                    console.error(`${key}: ${value}`)
                })
                console.error('')
            }

            console.log(JSON.stringify(result.body, null, 2))

            if (result.status >= 400) {
                process.exit(1)
            }
        })
    return program
}

export default create

await runMain('git-api', create)
