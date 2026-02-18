"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }

    checkUser()
  }, [])

  if (loading) return <p>Loading...</p>

  if (!user) {
    return (
      <div>
        <h1>Smart Bookmark App</h1>
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
            })
          }
        >
          Login with Google
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1>Welcome {user.email}</h1>
      <button onClick={() => supabase.auth.signOut()}>
        Logout
      </button>
    </div>
  )
}