import { useState, useEffect } from "react"
import api from "../services/api"
import type { Project, Line, Post } from "../types"

const card = "bg-white/95 rounded-2xl shadow-lg"
const select = "w-full border border-gray-200 rounded-xl p-3 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D81E2A]"
const input = "flex-1 border border-gray-200 rounded-xl p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D81E2A]"

type ConsumptionRecord = {
    id: number
    requestedAt: string
    issuedAt: string
    componentReference: string
    postName: string
    lineName: string
    projectName: string
}

function HistoryPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [lines, setLines] = useState<Line[]>([])
    const [posts, setPosts] = useState<Post[]>([])
    const [selectedProject, setSelectedProject] = useState<number | "">("")
    const [selectedLine, setSelectedLine] = useState<number | "">("")
    const [selectedPost, setSelectedPost] = useState<number | "">("")
    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")
    const [records, setRecords] = useState<ConsumptionRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    useEffect(() => { api.get("/api/project").then(r => setProjects(r.data)) }, [])

    useEffect(() => {
        if (selectedProject === "") return
        setSelectedLine(""); setSelectedPost(""); setLines([]); setPosts([])
        api.get(`/api/line?projectId=${selectedProject}`).then(r => setLines(r.data))
    }, [selectedProject])

    useEffect(() => {
        if (selectedLine === "") return
        setSelectedPost(""); setPosts([])
        api.get(`/api/post?lineId=${selectedLine}`).then(r => setPosts(r.data))
    }, [selectedLine])

    const search = async () => {
        setLoading(true); setSearched(true)
        const params = new URLSearchParams()
        if (selectedProject !== "") params.set("projectId", String(selectedProject))
        if (selectedLine !== "") params.set("lineId", String(selectedLine))
        if (selectedPost !== "") params.set("postId", String(selectedPost))
        if (from) params.set("from", new Date(from).toISOString())
        if (to) params.set("to", new Date(to).toISOString())
        const r = await api.get(`/api/request/consumption?${params}`)
        setRecords(r.data)
        setLoading(false)
    }

    return (
        <div className="min-h-screen p-4 pt-6">
            <div className="mb-6">
                <p className="text-[#D81E2A] text-xs font-bold tracking-widest uppercase mb-1">YAZAKI</p>
                <h1 className="text-white text-2xl font-bold">Historique</h1>
            </div>

            <div className={`${card} p-5 mb-4 flex flex-col gap-4`}>
                <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Du</label>
                        <input type="date" className={input} value={from} onChange={e => setFrom(e.target.value)} />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Au</label>
                        <input type="date" className={input} value={to} onChange={e => setTo(e.target.value)} />
                    </div>
                </div>

                <select className={select} value={selectedProject}
                    onChange={e => setSelectedProject(e.target.value === "" ? "" : Number(e.target.value))}>
                    <option value="">— Tous les projets —</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                {selectedProject !== "" && (
                    <select className={select} value={selectedLine}
                        onChange={e => setSelectedLine(e.target.value === "" ? "" : Number(e.target.value))}>
                        <option value="">— Toutes les lignes —</option>
                        {lines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                )}

                {selectedLine !== "" && (
                    <select className={select} value={selectedPost}
                        onChange={e => setSelectedPost(e.target.value === "" ? "" : Number(e.target.value))}>
                        <option value="">— Tous les postes —</option>
                        {posts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                )}

                <button
                    className="bg-[#D81E2A] text-white py-3 rounded-xl font-semibold disabled:opacity-50 active:scale-95 transition-transform"
                    onClick={search} disabled={loading}
                >
                    {loading ? "Chargement..." : "Rechercher"}
                </button>
            </div>

            {searched && !loading && records.length === 0 && (
                <div className={`${card} p-6 text-center`}>
                    <p className="text-gray-400">Aucun résultat</p>
                </div>
            )}

            {records.length > 0 && (
                <p className="text-gray-300 text-sm mb-3">{records.length} livraison(s)</p>
            )}

            <div className="flex flex-col gap-3">
                {records.map(r => (
                    <div key={r.id} className={`${card} p-4`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-gray-900">{r.componentReference}</p>
                                <p className="text-sm text-gray-500">{r.projectName} › {r.lineName} › {r.postName}</p>
                            </div>
                            <div className="text-right text-xs text-gray-400">
                                <p>{new Date(r.requestedAt).toLocaleString("fr-FR")}</p>
                                {r.issuedAt && <p className="text-[#D81E2A]">✓ {new Date(r.issuedAt).toLocaleString("fr-FR")}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default HistoryPage
