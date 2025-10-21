"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../DashboardLayout";
import { Toaster, toast } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import { Edit, Check } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}
const Profile: React.FC = () => {
  const [user, setUser] = useState<User>({
    id: 0,
    name: "",
    email: "",
    password: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Error state management
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const backendURL = "http://localhost:5000";

  // Handle error display
  useEffect(() => {
    if (error) {
      // Use setTimeout to ensure this runs after render
      const timer = setTimeout(() => {
        toast.error(error);
        setError(null); // Clear error after showing
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch user info from token or API
  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        axios
          .get(`${backendURL}/api/profile/${decoded.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setUser({
              id: res.data.id,
              name: res.data.name,
              email: res.data.email,
              password: "",
            });
            // console.log("data view from db")
          })
          .catch((err) => {
            console.error("Failed to fetch user profile:", err);
            setUser({
              id: decoded.id,
              name: decoded.name || "",
              email: decoded.email || "",
              password: "",
            });
          });
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, [token]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile
  const handleSave = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await axios.put(
        `${backendURL}/api/profile?id=${user.id}`,
        { name: user.name, email: user.email, password: user.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated successfully");
      setEditMode(false);
      setUser((prev) => ({ ...prev, password: "" })); // clear password field
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout currentPath="/requested-properties">
      <Toaster />
      <div className="flex flex-col items-center justify-center h-full space-y-6  mt-20">
        {/* User Icon */}
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
          {user.name.charAt(0)}
        </div>

        <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                Your Profile
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
                View and update your personal information securely
            </p>
        </div>


        {/* User Info */}
        <div className="w-full max-w-md space-y-4">
          <Input
            name="name"
            placeholder="Name"
            value={user.name}
            onChange={handleChange}
            disabled={!editMode}
          />
          <Input
            name="email"
            placeholder="Email"
            value={user.email}
            onChange={handleChange}
            disabled={!editMode}
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={user.password}
            onChange={handleChange}
            disabled={!editMode}
          />

          {editMode ? (
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-accent hover:bg-accent-light w-full gap-2 flex items-center justify-center"
            >
              <Check className="w-4 h-4" /> Save changes
            </Button>
          ) : (
            <Button
              onClick={() => setEditMode(true)}
              className="bg-blue-800 hover:bg-blue-900 w-full gap-2 flex items-center justify-center"
            >
              <Edit className="w-4 h-4" /> Press to edit
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
