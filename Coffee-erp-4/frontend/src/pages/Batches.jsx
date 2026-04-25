import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'

const STATUS_BADGE = { confirmed: 'badge-green', draft: 'badge-yellow', archived: 'badge-blue' }
const fmt = n => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

export default function Batches() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  const load = () => api.get('/batches/').then(r => setBatches(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const del = async id => {
    if (!confirm('Delete this batch?')) return
    await api.delete(`/batches/${id}`)
    load()
  }

  const recalc = async id => {
    await api.post(`/batches/${id}/calculate`)
    alert('Costing recalculated!')
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📦 Production Batches</h1>
        <Link to="/batches/new" className="btn btn-primary">+ New Batch</Link>
      </div>

      {loading ? <div className="spinner" /> : batches.length === 0 ? (
        <div className="empty-state"><div className="icon">📦</div><p>No batches yet. Create your first batch.</p></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Batch Name</th><th>Date</th><th>Fresh Cherry</th>
                  <th>Dry Cherry</th><th>Parchment</th><th>Green Beans</th>
                  <th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(b => (
                  <tr key={b.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{b.id}</td>
                    <td style={{ fontWeight: 600 }}>{b.batch_name}</td>
                    <td>{b.batch_date}</td>
                    <td>{b.fresh_cherry_qty > 0 ? `${fmt(b.fresh_cherry_qty)} kg @ Rs${fmt(b.fresh_cherry_price)}` : '—'}</td>
                    <td>{b.dry_cherry_qty > 0 ? `${fmt(b.dry_cherry_qty)} kg @ Rs${fmt(b.dry_cherry_price)}` : '—'}</td>
                    <td>{b.parchment_qty > 0 ? `${fmt(b.parchment_qty)} kg @ Rs${fmt(b.parchment_price)}` : '—'}</td>
                    <td>{b.green_bean_qty > 0 ? `${fmt(b.green_bean_qty)} kg @ Rs${fmt(b.green_bean_price)}` : '—'}</td>
                    <td><span className={`badge ${STATUS_BADGE[b.status] || 'badge-blue'}`}>{b.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => nav(`/batches/${b.id}/edit`)}>Edit</button>
                        <button className="btn btn-accent btn-sm" onClick={() => recalc(b.id)}>Recalc</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(b.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
