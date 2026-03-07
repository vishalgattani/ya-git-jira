import type { JSONValue } from '../json'

export type ConfluenceUser = JSONValue & {
    type: string
    accountId: string
    accountType: string
    email: string
    publicName: string
    displayName: string
}

export type Space = JSONValue & {
    id: string
    key: string
    name: string
    type: string
    status: string
}

export type Page = JSONValue & {
    id: string
    status: string
    title: string
    spaceId: string
    parentId: string
    parentType: string
    position: number
    version: {
        number: number
        message: string
        createdAt: string
    }
}
