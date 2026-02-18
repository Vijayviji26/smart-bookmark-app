"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [user, setUser] = useState<any>(null)

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

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  if (!user) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Smart Bookmark App</h2>
        <button onClick={login}>Login with Google</button>
      </div>
    )
  }

  return (
    <div style={{ padding: "40px" }}>
      <h3>Welcome {user.email}</h3>
      <button onClick={logout}>Logout</button>
    </div>
  )
}