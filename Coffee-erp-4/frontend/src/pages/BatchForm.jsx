import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'

const DEFAULTS = {
  batch_name: '', batch_date: new Date().toISOString().split('T')[0],
  fresh_cherry_qty: 500, fresh_cherry_price: 250,
  dry_cherry_qty: 500, dry_cherry_price: 400,
  parchment_qty: 500, parchment_price: 1400,
  green_bean_qty: 0, green_bean_price: 1900,
  fresh_to_parchment_yield: 0.30, dry_to_green_yield: 0.50,
  parchment_to_green_yield: 0.75, green_to_roasted_yield: 0.85,
  cups_per_kg_roasted: 50,
  transport_cost_per_kg: 30, fresh_processing_cost_per_kg: 20,
  dry_cleaning_cost_per_kg: 10, hulling_electricity_per_kg: 25,
  hulling_labour_per_kg: 10, roasting_electricity_per_kg: 25,
  roasting_labour_per_kg: 10, packaging_cost_per_kg: 60,
  cafe_variable_cost_per_cup: 30, cup_selling_price: 130,
  annual_fixed_cost: 416000, status: 'draft', notes: ''
}

function Field({ label, name, form, onChange, type = 'number', step = '0.01' }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input type={type} name={name} value={form[name] ?? ''} step={step} onChange={onChange} />
    </div>
  )
}

export default function BatchForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const [form, setForm] = useState(DEFAULTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isEdit = Boolean(id)

  useEffect(() => {
    if (isEdit) api.get(`/batches/${id}`).then(r => setForm({ ...DEFAULTS, ...r.data }))
  }, [id])

  const onChange = e => {
    const { name, value, type } = e.target
    setForm(p => ({ ...p, [name]: type === 'number' ? parseFloat(value) || 0 : value }))
  }

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      if (isEdit) await api.put(`/batches/${id}`, form)
      else await api.post('/batches/', form)
      nav('/batches')
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred')
    } finally { setLoading(false) }
  }

  const S = ({ title }) => <div style={{ gridColumn: '1/-1', borderBottom: '2px solid var(--accent-light)', paddingBottom: 4, marginTop: 8 }}><span className="section-title" style={{ marginBottom: 0 }}>{title}</span></div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? '✏️ Edit Batch' : '➕ New Batch'}</h1>
        <button className="btn btn-ghost" onClick={() => nav('/batches')}>← Back</button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-grid">
            <S title="Batch Info" />
            <Field label="Batch Name" name="batch_name" form={form} onChange={onChange} type="text" />
            <Field label="Batch Date" name="batch_date" form={form} onChange={onChange} type="date" />
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={onChange}>
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <S title="Volumes & Purchase Prices" />
            <Field label="Fresh Cherry Qty (kg)" name="fresh_cherry_qty" form={form} onChange={onChange} />
            <Field label="Fresh Cherry Price (Rs/kg)" name="fresh_cherry_price" form={form} onChange={onChange} />
            <Field label="Dry Cherry Qty (kg)" name="dry_cherry_qty" form={form} onChange={onChange} />
            <Field label="Dry Cherry Price (Rs/kg)" name="dry_cherry_price" form={form} onChange={onChange} />
            <Field label="Parchment Qty (kg)" name="parchment_qty" form={form} onChange={onChange} />
            <Field label="Parchment Price (Rs/kg)" name="parchment_price" form={form} onChange={onChange} />
            <Field label="Green Bean Qty (kg)" name="green_bean_qty" form={form} onChange={onChange} />
            <Field label="Green Bean Price (Rs/kg)" name="green_bean_price" form={form} onChange={onChange} />

            <S title="Yield Assumptions" />
            <Field label="Fresh Cherry → Parchment Yield" name="fresh_to_parchment_yield" form={form} onChange={onChange} step="0.01" />
            <Field label="Dry Cherry → Green Bean Yield" name="dry_to_green_yield" form={form} onChange={onChange} step="0.01" />
            <Field label="Parchment → Green Bean Yield" name="parchment_to_green_yield" form={form} onChange={onChange} step="0.01" />
            <Field label="Green Bean → Roasted Yield" name="green_to_roasted_yield" form={form} onChange={onChange} step="0.01" />
            <Field label="Cups per kg Roasted" name="cups_per_kg_roasted" form={form} onChange={onChange} step="1" />

            <S title="Processing Costs (Rs/kg)" />
            <Field label="Transport Cost/kg" name="transport_cost_per_kg" form={form} onChange={onChange} />
            <Field label="Fresh Processing Cost/kg" name="fresh_processing_cost_per_kg" form={form} onChange={onChange} />
            <Field label="Dry Cleaning Cost/kg" name="dry_cleaning_cost_per_kg" form={form} onChange={onChange} />
            <Field label="Hulling Electricity/kg" name="hulling_electricity_per_kg" form={form} onChange={onChange} />
            <Field label="Hulling Labour/kg" name="hulling_labour_per_kg" form={form} onChange={onChange} />
            <Field label="Roasting Electricity/kg" name="roasting_electricity_per_kg" form={form} onChange={onChange} />
            <Field label="Roasting Labour/kg" name="roasting_labour_per_kg" form={form} onChange={onChange} />
            <Field label="Packaging Cost/kg Roasted" name="packaging_cost_per_kg" form={form} onChange={onChange} />

            <S title="Sales & Fixed Costs" />
            <Field label="Café Variable Cost/cup (Rs)" name="cafe_variable_cost_per_cup" form={form} onChange={onChange} />
            <Field label="Cup Selling Price (Rs)" name="cup_selling_price" form={form} onChange={onChange} />
            <Field label="Annual Fixed Cost (Rs)" name="annual_fixed_cost" form={form} onChange={onChange} step="1" />

            <S title="Notes" />
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Notes</label>
              <textarea name="notes" value={form.notes || ''} onChange={onChange} rows={3} style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? '💾 Update Batch' : '✅ Create Batch & Calculate'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => nav('/batches')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
