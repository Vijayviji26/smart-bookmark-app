"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

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

  if (loading) return <div>Checking authentication...</div>

  if (!user) return <div>Please login first.</div>

  return (
    <div>
      <h1>Welcome {user.email}</h1>

      <button
        onClick={async () => {
          await supabase.auth.signOut()
          location.reload()
        }}
      >
        Logout
      </button>
    </div>
  )
}