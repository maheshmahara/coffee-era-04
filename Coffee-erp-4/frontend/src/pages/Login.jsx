import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ username: 'admin', password: 'secret' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.username, form.password)
      nav('/')
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Login failed. Check username and password.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 100%)'
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: '40px 36px',
        width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40 }}>☕</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', marginTop: 8 }}>
            Coffee ERP
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Value Chain Management System
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Username</label>
            <input
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              autoComplete="current-password"
              required
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: 20, padding: '12px 14px',
          background: '#f0f7f0', borderRadius: 8, fontSize: 12,
          color: 'var(--text-muted)', lineHeight: 1.8
        }}>
          <strong style={{ color: 'var(--primary)' }}>Default credentials:</strong><br />
          Username: <code style={{ background: '#e0ede0', padding: '1px 5px', borderRadius: 3 }}>admin</code><br />
          Password: <code style={{ background: '#e0ede0', padding: '1px 5px', borderRadius: 3 }}>secret</code>
        </div>
      </div>
    </div>
  )
}
