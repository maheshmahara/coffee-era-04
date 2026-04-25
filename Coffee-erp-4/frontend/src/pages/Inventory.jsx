import { useState, useEffect } from 'react'
import api from '../api/client'

const fmt = n => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
const ITEM_TYPES = ['fresh_cherry','dry_cherry','parchment','green_bean','roasted_bean','packaged']
const ITEM_LABELS = {
  fresh_cherry: '🍒 Fresh Cherry', dry_cherry: '🟤 Dry Cherry',
  parchment: '📦 Parchment', green_bean: '🟢 Green Bean',
  roasted_bean: '☕ Roasted Bean', packaged: '🎁 Packaged'
}
const ITEM_COLORS = {
  fresh_cherry: '#d8f3dc', dry_cherry: '#fef3c7',
  parchment: '#ede9fe', green_bean: '#d1fae5',
  roasted_bean: '#fde8d8', packaged: '#dbeafe'
}

export default function Inventory() {
  const [inventory, setInventory] = useState([])
  const [editItem, setEditItem] = useState(null)
  const [adjustItem, setAdjustItem] = useState(null)
  const [delta, setDelta] = useState(0)
  const [editForm, setEditForm] = useState({ quantity_kg: 0, location: '' })

  const load = () => api.get('/inventory/').then(r => setInventory(r.data))
  useEffect(() => { load() }, [])

  const saveEdit = async () => {
    await api.post('/inventory/', { item_type: editItem.item_type, ...editForm })
    setEditItem(null); load()
  }

  const applyAdjust = async () => {
    await api.patch(`/inventory/${adjustItem.item_type}/adjust?delta=${delta}`)
    setAdjustItem(null); setDelta(0); load()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏭 Inventory</h1>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live stock levels across all stages</span>
      </div>

      {/* Visual Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {ITEM_TYPES.map(type => {
          const item = inventory.find(i => i.item_type === type)
          const qty = item ? parseFloat(item.quantity_kg) : 0
          return (
            <div key={type} className="card" style={{ borderTop: `4px solid ${ITEM_COLORS[type]}`, background: ITEM_COLORS[type] }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>{ITEM_LABELS[type]}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: qty > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{fmt(qty)} kg</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>{item?.location || 'Not set'}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setEditItem({ item_type: type }); setEditForm({ quantity_kg: qty, location: item?.location || 'Main Warehouse' }) }}>Edit</button>
                <button className="btn btn-accent btn-sm" style={{ flex: 1 }} onClick={() => { setAdjustItem({ item_type: type, quantity_kg: qty }); setDelta(0) }}>±Adjust</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: 360 }}>
            <div className="section-title">Edit {ITEM_LABELS[editItem.item_type]}</div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Quantity (kg)</label>
              <input type="number" value={editForm.quantity_kg} onChange={e => setEditForm(p => ({ ...p, quantity_kg: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Location</label>
              <input value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={saveEdit}>Save</button>
              <button className="btn btn-ghost" onClick={() => setEditItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {adjustItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: 360 }}>
            <div className="section-title">Adjust {ITEM_LABELS[adjustItem.item_type]}</div>
            <div style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: 13 }}>
              Current: <strong>{fmt(adjustItem.quantity_kg)} kg</strong>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Adjustment (+ to add, − to reduce)</label>
              <input type="number" value={delta} onChange={e => setDelta(parseFloat(e.target.value) || 0)} step="0.1" />
            </div>
            <div style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 13 }}>
              New Total: <strong>{fmt(parseFloat(adjustItem.quantity_kg) + delta)} kg</strong>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={applyAdjust}>Apply</button>
              <button className="btn btn-ghost" onClick={() => setAdjustItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Table view */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr><th>Item Type</th><th>Quantity (kg)</th><th>Location</th><th>Last Updated</th></tr>
          </thead>
          <tbody>
            {inventory.map(i => (
              <tr key={i.id}>
                <td style={{ fontWeight: 600 }}>{ITEM_LABELS[i.item_type] || i.item_type}</td>
                <td style={{ fontWeight: 700, color: parseFloat(i.quantity_kg) > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                  {fmt(i.quantity_kg)} kg
                </td>
                <td>{i.location}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i.last_updated ? new Date(i.last_updated).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
