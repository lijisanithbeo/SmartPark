import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const stored = localStorage.getItem('smartpark_user')
  const parsed = stored ? JSON.parse(stored) : null
  // Clear stale session if role is stored as number (old format before enum-string fix)
  if (parsed && typeof parsed.role === 'number') {
    localStorage.removeItem('smartpark_user')
  }
  const [user, setUser] = useState((parsed && typeof parsed.role === 'string') ? parsed : null)

  const login = (userData) => {
    localStorage.setItem('smartpark_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('smartpark_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
