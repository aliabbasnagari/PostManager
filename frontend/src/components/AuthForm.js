import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function AuthForm({ type }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (type === "register") {
      if (!formData.username.trim()) {
        newErrors.username = "Username is required";
      } else if (formData.username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      } else if (formData.username.length > 20) {
        newErrors.username = "Username must be less than 20 characters";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (type === "register" && !passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be at least 8 characters and include both letters and numbers";
    } else if (type === "register" && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      const url = type === "register" ? "/api/auth/register" : "/api/auth/login";
      const res = await api.post(url, formData);

      console.log(res, res.status);
      
      if (res.status === 200) {
        localStorage.setItem("auth_data", JSON.stringify(res.data.user));
        navigate("/");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
        (type === "register" ? "Registration failed. Please try again." : "Login failed. Please check your credentials.");
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {type === "register" ? "Create an Account" : "Welcome Back"}
      </h2>
      
      {serverError && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === "register" && (
          <div>
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500
                ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500
              ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500
              ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
          {type === "register" && !errors.password && (
            <p className="text-gray-500 text-sm mt-1">
              Password must be at least 8 characters and include both letters and numbers
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {type === "register" ? "Creating Account..." : "Logging in..."}
            </span>
          ) : (
            type === "register" ? "Create Account" : "Login"
          )}
        </button>

        <p className="text-center text-gray-600 mt-4">
          {type === "register" ? (
            <>
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                Login here
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-500">
                Register here
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

export default AuthForm;
