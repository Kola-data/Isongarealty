"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, Shield, Building2 } from "lucide-react";
import { toast } from '@/components/ui/sonner';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/UserStore"; // ✅ updated store
import { API_ENDPOINTS } from '@/config/api';

function Login() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = React.useState(false);
  
  // Error state management
  const [error, setError] = React.useState<string | null>(null);

  const navigate = useNavigate();
  const { setToken } = useAuthStore(); // ✅ token-only store

  // Handle error display
  React.useEffect(() => {
    if (error) {
      // Use setTimeout to ensure this runs after render
      const timer = setTimeout(() => {
        toast.error(error);
        setError(null); // Clear error after showing
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, formData);

      if (response.status === 200) {
        const { token } = response.data;

        // ✅ store token in Zustand
        setToken(token);

        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(error.response?.data?.message || "Login attempt failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your admin dashboard</p>
          </div>

          {/* Login Form */}
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">Sign In</CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                Enter your credentials to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-white">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="w-4 h-4 text-orange-500 bg-gray-50 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                      Remember me
                    </Label>
                  </div>
                  <button type="button" className="text-sm text-orange-500 hover:text-orange-600 transition-colors">
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <button className="text-orange-500 hover:text-orange-600 transition-colors font-medium">
              Contact Administrator
            </button>
          </div>
        </div>
      </div>

      {/* Right Side Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-orange-100 via-blue-50 to-orange-200 dark:from-orange-900/20 dark:via-blue-900/10 dark:to-orange-800/20 items-center justify-center p-8">
        <div className="text-center space-y-8 max-w-md">
          <div className="relative">
            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-orange-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Shield className="h-24 w-24 text-white" />
            </div>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Secure Admin Access</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Manage your properties, users, and business operations with our comprehensive admin dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
