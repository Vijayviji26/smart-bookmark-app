"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  // 🔹 Get logged in user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()
  }, [])

  // 🔹 Fetch bookmarks
  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    setBookmarks(data || [])
  }

  // 🔹 Realtime subscription
  useEffect(() => {
    if (!user) return

    fetchBookmarks(user.id)

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookmarks(user.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // 🔹 Add bookmark
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

  // 🔹 Delete bookmark
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
  }

  // 🔹 Login
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    })
  }

  // 🔹 Logout
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={login}>Login with Google</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h3>Welcome {user.email}</h3>
      <button onClick={logout}>Logout</button>

      <hr />

      <h4>Add Bookmark</h4>
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

      <h4>Your Bookmarks</h4>
      {bookmarks.map((b) => (
        <div key={b.id}>
          {b.title}{" "}
          <button onClick={() => deleteBookmark(b.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}