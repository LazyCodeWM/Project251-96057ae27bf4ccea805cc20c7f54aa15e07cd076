"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./home.css";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);  // เก็บ token ใน state
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  // useEffect: ตรวจสอบว่า user และ token อยู่ใน localStorage หรือไม่
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));  // ตั้งค่า user
      setToken(storedToken);            // ตั้งค่า token
    } else {
      router.push("/login");  // ถ้าไม่มี token หรือ user, ไปที่หน้า login
    }

    const fetchPosts = async () => {
      if (!storedToken) return;  // ถ้าไม่มี token, ไม่ต้องส่งคำขอ

      try {
        const response = await fetch("/api/post", {
          headers: {
            Authorization: `Bearer ${storedToken}`,  // ใช้ storedToken ที่ได้จาก localStorage
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setError("Token expired or invalid. Please log in again.");
            router.push("/login");  // ไปที่หน้า login หาก token หมดอายุ
            return;
          }
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setPosts(data);
        } else if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts);
        } else {
          throw new Error("Invalid posts data");
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPosts();
  }, [router]);

  // Handle post creation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("Please log in to create a post");
      return;
    }

    const post = {
      title,
      content,
      author: user.username,  // ใช้ username ของ user ที่ล็อกอิน
      createdAt: new Date(),
    };

    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,  // ใช้ token จาก state
        },
        body: JSON.stringify(post),
      });

      if (response.ok) {
        const newPost = await response.json();
        setMessage("Post created successfully!");
        setTitle("");
        setContent("");
        setPosts([...posts, newPost]);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to create post");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");  // นำผู้ใช้กลับไปที่หน้า login
  };

  // ถ้า user ยังไม่ได้ล็อกอิน, จะไม่แสดงอะไร
  if (!user) {
    return null;
  }

  return (
    <div className="home-container">
      <div className="home-layout">
        <div className="logout-section">
          <span>{user.username} </span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

        <div className="create-post-section">
          <div className="header">DeSwuCafe ☕</div>
          <h1>Create a New Post</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div>
              <label>Content:</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="submit-button">
              Create Post
            </button>
          </form>
          {message && <p className="message">{message}</p>}
        </div>

        <div className="posts-list-section">
          <h1>Posts</h1>
          {error ? (
            <p className="error">Error: {error}</p>
          ) : posts.length === 0 ? (
            <p>No posts available</p>
          ) : (
            <ul className="posts-list">
              {posts.map((post) => (
                <li key={post._id} className="post-item">
                  <h2>{post.title}</h2>
                  <p>{post.content}</p>
                  <small>By: {post.author}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
