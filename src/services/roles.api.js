import { apiClient } from './apiClient'

function normalizeRole(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.roleId ?? raw.RoleId ?? raw.id ?? raw.Id
  const name = raw.name ?? raw.Name ?? ''
  const description = raw.description ?? raw.Description ?? ''
  return { id, name, description }
}

export async function fetchAllRoles(tokens) {
  // Use admin accounts roles endpoint to fetch ALL roles
  const json = await apiClient.get('/api/admin/accounts/roles', { tokens })
  const arr = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : [])
  return arr.map(normalizeRole).filter(Boolean)
}

export async function createRole(payload, tokens) {
  const body = { name: payload.name, description: payload.description }
  const res = await apiClient.post('/api/Roles/create', { tokens, body })
  return normalizeRole(res?.data ?? res)
}

export async function updateRole(id, payload, tokens) {
  const body = { name: payload.name, description: payload.description }
  const res = await apiClient.put(`/api/Roles/${id}`, { tokens, body })
  return normalizeRole(res?.data ?? res)
}


