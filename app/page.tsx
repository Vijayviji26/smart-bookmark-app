"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    getUser();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!user) {
    return <h2>Please login first</h2>;
  }

  return (
    <div>
      <h1>Welcome {user.email}</h1>
      <button onClick={() => supabase.auth.signOut()}>
        Logout
      </button>
    </div>
  );
}