import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./dashboard/auth/Login";
import { ProtectedRoute } from "./dashboard/components/ProtectedRoute";
import { AuthRedirect } from "./dashboard/components/AuthRedirect";
import Home from "./dashboard/index/Home";
import PropertyIndex from "./dashboard/properties/PropertyIndex";
import Properties from "./pages/properties";
import PropertyDetails from "./pages/PropertyDetails";
import RequestedPropertyIndex from "./dashboard/requestedProperties/requestedProperties";
import Profile from "./dashboard/profile/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />

            <Route path="/login" element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            } />

            <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/properties"
            element={
              <ProtectedRoute>
                <PropertyIndex />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/properties" 
            element={<Properties />}
          />

          <Route 
            path="/properties/:id" 
            element={<PropertyDetails />}
          />

          <Route path='/dashboard/requested-properties' element={
            <ProtectedRoute>
              {/* <RequestedProperties /> */}
              {<RequestedPropertyIndex />}
            </ProtectedRoute>
          } />

          <Route path='/dashboard/my-profile' element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

        </Routes>
          
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
