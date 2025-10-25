import apiClient from './apiClient';

// Get all appointments with optional status filter
export async function getAppointments(params, tokens) {
  const json = await apiClient.get('/api/appointments', {
    tokens,
    query: {
      status: params?.status,
    },
  });

  // Handle different response formats
  if (json?.data?.data) {
    return Array.isArray(json.data.data) ? json.data.data : [];
  }
  if (json?.data) {
    return Array.isArray(json.data) ? json.data : [];
  }
  return Array.isArray(json) ? json : [];
}

// Get appointment by ID
export async function getAppointmentById(id, tokens) {
  const json = await apiClient.get(`/api/appointments/${id}`, { tokens });
  return json?.data || json;
}

// Get eligible patients for appointment
export async function getEligiblePatients(tokens) {
  const json = await apiClient.get('/api/appointments/eligible-patients', { tokens });
  if (json?.data?.data) {
    return Array.isArray(json.data.data) ? json.data.data : [];
  }
  if (json?.data) {
    return Array.isArray(json.data) ? json.data : [];
  }
  return Array.isArray(json) ? json : [];
}

// Get doctors with schedules
export async function getDoctorsWithSchedules(tokens) {
  const json = await apiClient.get('/api/appointments/doctors', { tokens });
  
  if (json?.data) {
    return Array.isArray(json.data) ? json.data : [];
  }
  return Array.isArray(json) ? json : [];
}

// Create appointment
export async function createAppointment(payload, tokens) {
  const json = await apiClient.post('/api/appointments', {
    tokens,
    body: payload
  });
  return json?.data || json;
}

// Approve appointment
export async function approveAppointment(id, approve, tokens) {
  const json = await apiClient.post(`/api/appointments/${id}/approve`, {
    tokens,
    query: { approve }
  });
  return json?.data || json;
}

// Delete appointment
export async function deleteAppointment(id, tokens) {
  const json = await apiClient.delete(`/api/appointments/${id}`, { tokens });
  return json?.data || json;
}
