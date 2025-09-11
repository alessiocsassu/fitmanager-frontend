import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await api.post("/auth/login", { username, password });
      login(response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-green-600">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <img
          src="/logo.png"
          className="h-24 w-24 object-contain mx-auto mb-4 rounded-lg"
        ></img>
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
          >
            Login
          </button>
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </form>

        {/* Footer */}
        <footer className="bg-white border-t mt-8">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center px-6 py-4">
            <div className="flex flex-cols-2 items-center md:gap-6">
              <p className="text-sm text-gray-600">
                {new Date().getFullYear()}{" "}
                <span className="font-semibold">FitManager</span>
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-2 sm:mt-0">
              Developed by{" "}
              <a
                href="https://github.com/alessiocsassu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-semibold hover:underline"
              >
                Alessio Sassu
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Login;
