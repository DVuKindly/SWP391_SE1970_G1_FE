import apiClient from './apiClient';

// Get all departments
export async function getDepartments(tokens) {
  const json = await apiClient.get('/api/departments', { tokens });
  return Array.isArray(json) ? json : (json?.data || []);
}

// Get department by ID
export async function getDepartmentById(id, tokens) {
  const json = await apiClient.get(`/api/departments/${id}`, { tokens });
  return json?.data || json;
}

// Create department
export async function createDepartment(departmentData, tokens) {
  const json = await apiClient.post('/api/departments', { body: departmentData, tokens });
  return json?.data || json;
}

// Update department
export async function updateDepartment(id, departmentData, tokens) {
  const json = await apiClient.put(`/api/departments/${id}`, { body: departmentData, tokens });
  return json?.data || json;
}

// Delete department
export async function deleteDepartment(id, tokens) {
  const json = await apiClient.delete(`/api/departments/${id}`, { tokens });
  return json;
}
