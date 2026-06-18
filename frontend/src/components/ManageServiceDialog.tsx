import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Service, Category } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ManageServiceDialogProps {
  service?: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManageServiceDialog: React.FC<ManageServiceDialogProps> = ({ 
  service, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    categoryId: '',
    image: '',
    location: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price.toString(),
        duration: service.duration,
        categoryId: service.categoryId,
        image: service.image,
        location: service.location || 'Global'
      });
      setImagePreview(service.image || '');
      setImageFile(null);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        categoryId: '',
        image: '',
        location: ''
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [service, isOpen]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : formData.image);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      (Object.entries(formData) as [keyof typeof formData, string][]).forEach(([key, value]) => {
        payload.append(String(key), key === 'price' ? String(parseFloat(value)) : value);
      });
      if (imageFile) {
        payload.append('imageFile', imageFile);
      }
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (service) {
        await api.patch(`/services/${service.id}`, payload, config);
        toast.success('Service updated successfully. Awaiting re-approval.');
      } else {
        await api.post('/services', payload, config);
        toast.success('Service created successfully. Awaiting approval.');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] w-[calc(100vw-1rem)] max-w-xl grid-rows-none flex-col gap-0 overflow-hidden p-0 sm:w-full">
        <DialogHeader className="shrink-0 px-4 pb-3 pt-4 sm:px-5">
          <DialogTitle>{service ? 'Edit Service' : 'Create New Service'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4 sm:px-5">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Deep Home Cleaning"
                required
              />
            </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="2-3 hours"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.categoryId} 
              onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Service Location (City/Area)</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="New York, NY"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => {
                setFormData({ ...formData, image: e.target.value });
                if (!imageFile) setImagePreview(e.target.value);
              }}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageFile">Upload Image</Label>
            <Input
              id="imageFile"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Upload JPG, PNG, or WEBP up to 5MB. If selected, the uploaded image is used instead of the URL.
            </p>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Service preview"
                className="h-28 w-full rounded-md border object-cover sm:h-32"
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your service in detail..."
              className="min-h-[100px]"
              required
            />
          </div>
          </div>
    
          <div className="flex shrink-0 flex-col-reverse gap-2 border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full bg-[#1a4d2e] hover:bg-[#143d24] sm:w-auto" disabled={loading}>
              {loading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
