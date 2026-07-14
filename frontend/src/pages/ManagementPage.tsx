import { useEffect, useRef, useState } from "react"
import api from "../services/api"
import type { Project, Line, Post, PostComponent, Component } from "../types"

const card = "bg-white/95 rounded-2xl shadow-lg"
const select = "w-full border border-gray-200 rounded-xl p-3 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D81E2A]"
const inputCls = "flex-1 border border-gray-200 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D81E2A]"

function ManagementPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [lines, setLines] = useState<Line[]>([])
    const [posts, setPosts] = useState<Post[]>([])
    const [components, setComponents] = useState<PostComponent[]>([])
    const [allComponents, setAllComponents] = useState<Component[]>([])

    const [selectedProject, setSelectedProject] = useState<number | "">("")
    const [selectedLine, setSelectedLine] = useState<number | "">("")
    const [selectedPost, setSelectedPost] = useState<number | "">("")

    const [addComponentId, setAddComponentId] = useState<number | "">("")
    const [showAdd, setShowAdd] = useState(false)
    const [newRef, setNewRef] = useState("")
    const [newCat, setNewCat] = useState("")
    const [importing, setImporting] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        api.get("/api/project").then(r => setProjects(r.data))
        api.get("/api/component").then(r => setAllComponents(r.data))
    }, [])

    useEffect(() => {
        if (selectedProject === "") return
        setSelectedLine(""); setSelectedPost(""); setLines([]); setPosts([]); setComponents([])
        api.get(`/api/line?projectId=${selectedProject}`).then(r => setLines(r.data))
    }, [selectedProject])

    useEffect(() => {
        if (selectedLine === "") return
        setSelectedPost(""); setPosts([]); setComponents([])
        api.get(`/api/post?lineId=${selectedLine}`).then(r => setPosts(r.data))
    }, [selectedLine])

    useEffect(() => {
        if (selectedPost === "") return
        setComponents([])
        api.get(`/api/postcomponent/manage?postId=${selectedPost}`).then(r => setComponents(r.data))
    }, [selectedPost])

    const reload = () => {
        if (selectedPost !== "")
            api.get(`/api/postcomponent/manage?postId=${selectedPost}`).then(r => setComponents(r.data))
    }

    const deleteComponent = async (id: number) => {
        if (!confirm("Supprimer ce composant ?")) return
        await api.delete(`/api/postcomponent/${id}`)
        setComponents(prev => prev.filter(c => c.id !== id))
    }

    const regenerateQr = async (id: number) => {
        await api.patch(`/api/postcomponent/${id}/regenerateQr`)
        reload()
    }

    const addToPost = async () => {
        if (addComponentId === "" || selectedPost === "") return
        await api.post("/api/postcomponent", { postId: selectedPost, componentId: addComponentId })
        setAddComponentId(""); setShowAdd(false); reload()
    }

    const createComponent = async () => {
        if (!newRef.trim()) return
        const r = await api.post("/api/component", { reference: newRef.trim(), category: newCat.trim() })
        setAllComponents(prev => [...prev, r.data])
        setNewRef(""); setNewCat("")
    }

    const importExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImporting(true)
        const form = new FormData()
        form.append("file", file)
        const r = await api.post("/api/admin", form)
        alert(`Import terminé : ${r.data.imported} ajouté(s)`)
        setImporting(false); reload()
        api.get("/api/project").then(res => setProjects(res.data))
        if (fileRef.current) fileRef.current.value = ""
    }

    return (
        <div className="min-h-screen p-4 pt-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-[#D81E2A] text-xs font-bold tracking-widest uppercase mb-1">YAZAKI</p>
                    <h1 className="text-white text-2xl font-bold">Administration</h1>
                </div>
                <label className="cursor-pointer bg-[#D81E2A] text-white px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform">
                    {importing ? "Import..." : "Excel"}
                    <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={importExcel} />
                </label>
            </div>

            <p className="text-gray-400 text-xs mb-4">Format : Projet | Ligne | Poste | Référence | Catégorie</p>

            {/* New component */}
            <div className={`${card} p-4 mb-4`}>
                <p className="font-semibold text-gray-700 text-sm mb-3">Nouveau composant</p>
                <div className="flex gap-2">
                    <input className={inputCls} placeholder="Référence" value={newRef} onChange={e => setNewRef(e.target.value)} />
                    <input className={inputCls} placeholder="Catégorie" value={newCat} onChange={e => setNewCat(e.target.value)} />
                    <button className="bg-[#D81E2A] text-white px-4 py-2 rounded-lg text-sm font-semibold" onClick={createComponent}>
                        Créer
                    </button>
                </div>
            </div>

            {/* Filters */}
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

                {selectedPost !== "" && (
                    showAdd ? (
                        <div className="flex gap-2">
                            <select className="flex-1 border border-gray-200 rounded-xl p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D81E2A]"
                                value={addComponentId}
                                onChange={e => setAddComponentId(e.target.value === "" ? "" : Number(e.target.value))}>
                                <option value="">— Composant —</option>
                                {allComponents.map(c => (
                                    <option key={c.id} value={c.id}>{c.reference}{c.category ? ` (${c.category})` : ""}</option>
                                ))}
                            </select>
                            <button className="bg-[#D81E2A] text-white px-3 py-2 rounded-xl text-sm font-semibold" onClick={addToPost}>OK</button>
                            <button className="text-gray-400 px-2 text-sm" onClick={() => setShowAdd(false)}>✕</button>
                        </div>
                    ) : (
                        <button
                            className="text-sm text-[#D81E2A] border border-[#D81E2A] px-4 py-2 rounded-xl w-full font-semibold"
                            onClick={() => setShowAdd(true)}
                        >
                            + Assigner un composant
                        </button>
                    )
                )}
            </div>

            {selectedPost !== "" && components.length === 0 && (
                <p className="text-gray-300 text-center py-4">Aucun composant pour ce poste</p>
            )}

            <div className="flex flex-col gap-3">
                {components.map(pc => (
                    <div key={pc.id} className={`${card} p-4`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-gray-900">{pc.component.reference}</p>
                                {pc.component.category && <p className="text-sm text-gray-500">{pc.component.category}</p>}
                                <p className="text-xs text-gray-300 mt-1 font-mono truncate max-w-[180px]">{pc.qrCode}</p>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                                <button
                                    className="text-xs text-[#D81E2A] border border-[#D81E2A] px-3 py-1 rounded-lg"
                                    onClick={() => regenerateQr(pc.id)}
                                >
                                    Regén. QR
                                </button>
                                <button
                                    className="text-xs text-gray-400 border border-gray-200 px-3 py-1 rounded-lg"
                                    onClick={() => deleteComponent(pc.id)}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ManagementPage
