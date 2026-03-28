const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entity: { type: String },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
