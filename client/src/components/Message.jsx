import styles from './Message.module.css'

const AVATAR_COLORS = [
  '#E01E5A', '#36C5F0', '#2EB67D', '#ECB22E',
  '#4A154B', '#1264A3', '#FF6B6B', '#4ECDC4',
]

function getColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function Message({ message }) {
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const initial = message.username.charAt(0).toUpperCase()
  const color = getColor(message.username)

  return (
    <div className={styles.message}>
      <div className={styles.avatar} style={{ background: color }}>
        {initial}
      </div>
      <div className={styles.content}>
        <div className={styles.meta}>
          <span className={styles.username}>{message.username}</span>
          <span className={styles.time}>{time}</span>
        </div>
        <p className={styles.text}>{message.content}</p>
      </div>
    </div>
  )
}
