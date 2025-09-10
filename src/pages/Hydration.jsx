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
      await api.post("/hydrations", { amount: delta });
      fetchHydration();
    } catch (err) {
      console.error("Error updating hydration", err);
    }
  };

  const grouped = history.reduce((acc, h) => {
    const day = new Date(h.date).toLocaleDateString();
    acc[day] = (acc[day] || 0) + h.amount;
    return acc;
  }, {});

  const chartData = Object.keys(grouped).map((day) => ({
    date: day,
    amount: grouped[day],
  }));

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-green-600 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Hydration Tracker</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-white text-gray-700 rounded shadow hover:bg-gray-100 transition"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Buttons */}
      <div className="bg-white rounded-xl shadow p-6 flex gap-6 justify-center mb-6">
        <button
          onClick={() => updateHydration(100)}
          className="w-16 h-16 rounded-full bg-blue-200 text-blue-800 text-xl font-bold flex items-center justify-center hover:bg-blue-300 transition"
        >
          +100
        </button>
        <button
          onClick={() => updateHydration(-100)}
          className="w-16 h-16 rounded-full bg-red-200 text-red-800 text-xl font-bold flex items-center justify-center hover:bg-red-300 transition"
        >
          -100
        </button>
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
            style={{ width: `${(todayTotal / 3000) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">Target: 3000 ml</p>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow p-6">
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
    </div>
  );
};

export default Hydration;
