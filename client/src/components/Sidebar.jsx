import { useState } from 'react'
import {
  ChevronDown,
  MessageSquare,
  FileText,
  Hash,
  Lock,
  Plus,
  LogOut,
} from 'lucide-react'
import ChannelCreate from './ChannelCreate.jsx'
import DMCreate from './DMCreate.jsx'
import styles from './Sidebar.module.css'

export default function Sidebar({
  channels,
  activeChannel,
  onSelectChannel,
  onChannelCreated,
  conversations,
  activeDM,
  onSelectDM,
  onStartDM,
  user,
  onLogout,
  onlineUsers,
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [showNewDM, setShowNewDM] = useState(false)
  const [channelsOpen, setChannelsOpen] = useState(true)
  const [dmsOpen, setDmsOpen] = useState(true)

  return (
    <div className={styles.sidebar}>
      {/* Workspace header */}
      <div className={styles.header}>
        <span className={styles.workspaceName}>My Workspace</span>
        <ChevronDown size={16} />
      </div>

      {/* Static nav items */}
      <div className={styles.navItems}>
        <div className={styles.navItem}>
          <MessageSquare size={16} />
          <span>Threads</span>
        </div>
        <div className={styles.navItem}>
          <FileText size={16} />
          <span>Drafts & Sent</span>
        </div>
      </div>

      {/* Channels section */}
      <div className={styles.section}>
        <div
          className={styles.sectionHeader}
          onClick={() => setChannelsOpen(!channelsOpen)}
        >
          <ChevronDown
            size={14}
            className={`${styles.chevron} ${!channelsOpen ? styles.collapsed : ''}`}
          />
          <span>Channels</span>
          <button
            className={styles.addBtn}
            onClick={(e) => {
              e.stopPropagation()
              setShowCreate(true)
            }}
          >
            <Plus size={16} />
          </button>
        </div>
        {channelsOpen && (
          <div className={styles.channelList}>
            {channels.map((ch) => (
              <div
                key={ch.id}
                className={`${styles.channel} ${activeChannel?.id === ch.id ? styles.active : ''}`}
                onClick={() => onSelectChannel(ch)}
              >
                <Hash size={14} />
                <span>{ch.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Direct Messages section */}
      <div className={styles.section}>
        <div
          className={styles.sectionHeader}
          onClick={() => setDmsOpen(!dmsOpen)}
        >
          <ChevronDown
            size={14}
            className={`${styles.chevron} ${!dmsOpen ? styles.collapsed : ''}`}
          />
          <span>Direct messages</span>
          <button
            className={styles.addBtn}
            onClick={(e) => {
              e.stopPropagation()
              setShowNewDM(true)
            }}
          >
            <Plus size={16} />
          </button>
        </div>
        {dmsOpen && (
          <div className={styles.channelList}>
            {/* Self entry (always first) */}
            <div className={styles.dmItem}>
              <div className={styles.dmAvatar}>{user?.username?.charAt(0).toUpperCase()}</div>
              <span>{user?.username} (you)</span>
            </div>
            {/* DM conversations */}
            {conversations?.map((conv) => (
              <div
                key={conv.id}
                className={`${styles.dmItem} ${activeDM?.id === conv.id ? styles.active : ''}`}
                onClick={() => onSelectDM(conv)}
              >
                <div className={styles.dmAvatar}>
                  {conv.other_username.charAt(0).toUpperCase()}
                </div>
                <span>{conv.other_username}</span>
                {onlineUsers?.some(u => u.userId === conv.other_user_id) && (
                  <span className={styles.onlineDot} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User info & logout */}
      <div className={styles.userSection}>
        <div className={styles.userAvatar}>
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <span className={styles.userName}>{user?.username}</span>
        <button className={styles.logoutBtn} onClick={onLogout} title="Log out">
          <LogOut size={16} />
        </button>
      </div>

      {/* Channel create modal */}
      {showCreate && (
        <ChannelCreate
          onCreated={(ch) => {
            onChannelCreated(ch)
            setShowCreate(false)
          }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* DM create modal */}
      {showNewDM && (
        <DMCreate
          currentUserId={user?.id}
          onSelect={(userId) => {
            onStartDM(userId)
            setShowNewDM(false)
          }}
          onClose={() => setShowNewDM(false)}
        />
      )}
    </div>
  )
}
