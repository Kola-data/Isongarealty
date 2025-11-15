"use client"

import React, { useState, ChangeEvent, FormEvent } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster, toast } from '@/components/ui/sonner';
import useAuthStore from "../stores/UserStore" // import your store
import { API_ENDPOINTS } from '@/config/api';

export interface Property {
  id?: number
  title: string
  description?: string
  type: "sale" | "rent"
  status: "available" | "sold" | "pending" | "rented"
  price: number
  currency?: "RWF" | "USD"
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
    currency: (property?.currency && (property.currency === "RWF" || property.currency === "USD")) ? property.currency : "RWF",
    address: property?.address || "",
    city: property?.city || "",
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    garages: property?.garages || 0,
    area: property?.area || 0,
    main_image: property?.main_image || null,
  })

  // Update formData when property prop changes (for editing)
  React.useEffect(() => {
    if (property) {
      console.log(`[PropertyForm] Property loaded for editing:`, property);
      console.log(`[PropertyForm] Property currency:`, property.currency);
      setFormData({
        title: property.title || "",
        description: property.description || "",
        type: property.type || "sale",
        status: property.status || "available",
        price: property.price || 0,
        currency: (property.currency && (property.currency === "RWF" || property.currency === "USD")) ? property.currency : "RWF",
        address: property.address || "",
        city: property.city || "",
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        garages: property.garages || 0,
        area: property.area || 0,
        main_image: property.main_image || null,
      });
    }
  }, [property])

  const [errors, setErrors] = useState<Partial<Record<keyof Property, string>>>({})
  const [loading, setLoading] = useState(false)
  
  // Error state management
  const [error, setError] = useState<string | null>(null)

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

  const handleChange = <K extends keyof Property>(field: K, value: Property[K]) => {
    console.log(`[PropertyForm] handleChange: ${String(field)} = ${value}`)
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
    if (!formData.currency || (formData.currency !== "RWF" && formData.currency !== "USD")) {
      newErrors.currency = "Currency must be RWF or USD"
    }
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.area || formData.area < 0) newErrors.area = "Valid area is required"
    if (formData.bedrooms < 0) newErrors.bedrooms = "Bedrooms cannot be negative"
    if (formData.bathrooms < 0) newErrors.bathrooms = "Bathrooms cannot be negative"
    if (formData.garages < 0) newErrors.garages = "Garages cannot be negative"
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
      const currencyValue = formData.currency || "RWF"
      formPayload.append("currency", currencyValue)
      console.log(`[PropertyForm] ${property?.id ? 'Updating' : 'Creating'} property with currency: ${currencyValue}`)
      console.log(`[PropertyForm] formData.currency:`, formData.currency)
      console.log(`[PropertyForm] FormData entries:`, Array.from(formPayload.entries()).map(([k, v]) => [k, v instanceof File ? `[File: ${v.name}]` : v]))
      formPayload.append("address", formData.address)
      formPayload.append("city", formData.city)
      formPayload.append("bedrooms", formData.bedrooms.toString())
      formPayload.append("bathrooms", formData.bathrooms.toString())
      formPayload.append("garages", formData.garages.toString())
      formPayload.append("area", formData.area.toString())
      if (formData.main_image) formPayload.append("main_image", formData.main_image)

      const url = property?.id
        ? `${API_ENDPOINTS.PROPERTIES}/${property.id}`
        : API_ENDPOINTS.PROPERTIES
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
      setError("Failed to save property")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <Toaster />
      <CardHeader>
        <CardTitle>{property ? "Edit Property" : "Add New Property"}</CardTitle>
        <CardDescription>{property ? "Update property info" : "Create a new property listing"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={(e) => handleChange("title", e.target.value)} 
              className={`border-orange-500 focus:border-orange-600 focus:ring-orange-500 ${errors.title ? "border-destructive" : ""}`}
              placeholder="Enter property title"
            />
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
                <SelectTrigger className="border-orange-500 focus:border-orange-600 focus:ring-orange-500" autoComplete="off">
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
                <SelectTrigger className="border-orange-500 focus:border-orange-600 focus:ring-orange-500" autoComplete="off">
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
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price" 
                type="number" 
                min={0}
                step="0.01"
                value={formData.price} 
                onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)} 
                className={`border-orange-500 focus:border-orange-600 focus:ring-orange-500 ${errors.price ? "border-destructive" : ""}`}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={formData.currency || "RWF"} 
                onValueChange={(value) => handleChange("currency", value as "RWF" | "USD")}
              >
                <SelectTrigger className={`border-orange-500 focus:border-orange-600 focus:ring-orange-500 ${errors.currency ? "border-destructive" : ""}`} autoComplete="off">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RWF">RWF</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
              {errors.currency && <p className="text-sm text-destructive">{errors.currency}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Area (sq ft)</Label>
              <Input 
                id="area" 
                type="number" 
                min={0}
                step="0.01"
                value={formData.area} 
                onChange={(e) => handleChange("area", parseFloat(e.target.value) || 0)} 
                className={`border-orange-500 focus:border-orange-600 focus:ring-orange-500 ${errors.area ? "border-destructive" : ""}`}
              />
              {errors.area && <p className="text-sm text-destructive">{errors.area}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input 
                id="bedrooms" 
                type="number" 
                min={0} 
                value={formData.bedrooms} 
                onChange={(e) => handleChange("bedrooms", parseInt(e.target.value) || 0)} 
                className={`border-orange-500 focus:border-orange-600 focus:ring-orange-500 ${errors.bedrooms ? "border-destructive" : ""}`}
              />
              {errors.bedrooms && <p className="text-sm text-destructive">{errors.bedrooms}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input 
                id="bathrooms" 
                type="number" 
                min={0} 
                value={formData.bathrooms} 
                onChange={(e) => handleChange("bathrooms", parseInt(e.target.value) || 0)} 
                className={`border-orange-500 focus:border-orange-600 focus:ring-orange-500 ${errors.bathrooms ? "border-destructive" : ""}`}
              />
              {errors.bathrooms && <p className="text-sm text-destructive">{errors.bathrooms}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="garages">Garages</Label>
              <Input 
                id="garages" 
                type="number" 
                min={0} 
                value={formData.garages} 
                onChange={(e) => handleChange("garages", parseInt(e.target.value) || 0)} 
                className={`border-orange-500 focus:border-orange-600 focus:ring-orange-500 ${errors.garages ? "border-destructive" : ""}`}
              />
              {errors.garages && <p className="text-sm text-destructive">{errors.garages}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input 
              id="address" 
              value={formData.address} 
              onChange={(e) => handleChange("address", e.target.value)} 
              className={`border-orange-500 focus:border-orange-600 focus:ring-orange-500 ${errors.address ? "border-destructive" : ""}`}
              placeholder="Enter property address"
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input 
              id="city" 
              value={formData.city} 
              onChange={(e) => handleChange("city", e.target.value)} 
              className={`border-orange-500 focus:border-orange-600 focus:ring-orange-500 ${errors.city ? "border-destructive" : ""}`}
              placeholder="Enter city name"
            />
            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="main_image">Main Image</Label>
            <Input id="main_image" type="file" accept="image/*,.heic,.heif,.tiff,.tif,.bmp,.svg,.webp,.gif,.png,.jpg,.jpeg" onChange={handleFileChange} />
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
