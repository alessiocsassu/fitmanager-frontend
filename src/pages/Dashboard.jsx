import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
        logout();
        navigate("/login");
      }
    };
    fetchData();
  }, [token, logout, navigate]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const { user, latestWeight, latestMacros, todayHydrationTotal } = data;

  const weight = latestWeight ? latestWeight.weight : "N/A";
  const macros = latestMacros || { protein: 0, carbs: 0, fats: 0 };
  const hydration = todayHydrationTotal || 0;

  const macroData = [
    { name: "Protein", value: macros.protein },
    { name: "Carbs", value: macros.carbs },
    { name: "Fats", value: macros.fats },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-green-600 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-between items-bg-white shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Welcome, {user.username} 👋
        </h1>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">
        {/* Card Weight */}
        <Link
          to="/weight"
          className="bg-white hover:bg-gray-100 rounded-xl shadow p-6 flex flex-col items-center col-span-1"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Last weight measure ⚖️
          </h2>
          <p className="text-4xl font-bold text-gray-900">{weight} kg</p>
          <p className="text-sm text-gray-500 mt-2">
            Target: {user.targetWeight || "N/A"} kg
          </p>
        </Link>

        {/* Card Hydration */}
        <Link
          to="/hydration"
          className="bg-white hover:bg-gray-100 rounded-xl shadow p-6 flex flex-col items-center col-span-1"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Hydration 💧
          </h2>
          <p className="text-3xl font-bold text-gray-900">{hydration} ml</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
            <div
              className="bg-blue-500 h-3 rounded-full"
              style={{ width: `${(hydration / 4000) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Max: 4000 ml</p>
        </Link>

        {/* Card Macros */}
        <Link
          to="/macros"
          className="bg-white hover:bg-gray-100 rounded-xl shadow p-6 col-span-1 md:col-span-2"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Macros 🍎
          </h2>
          {latestMacros ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center">No data available</p>
          )}
        </Link>

        {/* Card Profile */}
        <div className="bg-white hover:bg-gray-100 rounded-xl shadow p-6 col-span-1 md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              User Profile 👤
            </h2>
            <span className="mb-4 font-medium text-gray-600">
              Last update{" "}
              {new Date(user.updatedAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 flex-col sm:flex-row">
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium">Date of Birth:</span>{" "}
              {new Date(user.dateOfBirth).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
            <p>
              <span className="font-medium">Sex:</span> {user.sex}
            </p>
            <p>
              <span className="font-medium">Height:</span>{" "}
              {user.height || "N/A"} cm
            </p>
            <p>
              <span className="font-medium">Initial weight:</span>{" "}
              {user.initialWeight || "N/A"} kg
            </p>
            <p>
              <span className="font-medium">Target Weight:</span>{" "}
              {user.targetWeight || "N/A"} kg
            </p>
            <p>
              <span className="font-medium">Workouts x week:</span>{" "}
              {user.workoutsPerWeek || "N/A"}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center px-6 py-4">
          <div className="flex flex-cols-2 items-center md:gap-6">
            <img
              src="/logo.png"
              className="h-8 md:h-14 w-8 md:w-14 object-cover rounded-lg"
            ></img>
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

export default Dashboard;
