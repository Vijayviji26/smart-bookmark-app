"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      setUser(data.user)
      fetchBookmarks(data.user.id)
    }
    setLoading(false)
  }

  async function fetchBookmarks(userId: string) {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)

    if (data) setBookmarks(data)
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://smartbookmarkapp-omega.vercel.app"
      }
    })
  }

  async function logout() {
    await supabase.auth.signOut()
    location.reload()
  }

  async function addBookmark() {
    if (!title || !url) return

    await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id
      }
    ])

    setTitle("")
    setUrl("")
    fetchBookmarks(user.id)
  }

  async function deleteBookmark(id: string) {
    await supabase.from("bookmarks").delete().eq("id", id)
    fetchBookmarks(user.id)
  }

  if (loading) return <p>Loading...</p>

  if (!user) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Login With Google</h2>
        <button onClick={loginWithGoogle}>
          Login
        </button>
      </div>
    )
  }

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
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id}>
          <a href={bookmark.url} target="_blank">
            {bookmark.title}
          </a>
          <button onClick={() => deleteBookmark(bookmark.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}