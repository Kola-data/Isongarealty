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
import { Search, Plus, MoreHorizontal, Edit, Trash2, XCircle, Image } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Toaster, toast } from "@/components/ui/sonner"
import PropertyForm, { Property } from "./PropertyForm"
import useAuthStore from "../stores/UserStore"
import { API_ENDPOINTS } from '@/config/api';

interface PropertyImage {
  id: number
  property_id: number
  image_url: string
}

const PropertyIndex: React.FC = () => {
  const token = useAuthStore((state) => state.token)
  const [properties, setProperties] = useState<Property[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [openModal, setOpenModal] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(false)

  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState<PropertyImage[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [currentPropertyId, setCurrentPropertyId] = useState<number | null>(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  
  // Error state management
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const backendURL = API_ENDPOINTS.BASE_URL

  // ------------------- FETCH PROPERTIES -------------------
  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${backendURL}/api/properties`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (Array.isArray(res.data)) {
        setProperties(res.data)
      } else {
        console.error("Invalid properties data:", res.data)
        setError("Failed to fetch properties")
      }
    } catch (err) {
      console.error("Error fetching properties:", err)
      setError("Failed to fetch properties")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  // Handle error display
  useEffect(() => {
    if (error) {
      // Use setTimeout to ensure this runs after render
      const timer = setTimeout(() => {
        toast.error(error)
        setError(null) // Clear error after showing
      }, 0)
      
      return () => clearTimeout(timer)
    }
  }, [error])

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "All" || p.type === typeFilter
    const matchesStatus = statusFilter === "All" || p.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, statusFilter])

  // ------------------- PROPERTY ACTIONS -------------------
  const handleAdd = () => {
    setSelectedProperty(null)
    setOpenModal(true)
  }

  const handleEdit = (property: Property) => {
    setSelectedProperty(property)
    setOpenModal(true)
  }

  const handleConfirmDelete = (property: Property) => {
    setPropertyToDelete(property)
    setDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!propertyToDelete) return
    try {
      await axios.delete(`${backendURL}/api/properties/${propertyToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProperties((prev) => prev.filter((p) => p.id !== propertyToDelete.id))
      toast.success(`Deleted "${propertyToDelete.title}"`)
    } catch (err) {
      console.error("Error deleting property:", err)
      setError("Failed to delete property")
    } finally {
      setDeleteModalOpen(false)
      setPropertyToDelete(null)
    }
  }

  const handleSubmit = () => {
    setOpenModal(false)
    fetchProperties()
  }

  // ------------------- BADGES & FORMAT -------------------
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      available: "bg-green-100 text-green-800",
      sold: "bg-gray-200 text-gray-700",
      pending: "bg-yellow-100 text-yellow-800",
      rented: "bg-blue-100 text-blue-800",
    }
    return <Badge className={colors[status]}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      sale: "bg-green-100 text-green-800",
      rent: "bg-blue-100 text-blue-800",
    }
    return <Badge className={colors[type]}>{type.toUpperCase()}</Badge>
  }

  const formatPrice = (price: number, currency?: string, type?: string) => {
    const currencySymbol = currency === 'USD' ? '$' : 'RWF '
    const formatted = new Intl.NumberFormat('en-US').format(price)
    const base = `${currencySymbol}${formatted}`
    return type === 'rent' ? `${base}/month` : base
  }

  // ------------------- IMAGE HANDLERS -------------------
  const openImagesModal = async (propertyId: number) => {
    setCurrentPropertyId(propertyId)
    setUploading(true)
    try {
      const res = await axios.get(`${backendURL}/api/properties/${propertyId}/images`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (Array.isArray(res.data)) setSelectedImages(res.data)
      else setSelectedImages([])
      setImageModalOpen(true)
    } catch (err) {
      console.error("Error fetching images:", err)
      setError("Failed to fetch images")
    } finally {
      setUploading(false)
    }
  }

  const handleUploadImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setNewImages(Array.from(e.target.files))
  }

  const handleAddImages = async () => {
    if (!currentPropertyId || newImages.length === 0) return
    if (!token) {
      setError("Unauthorized: Please login again")
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      newImages.forEach((file) => formData.append("images", file))

      const res = await axios.post(`${backendURL}/api/properties/${currentPropertyId}/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      if (Array.isArray(res.data)) {
        // **Add new images immediately to modal without refreshing**
        setSelectedImages((prev) => [...prev, ...res.data])
        toast.success(`${res.data.length} image(s) uploaded successfully`)
      } else if (res.data.message) {
        toast.success(res.data.message)
      } else {
        console.error("Invalid images data:", res.data)
        setError("Failed to add images")
      }

      setNewImages([])
    } catch (err) {
      console.error("Error adding images:", err)
      setError("Failed to add images")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    try {
      await axios.delete(`${backendURL}/api/properties/image/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSelectedImages((prev) => prev.filter((img) => img.id !== imageId))
      toast.success("Image deleted")
    } catch (err) {
      console.error("Error deleting image:", err)
      setError("Failed to delete image")
    }
  }

  const handleDeleteAllImages = async () => {
    if (!currentPropertyId) return
    try {
      await Promise.all(
        selectedImages.map((img) =>
          axios.delete(`${backendURL}/api/properties/image/${img.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      )
      setSelectedImages([])
      toast.success("All images deleted")
    } catch (err) {
      console.error("Error deleting all images:", err)
      setError("Failed to delete all images")
    }
  }

  // ------------------- RENDER -------------------
  return (
    <DashboardLayout currentPath="/properties">
      <Toaster />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
             <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
             Property Management</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage property listings and images</p>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
            <CardDescription>Manage all property listings</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-orange-500 focus:border-orange-600 focus:ring-orange-500"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border-2 border-orange-500 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-600"
                autoComplete="off"
              >
                <option value="All">All Types</option>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border-2 border-orange-500 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-600"
                autoComplete="off"
              >
                <option value="All">All Status</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="pending">Pending</option>
                <option value="rented">Rented</option>
              </select>
              <div className="flex items-center gap-2">
                <Label htmlFor="itemsPerPage" className="text-sm whitespace-nowrap">Items per page:</Label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-3 py-2 border-2 border-orange-500 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-600"
                  autoComplete="off"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProperties.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.main_image ? (
                          <img
                            src={`${backendURL}${p.main_image}`}
                            alt={p.title}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                            No Image
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{p.title}</TableCell>
                      <TableCell>{getTypeBadge(p.type)}</TableCell>
                      <TableCell>{formatPrice(p.price, (p as any).currency, p.type)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{(p as any).currency || 'RWF'}</Badge>
                      </TableCell>
                      <TableCell>{p.address}</TableCell>
                      <TableCell>{p.city}</TableCell>
                      <TableCell>{getStatusBadge(p.status)}</TableCell>
                      <TableCell>
                        {p.bedrooms} bed, {p.bathrooms} bath, {p.garages} garage, {p.area} sq ft
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(p)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleConfirmDelete(p)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openImagesModal(p.id)}>
                              <Image className="mr-2 h-4 w-4" /> Images
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

            {/* Pagination */}
            {!loading && filteredProperties.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length} properties
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Form Modal */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{selectedProperty ? "Edit Property" : "Add Property"}</DialogTitle>
              <DialogDescription>
                Fill out the form to {selectedProperty ? "update" : "add"} a property.
              </DialogDescription>
            </DialogHeader>
            <PropertyForm
              property={selectedProperty}
              onSubmit={handleSubmit}
              onCancel={() => setOpenModal(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{propertyToDelete?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Images Modal */}
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Manage Images</DialogTitle>
              <DialogDescription>
                Upload new images or manage existing images for this property.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-3 mb-4">
              <Input type="file" multiple accept="image/*,.heic,.heif,.tiff,.tif,.bmp,.svg,.webp,.gif,.png,.jpg,.jpeg" onChange={handleUploadImages} disabled={uploading} />
              <Button onClick={handleAddImages} disabled={newImages.length === 0 || uploading}>
                {uploading ? "Uploading..." : "Add Images"}
              </Button>
            </div>

            {uploading && <div className="text-center py-4 text-blue-600">Uploading images...</div>}

            {selectedImages.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {selectedImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={`${backendURL}${img.image_url}`}
                        alt="Property"
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="destructive" onClick={handleDeleteAllImages} disabled={selectedImages.length === 0}>
                    Delete All
                  </Button>
                </div>
              </>
            ) : (
              !uploading && <p className="text-muted-foreground">No images uploaded yet.</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default PropertyIndex
