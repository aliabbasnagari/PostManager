import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";

function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth_data") || "null");
    if (!authData) {
      navigate("/login");
      return;
    }
    setUser(authData);
    console.log("HOME: ", authData);

    const fetchPosts = async () => {
      try {
        const res = await api.get("/api/posts", {
          headers: { "x-auth-token": authData.token },
        });
        console.log("HOME: ", res.data);
        setPosts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPosts();
  }, [navigate]);

  const handlePostCreated = (newPost) => {
    const postWithUser = {
      ...newPost,
      user: {
        id: user?.id,
        username: user.username,
      },
    };
    console.log("HOME: ", postWithUser);
    setPosts([postWithUser, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(
      posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      {user && <PostForm onPostCreated={handlePostCreated} />}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          userId={user?.id}
          onDelete={handlePostDeleted}
          onUpdate={handlePostUpdated}
        />
      ))}
    </div>
  );
}

export default Home;
