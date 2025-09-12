import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showReAuth, setShowReAuth] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [pendingAction, setPendingAction] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user");
        setUser(res.data);
      } catch (err) {
        setError("Error loading profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const requestReAuth = (action) => {
    setPendingAction(action);
    setShowReAuth(true);
  };

  const handleReAuth = async () => {
    try {
      const res = await api.post("/auth/verify", credentials);
      if (!res.data.verified) {
        alert("Invalid credentials");
        return;
      }

      if (pendingAction === "update") {
        await updateProfile();
      } else if (pendingAction === "delete") {
        await deleteAccount();
      }
    } catch (err) {
      alert("Re-authentication failed");
      console.error(err);
    } finally {
      setShowReAuth(false);
      setCredentials({ username: "", password: "" });
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      const {
        username,
        dateOfBirth,
        sex,
        height,
        initialWeight,
        targetWeight,
        workoutsPerWeek,
      } = user;

      const res = await api.put("/user", {
        username,
        dateOfBirth,
        sex,
        height,
        initialWeight,
        targetWeight,
        workoutsPerWeek,
      });

      setUser(res.data);
      alert("Profile updated!");
    } catch (err) {
      setError("Error updating profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete("/user");
      localStorage.removeItem("token");
      alert("Account deleted");
      window.location.href = "/login";
    } catch (err) {
      setError("Error deleting account");
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-600 to-green-600">
      {/* Header */}
      <header className="bg-white shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          User Profile 👤
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
        >
          Dashboard
        </button>
      </header>

      {/* Main */}
      <main className="flex p-6 grid grid-cols-1 gap-6 max-w-6xl mx-auto w-full">
        <div className="p-6 max-w-md mx-auto bg-white rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Profile</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              requestReAuth("update");
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Username</label>
                <input
                  type="text"
                  name="username"
                  value={user.username || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={user.email || ""}
                  disabled
                  className="mt-1 block w-full border rounded-md p-2 bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={user.dateOfBirth ? user.dateOfBirth.split("T")[0] : ""}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Sex</label>
                <select
                  name="sex"
                  value={user.sex || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                >
                  <option value="">Select...</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={user.height || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Initial Weight (kg)
                </label>
                <input
                  type="number"
                  name="initialWeight"
                  value={user.initialWeight || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Target Weight (kg)
                </label>
                <input
                  type="number"
                  name="targetWeight"
                  value={user.targetWeight || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Workouts per Week
                </label>
                <input
                  type="number"
                  name="workoutsPerWeek"
                  value={user.workoutsPerWeek || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <button
            onClick={() => requestReAuth("delete")}
            className="mt-4 w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
      </main>

      {/* Re-Auth Modal */}
      {showReAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">Re-authenticate</h2>
            <input
              type="text"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              className="mt-1 mb-2 block w-full border rounded-md p-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              className="mt-1 mb-4 block w-full border rounded-md p-2"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReAuth(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleReAuth}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto bg-white border-t">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center px-6 py-4">
          <div className="flex flex-cols-2 items-center md:gap-6">
            <img
              src="/logo.png"
              className="h-8 md:h-14 w-8 md:w-14 object-cover rounded-lg"
              alt="logo"
            />
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
  );
};

export default Profile;
