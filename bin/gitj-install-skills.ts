#!/usr/bin/env bun

import { Command } from 'commander'
import { getPackageVersion } from '../lib/package'
import { findPackageJson } from '../lib/package'
import { isMain } from '../lib/is_main'
import fs from 'node:fs'
import path from 'node:path'

const version = await getPackageVersion()

const frameworks = ['opencode', 'copilot', 'claude'] as const
type Framework = typeof frameworks[number]

const skillNames = ['git-jira', 'git-lab', 'git-confluence']

function getSkillsSourceDir(): string {
    const packageJsonPath = findPackageJson()
    if (!packageJsonPath) {
        throw new Error('Cannot find package.json for ya-git-jira')
    }
    const packageRoot = path.dirname(packageJsonPath)
    const skillsDir = path.join(packageRoot, '.opencode', 'skills')
    if (!fs.existsSync(skillsDir)) {
        throw new Error(`Skills directory not found: ${skillsDir}`)
    }
    return skillsDir
}

function getTargetDir(framework: Framework): string {
    const cwd = process.cwd()
    switch (framework) {
        case 'opencode':
            return path.join(cwd, '.opencode', 'skills')
        case 'copilot':
            return path.join(cwd, '.github', 'skills')
        case 'claude':
            return path.join(cwd, '.claude', 'skills')
    }
}

function installSkills(framework: Framework, copy: boolean): void {
    const sourceDir = getSkillsSourceDir()
    const targetDir = getTargetDir(framework)

    fs.mkdirSync(targetDir, { recursive: true })

    for (const name of skillNames) {
        const source = path.join(sourceDir, name)
        const target = path.join(targetDir, name)

        if (fs.existsSync(target)) {
            const stat = fs.lstatSync(target)
            if (stat.isSymbolicLink()) {
                fs.unlinkSync(target)
            } else if (stat.isDirectory()) {
                console.error(`${target} already exists as a directory -- skipping (use --force to overwrite)`)
                continue
            }
        }

        if (copy) {
            fs.cpSync(source, target, { recursive: true })
            console.log(`copied ${name} -> ${target}`)
        } else {
            fs.symlinkSync(source, target)
            console.log(`linked ${name} -> ${target}`)
        }
    }
}

function forceInstallSkills(framework: Framework, copy: boolean): void {
    const sourceDir = getSkillsSourceDir()
    const targetDir = getTargetDir(framework)

    fs.mkdirSync(targetDir, { recursive: true })

    for (const name of skillNames) {
        const source = path.join(sourceDir, name)
        const target = path.join(targetDir, name)

        if (fs.existsSync(target) || fs.lstatSync(target).isSymbolicLink()) {
            fs.rmSync(target, { recursive: true, force: true })
        }

        if (copy) {
            fs.cpSync(source, target, { recursive: true })
            console.log(`copied ${name} -> ${target}`)
        } else {
            fs.symlinkSync(source, target)
            console.log(`linked ${name} -> ${target}`)
        }
    }
}

export function create(): Command {
    const program: Command = new Command()
    program
        .version(version)
        .name('install-skills')
        .description('Install AI agent skills for a coding framework')
        .argument('<framework>', `framework to install for (${frameworks.join(', ')})`)
        .option('--copy', 'copy files instead of creating symlinks (automatic in Docker)')
        .option('--force', 'overwrite existing skill directories')
        .action(async (framework: string, options: { copy?: boolean; force?: boolean }) => {
            if (!frameworks.includes(framework as Framework)) {
                console.error(`Unknown framework: ${framework}`)
                console.error(`Supported frameworks: ${frameworks.join(', ')}`)
                process.exit(1)
            }

            // When running in Docker, source files live inside the container
            // so symlinks would be broken on the host. Force copy mode.
            const sourceDir = getSkillsSourceDir()
            const inDocker = sourceDir.startsWith('/app/')
            const copy = !!(options.copy || inDocker)

            if (options.force) {
                forceInstallSkills(framework as Framework, copy)
            } else {
                installSkills(framework as Framework, copy)
            }
        })
    return program
}

export default create

if (isMain('gitj-install-skills')) {
    await create().parseAsync(Bun.argv)
}
