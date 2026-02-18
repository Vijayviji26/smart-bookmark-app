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
  const [search, setSearch] = useState("");

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
  // SEARCH FILTER
  // ===============================
  const filteredBookmarks = bookmarks.filter((bookmark) =>
    bookmark.title.toLowerCase().includes(search.toLowerCase())
  );

  // ===============================
  // UI
  // ===============================
  if (!user) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Smart Bookmark App</h2>
          <button
            onClick={login}
            style={{
              marginTop: 15,
              padding: "10px 20px",
              background: "#1677ff",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Smart Bookmark App</h2>
      <p style={{ color: "gray" }}>Welcome {user.email}</p>

      <button
        onClick={logout}
        style={{
          background: "#ff4d4f",
          color: "white",
          border: "none",
          padding: "6px 12px",
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        Logout
      </button>

      {/* ADD BOOKMARK CARD */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: 15,
          borderRadius: 6,
          marginBottom: 20,
        }}
      >
        <h3>Add Bookmark</h3>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 6 }}
        />

        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 6 }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 6 }}
        >
          <option value="General">General</option>
          <option value="Tech">Tech</option>
          <option value="Learning">Learning</option>
          <option value="Work">Work</option>
          <option value="Entertainment">Entertainment</option>
        </select>

        <button
          onClick={addBookmark}
          style={{
            width: "100%",
            padding: 8,
            background: "#1677ff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Add Bookmark
        </button>
      </div>

      {/* SEARCH */}
      <h3>Your Bookmarks</h3>

      <input
        placeholder="Search bookmarks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", marginBottom: 15, padding: 6 }}
      />

      {filteredBookmarks.length === 0 && <p>No bookmarks found.</p>}

      {filteredBookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          style={{
            border: "1px solid #eee",
            padding: 12,
            borderRadius: 6,
            marginBottom: 10,
          }}
        >
          <strong>{bookmark.title}</strong>
          <br />
          <a href={bookmark.url} target="_blank">
            {bookmark.url}
          </a>
          <br />
          <small style={{ color: "gray" }}>
            Category: {bookmark.category || "General"}
          </small>
          <br />
          <button
            onClick={() => deleteBookmark(bookmark.id)}
            style={{
              marginTop: 6,
              background: "#ff4d4f",
              color: "white",
              border: "none",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}