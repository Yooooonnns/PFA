import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import ScanPage from './pages/ScanPage'
import ManagementPage from './pages/ManagementPage'
import ReceptionPage from './pages/ReceptionPage'
import HistoryPage from './pages/HistoryPage'

function Nav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 flex" style={{ background: 'rgba(15,15,15,0.96)', borderTop: '2px solid #D81E2A' }}>
            {[
                { to: '/', label: 'Commander', end: true },
                { to: '/reception', label: 'Réception' },
                { to: '/history', label: 'Historique' },
                { to: '/management', label: 'Admin' },
            ].map(({ to, label, end }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                        `flex-1 text-center py-3 text-xs font-semibold tracking-wide transition-colors ${
                            isActive ? 'text-[#D81E2A]' : 'text-gray-400'
                        }`
                    }
                >
                    {label}
                </NavLink>
            ))}
        </nav>
    )
}

function App() {
    return (
        <BrowserRouter>
            <div className="pb-14">
                <Routes>
                    <Route path="/" element={<ScanPage />} />
                    <Route path="/reception" element={<ReceptionPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/management" element={<ManagementPage />} />
                </Routes>
            </div>
            <Nav />
        </BrowserRouter>
    )
}

export default App
