import apiClient from './apiClient';

// Get all exam packages
export async function getExams(tokens) {
  const json = await apiClient.get('/api/exams', { tokens });
  return Array.isArray(json) ? json : (json?.data || []);
}

// Get exam package by ID
export async function getExamById(id, tokens) {
  const json = await apiClient.get(`/api/exams/${id}`, { tokens });
  return json;
}

// Create new exam package
export async function createExam(examData, tokens) {
  const json = await apiClient.post('/api/exams', { body: examData, tokens });
  return json;
}

// Update exam package
export async function updateExam(id, examData, tokens) {
  const json = await apiClient.put(`/api/exams/${id}`, { body: examData, tokens });
  return json;
}

// Delete exam package
export async function deleteExam(id, tokens) {
  const json = await apiClient.delete(`/api/exams/${id}`, { tokens });
  return json;
}
