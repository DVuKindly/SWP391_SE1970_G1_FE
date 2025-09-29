
import { apiClient } from './apiClient';

export async function getRoles(tokens) {
  const json = await apiClient.get('/api/admin/accounts/roles', { tokens });
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}

export async function getAccounts(params, tokens) {
  const json = await apiClient.get('/api/admin/accounts', {
    tokens,
    query: {
      role: params?.role,
      keyword: params?.keyword,
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
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

export async function getAccountByEmail(email, tokens) {
  const json = await apiClient.get('/api/admin/accounts/by-email', {
    tokens,
    query: { email },
  });
  return json?.data ?? json;
}

export async function putAccountStatus(id, isActive, tokens) {
  await apiClient.put(`/api/admin/accounts/${id}/status`, {
    tokens,
    query: { isActive },
  });
  return true;
}

export async function bulkAccountStatus(ids, isActive, tokens) {
  const body = { accountIds: ids, isActive };
  await apiClient.put('/api/admin/accounts/bulk/status', {
    tokens,
    body,
  });
  return true;
}

export async function createStaff(payload, tokens) {
  // apiClient already normalizes { success, data }
  const data = await apiClient.post('/api/employee/auth/create-staff', {
    tokens,
    body: payload,
  });
  return data;
}

export async function createAccountWithRoles(payload, tokens) {
  // apiClient already normalizes { success, data }
  const data = await apiClient.post('/api/employee/auth/create-account-manyRole', {
    tokens,
    body: payload,
  });
  return data;
}

export async function updateAccountProfile(id, payload, tokens) {
  await apiClient.put(`/api/admin/accounts/${id}/profile`, {
    tokens,
    body: payload,
  });
  return true;
}