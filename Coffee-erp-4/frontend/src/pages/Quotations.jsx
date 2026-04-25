import api from '../api/client'
import CrudPage from '../components/CrudPage.jsx'

const fields = [
  { name: 'quote_no', label: 'Quote No', required: true },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ] },
  { name: 'quote_date', label: 'Quote Date', type: 'date' },
  { name: 'valid_until', label: 'Valid Until', type: 'date' },
  { name: 'customer_id', label: 'Customer', type: 'select', optionSource: 'customers', optionValue: 'id', optionLabel: 'customer_name' },
  { name: 'contact_id', label: 'Contact', type: 'select', optionSource: 'contacts', optionValue: 'id', optionLabel: 'full_name' },
  { name: 'lead_id', label: 'Lead', type: 'select', optionSource: 'leads', optionValue: 'id', optionLabel: 'lead_title' },
  { name: 'subtotal', label: 'Subtotal', type: 'number' },
  { name: 'discount_amount', label: 'Discount', type: 'number' },
  { name: 'tax_amount', label: 'Tax', type: 'number' },
  { name: 'total_amount', label: 'Total', type: 'number' },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
]

const columns = [
  { label: 'Quote', key: 'quote_no' },
  { label: 'Customer', key: 'customer_name' },
  { label: 'Status', key: 'status' },
  { label: 'Date', key: 'quote_date' },
  { label: 'Total', render: r => `Rs ${Number(r.total_amount || 0).toLocaleString('en-IN')}` },
  { label: 'Orders', key: 'order_count' },
]

export default function Quotations() {
  return (
    <CrudPage
      title="Quotations"
      icon="🧾"
      endpoint="/quotations/"
      fields={fields}
      columns={columns}
      optionLoaders={{ customers: () => api.get('/customers/'), contacts: () => api.get('/contacts/'), leads: () => api.get('/leads/') }}
      initialForm={{ quote_no: '', status: 'draft', quote_date: '', valid_until: '', customer_id: '', contact_id: '', lead_id: '', subtotal: 0, discount_amount: 0, tax_amount: 0, total_amount: 0, notes: '' }}
      emptyText="No quotations yet"
    />
  )
}
