"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/supabase"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Get logged in user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }

    getUser()
  }, [])

  // Google Login
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://smartbookmarkapp-omega.vercel.app"
      }
    })
  }

  // Logout
  const logout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  if (loading) return <p>Loading...</p>

  // If NOT logged in
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

  // If logged in
  return (
    <div style={{ padding: "40px" }}>
      <h2>Welcome {user.email}</h2>
      <button onClick={logout}>
        Logout
      </button>
    </div>
  )
}