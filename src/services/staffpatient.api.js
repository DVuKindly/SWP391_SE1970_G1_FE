import apiClient from './apiClient';

// Get all patient accounts
export async function getPatientAccounts(tokens) {
  const json = await apiClient.get('/api/staff/patients', { tokens });
  return Array.isArray(json) ? json : (json?.data || []);
}

// Get patient account by email
export async function getPatientAccountByEmail(email, tokens) {
  const json = await apiClient.get(`/api/staff/patients/email/${email}`, { tokens });
  return json?.data || json;
}

// Get patient accounts with pagination
export async function getPatientAccountsWithPagination(params, tokens) {
  const json = await apiClient.get('/api/staff/patients', {
    tokens,
    query: {
      keyword: params?.keyword?.trim() || '',
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
      status: params?.status,
    },
  });

  // Handle different response formats
  if (Array.isArray(json)) {
    return { items: json, total: json.length };
  }
  
  if (json?.data) {
    const items = Array.isArray(json.data?.items)
      ? json.data.items
      : Array.isArray(json.data)
      ? json.data
      : [];
    const total = Number(json.data?.total ?? items.length);
    return { items, total };
  }
  
  if (Array.isArray(json?.Items) || typeof json?.TotalItems !== 'undefined') {
    const items = Array.isArray(json.Items) ? json.Items : [];
    const total = Number(json.TotalItems ?? items.length);
    return { items, total };
  }
  
  const items = Array.isArray(json?.items) ? json.items : [];
  const total = Number(json?.total ?? items.length);
  return { items, total };
}

// Get patient accounts by status
export async function getPatientAccountsByStatus(status, tokens) {
  const json = await apiClient.get('/api/staff/patients', {
    tokens,
    query: { status: status ? 'active' : 'inactive' }
  });
  return Array.isArray(json) ? json : (json?.data || []);
}

// Registrations APIs
export async function getRegistrations(params, tokens) {
  const json = await apiClient.get('/api/staff-patient/registrations', {
    tokens,
    query: {
      keyword: params?.keyword?.trim() || '',
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
      status: params?.status,
    },
  });

  if (Array.isArray(json)) return { items: json, total: json.length };
  const data = json?.data || json;
  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : [];
  const total = Number(data?.total ?? items.length);
  return { items, total };
}

// Get filtered registrations (uses registrations_Filter endpoint)
export async function getRegistrationsFiltered(params, tokens) {
  const query = {};
  
  if (params?.status && params.status !== 'all') {
    query.status = params.status;
  }
  
  if (params?.email?.trim()) {
    query.email = params.email.trim();
  }
  
  if (params?.page) {
    query.page = params.page;
  }
  
  if (params?.pageSize) {
    query.pageSize = params.pageSize;
  }

  const json = await apiClient.get('/api/staff-patient/registrations_Filter', {
    tokens,
    query
  });

  // Handle response format
  if (Array.isArray(json)) {
    return { items: json, total: json.length };
  }
  
  const data = json?.data || json;
  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : [];
  const total = Number(data?.total ?? data?.totalItems ?? items.length);
  
  return { items, total };
}

export async function getRegistrationById(id, tokens) {
  const json = await apiClient.get(`/api/staff-patient/registrations/${id}`, { tokens });
  return json?.data || json;
}

export async function putRegistrationStatus(id, payload, tokens) {
  const status = typeof payload === 'string' ? payload : payload?.status;
  const json = await apiClient.put(`/api/staff-patient/registrations/${id}/status`, {
    tokens,
    // API expects status in query string per Swagger
    query: { status },
  });
  return json;
}

export async function postRegistrationNote(id, payload, tokens) {
  const note = typeof payload === 'string' ? payload : payload?.note ?? '';
  // Backend expects a JSON string body (e.g., "ghi chú")
  const json = await apiClient.post(`/api/staff-patient/registrations/${id}/note`, {
    tokens,
    body: JSON.stringify(note),
  });
  return json;
}

export async function putRegistrationInvalid(id, tokens) {
  const json = await apiClient.put(`/api/staff-patient/registrations/${id}/invalid`, { tokens });
  return json;
}

// Direct Payment - Set exam for registration and mark as Direct_Payment
export async function setDirectPayment(registrationId, examId, tokens) {
  const json = await apiClient.post(`/api/staff-patient/registrations/${registrationId}/direct-payment`, {
    tokens,
    body: { examId }
  });
  return json;
}


// Create patient account
export async function createPatientAccount(payload, tokens) {
  const json = await apiClient.post('/api/staff/patients', {
    tokens,
    body: payload
  });
  return json?.data || json;
}

// Update patient account status
export async function updatePatientAccountStatus(patientId, isActive, tokens) {
  const json = await apiClient.patch(`/api/staff/patients/${patientId}/status`, {
    tokens,
    body: { isActive }
  });
  return json?.data || json;
}

// Bulk update patient account status
export async function bulkUpdatePatientAccountStatus(patientIds, isActive, tokens) {
  const json = await apiClient.patch('/api/staff/patients/bulk-status', {
    tokens,
    body: { patientIds, isActive }
  });
  return json?.data || json;
}

// Reset patient password
export async function resetPatientPassword(patientId, tokens) {
  const json = await apiClient.post(`/api/staff/patients/${patientId}/reset-password`, {
    tokens
  });
  return json?.data || json;
}

// Update patient account details
export async function updatePatientAccount(patientId, payload, tokens) {
  const json = await apiClient.put(`/api/staff/patients/${patientId}`, {
    tokens,
    body: payload
  });
  return json?.data || json;
}

// Get patient medical records
export async function getPatientMedicalRecords(patientId, tokens) {
  const json = await apiClient.get(`/api/staff/patients/${patientId}/medical-records`, { tokens });
  return Array.isArray(json) ? json : (json?.data || []);
}

// Get patient appointments
export async function getPatientAppointments(patientId, tokens) {
  const json = await apiClient.get(`/api/staff/patients/${patientId}/appointments`, { tokens });
  return Array.isArray(json) ? json : (json?.data || []);
}

export async function markExam(registrationId, examId, tokens) {
  const json = await apiClient.post(`/api/staff-patient/registrations/${registrationId}/exams/${examId}/mark`, {
    tokens,
  });
  return json;
}

// Mark registration as examined
export async function markAsExamined(registrationId, tokens) {
  const json = await apiClient.post(`/api/staff-patient/${registrationId}/mark-examined`, {
    tokens
  });
  return json;
}