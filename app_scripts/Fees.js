// Fees management functions

/**
 * Get fee structures
 */
function getFeeStructures(filters = {}) {
  const feeMasterSheet = getSheet('FeeMaster');
  if (!feeMasterSheet) {
    return { success: false, error: 'FeeMaster sheet not found' };
  }

  const data = feeMasterSheet.getDataRange().getValues();
  const headers = data[0];

  let feeStructures = [];

  for (let i = 1; i < data.length; i++) {
    const feeStructure = rowToObject(headers, data[i]);

    // Apply filters
    if (filters.programme_id && feeStructure.programme_id !== filters.programme_id) continue;
    if (filters.category && feeStructure.category !== filters.category) continue;

    // Check if fee is currently effective
    const now = new Date();
    const effectiveFrom = feeStructure.effective_from ? new Date(feeStructure.effective_from) : null;
    const effectiveTo = feeStructure.effective_to ? new Date(feeStructure.effective_to) : null;

    if (effectiveFrom && now < effectiveFrom) continue;
    if (effectiveTo && now > effectiveTo) continue;

    feeStructures.push(feeStructure);
  }

  return { success: true, feeStructures };
}

/**
 * Get student fees
 */
function getStudentFees(studentId) {
  const transactionsSheet = getSheet('Transactions');
  if (!transactionsSheet) {
    return { success: false, error: 'Transactions sheet not found' };
  }

  const data = transactionsSheet.getDataRange().getValues();
  const headers = data[0];

  let fees = [];

  for (let i = 1; i < data.length; i++) {
    const transaction = rowToObject(headers, data[i]);
    if (transaction.student_id === studentId) {
      fees.push(transaction);
    }
  }

  return { success: true, fees };
}

/**
 * Create payment
 */
