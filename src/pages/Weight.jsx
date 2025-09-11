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
} from "recharts";

const Weight = () => {
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWeights();
  }, []);

  const fetchWeights = async () => {
    try {
      const res = await api.get("/weights");
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching weight data", err);
    }
  };

  const addWeight = async () => {
    if (!weight || isNaN(weight)) {
      setError("Please enter a valid number");
      return;
    }

    try {
      await api.post("/weights", {
        weight: parseFloat(weight),
        date: new Date().toISOString(),
      });
      setWeight("");
      setError("");
      fetchWeights();
    } catch (err) {
      console.error("Error adding weight", err);

      if (err.response && err.response.status === 400) {
        setError("Invalid weight. Please try again.");
      } else {
        setError("Something went wrong. Please try later.");
      }
    }
  };

  const deleteWeightById = async (id) => {
    try {
      await api.delete(`/weights/${id}`);
      fetchWeights();
    } catch (err) {
      console.error("Error deleting weight", err);
    }
  };

  const grouped = history.reduce((acc, w) => {
    const day = new Date(w.date).toLocaleDateString();
    acc[day] = w.weight; // prende l’ultima pesata del giorno
    return acc;
  }, {});

  const chartData = Object.keys(grouped)
    .map((day) => ({
      date: day,
      weight: grouped[day],
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-green-600 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Weight ⚖️
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
        >
          Dashboard
        </button>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 gap-6 max-w-6xl mx-auto w-full">
        {/* Form + Buttons */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-6 items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Add yout latest weight
          </h2>
          <div className="flex justify-center gap-6">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight (kg)"
              className={`w-48 px-4 py-2 text-center text-lg border-2 rounded-full shadow-sm focus:outline-none transition
            ${
              error
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-400 focus:border-blue-400"
            }`}
            />

            <button
              onClick={addWeight}
              className="w-20 h-20 rounded-full bg-green-200 text-green-700 text-3xl font-bold flex items-center justify-center hover:bg-green-300 transition"
            >
              +
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        {/* List of Weights */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Weight Entries
          </h2>
          {history.length === 0 ? (
            <p className="text-gray-500">No weights recorded yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
              {history.map((w) => (
                <li
                  key={w._id}
                  className="flex justify-between items-center py-2"
                >
                  <span className="text-gray-700">
                    {new Date(w.date).toLocaleString()} —{" "}
                    <span className="font-bold">{w.weight} kg</span>
                  </span>
                  <button
                    onClick={() => deleteWeightById(w._id)}
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
            Daily Weights
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
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

export default Weight;
