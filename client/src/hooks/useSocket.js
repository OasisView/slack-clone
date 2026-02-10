import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

export function useSocket({ token, channelId, onNewMessage }) {
  const socketRef = useRef(null)

  // Connect socket when token is available
  useEffect(() => {
    if (!token) return

    const socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      console.log('Socket connected')
    })

    socket.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message)
      if (err.message === 'Invalid token' || err.message === 'No token provided') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/'
      }
    })

    socket.on('error', (err) => {
      console.error('Socket error:', err.message)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [token])

  // Join channel when channelId changes
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !channelId) return

    socket.emit('joinChannel', { channelId })
  }, [channelId])

  // Listen for new messages
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    socket.on('newMessage', onNewMessage)

    return () => {
      socket.off('newMessage', onNewMessage)
    }
  }, [onNewMessage])

  // Send message function
  const sendMessage = useCallback(
    (content) => {
      const socket = socketRef.current
      if (!socket || !channelId) return
      socket.emit('sendMessage', { channelId, content })
    },
    [channelId]
  )

  return { sendMessage }
}
