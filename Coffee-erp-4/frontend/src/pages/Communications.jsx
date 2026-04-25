import api from '../api/client'
import CrudPage from '../components/CrudPage.jsx'

const fields = [
  { name: 'direction', label: 'Direction', type: 'select', options: [
    { value: 'outbound', label: 'Outbound' },
    { value: 'inbound', label: 'Inbound' },
  ] },
  { name: 'channel', label: 'Channel', type: 'select', options: [
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'meeting', label: 'Meeting' },
  ] },
  { name: 'subject', label: 'Subject' },
  { name: 'communication_at', label: 'When', type: 'datetime-local' },
  { name: 'collector_id', label: 'Collector', type: 'select', optionSource: 'collectors', optionValue: 'id', optionLabel: 'collector_name' },
  { name: 'customer_id', label: 'Customer', type: 'select', optionSource: 'customers', optionValue: 'id', optionLabel: 'customer_name' },
  { name: 'contact_id', label: 'Contact', type: 'select', optionSource: 'contacts', optionValue: 'id', optionLabel: 'full_name' },
  { name: 'lead_id', label: 'Lead', type: 'select', optionSource: 'leads', optionValue: 'id', optionLabel: 'lead_title' },
  { name: 'quotation_id', label: 'Quotation', type: 'select', optionSource: 'quotations', optionValue: 'id', optionLabel: 'quote_no' },
  { name: 'order_id', label: 'Order', type: 'select', optionSource: 'orders', optionValue: 'id', optionLabel: 'order_no' },
  { name: 'summary', label: 'Summary', type: 'textarea', fullWidth: true },
]

const columns = [
  { label: 'When', key: 'communication_at' },
  { label: 'Channel', key: 'channel' },
  { label: 'Direction', key: 'direction' },
  { label: 'Subject', key: 'subject' },
  { label: 'Customer', key: 'customer_name' },
  { label: 'Lead', key: 'lead_title' },
]

export default function Communications() {
  return (
    <CrudPage
      title="Communications"
      icon="💬"
      endpoint="/communications/"
      fields={fields}
      columns={columns}
      optionLoaders={{
        collectors: () => api.get('/collectors/'),
        customers: () => api.get('/customers/'),
        contacts: () => api.get('/contacts/'),
        leads: () => api.get('/leads/'),
        quotations: () => api.get('/quotations/'),
        orders: () => api.get('/orders/'),
      }}
      initialForm={{ direction: 'outbound', channel: 'phone', subject: '', communication_at: '', collector_id: '', customer_id: '', contact_id: '', lead_id: '', quotation_id: '', order_id: '', summary: '' }}
      emptyText="No communication logs yet"
    />
  )
}
