"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }

    getUser()
  }, [])

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  if (loading) return <p>Loading...</p>

  if (!user) {
  return (
    <div style={{ padding: "40px" }}>
      <h2>Login With Google</h2>
      <button
        onClick={async () => {
          await supabase.auth.signInWithOAuth({
            provider: "google",
          })
        }}
      >
        Login
      </button>
    </div>
  )
}

  return (
    <div style={{ padding: "40px" }}>
      <h2>Welcome {user.email}</h2>
      <button onClick={logout}>Logout</button>
    </div>
  )
}