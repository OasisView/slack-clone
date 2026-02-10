import { useEffect, useRef } from 'react'
import Message from './Message.jsx'
import styles from './MessageList.module.css'

export default function MessageList({ messages }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className={styles.list}>
        <div className={styles.empty}>
          <p className={styles.emptyText}>No messages yet. Start the conversation!</p>
        </div>
        <div ref={bottomRef} />
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
