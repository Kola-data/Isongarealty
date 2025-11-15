"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Building, FileText, ArrowRight, Plus, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../stores/UserStore";
import { API_ENDPOINTS } from '@/config/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatsType {
  totalUsers?: number;
  totalProperties?: number;
  totalRequests?: number;
}

interface PropertyData {
  created_at: string;
}

const Home: React.FC = () => {
  const [stats, setStats] = useState<StatsType>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState<Array<{ date: string; properties: number }>>([]);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [statsRes, propertiesRes] = await Promise.all([
          axios.get(`${API_ENDPOINTS.BASE_URL}/api/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_ENDPOINTS.BASE_URL}/api/properties`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        
        setStats(statsRes.data);
        
        // Process properties for chart data
        if (Array.isArray(propertiesRes.data)) {
          const properties: PropertyData[] = propertiesRes.data;
          
          // Group by date (last 30 days)
          const dateMap = new Map<string, number>();
          const today = new Date();
          
          // Initialize last 30 days with 0
          for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dateMap.set(dateStr, 0);
          }
          
          // Count properties by date
          properties.forEach((prop: PropertyData) => {
            if (prop.created_at) {
              const dateStr = prop.created_at.split('T')[0];
              if (dateMap.has(dateStr)) {
                dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
              }
            }
          });
          
          // Convert to chart data format
          const chartDataArray = Array.from(dateMap.entries())
            .map(([date, count]) => ({
              date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              properties: count,
            }));
          
          setChartData(chartDataArray);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setError("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers?.toLocaleString() ?? 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/users",
    },
    {
      title: "Properties",
      value: stats.totalProperties?.toLocaleString() ?? 0,
      icon: Building,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/dashboard/properties",
    },
    {
      title: "Requests",
      value: stats.totalRequests?.toLocaleString() ?? 0,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      href: "/dashboard/requested-properties",
    },
  ];


  if (loading) return <DashboardLayout currentPath="/"><p>Loading...</p></DashboardLayout>;
  if (error) return <DashboardLayout currentPath="/"><p className="text-red-500">{error}</p></DashboardLayout>;

  return (
    <DashboardLayout currentPath="/">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Welcome back! Here's an overview of your platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {statCards.map((stat) => {
    const Icon = stat.icon;
    return (
      <Link key={stat.title} to={stat.href}>
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-0 shadow-md">
          <CardContent className="items-center space-x-4">
            {/* Icon at the start */}
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <Icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            {/* Title & Value */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  })}
</div>

        {/* Analytics Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Property Analytics</CardTitle>
                <CardDescription className="mt-1">
                  Property creation trends over the last 30 days
                </CardDescription>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="properties" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Properties Created"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
        
      </div>
    </DashboardLayout>
  );
};

export default Home;
