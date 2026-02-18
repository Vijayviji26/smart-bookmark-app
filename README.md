# Smart Bookmark App 🚀

A full-stack bookmark manager built using **Next.js (App Router)** and **Supabase**.

## 🌐 Live Demo
https://smartbookmarkapp-omega.vercel.app

---

## 📌 Features

- 🔐 Google OAuth Login (Supabase Auth)
- ➕ Add Bookmark (Title + URL)
- 🔒 Private bookmarks per user (Row Level Security)
- ⚡ Real-time updates without page refresh
- 🗑 Delete bookmarks
- 🚀 Deployed on Vercel

---

## 🛠 Tech Stack

- Next.js (App Router)
- Supabase (Auth, PostgreSQL, Realtime)
- TypeScript
- PostgreSQL
- Vercel (Deployment)

---

## 🔒 Security Implementation

Row Level Security (RLS) policies ensure:

- Users can only view their own bookmarks
- Users can only insert their own bookmarks
- Users can only delete their own bookmarks

---

## ⚡ Real-Time Functionality

Implemented Supabase Realtime using:

This allows bookmark updates to appear instantly across multiple tabs without refreshing.

---

## 🧠 Challenges Faced

1. RLS initially blocking data access  
   → Solved by correctly configuring `auth.uid() = user_id` policies.

2. Real-time subscription not triggering  
   → Fixed by properly setting up `postgres_changes` channel.

3. Timestamp column mismatch (`create_at` vs `created_at`)  
   → Renamed column and set default `now()`.

4. Environment variables not working in production  
   → Correctly configured Supabase keys in Vercel settings.

---

## ⚙️ Run Locally

1. Install dependencies:
    npm install
    


2. Create a `.env.local` file and add:
NEXT_PUBLIC_SUPABASE_URL=https://zuekxzxwdzgsvtzvjbgn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_qTAOKOsKzP4ds8EdqrdR-g_25v4vp22

3. Start development server:
npm run dev


---

## 👨‍💻 Author

Vijay Kumar  
Full-stack Developer (Learning & Building Production Apps)