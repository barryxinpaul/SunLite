"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const salesData = [
  {
    name: "Jan",
    accountValue: 10000,
  },
  {
    name: "Feb",
    accountValue: 120000,
  },
  {
    name: "Mar",
    accountValue: 138000,
  },
  {
    name: "Apr",
    accountValue: 155000,
  },
  {
    name: "May",
    accountValue: 164000,
  },
  {
    name: "Jun",
    accountValue: 172070,
  },
];

const LineChartComponent = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={300}
        data={salesData}
        margin={{
          right: 30,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="accountValue"
          stroke="#FACC15" // Yellow line color
          strokeWidth={2} // Thicker line
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-slate-900 flex flex-col gap-4 rounded-md">
        <p className="text-medium text-lg text-white">{label}</p>
        <p className="text-sm text-yellow-400">
          Account Value:
          <span className="ml-2">${payload[0].value}</span>
        </p>
      </div>
    );
  }
};
