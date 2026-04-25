import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Batches from './pages/Batches.jsx'
import BatchForm from './pages/BatchForm.jsx'
import Procurement from './pages/Procurement.jsx'
import Processing from './pages/Processing.jsx'
import Costing from './pages/Costing.jsx'
import Inventory from './pages/Inventory.jsx'
import Sales from './pages/Sales.jsx'
import Expenses from './pages/Expenses.jsx'
import Reports from './pages/Reports.jsx'
import Collectors from './pages/Collectors.jsx'
import Customers from './pages/Customers.jsx'
import Contacts from './pages/Contacts.jsx'
import Leads from './pages/Leads.jsx'
import Tasks from './pages/Tasks.jsx'
import Communications from './pages/Communications.jsx'
import Quotations from './pages/Quotations.jsx'
import Orders from './pages/Orders.jsx'

const NAV = [
  { to: '/', icon: '📊', label: 'Dashboard' },
  { to: '/batches', icon: '🧮', label: 'Batches' },
  { to: '/procurement', icon: '🌿', label: 'Procurement' },
  { to: '/processing', icon: '⚙️', label: 'Processing' },
  { to: '/costing', icon: '💹', label: 'Costing' },
  { to: '/inventory', icon: '🏭', label: 'Inventory' },
  { to: '/sales', icon: '☕', label: 'Sales' },
  { to: '/expenses', icon: '💰', label: 'Expenses' },
  { to: '/reports', icon: '📄', label: 'Reports' },
  { to: '/collectors', icon: '🧑‍🌾', label: 'Collectors' },
  { to: '/customers', icon: '🏪', label: 'Customers' },
  { to: '/contacts', icon: '👤', label: 'Contacts' },
  { to: '/leads', icon: '🎯', label: 'Leads' },
  { to: '/tasks', icon: '✅', label: 'Tasks' },
  { to: '/communications', icon: '💬', label: 'Communications' },
  { to: '/quotations', icon: '🧾', label: 'Quotations' },
  { to: '/orders', icon: '📦', label: 'Orders' },
]

function Sidebar() {
  const { user, logout } = useAuth()
  return (
    <aside style={{ width: 'var(--sidebar-w)', background: 'var(--primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, overflowY: 'auto' }}>
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>☕ Coffee CRM</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>ERP + customer pipeline</div>
      </div>
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', fontSize: 13.5, fontWeight: 500,
              color: isActive ? '#95d5b2' : 'rgba(255,255,255,0.75)',
              background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderLeft: isActive ? '3px solid #52b788' : '3px solid transparent',
              transition: 'all 0.15s',
            })}>
            <span>{n.icon}</span>{n.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ color: '#95d5b2', fontSize: 12, fontWeight: 600 }}>{user?.full_name || user?.username}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 10, textTransform: 'capitalize' }}>{user?.role}</div>
        <button onClick={logout} className="btn btn-ghost btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', width: '100%', justifyContent: 'center' }}>
          Sign Out
        </button>
      </div>
    </aside>
  )
}

function Layout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 'var(--sidebar-w)', flex: 1, padding: '28px 32px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/batches" element={<ProtectedRoute><Batches /></ProtectedRoute>} />
          <Route path="/batches/new" element={<ProtectedRoute><BatchForm /></ProtectedRoute>} />
          <Route path="/batches/:id/edit" element={<ProtectedRoute><BatchForm /></ProtectedRoute>} />
          <Route path="/procurement" element={<ProtectedRoute><Procurement /></ProtectedRoute>} />
          <Route path="/processing" element={<ProtectedRoute><Processing /></ProtectedRoute>} />
          <Route path="/costing" element={<ProtectedRoute><Costing /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/collectors" element={<ProtectedRoute><Collectors /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
          <Route path="/quotations" element={<ProtectedRoute><Quotations /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
