import CrudPage from '../components/CrudPage.jsx'

const fields = [
  { name: 'collector_name', label: 'Collector Name', required: true },
  { name: 'phone', label: 'Phone' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'district', label: 'District' },
  { name: 'municipality', label: 'Municipality' },
  { name: 'village', label: 'Village' },
  { name: 'contract_status', label: 'Contract Status', type: 'select', options: [
    { value: 'contracted', label: 'Contracted' },
    { value: 'non_contracted', label: 'Non Contracted' },
    { value: 'pending', label: 'Pending' },
  ] },
  { name: 'payment_type', label: 'Payment Type', type: 'select', options: [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'mobile_wallet', label: 'Mobile Wallet' },
  ] },
  { name: 'preferred_source_type', label: 'Preferred Source', type: 'select', options: [
    { value: 'fresh_cherry', label: 'Fresh Cherry' },
    { value: 'dry_cherry', label: 'Dry Cherry' },
    { value: 'parchment', label: 'Parchment' },
    { value: 'green_bean', label: 'Green Bean' },
  ] },
  { name: 'rating', label: 'Rating', type: 'number' },
  { name: 'address', label: 'Address', fullWidth: true },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
]

const columns = [
  { label: 'Name', key: 'collector_name' },
  { label: 'District', key: 'district' },
  { label: 'Phone', key: 'phone' },
  { label: 'Contract', key: 'contract_status' },
  { label: 'Procurements', key: 'procurement_count' },
  { label: 'Total Kg', render: r => Number(r.total_procured_kg || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 }) },
  { label: 'Open Tasks', key: 'open_tasks_count' },
]

export default function Collectors() {
  return (
    <CrudPage
      title="Collectors"
      icon="🧑‍🌾"
      endpoint="/collectors/"
      fields={fields}
      columns={columns}
      initialForm={{ collector_name: '', phone: '', email: '', district: '', municipality: '', village: '', contract_status: 'non_contracted', payment_type: 'cash', preferred_source_type: 'parchment', rating: 3, address: '', notes: '' }}
      emptyText="No collectors yet"
    />
  )
}
