import api from '../api/client'
import CrudPage from '../components/CrudPage.jsx'

const fields = [
  { name: 'order_no', label: 'Order No', required: true },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'new', label: 'New' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ] },
  { name: 'payment_status', label: 'Payment Status', type: 'select', options: [
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
  ] },
  { name: 'fulfillment_status', label: 'Fulfillment', type: 'select', options: [
    { value: 'queued', label: 'Queued' },
    { value: 'roasting', label: 'Roasting' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
  ] },
  { name: 'order_date', label: 'Order Date', type: 'date' },
  { name: 'delivery_date', label: 'Delivery Date', type: 'date' },
  { name: 'customer_id', label: 'Customer', type: 'select', optionSource: 'customers', optionValue: 'id', optionLabel: 'customer_name', required: true },
  { name: 'contact_id', label: 'Contact', type: 'select', optionSource: 'contacts', optionValue: 'id', optionLabel: 'full_name' },
  { name: 'quotation_id', label: 'Quotation', type: 'select', optionSource: 'quotations', optionValue: 'id', optionLabel: 'quote_no' },
  { name: 'product_type', label: 'Product Type', type: 'select', options: [
    { value: 'roasted_bean', label: 'Roasted Bean' },
    { value: 'green_bean', label: 'Green Bean' },
    { value: 'cafe_cup', label: 'Cafe Cup' },
  ] },
  { name: 'quantity_kg', label: 'Qty Kg', type: 'number' },
  { name: 'quantity_cups', label: 'Qty Cups', type: 'number' },
  { name: 'unit_price', label: 'Unit Price', type: 'number' },
  { name: 'total_amount', label: 'Total Amount', type: 'number' },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
]

const columns = [
  { label: 'Order', key: 'order_no' },
  { label: 'Customer', key: 'customer_name' },
  { label: 'Contact', key: 'contact_name' },
  { label: 'Status', key: 'status' },
  { label: 'Payment', key: 'payment_status' },
  { label: 'Total', render: r => `Rs ${Number(r.total_amount || 0).toLocaleString('en-IN')}` },
]

export default function Orders() {
  return (
    <CrudPage
      title="Orders"
      icon="📦"
      endpoint="/orders/"
      fields={fields}
      columns={columns}
      optionLoaders={{ customers: () => api.get('/customers/'), contacts: () => api.get('/contacts/'), quotations: () => api.get('/quotations/') }}
      initialForm={{ order_no: '', status: 'new', payment_status: 'pending', fulfillment_status: 'queued', order_date: '', delivery_date: '', customer_id: '', contact_id: '', quotation_id: '', product_type: 'roasted_bean', quantity_kg: 0, quantity_cups: 0, unit_price: 0, total_amount: 0, notes: '' }}
      emptyText="No customer orders yet"
    />
  )
}
