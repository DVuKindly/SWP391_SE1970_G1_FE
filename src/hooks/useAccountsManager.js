import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getRoles,
  getAccounts,
  getAccountByEmail,
  putAccountStatus,
  bulkAccountStatus,
} from "../services/accounts.api";

export default function useAccountsManager(tokens) {
  const [roles, setRoles] = useState([]);
  const [query, setQuery] = useState({
    role: "",
    keyword: "",
    page: 1,
    pageSize: 10,
  });
  const [data, setData] = useState({ items: [], total: 0 });
  const [sortDir, setSortDir] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selected, setSelected] = useState(new Set());

  const showMessage = useCallback((text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    if (type === "success")
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 1800);
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const raw = await getRoles(tokens);
      const list = raw
        .map((r) =>
          typeof r === "string"
            ? r
            : r?.name ||
              r?.roleName ||
              r?.displayName ||
              r?.RoleName ||
              r?.Code ||
              ""
        )
        .filter(Boolean);
      setRoles(list);
    } catch (_) {}
  }, [tokens]);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const { items, total } = await getAccounts(
        {
          role: query.role,
          keyword: query.keyword,
          page: query.page,
          pageSize: query.pageSize,
        },
        tokens
      );
      const normalized = items.map((a) => ({
        ...a,
        _sortKey: (a.fullName || a.FullName || a.name || a.Name || a.email || a.Email || '').toString().toLowerCase(),
      }));
      normalized.sort((x, y) => sortDir === 'asc' ? x._sortKey.localeCompare(y._sortKey) : y._sortKey.localeCompare(x._sortKey));
      setData({ items: normalized, total });
    } catch (err) {
      showMessage(err?.message || "Có lỗi xảy ra khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  }, [
    query.role,
    query.keyword,
    query.page,
    query.pageSize,
    tokens,
    showMessage,
    sortDir,
  ]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllOnPage = useCallback((items) => {
    setSelected((prev) => {
      const next = new Set(prev);
      items.forEach((x) => {
        const id = x?.id ?? x?.accountId;
        if (id) next.add(id);
      });
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const updateStatus = useCallback(
    async (id, isActive) => {
      try {
        await putAccountStatus(id, isActive, tokens);
        showMessage("Cập nhật trạng thái thành công", "success");
        fetchAccounts();
      } catch (err) {
        showMessage(err?.message || "Có lỗi xảy ra", "error");
      }
    },
    [tokens, showMessage, fetchAccounts]
  );

  const updateStatusBulk = useCallback(
    async (isActive) => {
      if (selected.size === 0) {
        showMessage("Vui lòng chọn ít nhất 1 tài khoản", "error");
        return;
      }
      try {
        await bulkAccountStatus(Array.from(selected), isActive, tokens);
        showMessage("Cập nhật hàng loạt thành công", "success");
        clearSelection();
        fetchAccounts();
      } catch (err) {
        showMessage(err?.message || "Có lỗi xảy ra", "error");
      }
    },
    [selected, tokens, showMessage, clearSelection, fetchAccounts]
  );

  const searchByEmail = useCallback(
    async (email) => {
      if (!email?.trim()) return;
      try {
        const account = await getAccountByEmail(email.trim(), tokens);
        const normalized = (Array.isArray(account) ? account : [account]).map(
          (a) => ({
            ...a,
            fullName: a.fullName || a.FullName || a.name || a.Name,
            roles:
              a.roles || a.Roles || a.Role || (a.Role ? [a.Role] : undefined),
            _sortKey: (a.fullName || a.FullName || a.name || a.Name || a.email || a.Email || '').toString().toLowerCase(),
          })
        );
        normalized.sort((x, y) => sortDir === 'asc' ? x._sortKey.localeCompare(y._sortKey) : y._sortKey.localeCompare(x._sortKey));
        setData({ items: normalized, total: normalized.length });
        setQuery((p) => ({ ...p, page: 1 }));
        clearSelection();
      } catch (err) {
        showMessage(err?.message || "Có lỗi xảy ra khi tìm kiếm", "error");
        setData({ items: [], total: 0 });
      }
    },
    [tokens, showMessage, clearSelection, sortDir]
  );

  const toggleSort = useCallback(() => {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
  }, []);

  return {
    roles,
    query,
    setQuery,
    data,
    setData,
    loading,
    message,
    messageType,
    selected,
    toggleSelect,
    selectAllOnPage,
    clearSelection,
    fetchAccounts,
    searchByEmail,
    updateStatus,
    updateStatusBulk,
    showMessage,
    sortDir,
    toggleSort,
  };
}
