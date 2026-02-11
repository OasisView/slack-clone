import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../api.js'
import styles from './ChannelCreate.module.css'

export default function DMCreate({ currentUserId, onSelect, onClose }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/users').then((res) => {
      setUsers(res.data.filter(u => u.id !== currentUserId))
      setLoading(false)
    })
  }, [currentUserId])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>New message</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className={styles.form}>
          <label className={styles.label}>Pick a person</label>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            users.map((u) => (
              <button
                key={u.id}
                className={styles.button}
                onClick={() => onSelect(u.id)}
                style={{ marginBottom: '8px' }}
              >
                {u.username}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
