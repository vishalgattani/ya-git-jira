import type { Command } from 'commander'

// Recursively format a Commander command tree using box-drawing characters
export function formatCommandTree(cmd: Command): string {
    const lines: Array<string> = []
    const name = cmd.name() || 'gitj'
    lines.push(name)
    appendChildren(lines, cmd, '')
    return lines.join('\n')
}

function appendChildren(lines: Array<string>, cmd: Command, prefix: string): void {
    const children = cmd.commands as Array<Command>
    if (!children || children.length === 0) return

    const descWidth = longestNameChain(children)

    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const isLast = i === children.length - 1
        const connector = isLast ? '└── ' : '├── '
        const childPrefix = isLast ? '    ' : '│   '
        const name = child.name()
        const desc = child.description()
        const padding = desc ? ' '.repeat(Math.max(1, descWidth - name.length + 2)) : ''
        const descPart = desc ? padding + desc : ''
        lines.push(`${prefix}${connector}${name}${descPart}`)
        appendChildren(lines, child, prefix + childPrefix)
    }
}

// Find the longest command name among siblings for alignment
function longestNameChain(commands: Array<Command>): number {
    let max = 0
    for (const cmd of commands) {
        const len = cmd.name().length
        if (len > max) max = len
    }
    return max
}
