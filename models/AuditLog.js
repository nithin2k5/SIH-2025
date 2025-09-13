// AuditLog model schema
const AuditLogSchema = [
  "log_id","sheet_name","entity_id","action","user_id","timestamp","diff","notes"
];

module.exports = AuditLogSchema;
