import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import ChatHeader from '../components/ChatHeader.jsx'
import MessageList from '../components/MessageList.jsx'
import MessageInput from '../components/MessageInput.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useSocket } from '../hooks/useSocket.js'
import api from '../api.js'
import styles from './Chat.module.css'

export default function Chat() {
  const [channels, setChannels] = useState([])
  const [activeChannel, setActiveChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeDM, setActiveDM] = useState(null)
  const [dmMessages, setDmMessages] = useState([])
  const { getUser, getToken, logout } = useAuth()
  const user = getUser()
  const token = getToken()

  // Fetch channels and conversations on mount
  useEffect(() => {
    api.get('/api/channels').then((res) => {
      setChannels(res.data)
      if (res.data.length > 0) {
        setActiveChannel(res.data[0])
      }
    })
    api.get('/api/dm/conversations').then((res) => {
      setConversations(res.data)
    })
  }, [])

  // Fetch channel message history
  useEffect(() => {
    if (!activeChannel) return
    api.get(`/api/messages/${activeChannel.id}`).then((res) => {
      setMessages(res.data)
    })
  }, [activeChannel])

  // Fetch DM message history
  useEffect(() => {
    if (!activeDM) return
    api.get(`/api/dm/messages/${activeDM.id}`).then((res) => {
      setDmMessages(res.data)
    })
  }, [activeDM])

  // Handle incoming channel messages
  const handleNewMessage = useCallback(
    (msg) => {
      if (msg.channel_id === activeChannel?.id) {
        setMessages((prev) => [...prev, msg])
      }
    },
    [activeChannel]
  )

  // Handle incoming DMs
  const handleNewDM = useCallback(
    (msg) => {
      if (msg.conversation_id === activeDM?.id) {
        setDmMessages((prev) => [...prev, msg])
      }
    },
    [activeDM]
  )

  const { sendMessage, emitTyping, sendDM, emitDMTyping, onlineUsers, typingUsers } = useSocket({
    token,
    channelId: activeChannel?.id,
    activeDM,
    onNewMessage: handleNewMessage,
    onNewDM: handleNewDM,
  })

  // Switch to a channel (clear DM)
  const handleSelectChannel = (ch) => {
    setActiveDM(null)
    setDmMessages([])
    setActiveChannel(ch)
  }

  // Switch to a DM (clear channel)
  const handleSelectDM = (conv) => {
    setActiveChannel(null)
    setMessages([])
    setActiveDM(conv)
  }

  // Start a new DM
  const handleStartDM = async (userId) => {
    const res = await api.post('/api/dm/conversations', { userId })
    const conv = res.data
    const listRes = await api.get('/api/dm/conversations')
    setConversations(listRes.data)
    const full = listRes.data.find(c => c.id === conv.id)
    handleSelectDM(full)
  }

  const handleChannelCreated = (ch) => {
    setChannels((prev) => [...prev, ch])
  }

  return (
    <div className={styles.workspace}>
      <Sidebar
        channels={channels}
        activeChannel={activeChannel}
        onSelectChannel={handleSelectChannel}
        onChannelCreated={handleChannelCreated}
        conversations={conversations}
        activeDM={activeDM}
        onSelectDM={handleSelectDM}
        onStartDM={handleStartDM}
        user={user}
        onLogout={logout}
        onlineUsers={onlineUsers}
      />
      <div className={styles.main}>
        <ChatHeader
          channel={activeChannel}
          dm={activeDM}
          onlineCount={onlineUsers.length}
        />
        <MessageList
          messages={activeChannel ? messages : dmMessages}
          typingUsers={typingUsers}
        />
        <MessageInput
          channelName={activeChannel ? activeChannel.name : null}
          dmUsername={activeDM ? activeDM.other_username : null}
          onSendMessage={activeChannel ? sendMessage : sendDM}
          onTyping={activeChannel ? emitTyping : emitDMTyping}
        />
      </div>
    </div>
  )
}
