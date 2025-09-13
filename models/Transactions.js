// Transactions model schema
const TransactionsSchema = [
  "txn_id","student_id","admission_id","date","amount","currency","payment_mode",
  "gateway_ref","payment_status","receipt_id","created_by","created_at","notes"
];

module.exports = TransactionsSchema;
