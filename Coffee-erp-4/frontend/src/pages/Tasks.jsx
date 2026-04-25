import api from '../api/client'
import CrudPage from '../components/CrudPage.jsx'

const fields = [
  { name: 'title', label: 'Task Title', required: true },
  { name: 'task_type', label: 'Task Type', type: 'select', options: [
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'payment_check', label: 'Payment Check' },
    { value: 'sample_delivery', label: 'Sample Delivery' },
  ] },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ] },
  { name: 'priority', label: 'Priority', type: 'select', options: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ] },
  { name: 'due_date', label: 'Due Date', type: 'date' },
  { name: 'collector_id', label: 'Collector', type: 'select', optionSource: 'collectors', optionValue: 'id', optionLabel: 'collector_name' },
  { name: 'customer_id', label: 'Customer', type: 'select', optionSource: 'customers', optionValue: 'id', optionLabel: 'customer_name' },
  { name: 'contact_id', label: 'Contact', type: 'select', optionSource: 'contacts', optionValue: 'id', optionLabel: 'full_name' },
  { name: 'lead_id', label: 'Lead', type: 'select', optionSource: 'leads', optionValue: 'id', optionLabel: 'lead_title' },
  { name: 'quotation_id', label: 'Quotation', type: 'select', optionSource: 'quotations', optionValue: 'id', optionLabel: 'quote_no' },
  { name: 'order_id', label: 'Order', type: 'select', optionSource: 'orders', optionValue: 'id', optionLabel: 'order_no' },
  { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
]

const columns = [
  { label: 'Task', key: 'title' },
  { label: 'Status', key: 'status' },
  { label: 'Priority', key: 'priority' },
  { label: 'Customer', key: 'customer_name' },
  { label: 'Lead', key: 'lead_title' },
  { label: 'Due', key: 'due_date' },
]

export default function Tasks() {
  return (
    <CrudPage
      title="Tasks"
      icon="✅"
      endpoint="/tasks/"
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
      initialForm={{ title: '', task_type: 'follow_up', status: 'open', priority: 'medium', due_date: '', collector_id: '', customer_id: '', contact_id: '', lead_id: '', quotation_id: '', order_id: '', description: '' }}
      emptyText="No tasks yet"
    />
  )
}
