import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/client'

const fmt = n => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })

export default function Sales() {
  const [sales, setSales] = useState([])
  const [summary, setSummary] = useState({})
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ sale_date: new Date().toISOString().split('T')[0], product_type: 'cafe_cup', quantity_cups: 0, quantity_kg: 0, unit_price: 130, customer_type: 'retail', notes: '' })

  const load = () => Promise.all([
    api.get('/sales/'),
    api.get('/sales/summary'),
  ]).then(([s, sum]) => { setSales(s.data); setSummary(sum.data) })

  useEffect(() => { load() }, [])

  const submit = async e => {
    e.preventDefault()
    await api.post('/sales/', form)
    setShow(false); load()
  }

  const del = async id => { if (confirm('Delete?')) { await api.delete(`/sales/${id}`); load() } }

  // Chart data - aggregate by date
  const chartData = Object.values(
    sales.reduce((acc, s) => {
      const d = s.sale_date
      if (!acc[d]) acc[d] = { date: d, cups: 0, revenue: 0 }
      acc[d].cups += s.quantity_cups || 0
      acc[d].revenue += (s.quantity_cups || 0) * parseFloat(s.unit_price || 0)
      return acc
    }, {})
  ).slice(-14)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">☕ Sales</h1>
        <button className="btn btn-primary" onClick={() => setShow(!show)}>+ Record Sale</button>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Cups Sold</div>
          <div className="kpi-value">{fmt(summary.total_cups)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value">Rs {fmt(summary.total_revenue)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Revenue/Cup</div>
          <div className="kpi-value">Rs {summary.total_cups > 0 ? fmt(summary.total_revenue / summary.total_cups) : 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Transactions</div>
          <div className="kpi-value">{sales.length}</div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Daily Sales (Last 14 days)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="cups" fill="var(--accent)" name="Cups" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Form */}
      {show && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Record New Sale</div>
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-group"><label>Sale Date</label><input type="date" value={form.sale_date} onChange={e => setForm(p => ({ ...p, sale_date: e.target.value }))} /></div>
              <div className="form-group">
                <label>Product Type</label>
                <select value={form.product_type} onChange={e => setForm(p => ({ ...p, product_type: e.target.value }))}>
                  <option value="cafe_cup">Café Cup</option>
                  <option value="packaged_bag">Packaged Bag</option>
                  <option value="wholesale_kg">Wholesale (kg)</option>
                </select>
              </div>
              <div className="form-group"><label>Cups Sold</label><input type="number" value={form.quantity_cups} onChange={e => setForm(p => ({ ...p, quantity_cups: parseInt(e.target.value) || 0 }))} /></div>
              <div className="form-group"><label>Unit Price (Rs)</label><input type="number" value={form.unit_price} onChange={e => setForm(p => ({ ...p, unit_price: e.target.value }))} /></div>
              <div className="form-group">
                <label>Customer Type</label>
                <select value={form.customer_type} onChange={e => setForm(p => ({ ...p, customer_type: e.target.value }))}>
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="b2b">B2B</option>
                </select>
              </div>
              <div className="form-group"><label>Notes</label><input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary">Save Sale</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShow(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr><th>Date</th><th>Product</th><th>Cups</th><th>Unit Price</th><th>Revenue</th><th>Customer</th><th>Notes</th><th></th></tr>
          </thead>
          <tbody>
            {sales.map(s => (
              <tr key={s.id}>
                <td>{s.sale_date}</td>
                <td><span className="badge badge-green">{s.product_type}</span></td>
                <td style={{ fontWeight: 600 }}>{s.quantity_cups?.toLocaleString()}</td>
                <td>Rs {fmt(s.unit_price)}</td>
                <td style={{ fontWeight: 700, color: 'var(--success)' }}>Rs {fmt((s.quantity_cups || 0) * parseFloat(s.unit_price))}</td>
                <td>{s.customer_type}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.notes || '—'}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => del(s.id)}>Del</button></td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No sales recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
