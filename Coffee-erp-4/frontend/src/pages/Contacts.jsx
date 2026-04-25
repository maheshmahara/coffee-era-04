import api from '../api/client'
import CrudPage from '../components/CrudPage.jsx'

const fields = [
  { name: 'customer_id', label: 'Customer', type: 'select', optionSource: 'customers', optionValue: 'id', optionLabel: 'customer_name', required: true },
  { name: 'full_name', label: 'Full Name', required: true },
  { name: 'role_title', label: 'Role / Title' },
  { name: 'phone', label: 'Phone' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'is_primary', label: 'Is Primary', type: 'select', options: [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' },
  ] },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
]

const columns = [
  { label: 'Contact', key: 'full_name' },
  { label: 'Customer', key: 'customer_name' },
  { label: 'Role', key: 'role_title' },
  { label: 'Phone', key: 'phone' },
  { label: 'Email', key: 'email' },
  { label: 'Primary', render: r => (r.is_primary ? 'Yes' : 'No') },
]

export default function Contacts() {
  return (
    <CrudPage
      title="Contacts"
      icon="👤"
      endpoint="/contacts/"
      fields={fields}
      columns={columns}
      optionLoaders={{ customers: () => api.get('/customers/') }}
      initialForm={{ customer_id: '', full_name: '', role_title: '', phone: '', email: '', is_primary: 'false', notes: '' }}
      emptyText="No contacts yet"
    />
  )
}
