"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
      setLoading(false)
    }

    getSession()
  }, [])

  if (loading) return <h2>Loading...</h2>

  if (!user)
    return (
      <div style={{ padding: "40px" }}>
        <h2>Not Logged In</h2>
      </div>
    )

  return (
    <div style={{ padding: "40px" }}>
      <h2>Welcome {user.email}</h2>
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