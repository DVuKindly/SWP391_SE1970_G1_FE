import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  tokens: null,
  login: async () => { },
  loginPatient: async () => { },
  loginEmployee: async () => { },
  logout: () => { },
  updateProfileLocally: () => { },
})

const STORAGE_KEY = 'eclinic.auth'

export const AuthProvider = ({ children }) => {
  const [tokens, setTokens] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setTokens(parsed.tokens || null)
        setUser(parsed.user || null)
      } catch (_) {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const persist = (next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const doLogin = useCallback(async (url, { email, password }) => {
    const payload = { email, password }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    let envelope
    if (!res.ok) {
      let serverMessage = ''
      try {
        const maybeJson = await res.clone().json()
        serverMessage = maybeJson?.message || maybeJson?.error || ''
      } catch (_) {
        serverMessage = await res.text().catch(() => '')
      }
      if (res.status === 401) {
        throw new Error('Sai email hoặc mật khẩu')
      }
      throw new Error(serverMessage || res.statusText || `Máy chủ lỗi (${res.status}).`)
    } else {
      envelope = await res.json()
    }

    // Expect ServiceResult<AuthResponse>
    if (!envelope?.success) {
      throw new Error(envelope?.message || 'Đăng nhập thất bại')
    }
    const data = envelope.data || {}

    const nextTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      // optional expiresAt not provided by BE now
    }
    const nextUser = {
      userId: data.userId,
      email: data.email,
      fullName: data.fullName,
      roles: Array.isArray(data.roles) ? data.roles : [],
      primaryRole: Array.isArray(data.roles) && data.roles.length > 0 ? data.roles[0] : undefined,
    }

    setTokens(nextTokens)
    setUser(nextUser)
    persist({ tokens: nextTokens, user: nextUser })

    return { user: nextUser, tokens: nextTokens }
  }, [])

  const loginPatient = useCallback(async ({ email, password }) => {
    return doLogin('/api/patient/auth/login', { email, password })
  }, [doLogin])

  const loginEmployee = useCallback(async ({ email, password }) => {
    return doLogin('/api/employee/auth/login', { email, password })
  }, [doLogin])

  const login = useCallback(async ({ email, password }) => {
    return loginPatient({ email, password })
  }, [loginPatient])

  const logout = useCallback(() => {
    setTokens(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const updateProfileLocally = useCallback((partial) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...(partial || {}) }
      persist({ tokens, user: next })
      return next
    })
  }, [tokens])

  const value = useMemo(() => ({
    isAuthenticated: !!tokens?.accessToken,
    tokens,
    user,
    login,
    loginPatient,
    loginEmployee,
    logout,
    updateProfileLocally,
  }), [tokens, user, login, loginPatient, loginEmployee, logout, updateProfileLocally])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


