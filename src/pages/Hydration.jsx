import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Hydration = () => {
  const [todayTotal, setTodayTotal] = useState(0);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const getDayString = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  useEffect(() => {
    fetchHydration();
  }, []);

  const fetchHydration = async () => {
    try {
      const res = await api.get("/hydrations");
      setHistory(res.data);

      const today = getDayString(new Date());
      const todayEntries = res.data.filter(
        (h) => getDayString(h.date) === today
      );
      const sum = todayEntries.reduce((acc, h) => acc + h.amount, 0);
      setTodayTotal(sum);
    } catch (err) {
      console.error("Error fetching hydration data", err);
    }
  };

  const updateHydration = async (delta) => {
    try {
      await api.post("/hydrations", {
        amount: delta,
        date: new Date().toISOString(),
      });
      fetchHydration();
    } catch (err) {
      console.error("Error updating hydration", err);
    }
  };

  const deleteHydrationById = async (id) => {
    try {
      await api.delete(`/hydrations/${id}`);
      fetchHydration();
    } catch (err) {
      console.error("Error deleting weight", err);
    }
  };

  const deleteLastHydration = async () => {
    try {
      const res = await api.get("/hydrations?last=true");
      const lastEntry = res.data[0];
      if (!lastEntry) return;

      await api.delete(`/hydrations/${lastEntry._id}`);
      fetchHydration();
    } catch (err) {
      console.error("Error deleting last entry", err);
    }
  };

  const grouped = history.reduce((acc, h) => {
    const day = new Date(h.date).toLocaleDateString();
    acc[day] = (acc[day] || 0) + h.amount;
    return acc;
  }, {});

  const chartData = Object.keys(grouped)
    .sort((a, b) => new Date(a) - new Date(b))
    .map((day) => ({
      date: day,
      amount: grouped[day],
    }));

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-600 to-green-600 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Hydration 💧
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
        >
          Dashboard
        </button>
      </header>

      <main className="flex p-6 grid grid-cols-1 gap-6 max-w-6xl mx-auto w-full">
        {/* Buttons */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-6 items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-700">Add water</h2>
          <div className="flex justify-center gap-6">
            <button
              onClick={() => updateHydration(100)}
              className="w-20 h-20 rounded-full bg-blue-200 text-blue-800 text-xl font-bold flex items-center justify-center hover:bg-blue-300 transition"
            >
              +100
            </button>
            <button
              onClick={() => deleteLastHydration()}
              className="w-20 h-20 rounded-full bg-red-200 text-red-800 text-xl font-bold flex items-center justify-center hover:bg-red-300 transition"
            >
              -100
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Today's Progress
          </h2>
          <p className="text-2xl font-bold mb-2">{todayTotal} ml</p>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full"
              style={{ width: `${(todayTotal / 4000) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Max: 4000 ml</p>
        </div>

        {/* List of Hydrations */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Hydration Entries
          </h2>
          {history.length === 0 ? (
            <p className="text-gray-500">No hydration entries recorded yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
              {history.map((h) => (
                <li
                  key={h._id}
                  className="flex justify-between items-center py-2"
                >
                  <span className="text-gray-700">
                    {new Date(h.date).toLocaleString()} —{" "}
                    <span className="font-bold">{h.amount} ml</span>
                  </span>
                  <button
                    onClick={() => deleteHydrationById(h._id)}
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
            Daily Totals
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t mt-8">
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

export default Hydration;
