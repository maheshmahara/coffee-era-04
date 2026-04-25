import { useState, useEffect } from 'react'
import api from '../api/client'

const fmt = n => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })

export default function Processing() {
  const [records, setRecords] = useState([])
  const [form, setForm] = useState({ stage: 'pulping', input_qty_kg: '', output_qty_kg: '', electricity_cost: 0, labour_cost: 0, other_cost: 0, operator_name: '', notes: '' })
  const [show, setShow] = useState(false)

  const load = () => api.get('/processing/').then(r => setRecords(r.data))
  useEffect(() => { load() }, [])

  const submit = async e => {
    e.preventDefault()
    const payload = { ...form }
    if (payload.input_qty_kg && payload.output_qty_kg) {
      payload.actual_yield = parseFloat(payload.output_qty_kg) / parseFloat(payload.input_qty_kg)
    }
    await api.post('/processing/', payload)
    setShow(false); load()
  }

  const del = async id => { if (confirm('Delete?')) { await api.delete(`/processing/${id}`); load() } }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ Processing Stages</h1>
        <button className="btn btn-primary" onClick={() => setShow(!show)}>+ Add Record</button>
      </div>

      {show && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">New Processing Record</div>
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Stage</label>
                <select value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}>
                  {['pulping','hulling','roasting','packaging'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group"><label>Input Qty (kg)</label><input type="number" value={form.input_qty_kg} onChange={e => setForm(p => ({ ...p, input_qty_kg: e.target.value }))} /></div>
              <div className="form-group"><label>Output Qty (kg)</label><input type="number" value={form.output_qty_kg} onChange={e => setForm(p => ({ ...p, output_qty_kg: e.target.value }))} /></div>
              <div className="form-group"><label>Electricity Cost (Rs)</label><input type="number" value={form.electricity_cost} onChange={e => setForm(p => ({ ...p, electricity_cost: e.target.value }))} /></div>
              <div className="form-group"><label>Labour Cost (Rs)</label><input type="number" value={form.labour_cost} onChange={e => setForm(p => ({ ...p, labour_cost: e.target.value }))} /></div>
              <div className="form-group"><label>Other Cost (Rs)</label><input type="number" value={form.other_cost} onChange={e => setForm(p => ({ ...p, other_cost: e.target.value }))} /></div>
              <div className="form-group"><label>Operator Name</label><input value={form.operator_name} onChange={e => setForm(p => ({ ...p, operator_name: e.target.value }))} /></div>
              <div className="form-group"><label>Notes</label><input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
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
          <thead>
            <tr>
              <th>#</th><th>Stage</th><th>Input (kg)</th><th>Output (kg)</th>
              <th>Actual Yield</th><th>Electricity</th><th>Labour</th>
              <th>Operator</th><th>Date</th><th></th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td><span className="badge badge-blue">{r.stage}</span></td>
                <td>{fmt(r.input_qty_kg)}</td>
                <td>{fmt(r.output_qty_kg)}</td>
                <td>{r.actual_yield ? `${(parseFloat(r.actual_yield)*100).toFixed(1)}%` : '—'}</td>
                <td>Rs {fmt(r.electricity_cost)}</td>
                <td>Rs {fmt(r.labour_cost)}</td>
                <td>{r.operator_name || '—'}</td>
                <td>{r.process_date}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => del(r.id)}>Del</button></td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No processing records yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
