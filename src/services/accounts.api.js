// Admin Accounts API service

export const buildAuthHeaders = (tokens) => ({
  "Content-Type": "application/json",
  ...(tokens?.accessToken
    ? { Authorization: `Bearer ${tokens.accessToken}` }
    : {}),
});

export async function getRoles(tokens) {
  const res = await fetch("/api/admin/accounts/roles", {
    headers: buildAuthHeaders(tokens),
  });
  if (!res.ok) throw new Error("Tải roles thất bại");
  const json = await res.json();
  return Array.isArray(json)
    ? json
    : Array.isArray(json?.data)
    ? json.data
    : [];
}

export async function getAccounts(params, tokens) {
  const search = new URLSearchParams();
  if (params?.role) search.set("role", params.role);
  if (params?.keyword) search.set("keyword", params.keyword);
  search.set("page", String(params?.page || 1));
  search.set("pageSize", String(params?.pageSize || 10));
  const res = await fetch(`/api/admin/accounts?${search.toString()}`, {
    headers: buildAuthHeaders(tokens),
  });
  if (!res.ok) throw new Error("Tải danh sách tài khoản thất bại");
  const json = await res.json();
  if (Array.isArray(json)) return { items: json, total: json.length };
  if (json?.data) {
    const items = Array.isArray(json.data.items)
      ? json.data.items
      : Array.isArray(json.data)
      ? json.data
      : [];
    const total = Number(json.data?.total ?? items.length);
    return { items, total };
  }
  if (Array.isArray(json?.Items) || typeof json?.TotalItems !== "undefined") {
    const items = Array.isArray(json.Items) ? json.Items : [];
    const total = Number(json.TotalItems ?? items.length);
    return { items, total };
  }
  const items = Array.isArray(json?.items) ? json.items : [];
  const total = Number(json?.total ?? items.length);
  return { items, total };
}

export async function getAccountByEmail(email, tokens) {
  const res = await fetch(
    `/api/admin/accounts/by-email?email=${encodeURIComponent(email)}`,
    { headers: buildAuthHeaders(tokens) }
  );
  if (!res.ok) throw new Error("Không tìm thấy tài khoản theo email");
  const json = await res.json();
  return json?.data ?? json;
}

export async function putAccountStatus(id, isActive, tokens) {
  const res = await fetch(
    `/api/admin/accounts/${id}/status?isActive=${isActive}`,
    { method: "PUT", headers: buildAuthHeaders(tokens) }
  );
  if (!res.ok) throw new Error("Cập nhật trạng thái thất bại");
  return true;
}

export async function bulkAccountStatus(ids, isActive, tokens) {
  const body = { accountIds: ids, isActive };
  const res = await fetch("/api/admin/accounts/bulk/status", {
    method: "PUT",
    headers: buildAuthHeaders(tokens),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Cập nhật hàng loạt thất bại");
  return true;
}

export async function createStaff(payload, tokens) {
  const res = await fetch("/api/employee/auth/create-staff", {
    method: "POST",
    headers: buildAuthHeaders(tokens),
    body: JSON.stringify(payload),
  });
  let envelope;
  if (!res.ok) {
    let msg = "";
    try {
      const j = await res.clone().json();
      msg = j?.message || j?.error || "";
    } catch (_) {
      msg = await res.text().catch(() => "");
    }
    throw new Error(msg || `Tạo staff thất bại (${res.status})`);
  } else {
    envelope = await res.json();
  }
  if (!envelope?.success)
    throw new Error(envelope?.message || "Tạo staff thất bại");
  return envelope;
}
