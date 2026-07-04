"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export const CHART_COLORS = [
  "#0B5D4B",
  "#D9A94C",
  "#C97B57",
  "#3C8A6A",
  "#052C24",
  "#E1BB5E",
  "#6FA88E",
  "#98701F",
];

const axisStyle = { fontSize: 12, fill: "#6B7A73" };

export function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card p-5 ${className || ""}`}>
      <h3 className="mb-4 font-display text-base font-bold text-ink">{title}</h3>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

export function LineTrend({
  data,
  xKey,
  yKey,
}: {
  data: any[];
  xKey: string;
  yKey: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke="#0B5D4B"
          strokeWidth={3}
          dot={{ r: 3, fill: "#0B5D4B" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BarCompare({
  data,
  xKey,
  yKey,
  color = "#0B5D4B",
}: {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "rgba(11,93,75,0.05)" }} />
        <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutDistribution({
  data,
  nameKey = "name",
  valueKey = "value",
}: {
  data: any[];
  nameKey?: string;
  valueKey?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
