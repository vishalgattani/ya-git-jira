import path from 'node:path'
import type { Command } from 'commander'

function justBase(filename: string): string {
    const ext = path.extname(filename)
    const base = path.basename(filename, ext)
    return base
}

export function isMain(self: string): boolean {
    const arg1 = Bun.argv[1]
    const argv1Base = justBase(arg1)
    const selfBase = justBase(self)
    const result = argv1Base === selfBase
    // if (result) {
    //     console.log({
    //         arg1,
    //         self,
    //         argv1Base,
    //         selfBase,
    //         result,
    //     })
    // }
    return result
}

export async function runMain(self: string, create: () => Command): Promise<void> {
    if (!isMain(self)) return
    try {
        await create().parseAsync(Bun.argv)
    } catch (err) {
        console.error(`error: ${err instanceof Error ? err.message : String(err)}`)
        process.exit(1)
    }
}
