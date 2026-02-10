import { useState } from 'react'
import axios from 'axios'

export function useAuth() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = async (username, password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('/api/auth/login', { username, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      return res.data
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signup = async (username, password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('/api/auth/signup', { username, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      return res.data
    } catch (err) {
      const msg = err.response?.data?.error || 'Signup failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const getToken = () => localStorage.getItem('token')

  const getUser = () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }

  return { login, signup, logout, getToken, getUser, error, loading }
}
