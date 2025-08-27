"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users, Building, FileText, ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../stores/UserStore";

interface StatsType {
  totalUsers?: number;
  totalProperties?: number;
  totalRequests?: number;
}

const Home: React.FC = () => {
  const [stats, setStats] = useState<StatsType>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
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


        
      </div>
    </DashboardLayout>
  );
};

export default Home;
