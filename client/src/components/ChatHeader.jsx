import { Hash, Users, Pin, Search } from 'lucide-react'
import styles from './ChatHeader.module.css'

export default function ChatHeader({ channel, dm, onlineCount = 0 }) {
  if (!channel && !dm) return null

  return (
    <div className={styles.header}>
      <div className={styles.channelInfo}>
        {channel ? (
          <>
            <Hash size={18} />
            <h2 className={styles.channelName}>{channel.name}</h2>
            {onlineCount > 0 && (
              <span className={styles.onlineCount}>{onlineCount} online</span>
            )}
          </>
        ) : (
          <h2 className={styles.channelName}>{dm.other_username}</h2>
        )}
      </div>
      <div className={styles.actions}>
        <button className={styles.iconBtn}>
          <Users size={18} />
        </button>
        <button className={styles.iconBtn}>
          <Pin size={18} />
        </button>
        <button className={styles.iconBtn}>
          <Search size={18} />
        </button>
      </div>
    </div>
  )
}
