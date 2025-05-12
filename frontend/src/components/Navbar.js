import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("auth_data"));
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuth(!!localStorage.getItem("auth_data"));
  }, []);

  const logout = () => {
    localStorage.removeItem("auth_data");
    setIsAuth(false);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600">
                SocialApp
              </span>
            </Link>
          </div>
          <div className="flex items-center">
            {isAuth ? (
              <button
                onClick={logout}
                className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="ml-4 px-4 py-2 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded
                  rounded-md hover:bg-indigo-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
