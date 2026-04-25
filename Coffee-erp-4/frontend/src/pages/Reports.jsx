import { useState } from 'react'
import api from '../api/client'

export default function Reports() {
  const [downloading, setDownloading] = useState(false)

  const downloadReport = async () => {
    setDownloading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/reports/export/costing-report', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'coffee_erp_report.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const REPORT_CARDS = [
    {
      icon: '🧮',
      title: 'Full Costing & P&L Report',
      desc: 'Excel export with Summary_Compare, Annual_PnL, Procurement ledger, and Expense GL — mirrors your original Excel file structure.',
      action: downloadReport,
      label: downloading ? 'Generating…' : '⬇ Download Excel',
      color: '#d8f3dc',
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📄 Reports</h1>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Export data in Excel format</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {REPORT_CARDS.map((r, i) => (
          <div key={i} className="card" style={{ borderTop: `4px solid var(--accent)`, background: r.color }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{r.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)', marginBottom: 6 }}>{r.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>{r.desc}</div>
            <button className="btn btn-primary" onClick={r.action} disabled={downloading}>
              {r.label}
            </button>
          </div>
        ))}

        {/* Data Summary Card */}
        <div className="card" style={{ borderTop: '4px solid var(--accent-light)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)', marginBottom: 6 }}>System Overview</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
            <div>✅ 9 ERP Modules</div>
            <div>✅ 4 Coffee Source Types</div>
            <div>✅ Full Value Chain Costing</div>
            <div>✅ Chart of Accounts (GL)</div>
            <div>✅ Inventory Management</div>
            <div>✅ Sales Tracking</div>
            <div>✅ Excel Export</div>
            <div>✅ JWT Auth + Roles</div>
            <div>✅ PostgreSQL Database</div>
            <div>✅ Docker Compose</div>
          </div>
        </div>

        {/* API Docs Card */}
        <div className="card" style={{ borderTop: '4px solid #a29bfe' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔌</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)', marginBottom: 6 }}>API Documentation</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Interactive Swagger API docs — explore all endpoints, test requests, and view schemas.
          </div>
          <a href="/api/docs" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            🔗 Open API Docs
          </a>
        </div>
      </div>

      {/* Endpoints Reference */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">API Endpoint Reference</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {[
            ['Authentication', ['/api/auth/token', '/api/auth/me', '/api/auth/register']],
            ['Batches', ['/api/batches/', '/api/batches/{id}', '/api/batches/{id}/calculate']],
            ['Procurement', ['/api/procurement/', '/api/procurement/{id}']],
            ['Processing', ['/api/processing/', '/api/processing/{id}']],
            ['Costing', ['/api/costing/', '/api/costing/compare', '/api/costing/batch/{id}']],
            ['Inventory', ['/api/inventory/', '/api/inventory/{type}/adjust']],
            ['Sales', ['/api/sales/', '/api/sales/summary']],
            ['Expenses', ['/api/expenses/', '/api/expenses/by-gl', '/api/expenses/gl-groups']],
            ['Dashboard', ['/api/dashboard/kpis', '/api/dashboard/profit-by-source', '/api/dashboard/annual-pnl']],
            ['Reports', ['/api/reports/export/costing-report']],
          ].map(([group, endpoints]) => (
            <div key={group} style={{ background: 'var(--bg)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--primary)', marginBottom: 6 }}>{group}</div>
              {endpoints.map(ep => (
                <div key={ep} style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', padding: '2px 0' }}>{ep}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
