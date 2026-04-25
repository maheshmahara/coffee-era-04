import { useState, useEffect } from 'react'
import api from '../api/client'

const fmt = n => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
const SOURCE_OPTS = ['fresh_cherry', 'dry_cherry', 'parchment', 'green_bean']
const SOURCE_LABELS = { fresh_cherry: 'Fresh Cherry', dry_cherry: 'Dry Cherry', parchment: 'Parchment', green_bean: 'Green Beans' }

export default function Procurement() {
  const [records, setRecords] = useState([])
  const [collectors, setCollectors] = useState([])
  const [form, setForm] = useState({ source_type: 'fresh_cherry', collector_id: '', supplier_name: '', quantity_kg: '', price_per_kg: '', transport_cost: 0, invoice_ref: '', notes: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const [recordsRes, collectorsRes] = await Promise.all([
      api.get('/procurement/'),
      api.get('/collectors/'),
    ])
    setRecords(recordsRes.data)
    setCollectors(collectorsRes.data)
  }

  useEffect(() => { load() }, [])

  const submit = async e => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form }
      if (!payload.collector_id) payload.collector_id = null
      if (!payload.supplier_name) payload.supplier_name = null
      await api.post('/procurement/', payload)
      setShow(false)
      await load()
      setForm({ source_type: 'fresh_cherry', collector_id: '', supplier_name: '', quantity_kg: '', price_per_kg: '', transport_cost: 0, invoice_ref: '', notes: '' })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to save procurement')
    }
  }

  const del = async id => { if (window.confirm('Delete?')) { await api.delete(`/procurement/${id}`); load() } }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🌿 Procurement</h1>
        <button className="btn btn-primary" onClick={() => setShow(!show)}>+ Add Record</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {show && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">New Procurement Record</div>
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Source Type</label>
                <select value={form.source_type} onChange={e => setForm(p => ({ ...p, source_type: e.target.value }))}>
                  {SOURCE_OPTS.map(o => <option key={o} value={o}>{SOURCE_LABELS[o]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Collector</label>
                <select value={form.collector_id} onChange={e => {
                  const selected = collectors.find(c => String(c.id) === e.target.value)
                  setForm(p => ({ ...p, collector_id: e.target.value, supplier_name: selected?.collector_name || p.supplier_name }))
                }}>
                  <option value="">Select collector</option>
                  {collectors.map(c => <option key={c.id} value={c.id}>{c.collector_name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Supplier Name</label><input value={form.supplier_name} onChange={e => setForm(p => ({ ...p, supplier_name: e.target.value }))} /></div>
              <div className="form-group"><label>Quantity (kg)</label><input type="number" value={form.quantity_kg} onChange={e => setForm(p => ({ ...p, quantity_kg: e.target.value }))} required /></div>
              <div className="form-group"><label>Price per kg (Rs)</label><input type="number" value={form.price_per_kg} onChange={e => setForm(p => ({ ...p, price_per_kg: e.target.value }))} required /></div>
              <div className="form-group"><label>Transport Cost (Rs)</label><input type="number" value={form.transport_cost} onChange={e => setForm(p => ({ ...p, transport_cost: e.target.value }))} /></div>
              <div className="form-group"><label>Invoice Ref</label><input value={form.invoice_ref} onChange={e => setForm(p => ({ ...p, invoice_ref: e.target.value }))} /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Notes</label><textarea rows="3" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShow(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead><tr><th>#</th><th>Source</th><th>Collector</th><th>Supplier</th><th>Qty (kg)</th><th>Price/kg</th><th>Total Cost</th><th>Transport</th><th>Date</th><th>Invoice</th><th></th></tr></thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td><span className={`tag tag-${r.source_type.split('_')[0]}`}>{SOURCE_LABELS[r.source_type]}</span></td>
                <td>{r.collector_name || '—'}</td>
                <td>{r.supplier_name || '—'}</td>
                <td>{fmt(r.quantity_kg)}</td>
                <td>Rs {fmt(r.price_per_kg)}</td>
                <td style={{ fontWeight: 600 }}>Rs {fmt(parseFloat(r.quantity_kg) * parseFloat(r.price_per_kg))}</td>
                <td>Rs {fmt(r.transport_cost)}</td>
                <td>{r.purchase_date}</td>
                <td>{r.invoice_ref || '—'}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => del(r.id)}>Del</button></td>
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan={11} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No procurement records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
