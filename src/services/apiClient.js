
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

function buildHeaders(tokens, extraHeaders) {
  const authHeader = tokens?.accessToken
    ? { Authorization: `Bearer ${tokens.accessToken}` }
    : {};
  return { ...DEFAULT_HEADERS, ...authHeader, ...(extraHeaders || {}) };
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : await response.text().catch(() => '');
  return { body, isJson };
}

function toError(response, parsed) {
  const status = response.status;
  const message =
    (parsed?.isJson && (parsed.body?.message || parsed.body?.error)) ||
    (typeof parsed?.body === 'string' ? parsed.body : '') ||
    response.statusText ||
    `Request failed (${status})`;
  const error = new Error(message);
  error.status = status;
  error.response = response;
  error.parsed = parsed;
  return error;
}

async function request(method, url, { tokens, headers, query, body } = {}) {
  const search = new URLSearchParams();
  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.set(key, String(value));
      }
    });
  }
  const fullUrl = search.toString() ? `${url}?${search.toString()}` : url;

  const init = {
    method,
    headers: buildHeaders(tokens, headers),
  };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const res = await fetch(fullUrl, init);
  const parsed = await parseResponse(res);
  if (!res.ok) {
    throw toError(res, parsed);
  }
  // Prefer common envelope { success, data }
  if (parsed.isJson) {
    const json = parsed.body;
    if (json && typeof json === 'object') {
      if (Object.prototype.hasOwnProperty.call(json, 'success')) {
        if (!json.success) {
          const error = new Error(json?.message || 'Request failed');
          error.response = { data: json };
          throw error;
        }
        // Nếu có message, return object chứa cả data và message
        if (json.message) {
          return {
            data: json.data,
            message: json.message
          };
        }
        return json.data !== undefined ? json.data : json;
      }
    }
    return json;
  }
  return parsed.body;
}

export const apiClient = {
  get: (url, opts) => request('GET', url, opts),
  post: (url, opts) => request('POST', url, opts),
  put: (url, opts) => request('PUT', url, opts),
  patch: (url, opts) => request('PATCH', url, opts),
  delete: (url, opts) => request('DELETE', url, opts),
  buildHeaders,
};

export default apiClient;


