import { useState } from 'react'
import { X } from 'lucide-react'
import api from '../api.js'
import styles from './ChannelCreate.module.css'

export default function ChannelCreate({ onCreated, onClose }) {
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/api/channels', { name: name.trim() })
      onCreated(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create channel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Create a channel</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Channel name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. design"
            className={styles.input}
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button} disabled={loading || !name.trim()}>
            {loading ? 'Creating...' : 'Create Channel'}
          </button>
        </form>
      </div>
    </div>
  )
}
