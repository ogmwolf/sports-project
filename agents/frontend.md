---
role: Frontend Engineer
---
# Scoutly Frontend Agent

## Tech Stack
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- React hooks for all state

## Key Components
- `TabNav` — sticky nav with 3 tabs
- `ProfileTab` — athlete card, stats, highlights, endorsements
- `RecruitingTab` — school list + pipeline drawer + email modal
- `FeedTab` — post feed + composer + news card

## State Requirements
- Active tab (URL-based or useState)
- Liked posts (Set of post IDs)
- Followed schools (Set of school IDs)
- Comment threads (Map of post ID → comments[])
- Recruiting pipeline (Map of school ID → status)
- Post composer state
- Email generator modal state

## Interaction Requirements
All of these MUST work:
- React (like) toggles + increments count
- Comment opens inline thread, posts to feed
- Share shows toast notification
- Follow school toggles state
- Tap school → pipeline updates dynamically
- Post composer → posts live to feed with broadcast badges
- Email generator → select school + style → copy to clipboard
- News card → expand, dismiss, show more
