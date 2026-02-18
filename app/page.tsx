"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  // Get user + bookmarks
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)

      if (data.user) {
        fetchBookmarks(data.user.id)
      }

      setLoading(false)
    }

    getUser()
  }, [])

  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)

    if (data) setBookmarks(data)
  }

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://smartbookmarkapp-omega.vercel.app"
      }
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  const addBookmark = async () => {
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

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
    fetchBookmarks(user.id)
  }

  if (loading) return <p>Loading...</p>

  if (!user) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Login With Google</h2>
        <button onClick={loginWithGoogle}>Login</button>
      </div>
    )
  }

  return (
    <div style={{ padding: "40px" }}>
      <h2>Welcome {user.email}</h2>
      <button onClick={logout}>Logout</button>

      <hr style={{ margin: "20px 0" }} />

      <h3>Add Bookmark</h3>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <input
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <br />
      <button onClick={addBookmark}>Add</button>

      <hr style={{ margin: "20px 0" }} />

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