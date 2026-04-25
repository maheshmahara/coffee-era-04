import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api/client'

const fmt = (n, d = 0) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: d })
const SOURCE_LABELS = { fresh_cherry: 'Fresh Cherry', dry_cherry: 'Dry Cherry', parchment: 'Parchment', green_bean: 'Green Beans' }
const SOURCE_COLORS = { fresh_cherry: '#52b788', dry_cherry: '#f4a261', parchment: '#a29bfe', green_bean: '#2d6a4f' }

export default function Costing() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/costing/').then(r => setResults(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" />

  const chartData = results.map(r => ({
    name: SOURCE_LABELS[r.source_type] || r.source_type,
    source_type: r.source_type,
    cost_per_kg: parseFloat(r.cost_per_roasted_kg || 0),
    cost_per_cup: parseFloat(r.coffee_cost_per_cup || 0),
    net_profit: parseFloat(r.net_profit || 0),
    net_margin: parseFloat(r.net_margin || 0) * 100,
  }))

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🧮 Costing & Profitability</h1>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mirrors Excel: Summary_Compare + Source Sheets</span>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="section-title">Cost per Roasted Kg (Rs)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={70} />
              <Tooltip formatter={v => [`Rs ${fmt(v, 2)}`, 'Cost/kg']} />
              <Bar dataKey="cost_per_kg" radius={[4,4,0,0]}>
                {chartData.map((e, i) => <Cell key={i} fill={SOURCE_COLORS[e.source_type] || '#52b788'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="section-title">Net Profit by Source (Rs)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={80} tickFormatter={v => `Rs ${fmt(v)}`} />
              <Tooltip formatter={v => [`Rs ${fmt(v)}`, 'Net Profit']} />
              <Bar dataKey="net_profit" radius={[4,4,0,0]}>
                {chartData.map((e, i) => <Cell key={i} fill={e.net_profit >= 0 ? SOURCE_COLORS[e.source_type] : 'var(--danger)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full Comparison Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Scenario Comparison — All Batches</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                {results.map(r => <th key={r.id}>{SOURCE_LABELS[r.source_type]} (Batch {r.batch_id})</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ['Roasted Output (kg)', 'roasted_output_kg', false, 2],
                ['Cups Produced', 'cups_produced', false, 0],
                ['Procurement Cost (Rs)', 'procurement_cost', false, 0],
                ['Transport Cost (Rs)', 'transport_cost', false, 0],
                ['Processing Cost (Rs)', 'processing_cost', false, 0],
                ['Hulling Cost (Rs)', 'hulling_cost', false, 0],
                ['Roasting Cost (Rs)', 'roasting_cost', false, 0],
                ['Packaging Cost (Rs)', 'packaging_cost', false, 0],
                ['Total Variable Cost (Rs)', 'total_variable_cost', false, 0],
                ['Cost per Roasted Kg (Rs)', 'cost_per_roasted_kg', false, 2],
                ['Coffee Cost per Cup (Rs)', 'coffee_cost_per_cup', false, 2],
                ['Cup Sales Revenue (Rs)', 'cup_sales_revenue', false, 0],
                ['Café Variable Cost (Rs)', 'cafe_variable_cost', false, 0],
                ['Contribution Before Fixed (Rs)', 'contribution_before_fixed', false, 0],
                ['Annual Fixed Cost (Rs)', 'annual_fixed_cost', false, 0],
                ['Net Profit (Rs)', 'net_profit', false, 0],
                ['Net Margin', 'net_margin', true, 1],
                ['Break-Even (cups/day)', 'breakeven_cups_per_day', false, 2],
              ].map(([label, key, isPct, dec]) => (
                <tr key={key}>
                  <td style={{ fontWeight: ['net_profit', 'total_variable_cost'].includes(key) ? 700 : 400, color: key === 'net_profit' ? undefined : 'inherit' }}>
                    {label}
                  </td>
                  {results.map(r => {
                    const val = parseFloat(r[key] || 0)
                    const isProfit = key === 'net_profit'
                    return (
                      <td key={r.id} style={{
                        fontWeight: ['net_profit', 'total_variable_cost'].includes(key) ? 700 : 400,
                        color: isProfit ? (val >= 0 ? 'var(--success)' : 'var(--danger)') : 'inherit'
                      }}>
                        {isPct ? `${(val * 100).toFixed(dec)}%` : `Rs ${fmt(val, dec)}`}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
