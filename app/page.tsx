"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(true)

  // 🔹 Get Logged User
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }

    getUser()
  }, [])

  // 🔹 Fetch Bookmarks
  const fetchBookmarks = async () => {
    if (!user) return

    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    setBookmarks(data || [])
  }

  // 🔹 Real-time subscription
  useEffect(() => {
    if (!user) return

    fetchBookmarks()

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
          fetchBookmarks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // 🔹 Google Login
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://smartbookmarkapp-omega.vercel.app",
      },
    })
  }

  // 🔹 Logout
  const logout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  // 🔹 Add Bookmark
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

  // 🔹 Delete Bookmark
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
  }

  if (loading) return <p>Loading...</p>

  // 🔹 Not Logged In
  if (!user)
    return (
      <div style={{ padding: "40px" }}>
        <h2>Login With Google</h2>
        <button onClick={loginWithGoogle}>Login</button>
      </div>
    )

  // 🔹 Logged In
  return (
    <div style={{ padding: "40px" }}>
      <h3>Welcome {user.email}</h3>
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
        <div key={b.id} style={{ marginBottom: "10px" }}>
          <a href={b.url} target="_blank">
            {b.title}
          </a>
          <button onClick={() => deleteBookmark(b.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}