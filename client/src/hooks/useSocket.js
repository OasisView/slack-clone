import { useEffect, useRef, useCallback, useState } from 'react'
import { io } from 'socket.io-client'

export function useSocket({ token, channelId, activeDM, onNewMessage, onNewDM }) {
  const socketRef = useRef(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const typingTimeoutRef = useRef(null)

  // Connect socket when token is available
  useEffect(() => {
    if (!token) return

    const socket = io(`http://${window.location.hostname}:3001`, {
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

    // Online presence
    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users)
    })

    // Channel typing indicators
    socket.on('userTyping', ({ username }) => {
      setTypingUsers((prev) => prev.includes(username) ? prev : [...prev, username])
    })

    socket.on('userStopTyping', ({ username }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== username))
    })

    // DM typing indicators
    socket.on('dmUserTyping', ({ username }) => {
      setTypingUsers((prev) => prev.includes(username) ? prev : [...prev, username])
    })

    socket.on('dmUserStopTyping', ({ username }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== username))
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

    setTypingUsers([])
    socket.emit('joinChannel', { channelId })
  }, [channelId])

  // Join DM room when activeDM changes
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !activeDM) return

    setTypingUsers([])
    socket.emit('joinDM', { recipientId: activeDM.other_user_id })
  }, [activeDM])

  // Listen for new channel messages
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    socket.on('newMessage', onNewMessage)

    return () => {
      socket.off('newMessage', onNewMessage)
    }
  }, [onNewMessage])

  // Listen for new DMs
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !onNewDM) return

    socket.on('newDM', onNewDM)

    return () => {
      socket.off('newDM', onNewDM)
    }
  }, [onNewDM])

  // Send channel message
  const sendMessage = useCallback(
    (content) => {
      const socket = socketRef.current
      if (!socket || !channelId) return
      socket.emit('sendMessage', { channelId, content })
      socket.emit('stopTyping', { channelId })
    },
    [channelId]
  )

  // Send DM
  const sendDM = useCallback(
    (content) => {
      const socket = socketRef.current
      if (!socket || !activeDM) return
      socket.emit('sendDM', {
        recipientId: activeDM.other_user_id,
        conversationId: activeDM.id,
        content,
      })
      socket.emit('dmStopTyping', { recipientId: activeDM.other_user_id })
    },
    [activeDM]
  )

  // Channel typing
  const emitTyping = useCallback(() => {
    const socket = socketRef.current
    if (!socket || !channelId) return

    socket.emit('typing', { channelId })

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { channelId })
    }, 2000)
  }, [channelId])

  // DM typing
  const emitDMTyping = useCallback(() => {
    const socket = socketRef.current
    if (!socket || !activeDM) return

    socket.emit('dmTyping', { recipientId: activeDM.other_user_id })

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('dmStopTyping', { recipientId: activeDM.other_user_id })
    }, 2000)
  }, [activeDM])

  return { sendMessage, emitTyping, sendDM, emitDMTyping, onlineUsers, typingUsers }
}
