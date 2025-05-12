import { useState } from "react";
import api from "../api";

function PostCard({ post, userId, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    const authData = JSON.parse(localStorage.getItem("auth_data") || "null");

    setIsLoading(true);
    setError(null);

    try {
      await api.delete(`/api/posts/${post.id}`, {
        headers: { "x-auth-token": authData.token },
      });
      onDelete(post.id);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to delete post. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!content.trim()) {
      setError("Content cannot be empty");
      return;
    }

    const authData = JSON.parse(localStorage.getItem("auth_data") || "null");

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.put(
        `/api/posts/${post.id}`,
        { content: content.trim() },
        { headers: { "x-auth-token": authData.token } }
      );
      setIsEditing(false);
      onUpdate(res.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update post. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{post.user.username}</h3>
        {post.user.id === userId && (
          <div>
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setError(null);
                if (!isEditing) {
                  setContent(post.content);
                }
              }}
              disabled={isLoading}
              className={`text-indigo-600 mr-2 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className={`text-red-600 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-500 rounded-md text-sm">
          {error}
        </div>
      )}

      {isEditing ? (
        <div>
          <textarea
            className="w-full p-2 border rounded-md mb-2"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
            }}
            maxLength={500}
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mb-2">
            {content.length}/500 characters
          </p>
          <div className="mt-2">
            <button
              onClick={handleUpdate}
              disabled={isLoading}
              className={`bg-indigo-600 text-white px-4 py-2 rounded-md mr-2 
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-700 mb-4">{post.content}</p>
          {post.image && (
            <img
              src={post.image}
              alt="Post"
              className="max-w-full h-auto rounded-md"
            />
          )}
        </>
      )}
      <p className="text-sm text-gray-500 mt-2">
        {new Date(post.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export default PostCard;
