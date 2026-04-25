import api from '../api/client'
import CrudPage from '../components/CrudPage.jsx'

const fields = [
  { name: 'lead_title', label: 'Lead Title', required: true },
  { name: 'source', label: 'Source', type: 'select', options: [
    { value: 'referral', label: 'Referral' },
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'website', label: 'Website' },
    { value: 'social', label: 'Social' },
    { value: 'event', label: 'Event' },
  ] },
  { name: 'stage', label: 'Stage', type: 'select', options: [
    { value: 'new', label: 'New' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal_sent', label: 'Proposal Sent' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
  ] },
  { name: 'customer_id', label: 'Customer', type: 'select', optionSource: 'customers', optionValue: 'id', optionLabel: 'customer_name' },
  { name: 'contact_id', label: 'Contact', type: 'select', optionSource: 'contacts', optionValue: 'id', optionLabel: 'full_name' },
  { name: 'expected_value', label: 'Expected Value', type: 'number' },
  { name: 'probability', label: 'Probability %', type: 'number' },
  { name: 'expected_close_date', label: 'Expected Close', type: 'date' },
  { name: 'next_follow_up_date', label: 'Next Follow-up', type: 'date' },
  { name: 'summary', label: 'Summary', type: 'textarea', fullWidth: true },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
]

const columns = [
  { label: 'Lead', key: 'lead_title' },
  { label: 'Customer', key: 'customer_name' },
  { label: 'Stage', key: 'stage' },
  { label: 'Value', render: r => `Rs ${Number(r.expected_value || 0).toLocaleString('en-IN')}` },
  { label: 'Probability', render: r => `${r.probability || 0}%` },
  { label: 'Open Tasks', key: 'open_tasks_count' },
]

export default function Leads() {
  return (
    <CrudPage
      title="Leads"
      icon="🎯"
      endpoint="/leads/"
      fields={fields}
      columns={columns}
      optionLoaders={{ customers: () => api.get('/customers/'), contacts: () => api.get('/contacts/') }}
      initialForm={{ lead_title: '', source: 'referral', stage: 'new', customer_id: '', contact_id: '', expected_value: 0, probability: 10, expected_close_date: '', next_follow_up_date: '', summary: '', notes: '' }}
      emptyText="No leads yet"
    />
  )
}
