import { apiClient } from './apiClient';

// Staff Account Management APIs
export async function getStaffAccounts(tokens) {
  const json = await apiClient.get('/api/staff/accounts', { tokens });
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}

export async function getStaffAccountByEmail(email, tokens) {
  const json = await apiClient.get('/api/staff/accounts/by-email', {
    tokens,
    query: { email },
  });
  return json?.data ?? json;
}

export async function updateStaffAccountStatus(id, isActive, tokens) {
  await apiClient.put(`/api/staff/accounts/${id}/status`, {
    tokens,
    query: { isActive },
  });
  return true;
}

export async function bulkUpdateStaffAccountStatus(accountIds, isActive, tokens) {
  const body = { accountIds, isActive };
  await apiClient.put('/api/staff/accounts/bulk/Editstatusmany', {
    tokens,
    body,
  });
  return true;
}

export async function resetStaffPassword(id, tokens) {
  await apiClient.put(`/api/staff/accounts/${id}/reset-password`, {
    tokens,
  });
  return true;
}

export async function getStaffAccountsByStatus(status, tokens) {
  const json = await apiClient.get('/api/staff/accounts/filterByStatusaccount', {
    tokens,
    query: { status },
  });
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}

// Staff Profile Management APIs
export async function getStaffProfile(tokens) {
  const json = await apiClient.get('/api/staff/accounts/GetProfileme', { tokens });
  return json?.data ?? json;
}

export async function updateStaffProfile(payload, tokens) {
  const json = await apiClient.put('/api/staff/accounts/UpdateProfileme', {
    tokens,
    body: payload,
  });
  return json?.data ?? json;
}

// Helper function to get staff accounts with pagination
export async function getStaffAccountsWithPagination(params, tokens) {
  const json = await apiClient.get('/api/staff/accounts', {
    tokens,
    query: {
      keyword: params?.keyword?.trim() || '',
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
      status: params?.status,
    },
  });
  
  if (Array.isArray(json)) return { items: json, total: json.length };
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

// Create Doctor account (role Doctor)
export async function createDoctorAccount(payload, tokens) {
  // Payload expected by BE:
  // { email, password, fullName, phone, title, biography, degree, education, experienceYears, certifications, departments: [{ departmentId, isPrimary }] }
  const json = await apiClient.post('/api/employee/auth/create-doctor', {
    tokens,
    body: payload,
  });
  return json?.data ?? json;
}