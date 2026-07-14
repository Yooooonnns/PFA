import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import type { Project, Line, Post, PostComponent } from "../types"

const card = "bg-white/95 rounded-2xl shadow-lg"
const select = "w-full border border-gray-200 rounded-xl p-3 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D81E2A]"

function ScanPage() {
    const navigate = useNavigate()
    const [projects, setProjects] = useState<Project[]>([])
    const [lines, setLines] = useState<Line[]>([])
    const [posts, setPosts] = useState<Post[]>([])
    const [components, setComponents] = useState<PostComponent[]>([])
    // set of postComponentIds that already have a pending request
    const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())

    const [selectedProject, setSelectedProject] = useState<number | "">("")
    const [selectedLine, setSelectedLine] = useState<number | "">("")
    const [selectedPost, setSelectedPost] = useState<number | "">("")
    const [submitting, setSubmitting] = useState<number | null>(null)

    useEffect(() => { api.get("/api/project").then(r => setProjects(r.data)) }, [])

    useEffect(() => {
        if (selectedProject === "") return
        setSelectedLine(""); setSelectedPost(""); setLines([]); setPosts([]); setComponents([]); setPendingIds(new Set())
        api.get(`/api/line?projectId=${selectedProject}`).then(r => setLines(r.data))
    }, [selectedProject])

    useEffect(() => {
        if (selectedLine === "") return
        setSelectedPost(""); setPosts([]); setComponents([]); setPendingIds(new Set())
        api.get(`/api/post?lineId=${selectedLine}`).then(r => setPosts(r.data))
    }, [selectedLine])

    useEffect(() => {
        if (selectedPost === "") return
        setComponents([]); setPendingIds(new Set())
        Promise.all([
            api.get(`/api/postcomponent/manage?postId=${selectedPost}`),
            api.get(`/api/request?status=0&postId=${selectedPost}`)
        ]).then(([compsRes, reqsRes]) => {
            setComponents(compsRes.data)
            const ids = new Set<number>(reqsRes.data.map((r: { postComponent: { id: number } }) => r.postComponent.id))
            setPendingIds(ids)
        })
    }, [selectedPost])

    const commander = async (postComponentId: number) => {
        setSubmitting(postComponentId)
        await api.post("/api/request", { postComponentId })
        setSubmitting(null)
        navigate("/reception")
    }

    return (
        <div className="min-h-screen p-4 pt-6">
            <div className="mb-6">
                <p className="text-[#D81E2A] text-xs font-bold tracking-widest uppercase mb-1">YAZAKI</p>
                <h1 className="text-white text-2xl font-bold">Commander un composant</h1>
            </div>

            <div className={`${card} p-5 mb-4 flex flex-col gap-4`}>
                <select className={select} value={selectedProject}
                    onChange={e => setSelectedProject(e.target.value === "" ? "" : Number(e.target.value))}>
                    <option value="">— Projet —</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                {selectedProject !== "" && (
                    <select className={select} value={selectedLine}
                        onChange={e => setSelectedLine(e.target.value === "" ? "" : Number(e.target.value))}>
                        <option value="">— Ligne —</option>
                        {lines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                )}

                {selectedLine !== "" && (
                    <select className={select} value={selectedPost}
                        onChange={e => setSelectedPost(e.target.value === "" ? "" : Number(e.target.value))}>
                        <option value="">— Poste —</option>
                        {posts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                )}
            </div>

            {selectedPost !== "" && components.length === 0 && (
                <p className="text-gray-300 text-center py-4">Aucun composant pour ce poste</p>
            )}

            <div className="flex flex-col gap-3">
                {components.map(pc => {
                    const isPending = pendingIds.has(pc.id)
                    return (
                        <div key={pc.id} className={`${card} p-4 flex justify-between items-center ${isPending ? "opacity-80" : ""}`}>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">{pc.component.reference}</p>
                                {pc.component.category && <p className="text-gray-400 text-sm">{pc.component.category}</p>}
                                {isPending && (
                                    <span className="inline-block mt-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                                        En attente de livraison
                                    </span>
                                )}
                            </div>
                            {isPending ? (
                                <div className="text-amber-500 text-xl">⏳</div>
                            ) : (
                                <button
                                    className="bg-[#D81E2A] text-white px-5 py-2 rounded-xl font-semibold text-sm disabled:opacity-50 active:scale-95 transition-transform"
                                    disabled={submitting === pc.id}
                                    onClick={() => commander(pc.id)}
                                >
                                    {submitting === pc.id ? "..." : "Commander"}
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ScanPage
