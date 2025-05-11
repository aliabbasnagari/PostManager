import { useState } from "react";
import axios from "axios";

function PostForm({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!content.trim()) {
      newErrors.content = "Content is required";
    } else if (content.length > 500) {
      newErrors.content = "Content must be less than 500 characters";
    }

    if (image) {
      if (image.size > 5 * 1024 * 1024) { // 5MB limit
        newErrors.image = "Image size must be less than 5MB";
      }
      if (!image.type.startsWith('image/')) {
        newErrors.image = "File must be an image";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "Image size must be less than 5MB" });
        e.target.value = null;
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: "File must be an image" });
        e.target.value = null;
        return;
      }
      setImage(file);
      setErrors({ ...errors, image: null });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    const formData = new FormData();
    formData.append("content", content.trim());
    if (image) formData.append("image", image);

    try {
      const res = await axios.post("/api/posts", formData, {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
      setContent("");
      setImage(null);
      setImagePreview(null);
      onPostCreated(res.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to create post. Please try again.";
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            className={`w-full p-2 border rounded-md ${errors.content ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) {
                setErrors({ ...errors, content: null });
              }
            }}
            maxLength={500}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {content.length}/500 characters
          </p>
        </div>

        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={`block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100
              ${errors.image ? 'border-red-500' : ''}`}
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image}</p>
          )}
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-40 rounded-md"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
                className="text-red-500 text-sm mt-1"
              >
                Remove image
              </button>
            </div>
          )}
        </div>

        {errors.submit && (
          <div className="mb-4 p-2 bg-red-50 text-red-500 rounded-md">
            {errors.submit}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}

export default PostForm;
