import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getRoles,
  getAccounts,
  getAccountByEmail,
  putAccountStatus,
  bulkAccountStatus,
  updateAccountProfile,
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
  const [hasNextPage, setHasNextPage] = useState(false);
//Hàm xây dựng khóa sắp xếp tên
  const buildNameSortKey = useCallback((a) => {
    const nameRaw = (
      a.fullName || a.FullName || a.name || a.Name ||
      [a.firstName || a.FirstName || '', a.lastName || a.LastName || ''].filter(Boolean).join(' ')
    ) || '';
    const normalizedFull = nameRaw
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') 
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    // Sort by given name (tên) only: take the last word
    const parts = normalizedFull.split(' ').filter(Boolean);
    const givenName = parts.length > 0 ? parts[parts.length - 1] : normalizedFull;
    return `${givenName}|${normalizedFull}`;
  }, []);

  const showMessage = useCallback((text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    if (type === "success")
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 1800);
  }, []);
//Hàm lấy danh sách vai trò
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
//Hàm lấy danh sách tài khoản
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
        _sortKey: buildNameSortKey(a),
      }));
      normalized.sort((x, y) => sortDir === 'asc'
        ? x._sortKey.localeCompare(y._sortKey, 'vi', { sensitivity: 'base' })
        : y._sortKey.localeCompare(x._sortKey, 'vi', { sensitivity: 'base' })
      );
      setData({ items: normalized, total });
      setHasNextPage(normalized.length >= (query.pageSize || 10));
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
//Hàm xóa lựa chọn
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
//Hàm cập nhật trạng thái hàng loạt
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
//Hàm tìm kiếm theo email
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
            _sortKey: buildNameSortKey(a),
          })
        );
        normalized.sort((x, y) => sortDir === 'asc'
          ? x._sortKey.localeCompare(y._sortKey, 'vi', { sensitivity: 'base' })
          : y._sortKey.localeCompare(x._sortKey, 'vi', { sensitivity: 'base' })
        );
        setData({ items: normalized, total: normalized.length });
        setQuery((p) => ({ ...p, page: 1 }));
        clearSelection();
        setHasNextPage(false);
      } catch (err) {
        showMessage(err?.message || "Có lỗi xảy ra khi tìm kiếm", "error");
        setData({ items: [], total: 0 });
        setHasNextPage(false);
      }
    },
    [tokens, showMessage, clearSelection, sortDir]
  );
//Hàm chuyển đổi sắp xếp
  const toggleSort = useCallback(() => {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
  }, []);

  //Hàm cập nhật thông tin tài khoản
  const updateAccount = useCallback(
    async (id, profileData) => {
      try {
        // Chỉ gửi các trường có thể chỉnh sửa (không bao gồm email và password)
        const updateData = {
          fullName: profileData.fullName,
          phone: profileData.phone
        };
        
        await updateAccountProfile(id, updateData, tokens);
        showMessage("Cập nhật thông tin tài khoản thành công", "success");
        fetchAccounts();
      } catch (err) {
        showMessage(err?.message || "Có lỗi xảy ra khi cập nhật", "error");
        throw err; // Re-throw để component có thể xử lý
      }
    },
    [tokens, showMessage, fetchAccounts]
  );

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
    hasNextPage,
    updateAccount,
  };
}
