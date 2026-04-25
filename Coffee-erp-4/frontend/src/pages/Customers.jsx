import CrudPage from '../components/CrudPage.jsx'

const fields = [
  { name: 'customer_name', label: 'Customer Name', required: true },
  { name: 'customer_type', label: 'Customer Type', type: 'select', options: [
    { value: 'cafe', label: 'Cafe' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'retail', label: 'Retail' },
    { value: 'distributor', label: 'Distributor' },
  ] },
  { name: 'phone', label: 'Phone' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'district', label: 'District' },
  { name: 'city', label: 'City' },
  { name: 'payment_terms', label: 'Payment Terms' },
  { name: 'credit_limit', label: 'Credit Limit', type: 'number' },
  { name: 'roast_preference', label: 'Roast Preference' },
  { name: 'address', label: 'Address', fullWidth: true },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
]

const columns = [
  { label: 'Customer', key: 'customer_name' },
  { label: 'Type', key: 'customer_type' },
  { label: 'Phone', key: 'phone' },
  { label: 'Contacts', key: 'contacts_count' },
  { label: 'Quotes', key: 'quotations_count' },
  { label: 'Orders', key: 'orders_count' },
  { label: 'Open Tasks', key: 'open_tasks_count' },
]

export default function Customers() {
  return (
    <CrudPage
      title="Customers"
      icon="🏪"
      endpoint="/customers/"
      fields={fields}
      columns={columns}
      initialForm={{ customer_name: '', customer_type: 'cafe', phone: '', email: '', district: '', city: '', payment_terms: '', credit_limit: 0, roast_preference: '', address: '', notes: '' }}
      emptyText="No customers yet"
    />
  )
}
