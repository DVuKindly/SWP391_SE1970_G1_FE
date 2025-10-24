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
