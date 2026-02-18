"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  // -------------------------
  // 🔐 Get Logged-in User
  // -------------------------
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // -------------------------
  // 📥 Fetch Bookmarks
  // -------------------------
  const fetchBookmarks = async () => {
    if (!user) return

    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    setBookmarks(data || [])
  }

  // -------------------------
  // 🔄 Real-time subscription
  // -------------------------
  useEffect(() => {
    if (!user) return

    fetchBookmarks()

    const channel = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookmarks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // -------------------------
  // ➕ Add Bookmark
  // -------------------------
  const addBookmark = async () => {
    if (!title || !url) return

    await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ])

    setTitle("")
    setUrl("")
  }

  // -------------------------
  // ❌ Delete Bookmark
  // -------------------------
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
  }

  // -------------------------
  // 🔐 Login with Google
  // -------------------------
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  // -------------------------
  // 🖥️ UI
  // -------------------------
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Smart Bookmark App</h2>
        <button onClick={loginWithGoogle}>Login with Google</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <p>Welcome {user.email}</p>
      <button onClick={logout}>Logout</button>

      <hr />

      <h3>Add Bookmark</h3>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={addBookmark}>Add</button>

      <hr />

      <h3>Your Bookmarks</h3>
      {bookmarks.map((b) => (
        <div key={b.id}>
          <a href={b.url} target="_blank">
            {b.title}
          </a>
          <button onClick={() => deleteBookmark(b.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}