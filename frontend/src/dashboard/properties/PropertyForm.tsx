"use client"

import { useState, ChangeEvent, FormEvent } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner" // Import toaster
import useAuthStore from "../stores/UserStore" // import your store

export interface Property {
  id?: number
  title: string
  description?: string
  type: "sale" | "rent"
  status: "available" | "sold" | "pending" | "rented"
  price: number
  address: string
  city: string
  bedrooms: number
  bathrooms: number
  garages: number
  area: number
  main_image?: File | null
}

interface PropertyFormProps {
  property?: Property | null
  onSubmit?: (data: Property) => void
  onCancel?: () => void
}

export default function PropertyForm({ property = null, onSubmit, onCancel }: PropertyFormProps) {
  const token = useAuthStore((state) => state.token) // get auth token from store

  const [formData, setFormData] = useState<Property>({
    title: property?.title || "",
    description: property?.description || "",
    type: property?.type || "sale",
    status: property?.status || "available",
    price: property?.price || 0,
    address: property?.address || "",
    city: property?.city || "",
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    garages: property?.garages || 0,
    area: property?.area || 0,
    main_image: property?.main_image || null,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof Property, string>>>({})
  const [loading, setLoading] = useState(false)

  const handleChange = <K extends keyof Property>(field: K, value: Property[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, main_image: file }))
  }

  const validateForm = () => {
    const newErrors: Partial<Record<keyof Property, string>> = {}
    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.price || formData.price <= 0) newErrors.price = "Valid price is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.area || formData.area <= 0) newErrors.area = "Valid area is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)

      const formPayload = new FormData()
      formPayload.append("title", formData.title)
      formPayload.append("description", formData.description || "")
      formPayload.append("type", formData.type)
      formPayload.append("status", formData.status)
      formPayload.append("price", formData.price.toString())
      formPayload.append("address", formData.address)
      formPayload.append("city", formData.city)
      formPayload.append("bedrooms", formData.bedrooms.toString())
      formPayload.append("bathrooms", formData.bathrooms.toString())
      formPayload.append("garages", formData.garages.toString())
      formPayload.append("area", formData.area.toString())
      if (formData.main_image) formPayload.append("main_image", formData.main_image)

      const url = property?.id
        ? `http://localhost:5000/api/properties/${property.id}`
        : "http://localhost:5000/api/properties"
      const method = property?.id ? "put" : "post"

      const response = await axios({
        url,
        method,
        data: formPayload,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      toast.success(property?.id ? "Property updated successfully!" : "Property created successfully!")
      onSubmit?.(formData)
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message)
      toast.error("Failed to save property")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{property ? "Edit Property" : "Add New Property"}</CardTitle>
        <CardDescription>{property ? "Update property info" : "Create a new property listing"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value as Property["type"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value as Property["status"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" type="number" value={formData.price} onChange={(e) => handleChange("price", parseFloat(e.target.value))} />
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area (sq ft)</Label>
              <Input id="area" type="number" value={formData.area} onChange={(e) => handleChange("area", parseFloat(e.target.value))} />
              {errors.area && <p className="text-sm text-destructive">{errors.area}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" type="number" min={0} value={formData.bedrooms} onChange={(e) => handleChange("bedrooms", parseInt(e.target.value) || 0)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" type="number" min={0} value={formData.bathrooms} onChange={(e) => handleChange("bathrooms", parseInt(e.target.value) || 0)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="garages">Garages</Label>
              <Input id="garages" type="number" min={0} value={formData.garages} onChange={(e) => handleChange("garages", parseInt(e.target.value) || 0)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="main_image">Main Image</Label>
            <Input id="main_image" type="file" onChange={handleFileChange} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Submitting..." : property?.id ? "Update Property" : "Create Property"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
