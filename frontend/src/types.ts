export type Project = {
    id: number
    name: string
}

export type Line = {
    id: number
    name: string
    project: Project
}

export type Post = {
    id: number
    name: string
    line: Line
}

export type Component = {
    id: number
    reference: string
    category: string
}

export type PostComponent = {
    id: number
    qrCode: string
    post: Post
    component: Component
}

export type Request = {
    id: number
    status: number
    requestedAt: string
    issuedAt: string | null
    canceledAt: string | null
    postComponent: PostComponent
}