import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../api/client'

const fmt = n => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })

const ACCOUNTS_MAP = [
  { main: 'Fresh Cherry Procurement', sub: 'Purchase cost per kg', gl: 'COGS - Raw Material' },
  { main: 'Fresh Cherry Procurement', sub: 'Farmer payment / collection commission', gl: 'COGS - Raw Material' },
  { main: 'Dry Cherry Procurement', sub: 'Purchase cost', gl: 'COGS - Raw Material' },
  { main: 'Parchment Procurement', sub: 'Purchase cost', gl: 'COGS - Raw Material' },
  { main: 'Green Bean Procurement', sub: 'Purchase cost', gl: 'COGS - Raw Material' },
  { main: 'Inbound Transport', sub: 'Village to factory freight', gl: 'COGS - Logistics' },
  { main: 'Processing', sub: 'Fresh cherry pulping / washing / drying', gl: 'COGS - Processing' },
  { main: 'Processing', sub: 'Dry cherry cleaning / sorting', gl: 'COGS - Processing' },
  { main: 'Hulling', sub: 'Electricity', gl: 'COGS - Utilities' },
  { main: 'Hulling', sub: 'Labour', gl: 'COGS - Labour' },
  { main: 'Roasting', sub: 'Electricity', gl: 'COGS - Utilities' },
  { main: 'Roasting', sub: 'Labour', gl: 'COGS - Labour' },
  { main: 'Packaging', sub: 'Coffee bags / labels / sealing', gl: 'COGS - Packaging' },
  { main: 'Café Variable', sub: 'Milk / sugar / syrups', gl: 'COGS - Café consumables' },
  { main: 'Fixed Costs', sub: 'Rent', gl: 'Fixed - Rent' },
  { main: 'Fixed Costs', sub: 'Salaries', gl: 'Fixed - Salaries' },
  { main: 'Fixed Costs', sub: 'Equipment depreciation', gl: 'Fixed - Equipment depreciation' },
]

const PIE_COLORS = ['#52b788','#f4a261','#a29bfe','#2d6a4f','#ff6b6b','#ffd93d','#6bcb77','#4d96ff']

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [glSummary, setGlSummary] = useState([])
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ expense_date: new Date().toISOString().split('T')[0], main_title: '', sub_title: '', gl_group: '', amount: '', reference_no: '', notes: '' })

  const load = () => Promise.all([
    api.get('/expenses/'),
    api.get('/expenses/by-gl'),
  ]).then(([e, g]) => { setExpenses(e.data); setGlSummary(g.data) })

  useEffect(() => { load() }, [])

  const submit = async ev => {
    ev.preventDefault()
    await api.post('/expenses/', form)
    setShow(false); load()
    setForm({ expense_date: new Date().toISOString().split('T')[0], main_title: '', sub_title: '', gl_group: '', amount: '', reference_no: '', notes: '' })
  }

  const del = async id => { if (confirm('Delete?')) { await api.delete(`/expenses/${id}`); load() } }

  const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0)

  const selectAccount = (acc) => {
    setForm(p => ({ ...p, main_title: acc.main, sub_title: acc.sub, gl_group: acc.gl }))
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💰 Expenses & GL Ledger</h1>
        <button className="btn btn-primary" onClick={() => setShow(!show)}>+ Add Expense</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* GL Summary Chart */}
        <div className="card">
          <div className="section-title">Spend by GL Group</div>
          {glSummary.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={glSummary} dataKey="total" nameKey="gl_group" cx="50%" cy="50%" outerRadius={80}>
                  {glSummary.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [`Rs ${fmt(v)}`, '']} />
                <Legend iconSize={10} formatter={v => v?.replace('COGS - ', '').replace('Fixed - ', '')} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><div className="icon">📊</div><p>No expense data</p></div>}
        </div>

        {/* GL Summary Table */}
        <div className="card">
          <div className="section-title">GL Group Totals</div>
          <table>
            <thead><tr><th>GL Group</th><th>Total (Rs)</th><th>%</th></tr></thead>
            <tbody>
              {glSummary.sort((a,b) => b.total - a.total).map((g, i) => (
                <tr key={i}>
                  <td style={{ fontSize: 12 }}>{g.gl_group}</td>
                  <td style={{ fontWeight: 600 }}>Rs {fmt(g.total)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {totalExpenses > 0 ? `${((g.total / totalExpenses) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
              {glSummary.length > 0 && (
                <tr style={{ borderTop: '2px solid var(--border)' }}>
                  <td style={{ fontWeight: 700 }}>TOTAL</td>
                  <td style={{ fontWeight: 700, color: 'var(--danger)' }}>Rs {fmt(totalExpenses)}</td>
                  <td>100%</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Form */}
      {show && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Add Expense Entry</div>

          {/* Quick-select from Chart of Accounts */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Quick Select from Chart of Accounts</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ACCOUNTS_MAP.map((acc, i) => (
                <button key={i} type="button" className="btn btn-ghost btn-sm" onClick={() => selectAccount(acc)}
                  style={{ fontSize: 11 }}>
                  {acc.main} · {acc.sub}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-group"><label>Date</label><input type="date" value={form.expense_date} onChange={e => setForm(p => ({ ...p, expense_date: e.target.value }))} /></div>
              <div className="form-group"><label>Main Title</label><input value={form.main_title} onChange={e => setForm(p => ({ ...p, main_title: e.target.value }))} required /></div>
              <div className="form-group"><label>Sub Title</label><input value={form.sub_title} onChange={e => setForm(p => ({ ...p, sub_title: e.target.value }))} /></div>
              <div className="form-group"><label>GL Group</label><input value={form.gl_group} onChange={e => setForm(p => ({ ...p, gl_group: e.target.value }))} /></div>
              <div className="form-group"><label>Amount (Rs)</label><input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required /></div>
              <div className="form-group"><label>Reference No</label><input value={form.reference_no} onChange={e => setForm(p => ({ ...p, reference_no: e.target.value }))} /></div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary">Save Expense</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShow(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Expense Ledger Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr><th>Date</th><th>Main Title</th><th>Sub Title</th><th>GL Group</th><th>Amount</th><th>Ref</th><th></th></tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}>
                <td>{e.expense_date}</td>
                <td style={{ fontWeight: 600 }}>{e.main_title}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{e.sub_title || '—'}</td>
                <td><span className="badge badge-blue" style={{ fontSize: 10 }}>{e.gl_group || '—'}</span></td>
                <td style={{ fontWeight: 700, color: 'var(--danger)' }}>Rs {fmt(e.amount)}</td>
                <td style={{ fontSize: 12 }}>{e.reference_no || '—'}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => del(e.id)}>Del</button></td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No expenses recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