function createPayment(paymentData) {
  // Validate required fields
  const required = ['student_id', 'amount', 'payment_mode'];
  const missing = validateRequired(paymentData, required);
  if (missing) {
    return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  const transactionsSheet = getSheet('Transactions');
  if (!transactionsSheet) {
    return { success: false, error: 'Transactions sheet not found' };
  }

  // Generate transaction ID
  const txnId = generateId('TXN');
  const now = getCurrentTimestamp();

  const newTransaction = {
    txn_id: txnId,
    student_id: paymentData.student_id,
    admission_id: paymentData.admission_id || '',
    date: now,
    amount: paymentData.amount,
    currency: paymentData.currency || 'INR',
    payment_mode: paymentData.payment_mode,
    gateway_ref: paymentData.gateway_ref || '',
    payment_status: 'completed',
    receipt_id: paymentData.receipt_id || '',
    created_by: paymentData.created_by || 'system',
    created_at: now,
    notes: paymentData.notes || ''
  };

  // Add to sheet
  const headers = transactionsSheet.getRange(1, 1, 1, transactionsSheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(header => newTransaction[header] || '');

  transactionsSheet.appendRow(rowData);

  // Generate receipt if requested
  let receipt = null;
  if (paymentData.generate_receipt) {
    receipt = createReceipt({
      txn_id: txnId,
      issued_by: paymentData.created_by || 'system',
      issued_on: now,
      pdf_drive_file_id: paymentData.receipt_file_id || '',
      email_sent: false
    });
  }

  // Log audit
  logAudit('Transactions', txnId, 'create', null, newTransaction);

  return {
    success: true,
    transaction: newTransaction,
    receipt: receipt ? receipt.receipt : null
  };
}

/**
 * Get all payments with filters
 */
function getPayments(filters = {}) {
  const transactionsSheet = getSheet('Transactions');
  if (!transactionsSheet) {
    return { success: false, error: 'Transactions sheet not found' };
  }

  const data = transactionsSheet.getDataRange().getValues();
  const headers = data[0];

  let payments = [];

  for (let i = 1; i < data.length; i++) {
    const payment = rowToObject(headers, data[i]);

    // Apply filters
    if (filters.student_id && payment.student_id !== filters.student_id) continue;
    if (filters.payment_status && payment.payment_status !== filters.payment_status) continue;
    if (filters.payment_mode && payment.payment_mode !== filters.payment_mode) continue;

    // Date range filter
    if (filters.start_date && new Date(payment.date) < new Date(filters.start_date)) continue;
    if (filters.end_date && new Date(payment.date) > new Date(filters.end_date)) continue;

    payments.push(payment);
  }

  return { success: true, payments };
}

/**
 * Create receipt
 */
function createReceipt(receiptData) {
  const receiptsSheet = getSheet('Receipts');
  if (!receiptsSheet) {
    return { success: false, error: 'Receipts sheet not found' };
  }

  // Generate receipt ID
  const receiptId = generateId('RCP');

  const newReceipt = {
    receipt_id: receiptId,
    txn_id: receiptData.txn_id,
    issued_by: receiptData.issued_by,
    issued_on: receiptData.issued_on || getCurrentTimestamp(),
    pdf_drive_file_id: receiptData.pdf_drive_file_id || '',
    email_sent: receiptData.email_sent || false,
    created_at: getCurrentTimestamp()
  };

  // Add to sheet
  const headers = receiptsSheet.getRange(1, 1, 1, receiptsSheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(header => newReceipt[header] || '');

  receiptsSheet.appendRow(rowData);

  // Update transaction with receipt_id
  updateTransactionReceipt(receiptData.txn_id, receiptId);

  return { success: true, receipt: newReceipt };
}

/**
 * Update transaction with receipt ID
 */
function updateTransactionReceipt(txnId, receiptId) {
  const transactionsSheet = getSheet('Transactions');
  if (!transactionsSheet) {
    return;
  }

  const result = findRowById(transactionsSheet, 'txn_id', txnId);
  if (result) {
    const headers = transactionsSheet.getRange(1, 1, 1, transactionsSheet.getLastColumn()).getValues()[0];
    transactionsSheet.getRange(result.rowIndex, headers.indexOf('receipt_id') + 1).setValue(receiptId);
  }
}

/**
 * Get receipts with filters
 */
function getReceipts(filters = {}) {
  const receiptsSheet = getSheet('Receipts');
  if (!receiptsSheet) {
    return { success: false, error: 'Receipts sheet not found' };
  }

  const data = receiptsSheet.getDataRange().getValues();
  const headers = data[0];

  let receipts = [];

  for (let i = 1; i < data.length; i++) {
    const receipt = rowToObject(headers, data[i]);

    // Apply filters
    if (filters.txn_id && receipt.txn_id !== filters.txn_id) continue;
    if (filters.issued_by && receipt.issued_by !== filters.issued_by) continue;

    receipts.push(receipt);
  }

  return { success: true, receipts };
}

/**
 * Calculate student fee summary
 */
function getStudentFeeSummary(studentId) {
  const transactions = getStudentFees(studentId);
  if (!transactions.success) {
    return transactions;
  }

  let summary = {
    student_id: studentId,
    totalPaid: 0,
    totalPending: 0,
    payments: transactions.fees,
    lastPaymentDate: null,
    paymentCount: transactions.fees.length
  };

  transactions.fees.forEach(payment => {
    summary.totalPaid += parseFloat(payment.amount) || 0;
    if (!summary.lastPaymentDate || new Date(payment.date) > new Date(summary.lastPaymentDate)) {
      summary.lastPaymentDate = payment.date;
    }
  });

  // Get fee structures to calculate pending fees
  const feeStructures = getFeeStructures();
  if (feeStructures.success) {
    let totalRequired = 0;
    feeStructures.feeStructures.forEach(structure => {
      totalRequired += parseFloat(structure.amount) || 0;
    });
    summary.totalPending = Math.max(0, totalRequired - summary.totalPaid);
  }

  return { success: true, summary };
}

/**
 * Get fee statistics
 */
function getFeeStats() {
  const transactions = getPayments();
  if (!transactions.success) {
    return transactions;
  }

  let stats = {
    totalCollected: 0,
    totalTransactions: transactions.payments.length,
    byPaymentMode: {},
    monthlyCollection: {},
    pendingFees: 0
  };

  transactions.payments.forEach(payment => {
    const amount = parseFloat(payment.amount) || 0;
    stats.totalCollected += amount;

    // Count by payment mode
    const mode = payment.payment_mode || 'unknown';
    stats.byPaymentMode[mode] = (stats.byPaymentMode[mode] || 0) + amount;

    // Monthly collection
    const date = new Date(payment.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    stats.monthlyCollection[monthKey] = (stats.monthlyCollection[monthKey] || 0) + amount;
  });

  return { success: true, stats };
}

/**
 * Create a new fee structure
 */
function createFeeStructure(feeData) {
  // Validate required fields
  const required = ['fee_id', 'component', 'amount'];
  const missing = validateRequired(feeData, required);
  if (missing) {
    return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  const feeMasterSheet = getSheet('FeeMaster');
  if (!feeMasterSheet) {
    return { success: false, error: 'FeeMaster sheet not found' };
  }

  // Check if fee structure already exists
  const existingFee = findRowById(feeMasterSheet, 'fee_id', feeData.fee_id);
  if (existingFee) {
    return { success: false, error: 'Fee structure with this ID already exists' };
  }

  // Create new fee structure
  const now = getCurrentTimestamp();
  const newFeeStructure = {
    fee_id: feeData.fee_id,
    programme_id: feeData.programme_id || feeData.course || '',
    component: feeData.component,
    amount: feeData.amount,
    currency: feeData.currency || 'INR',
    effective_from: feeData.effective_from || now,
    effective_to: feeData.effective_to || '',
    category: feeData.category || 'Tuition',
    created_at: now,
    updated_at: now
  };

  // Add to sheet
  const headers = feeMasterSheet.getRange(1, 1, 1, feeMasterSheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(header => newFeeStructure[header] || '');

  feeMasterSheet.appendRow(rowData);

  // Log audit
  logAudit('FeeMaster', newFeeStructure.fee_id, 'create', null, newFeeStructure);

  return { success: true, feeStructure: newFeeStructure };
}

/**
 * Update a fee structure
 */
function updateFeeStructure(feeId, updateData) {
  const feeMasterSheet = getSheet('FeeMaster');
  if (!feeMasterSheet) {
    return { success: false, error: 'FeeMaster sheet not found' };
  }

  const result = findRowById(feeMasterSheet, 'fee_id', feeId);
  if (!result) {
    return { success: false, error: 'Fee structure not found' };
  }

  const headers = feeMasterSheet.getRange(1, 1, 1, feeMasterSheet.getLastColumn()).getValues()[0];
  const currentFee = rowToObject(headers, result.rowData);

  // Update fields
  const updatedFee = {
    ...currentFee,
    ...updateData,
    updated_at: getCurrentTimestamp()
  };

  // Update row
  const rowData = headers.map(header => updatedFee[header] || '');
  feeMasterSheet.getRange(result.rowIndex, 1, 1, headers.length).setValues([rowData]);

  // Log audit
  logAudit('FeeMaster', feeId, 'update', currentFee, updatedFee);

  return { success: true, feeStructure: updatedFee };
}

/**
 * Delete a fee structure
 */
function deleteFeeStructure(feeId) {
  const feeMasterSheet = getSheet('FeeMaster');
  if (!feeMasterSheet) {
    return { success: false, error: 'FeeMaster sheet not found' };
  }

  const result = findRowById(feeMasterSheet, 'fee_id', feeId);
  if (!result) {
    return { success: false, error: 'Fee structure not found' };
  }

  const headers = feeMasterSheet.getRange(1, 1, 1, feeMasterSheet.getLastColumn()).getValues()[0];
  const currentFee = rowToObject(headers, result.rowData);

  // Delete row
  feeMasterSheet.deleteRow(result.rowIndex);

  // Log audit
  logAudit('FeeMaster', feeId, 'delete', currentFee, null);

  return { success: true, message: 'Fee structure deleted successfully' };
}
