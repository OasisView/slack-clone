# Slack Clone MVP

---

## Slide 1: Project Overview

### What We Built
A lightweight, real-time communication platform that replicates Slack's core experience — two users can chat across organized channels with zero page refresh.

### The Team
- **Manny** — Frontend (React, UI/UX, Socket.io client, styling)
- **Ismael** — Backend (Express, PostgreSQL, Socket.io server, JWT auth)
- Built in a **7-day sprint** for Pursuit

### Core Features
- User authentication (signup/login with JWT tokens)
- Channel-based messaging (#general, #random, custom channels)
- Real-time messaging via WebSockets — instant delivery, no refresh
- Direct messages between users
- Typing indicators ("user is typing...")
- Online presence (green dot shows who's active)
- Message persistence — chat history survives logout and refresh

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, CSS Modules, Axios, Lucide Icons |
| Backend | Node.js, Express 5, Socket.io |
| Database | PostgreSQL (users, channels, messages, DMs) |
| Auth | JWT tokens + bcrypt password hashing |
| Real-Time | Socket.io (WebSocket-only transport) |

---

## Slide 2: Tech & Architecture

### How the System Works
```
React UI (localhost:3000)
    ↕ HTTP (REST API) + WebSocket (Socket.io)
Express Server (localhost:3001)
    ↕ SQL Queries
PostgreSQL Database
```

### Backend Breakdown
- **REST API** — 5 route groups: auth, channels, messages, DMs, users
- **JWT Middleware** — Every protected request verified with Bearer token
- **Socket.io Rooms** — Each channel/DM gets its own room for isolated real-time messaging
- **Database** — 5 tables with foreign keys: users, channels, messages, conversations, direct_messages
- **68 passing tests** across auth, channels, messages, DMs, sockets, and edge cases

### Frontend Breakdown
- **Component-based architecture** — Sidebar, ChatHeader, MessageList, MessageInput, Message, ChannelCreate, DMCreate
- **Custom hooks** — `useAuth` (login/signup/logout), `useSocket` (WebSocket connection, events, typing)
- **Axios interceptors** — Auto-attaches JWT token to every request, auto-logout on 401
- **CSS Modules** — Scoped styling per component, no class name collisions

### How We Cloned Slack's Layout
- Dark purple sidebar (#3F0E40) with collapsible channel and DM sections
- Channel list with # icons, active state highlighting in blue
- DM list with user avatars (color-coded initials) and green online dots
- Message area with username, timestamp, and avatar per message
- Formatting toolbar (Bold, Italic, Strikethrough, Link, Lists, Code)
- Send button that activates (turns green) only when text is entered

### Our Development Process
- **Git workflow**: Manny forked Ismael's repo, used upstream/origin remotes to stay synced
- **Daily sync points**: Test signup → login → see channels → send message → verify persistence
- **Seed scripts**: Database initialized with default channels on setup
- **7-day roadmap**: Foundation (Days 1-2) → Real-time (Days 3-4) → Persistence (Day 5) → Polish (Day 6) → Submit (Day 7)

---

## Slide 3: UI/UX Improvements

### Features We'd Add Next
- **Threaded replies** — Reply to specific messages in a side panel, like Slack threads
- **Emoji reactions** — React to messages with thumbs up, heart, etc.
- **File uploads** — Share images, documents, and code snippets in chat
- **Message search** — Full-text search across all channels and DMs

### Visual Upgrades
- **Dark mode toggle** — Switch between light and dark themes
- **Notification badges** — Unread message counts on channels and DMs
- **Profile avatars** — Upload real photos instead of letter initials
- **Mobile responsive design** — Collapsible sidebar, touch-friendly UI on phones/tablets

### UX Improvements
- **Message editing & deletion** — Edit typos, delete messages with confirmation
- **Read receipts** — Show when your message has been seen
- **Pinned messages** — Pin important messages to the top of a channel
- **Keyboard shortcuts** — Cmd+K to jump to channels, Cmd+Enter to send, Escape to close modals
- **Infinite scroll** — Load older messages as you scroll up (currently limited to 50)

### What We Learned
- Start with a shared design mockup before coding — saves time on alignment
- Socket.io + Express 5 requires WebSocket-only transport (polling breaks)
- Seed your database early — empty channels make testing confusing
- Fork/upstream Git workflow is essential when two developers share a codebase
- Build the "boring" stuff first (auth, DB schema) — real-time features are the reward
