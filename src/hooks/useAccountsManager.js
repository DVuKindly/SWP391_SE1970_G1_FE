import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getRoles,
  getAccounts,
  putAccountStatus,
  bulkAccountStatus,
  updateAccountProfile,
  updateAccountFull,
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
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

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
      

      console.log('Roles received from API:', list);
      setRoles(list);
    } catch (_) {

      setRoles(["Admin", "Staff_Doctor", "Staff_Patient", "Doctor"]);
    }
  }, [tokens]);


  const filterPatientAccounts = useCallback((accounts) => {
    console.log('Accounts received:', accounts);
    if (accounts.length > 0) {
      console.log('Sample account roles:', accounts[0]);
    }
    return accounts;

  }, []);


  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const targetPageSize = query.pageSize || 10;
      const requestedPage = query.page || 1;
      

      const adjustedPageSize = Math.ceil(targetPageSize * 1.5);
      
      const { items, total } = await getAccounts(
        {
          role: query.role,
          keyword: debouncedKeyword,
          page: requestedPage,
          pageSize: adjustedPageSize,
        },
        tokens
      );

      // Lọc bỏ các tài khoản có role "Patient"
      const filteredItems = filterPatientAccounts(items);
      
      // Nếu sau khi lọc không đủ records và vẫn còn data, thử fetch thêm
      let allFilteredItems = [...filteredItems];
      let currentPage = requestedPage + 1;
      let totalOriginalItems = items.length;
      
      while (allFilteredItems.length < targetPageSize && totalOriginalItems >= adjustedPageSize && totalOriginalItems < total) {
        const { items: moreItems } = await getAccounts(
          {
            role: query.role,
            keyword: debouncedKeyword,
            page: currentPage,
            pageSize: adjustedPageSize,
          },
          tokens
        );
        
        if (moreItems.length === 0) break;
        
        const moreFilteredItems = filterPatientAccounts(moreItems);
        allFilteredItems = [...allFilteredItems, ...moreFilteredItems];
        totalOriginalItems += moreItems.length;
        currentPage++;
        
        // Giới hạn số lần gọi API để tránh vòng lặp vô tận
        if (currentPage > requestedPage + 3) break;
      }

      // Chỉ lấy số lượng records theo pageSize
      const paginatedItems = allFilteredItems.slice(0, targetPageSize);

      const normalized = paginatedItems.map((a) => ({
        ...a,
        _sortKey: buildNameSortKey(a),
      }));
      
      normalized.sort((x, y) => sortDir === 'asc'
        ? x._sortKey.localeCompare(y._sortKey, 'vi', { sensitivity: 'base' })
        : y._sortKey.localeCompare(x._sortKey, 'vi', { sensitivity: 'base' })
      );

      // Ước tính total sau khi lọc dựa trên tỷ lệ lọc
      const filterRatio = totalOriginalItems > 0 ? allFilteredItems.length / totalOriginalItems : 0.7; // Giả định 70% không phải Patient
      const estimatedTotal = Math.floor(total * filterRatio);
      
      setData({ items: normalized, total: estimatedTotal });
      setHasNextPage(paginatedItems.length >= targetPageSize && (requestedPage * targetPageSize) < estimatedTotal);
    } catch (err) {
      showMessage(err?.message || "Có lỗi xảy ra khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  }, [
    query.role,
    debouncedKeyword,
    query.page,
    query.pageSize,
    tokens,
    showMessage,
    sortDir,
    buildNameSortKey,
    filterPatientAccounts,
  ]);

  // Debounce keyword để tránh gọi API quá nhiều
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(query.keyword?.trim() || "");
    }, 300);
    return () => clearTimeout(timer);
  }, [query.keyword]);

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
      if (!email?.trim()) {
        // Nếu không có email, reset về tìm kiếm thông thường
        setQuery((p) => ({ ...p, keyword: "", page: 1 }));
        return;
      }
      // Sử dụng keyword search thay vì API riêng biệt
      setQuery((p) => ({ ...p, keyword: email.trim(), page: 1 }));
    },
    []
  );

//Hàm chuyển đổi sắp xếp
  const toggleSort = useCallback(() => {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
  }, []);

  //Hàm cập nhật thông tin tài khoản
  const updateAccount = useCallback(
    async (id, profileData) => {
      try {
        const updateData = {
          email: profileData.email,
          fullName: profileData.fullName,
          phone: profileData.phone
        }; 
        await updateAccountFull(id, updateData, tokens);
        showMessage("Cập nhật thông tin tài khoản thành công", "success");
        fetchAccounts();
      } catch (err) {
        showMessage(err?.message || "Có lỗi xảy ra khi cập nhật", "error");
        throw err;
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