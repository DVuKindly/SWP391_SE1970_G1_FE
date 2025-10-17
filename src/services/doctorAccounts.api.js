import { apiClient } from './apiClient';

export async function getPatients(params, tokens) {
  const json = await apiClient.get('/api/doctor/accounts', {
    tokens,
    query: {
      keyword: params?.keyword?.trim() || '',
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
    },
  });
  if (Array.isArray(json)) return { items: json, total: json.length };
  const items = Array.isArray(json?.items || json?.data?.items || json?.data) ? (json.items || json.data.items || json.data) : [];
  const total = Number(json?.total || json?.data?.total || items.length);
  return { items, total };
}

export async function getPatientByEmail(email, tokens) {
  const json = await apiClient.get('/api/doctor/accounts/by-email', {
    tokens,
    query: { email },
  });
  return json?.data ?? json;
}

export async function updatePatientStatus(id, isActive, tokens) {
  await apiClient.put(`/api/doctor/accounts/${id}/status`, {
    tokens,
    query: { isActive },
  });
  return true;
}

export async function resetPatientPassword(id, newPassword, tokens) {
  await apiClient.put(`/api/doctor/accounts/${id}/reset-password`, {
    tokens,
    body: newPassword, // Assuming API expects string body
  });
  return true;
}

export async function getMyDoctorProfile(tokens) {
  const json = await apiClient.get('/api/doctor/accounts/GetProfileme', { tokens });
  return json?.data ?? json;
}

export async function updateMyDoctorProfile(payload, tokens) {
  await apiClient.put('/api/doctor/accounts/UpdateProfileme', {
    tokens,
    body: payload,
  });
  return true;
}