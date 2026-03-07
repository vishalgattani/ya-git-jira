import { describe, expect, test } from 'bun:test'
import { doCommand } from '..'

describe('--help-all', () => {
    test('gitj --help-all prints the full command tree', async (): Promise<void> => {
        const output = await doCommand(['bun', 'run', './bin/gitj.ts', '--help-all'])
        // root
        expect(output).toContain('gitj')
        // top-level commands
        expect(output).toContain('bump')
        expect(output).toContain('confluence')
        expect(output).toContain('jira')
        expect(output).toContain('lab')
        // deeply nested leaf commands
        expect(output).toContain('search')
        expect(output).toContain('whereami')
        expect(output).toContain('train')
        // tree-drawing characters
        expect(output).toContain('├──')
        expect(output).toContain('└──')
        expect(output).toContain('│')
    })

    test('gitj --help-all includes descriptions', async (): Promise<void> => {
        const output = await doCommand(['bun', 'run', './bin/gitj.ts', '--help-all'])
        expect(output).toContain('Commands for working with Jira')
        expect(output).toContain('Commands for working with GitLab')
    })
})
