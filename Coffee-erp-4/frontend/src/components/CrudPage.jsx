import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const fmt = value => {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

export default function CrudPage({
  title,
  endpoint,
  icon = '🗂️',
  fields,
  columns,
  initialForm,
  optionLoaders = {},
  emptyText = 'No records yet',
}) {
  const [records, setRecords] = useState([])
  const [form, setForm] = useState(initialForm)
  const [show, setShow] = useState(false)
  const [options, setOptions] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const optionKeys = useMemo(() => Object.keys(optionLoaders), [optionLoaders])

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [listRes, ...optionRes] = await Promise.all([
        api.get(endpoint),
        ...optionKeys.map(key => optionLoaders[key]()),
      ])
      setRecords(listRes.data)
      const next = {}
      optionRes.forEach((res, idx) => { next[optionKeys[idx]] = res.data })
      setOptions(next)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const onChange = (name, value) => setForm(prev => ({ ...prev, [name]: value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form }
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null
      })
      await api.post(endpoint, payload)
      setForm(initialForm)
      setShow(false)
      loadAll()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to save record')
    }
  }

  const del = async id => {
    if (!window.confirm('Delete this record?')) return
    try {
      await api.delete(`${endpoint}${id}`)
      loadAll()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete record')
    }
  }

  const renderField = field => {
    const value = form[field.name] ?? ''
    const commonProps = {
      value: value,
      onChange: e => onChange(field.name, field.type === 'checkbox' ? e.target.checked : e.target.value),
      required: !!field.required,
      placeholder: field.placeholder || '',
    }

    if (field.type === 'textarea') return <textarea rows={field.rows || 3} {...commonProps} />

    if (field.type === 'checkbox') {
      return <input type="checkbox" checked={!!value} onChange={e => onChange(field.name, e.target.checked)} />
    }

    if (field.type === 'select') {
      const opts = field.options || options[field.optionSource] || []
      return (
        <select value={value ?? ''} onChange={e => onChange(field.name, e.target.value)}>
          <option value="">{field.blankLabel || 'Select'}</option>
          {opts.map(opt => {
            const val = field.optionValue ? opt[field.optionValue] : opt.value
            const label = field.optionLabel ? opt[field.optionLabel] : opt.label
            return <option key={`${field.name}-${val}`} value={val}>{label}</option>
          })}
        </select>
      )
    }

    return <input type={field.type || 'text'} {...commonProps} />
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{icon} {title}</h1>
        <button className="btn btn-primary" onClick={() => setShow(!show)}>+ Add</button>
      </div>

      {error && <div className="alert alert-error">{fmt(error)}</div>}

      {show && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">New {title.slice(0, -1) || title}</div>
          <form onSubmit={submit}>
            <div className="form-grid">
              {fields.map(field => (
                <div key={field.name} className="form-group" style={field.fullWidth ? { gridColumn: '1 / -1' } : undefined}>
                  <label>{field.label}</label>
                  {renderField(field)}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShow(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <div className="spinner" /> : (
          <table>
            <thead>
              <tr>
                {columns.map(col => <th key={col.label}>{col.label}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map(row => (
                <tr key={row.id}>
                  {columns.map(col => <td key={`${row.id}-${col.label}`}>{col.render ? col.render(row) : fmt(row[col.key])}</td>)}
                  <td><button className="btn btn-danger btn-sm" onClick={() => del(row.id)}>Del</button></td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>{emptyText}</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
