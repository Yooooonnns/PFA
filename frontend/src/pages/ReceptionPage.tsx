import type { Request } from "../types"
import api from "../services/api"
import { useState, useEffect } from "react"

const card = "bg-white/95 rounded-2xl shadow-lg"

type ItemStatus = "ok" | "missing"

function ReceptionPage() {
    const [loading, setLoading] = useState(true)
    const [requests, setRequests] = useState<Request[]>([])
    // per-request toggle: ok or missing
    const [statuses, setStatuses] = useState<Record<number, ItemStatus>>({})
    const [delivering, setDelivering] = useState<number | null>(null) // lineId being delivered

    useEffect(() => {
        api.get("/api/request?status=0")
            .then(r => {
                const reqs: Request[] = r.data
                setRequests(reqs)
                const init: Record<number, ItemStatus> = {}
                reqs.forEach(req => { init[req.id] = "ok" })
                setStatuses(init)
            })
            .finally(() => setLoading(false))
    }, [])

    // Group requests by lineId
    const groups = requests.reduce<Record<number, Request[]>>((acc, req) => {
        const lineId = req.postComponent.post.line.id
        if (!acc[lineId]) acc[lineId] = []
        acc[lineId].push(req)
        return acc
    }, {})

    const toggle = (id: number) =>
        setStatuses(prev => ({ ...prev, [id]: prev[id] === "ok" ? "missing" : "ok" }))

    const deliverBundle = async (lineId: number) => {
        setDelivering(lineId)
        const lineRequests = groups[lineId]
        const items = lineRequests.map(req => ({
            id: req.id,
            // ok → Done (1), missing → NoStock (3)
            status: statuses[req.id] === "ok" ? 1 : 3
        }))
        await api.post("/api/request/bundle", { items })
        setRequests(prev => prev.filter(r => r.postComponent.post.line.id !== lineId))
        setDelivering(null)
    }

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <p className="text-white text-lg">Chargement...</p>
        </div>
    )

    const lineIds = Object.keys(groups).map(Number)

    return (
        <div className="min-h-screen p-4 pt-6">
            <div className="mb-6">
                <p className="text-[#D81E2A] text-xs font-bold tracking-widest uppercase mb-1">YAZAKI</p>
                <h1 className="text-white text-2xl font-bold">Réception</h1>
            </div>

            {lineIds.length === 0 && (
                <div className={`${card} p-8 text-center`}>
                    <p className="text-gray-400">Aucune commande en attente</p>
                </div>
            )}

            <div className="flex flex-col gap-5">
                {lineIds.map(lineId => {
                    const lineReqs = groups[lineId]
                    const first = lineReqs[0]
                    const projectName = first.postComponent.post.line.project.name
                    const lineName = first.postComponent.post.line.name
                    const missingCount = lineReqs.filter(r => statuses[r.id] === "missing").length

                    return (
                        <div key={lineId} className={card}>
                            {/* Line header */}
                            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                                <p className="text-xs text-gray-400">{projectName}</p>
                                <p className="font-bold text-gray-900 text-base">{lineName}</p>
                            </div>

                            {/* Components */}
                            <div className="divide-y divide-gray-50">
                                {lineReqs.map(req => {
                                    const isOk = statuses[req.id] === "ok"
                                    return (
                                        <div key={req.id} className="px-4 py-3 flex justify-between items-center">
                                            <div>
                                                <p className={`font-semibold text-sm ${isOk ? "text-gray-900" : "text-gray-400 line-through"}`}>
                                                    {req.postComponent.component.reference}
                                                </p>
                                                <p className="text-xs text-gray-400">{req.postComponent.post.name}</p>
                                            </div>
                                            <button
                                                onClick={() => toggle(req.id)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                                                    isOk
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                        : "bg-red-50 text-[#D81E2A] border-red-200"
                                                }`}
                                            >
                                                {isOk ? "✓ OK" : "✗ Manquant"}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Bundle action */}
                            <div className="px-4 pb-4 pt-3">
                                {missingCount > 0 && (
                                    <p className="text-xs text-amber-600 mb-2">
                                        {missingCount} composant(s) manquant(s) — reporté(s) à la prochaine commande
                                    </p>
                                )}
                                <button
                                    className="w-full bg-[#D81E2A] text-white py-3 rounded-xl font-semibold disabled:opacity-50 active:scale-95 transition-transform"
                                    onClick={() => deliverBundle(lineId)}
                                    disabled={delivering === lineId}
                                >
                                    {delivering === lineId ? "Livraison..." : "Livrer le bundle"}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ReceptionPage
