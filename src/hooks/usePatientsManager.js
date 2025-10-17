import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPatients, getPatientByEmail, updatePatientStatus, resetPatientPassword } from '../services/doctorAccounts.api';

function usePatientsManager(tokens) {
  const [query, setQuery] = useState({ keyword: '', page: 1, pageSize: 10 });
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [hasNextPage, setHasNextPage] = useState(false);

  const showMessage = useCallback((msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  }, []);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPatients(query, tokens);
      setData(res);
      setHasNextPage(res.items.length === query.pageSize);
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [query, tokens, showMessage]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const searchByEmail = useCallback(async (email) => {
    if (!email) return null;
    try {
      return await getPatientByEmail(email, tokens);
    } catch {
      return null;
    }
  }, [tokens]);

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectAllOnPage = useCallback((items) => {
    setSelected(new Set(items.map((a) => a.id ?? a.accountId)));
  }, []);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const updateStatus = useCallback(async (id, isActive) => {
    try {
      await updatePatientStatus(id, isActive, tokens);
      fetchPatients();
      showMessage('Status updated', 'success');
    } catch (err) {
      showMessage(err.message, 'error');
    }
  }, [tokens, fetchPatients, showMessage]);

  // No bulk for doctor

  const resetPassword = useCallback(async (id, newPassword) => {
    try {
      await resetPatientPassword(id, newPassword, tokens);
      showMessage('Password reset', 'success');
    } catch (err) {
      showMessage(err.message, 'error');
    }
  }, [tokens, showMessage]);

  return {
    query,
    setQuery,
    data,
    loading,
    message,
    messageType,
    selected,
    toggleSelect,
    selectAllOnPage,
    clearSelection,
    fetchPatients,
    searchByEmail,
    updateStatus,
    resetPassword,
    showMessage,
    hasNextPage,
  };
}

export default usePatientsManager;