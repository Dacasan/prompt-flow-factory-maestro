
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 4500, target: 5000 },
  { month: "Feb", revenue: 5200, target: 5000 },
  { month: "Mar", revenue: 4800, target: 5000 },
  { month: "Apr", revenue: 6100, target: 5500 },
  { month: "May", revenue: 5800, target: 5500 },
  { month: "Jun", revenue: 7200, target: 6000 },
  { month: "Jul", revenue: 6800, target: 6000 },
  { month: "Aug", revenue: 7500, target: 6500 },
  { month: "Sep", revenue: 8200, target: 7000 },
  { month: "Oct", revenue: 7900, target: 7000 },
  { month: "Nov", revenue: 8800, target: 7500 },
  { month: "Dec", revenue: 9200, target: 8000 },
];

export const RevenueChart = () => {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue vs targets for the current year</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [`$${value}`, name === 'revenue' ? 'Revenue' : 'Target']}
            />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
