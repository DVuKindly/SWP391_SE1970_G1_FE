import apiClient from './apiClient';

// Get examined patients (patients who have been examined) - FOR DOCTOR
export async function getExaminedPatients(keyword, tokens) {
  const json = await apiClient.get('/api/doctor/prescriptions/examined-patients', {
    tokens,
    query: keyword ? { keyword } : {}
  });
  return Array.isArray(json) ? json : (json?.data || []);
}

// Get all prescriptions - FOR DOCTOR (không cần params, backend tự lấy doctorId từ token)
export async function getPrescriptions(params, tokens) {
  const json = await apiClient.get('/api/doctor/prescriptions', {
    tokens
  });
  return Array.isArray(json) ? json : (json?.data || []);
}

// Get prescription detail - FOR DOCTOR
export async function getPrescriptionById(id, tokens) {
  const json = await apiClient.get(`/api/doctor/prescriptions/${id}`, { tokens });
  return json?.data || json;
}

// Create prescription - FOR DOCTOR (không cần staffId, backend tự lấy doctorId từ token)
export async function createPrescription(payload, staffId, tokens) {
  const json = await apiClient.post('/api/doctor/prescriptions', {
    tokens,
    body: payload
  });
  return json;
}

// Update prescription - FOR DOCTOR
export async function updatePrescription(id, payload, staffId, tokens) {
  const json = await apiClient.put(`/api/doctor/prescriptions/${id}`, {
    tokens,
    body: payload
  });
  return json?.data || json;
}

// Delete prescription - FOR DOCTOR
export async function deletePrescription(id, tokens) {
  const json = await apiClient.delete(`/api/doctor/prescriptions/${id}`, { tokens });
  return json?.data || json;
}

// Send prescription email - FOR DOCTOR
export async function sendPrescriptionEmail(id, tokens) {
  const json = await apiClient.post(`/api/doctor/prescriptions/${id}/send-email`, { tokens });
  return json?.data || json;
}
