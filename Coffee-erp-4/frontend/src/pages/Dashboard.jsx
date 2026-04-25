import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../api/client'

const fmt = (n, dec = 0) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: dec })
const SOURCE_COLORS = { fresh_cherry: '#52b788', dry_cherry: '#f4a261', parchment: '#a29bfe', green_bean: '#2d6a4f' }
const SOURCE_LABELS = { fresh_cherry: 'Fresh Cherry', dry_cherry: 'Dry Cherry', parchment: 'Parchment', green_bean: 'Green Beans' }

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [profitData, setProfitData] = useState([])
  const [pnl, setPnl] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/kpis'),
      api.get('/dashboard/profit-by-source'),
      api.get('/dashboard/annual-pnl'),
    ]).then(([k, p, l]) => {
      setKpis(k.data)
      setProfitData(p.data.map(d => ({ ...d, name: SOURCE_LABELS[d.source_type] || d.source_type })))
      setPnl(l.data.map(d => ({ ...d, name: SOURCE_LABELS[d.source_type] || d.source_type })))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" />

  const invItems = kpis ? Object.entries(kpis.inventory).map(([k, v]) => ({ name: SOURCE_LABELS[k] || k, value: v })).filter(x => x.value > 0) : []

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">☕ Dashboard</h1>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Coffee Value Chain ERP</span>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Batches</div>
          <div className="kpi-value">{kpis?.batches?.total}</div>
          <div className="kpi-sub">{kpis?.batches?.confirmed} confirmed · {kpis?.batches?.draft} draft</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Roasted Output</div>
          <div className="kpi-value">{fmt(kpis?.production?.total_roasted_kg)} kg</div>
          <div className="kpi-sub">Across all batches</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Cup Capacity</div>
          <div className="kpi-value">{fmt(kpis?.production?.total_cups_capacity)}</div>
          <div className="kpi-sub">Projected cups</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Projected Revenue</div>
          <div className="kpi-value">Rs {fmt(kpis?.financials?.total_projected_revenue)}</div>
          <div className="kpi-sub">All sources</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Variable Cost</div>
          <div className="kpi-value">Rs {fmt(kpis?.financials?.total_variable_cost)}</div>
          <div className="kpi-sub">Total production cost</div>
        </div>
        <div className="kpi-card" style={{ borderLeft: `4px solid ${(kpis?.financials?.total_net_profit || 0) >= 0 ? 'var(--success)' : 'var(--danger)'}` }}>
          <div className="kpi-label">Net Profit</div>
          <div className="kpi-value" style={{ color: (kpis?.financials?.total_net_profit || 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            Rs {fmt(kpis?.financials?.total_net_profit)}
          </div>
          <div className="kpi-sub">After fixed costs</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Actual Sales</div>
          <div className="kpi-value">{fmt(kpis?.financials?.actual_sales_cups)} cups</div>
          <div className="kpi-sub">Rs {fmt(kpis?.financials?.actual_revenue)} revenue</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Expenses Logged</div>
          <div className="kpi-value">Rs {fmt(kpis?.financials?.total_expenses_logged)}</div>
          <div className="kpi-sub">All GL entries</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="section-title">Net Profit by Source</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={profitData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `Rs ${fmt(v)}`} width={80} />
              <Tooltip formatter={v => [`Rs ${fmt(v)}`, '']} />
              <Bar dataKey="total_profit" fill="var(--accent)" radius={[4,4,0,0]}>
                {profitData.map((e, i) => <Cell key={i} fill={e.total_profit >= 0 ? SOURCE_COLORS[e.source_type] || 'var(--accent)' : 'var(--danger)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="section-title">Inventory by Type</div>
          {invItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={invItems} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}kg`} labelLine={false}>
                  {invItems.map((_, i) => <Cell key={i} fill={Object.values(SOURCE_COLORS)[i % 4]} />)}
                </Pie>
                <Tooltip formatter={v => [`${v} kg`, '']} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><div className="icon">📦</div><p>No inventory data</p></div>}
        </div>
      </div>

      {/* Annual P&L Table */}
      <div className="card">
        <div className="section-title">Annual P&L by Procurement Source</div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Line Item</th>
                {pnl.map(d => <th key={d.source_type}>{d.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ['Cup Sales Revenue', 'cup_sales_revenue', false],
                ['Coffee Variable Cost', 'coffee_variable_cost', false],
                ['Café Variable Cost', 'cafe_variable_cost', false],
                ['Contribution Before Fixed', 'contribution_before_fixed', false],
                ['Fixed Cost', 'fixed_cost', false],
                ['Net Profit', 'net_profit', false],
                ['Net Margin', 'net_margin', true],
              ].map(([label, key, isPct]) => (
                <tr key={key}>
                  <td style={{ fontWeight: key === 'net_profit' ? 700 : 400 }}>{label}</td>
                  {pnl.map(d => (
                    <td key={d.source_type} style={{
                      fontWeight: key === 'net_profit' ? 700 : 400,
                      color: key === 'net_profit' ? (d[key] >= 0 ? 'var(--success)' : 'var(--danger)') : 'inherit'
                    }}>
                      {isPct ? `${(d[key] * 100).toFixed(1)}%` : `Rs ${fmt(d[key])}`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
