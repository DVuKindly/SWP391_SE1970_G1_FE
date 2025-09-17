import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  tokens: null,
  login: async () => {},
  logout: () => {},
  updateProfileLocally: () => {},
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

  const login = useCallback(async ({ email, password }) => {
    const payload = { email, password }

    // Use Vite proxy to avoid CORS/SSL issues in dev
    const res = await fetch('/api/Auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    let data
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
      console.error('Login failed:', res.status, res.statusText, serverMessage)
      throw new Error(serverMessage || res.statusText || `Máy chủ lỗi (${res.status}).`)
    } else {
      data = await res.json()
    }
    const nextTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
    }
    const nextUser = {
      email,
      role: data.role,
      accountId: data.accountId,
    }
    setTokens(nextTokens)
    setUser(nextUser)
    persist({ tokens: nextTokens, user: nextUser })
  }, [])

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
    logout,
    updateProfileLocally,
  }), [tokens, user, login, logout, updateProfileLocally])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


