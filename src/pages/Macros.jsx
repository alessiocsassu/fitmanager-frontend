import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Macros = () => {
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMacros();
  }, []);

  const fetchMacros = async () => {
    try {
      const res = await api.get("/macros");
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching macros data", err);
    }
  };

  const addMacro = async () => {
    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fats) || 0;

    if (isNaN(p) && isNaN(c) && isNaN(f)) {
      setError("Please insert at least one value");
      return;
    }

    try {
      await api.post("/macros", {
        protein: p,
        carbs: c,
        fats: f,
        date: new Date().toISOString(),
      });
      setProtein("");
      setCarbs("");
      setFats("");
      setError("");
      fetchMacros();
    } catch (err) {
      console.error("Error adding macros", err);
      if (err.response && err.response.status === 400) {
        setError("Invalid values. Please try again.");
      } else {
        setError("Something went wrong. Please try later.");
      }
    }
  };

  const deleteMacroById = async (id) => {
    try {
      await api.delete(`/macros/${id}`);
      fetchMacros();
    } catch (err) {
      console.error("Error deleting macro entry", err);
    }
  };

  const chartData = history
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString(),
      protein: m.protein,
      carbs: m.carbs,
      fats: m.fats,
    }));

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-green-600 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Macros 🍎
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
        >
          Dashboard
        </button>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 gap-6 max-w-6xl mx-auto w-full">
        {/* Form */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-6 items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Add your latest macros
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="Protein (g)"
              className="w-32 px-4 py-2 text-center text-lg border-2 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              placeholder="Carbs (g)"
              className="w-32 px-4 py-2 text-center text-lg border-2 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input
              type="number"
              value={fats}
              onChange={(e) => setFats(e.target.value)}
              placeholder="Fats (g)"
              className="w-32 px-4 py-2 text-center text-lg border-2 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              onClick={addMacro}
              className="w-20 h-20 rounded-full bg-green-200 text-green-700 text-3xl font-bold flex items-center justify-center hover:bg-green-300 transition"
            >
              +
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Macros Entries
          </h2>
          {history.length === 0 ? (
            <p className="text-gray-500">No macros recorded yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
              {history.map((m) => (
                <li
                  key={m._id}
                  className="flex justify-between items-center py-2"
                >
                  <span className="text-gray-700">
                    {new Date(m.date).toLocaleString()} —{" "}
                    <span className="font-bold text-blue-600">
                      {m.protein}g Protein
                    </span>
                    ,{" "}
                    <span className="font-bold text-green-600">
                      {m.carbs}g Carbs
                    </span>
                    ,{" "}
                    <span className="font-bold text-yellow-600">
                      {m.fats}g Fats
                    </span>
                  </span>
                  <button
                    onClick={() => deleteMacroById(m._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Macros Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="protein"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="carbs"
                stroke="#10b981"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="fats"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>

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

export default Macros;
