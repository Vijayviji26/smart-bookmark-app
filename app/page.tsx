"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  category: string;
  user_id: string;
  created_at: string;
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("General");

  // ===============================
  // GET USER
  // ===============================
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  // ===============================
  // FETCH BOOKMARKS
  // ===============================
  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  useEffect(() => {
    if (user) fetchBookmarks();
  }, [user]);

  // ===============================
  // REALTIME
  // ===============================
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("bookmarks-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => {
          fetchBookmarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ===============================
  // ADD BOOKMARK
  // ===============================
  const addBookmark = async () => {
    if (!title || !url) return;

    await supabase.from("bookmarks").insert([
      {
        title,
        url,
        category,
        user_id: user.id,
      },
    ]);

    setTitle("");
    setUrl("");
    setCategory("General");
  };

  // ===============================
  // DELETE BOOKMARK
  // ===============================
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  // ===============================
  // LOGIN
  // ===============================
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  // ===============================
  // LOGOUT
  // ===============================
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ===============================
  // UI
  // ===============================
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Smart Bookmark App</h2>
        <button onClick={login}>Login with Google</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
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

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="General">General</option>
        <option value="Tech">Tech</option>
        <option value="Learning">Learning</option>
        <option value="Work">Work</option>
        <option value="Entertainment">Entertainment</option>
      </select>

      <button onClick={addBookmark}>Add</button>

      <hr />

      <h3>Your Bookmarks</h3>

      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} style={{ marginBottom: 10 }}>
          <strong>{bookmark.title}</strong> <br />
          <a href={bookmark.url} target="_blank">
            {bookmark.url}
          </a>
          <br />
          <small>Category: {bookmark.category}</small>
          <br />
          <button onClick={() => deleteBookmark(bookmark.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}