import apiClient from './apiClient';

// Get examined patients (patients who have been examined)
export async function getExaminedPatients(keyword, tokens) {
  const json = await apiClient.get('/api/prescriptions/examined-patients', {
    tokens,
    query: keyword ? { keyword } : {}
  });
  return Array.isArray(json) ? json : (json?.data || []);
}

// Get all prescriptions
export async function getPrescriptions(params, tokens) {
  const json = await apiClient.get('/api/prescriptions', {
    tokens,
    query: {
      doctorId: params?.doctorId,
      patientId: params?.patientId,
    }
  });
  return Array.isArray(json) ? json : (json?.data || []);
}

// Get prescription detail
export async function getPrescriptionById(id, tokens) {
  const json = await apiClient.get(`/api/prescriptions/${id}`, { tokens });
  return json?.data || json;
}

// Create prescription
export async function createPrescription(payload, staffId, tokens) {
  const json = await apiClient.post('/api/prescriptions', {
    tokens,
    query: { staffId },
    body: payload
  });
  return json?.data || json;
}

// Update prescription
export async function updatePrescription(id, payload, staffId, tokens) {
  const json = await apiClient.put(`/api/prescriptions/${id}`, {
    tokens,
    query: { staffId },
    body: payload
  });
  return json?.data || json;
}

// Delete prescription
export async function deletePrescription(id, tokens) {
  const json = await apiClient.delete(`/api/prescriptions/${id}`, { tokens });
  return json?.data || json;
}

// Send prescription email
export async function sendPrescriptionEmail(id, tokens) {
  const json = await apiClient.post(`/api/prescriptions/${id}/send-email`, { tokens });
  return json?.data || json;
}

// Mark registration as examined
export async function markRegistrationExamined(registrationId, tokens) {
  const json = await apiClient.post(`/api/staff-patient/${registrationId}/mark-examined`, { tokens });
  return json?.data || json;
}
