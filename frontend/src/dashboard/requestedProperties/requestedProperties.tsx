"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import DashboardLayout from "../DashboardLayout"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { Toaster, toast } from "@/components/ui/sonner"
import useAuthStore from "../stores/UserStore"

interface Property {
  id: number
  first_name: string
  last_name: string
  phone: string
  email: string
  property_type: string
  status: string
  is_read: number
  description: string // <-- Add this line
  created_at: string
  updated_at: string
}


const RequestedPropertyIndex: React.FC = () => {
  const token = useAuthStore((state) => state.token)
  const [properties, setProperties] = useState<Property[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(false)

  const backendURL = "http://localhost:5000"

  // ------------------- FETCH PROPERTIES -------------------
  const fetchProperties = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${backendURL}/api/requested-properties`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (Array.isArray(res.data)) {
        setProperties(res.data)
      } else {
        toast.error("Failed to fetch properties")
      }
    } catch (err) {
      console.error("Error fetching properties:", err)
      toast.error("Failed to fetch properties")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "All" || p.property_type === typeFilter
    const matchesStatus = statusFilter === "All" || p.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  // ------------------- BADGES -------------------
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processed: "bg-green-100 text-green-800",
    }
    return <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      Rent: "bg-blue-100 text-blue-800",
      Sale: "bg-green-100 text-green-800",
    }
    return <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>{type}</Badge>
  }

  const getReadBadge = (is_read: number) => {
    return is_read === 1 ? (
      <Badge className="bg-green-100 text-green-800">Read</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Not Read</Badge>
    )
  }

  // ------------------- ACTION HANDLERS -------------------
  const handleChangeStatus = async (property: Property) => {
    try {
      const newStatus = property.status === "pending" ? "processed" : "pending"
      await axios.patch(
        `${backendURL}/api/requested-properties/${property.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchProperties()
      toast.success("Status updated")
    } catch (err) {
      console.error("Error updating status:", err)
      toast.error("Failed to update status")
    }
  }

  const handleChangeRead = async (property: Property) => {
    try {
      const newRead = property.is_read === 1 ? 0 : 1
      await axios.patch(
        `${backendURL}/api/requested-properties/${property.id}/read`,
        { is_read: newRead },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchProperties()
      toast.success("Read status updated")
    } catch (err) {
      console.error("Error updating read status:", err)
      toast.error("Failed to update read status")
    }
  }

  // ------------------- RENDER -------------------
  return (
    <DashboardLayout currentPath="/requested-properties">
      <Toaster />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                Requested Properties
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Manage all requested properties</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Requests</CardTitle>
            <CardDescription>View and manage property requests</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-3"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="All">All Types</option>
                <option value="Rent">Rent</option>
                <option value="Sale">Sale</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="All">All Status</option>
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
              </select>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Is Read</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.first_name} {p.last_name}</TableCell>
                      <TableCell>{p.phone}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{p.description}</TableCell>
                      <TableCell>{getTypeBadge(p.property_type)}</TableCell>
                      <TableCell>{getStatusBadge(p.status)}</TableCell>
                      <TableCell>{getReadBadge(p.is_read)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleChangeStatus(p)}>
                              Change Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRead(p)}>
                              Mark as {p.is_read ? "Unread" : "Read"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {loading && <div className="text-center py-8">Loading properties...</div>}
              {!loading && filteredProperties.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No properties found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default RequestedPropertyIndex
