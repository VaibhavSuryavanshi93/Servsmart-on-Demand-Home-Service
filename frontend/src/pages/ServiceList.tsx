import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { Service, Category } from '../types';
import { CATEGORIES } from '../constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Search, MapPin, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const ServiceList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [locationSearch, setLocationSearch] = useState(searchParams.get('location') || '');
  
  const categoryId = searchParams.get('category');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        } else {
          setCategories(CATEGORIES);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
        setCategories(CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const s = searchParams.get('search');
    const l = searchParams.get('location');
    if (s !== null) setSearch(s);
    if (l !== null) setLocationSearch(l);
  }, [searchParams]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/services', {
          params: { categoryId, search: searchParams.get('search'), location: searchParams.get('location') }
        });
        setServices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch services', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [categoryId, searchParams]);

  const filteredServices = Array.isArray(services) ? services.filter(s => 
    (s.name.toLowerCase().includes(search.toLowerCase()) ||
     s.description.toLowerCase().includes(search.toLowerCase())) &&
    (s.location?.toLowerCase().includes(locationSearch.toLowerCase()) || !locationSearch)
  ) : [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          {categoryId ? (
            categories.find(c => (c._id || c.id) === categoryId)?.name || 
            CATEGORIES.find(c => c.id === categoryId)?.name || 
            'Services'
          ) : 'All Services'}
        </h1>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="What are you looking for?"
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-64">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="In which city?"
              className="pl-10"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={!categoryId ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchParams({})}
        >
          All
        </Button>
        {Array.isArray(categories) && categories.map(cat => {
          const id = cat._id || cat.id;
          return (
            <Button
              key={id}
              variant={categoryId === id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchParams({ category: id })}
            >
              {cat.name}
            </Button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <Link key={service.id} to={`/services/${service.id}`}>
              <Card className="hover:shadow-lg transition-shadow overflow-hidden group">
                <div className="aspect-video relative">
                  <img
                    src={service.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=800'}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur text-foreground">
                    ₹{service.price}
                  </Badge>
                  {service.location && (
                    <Badge variant="secondary" className="absolute bottom-2 left-2 flex items-center gap-1 opacity-90 text-[10px]">
                      <MapPin className="h-3 w-3" /> {service.location}
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{service.name}</span>
                    <div className="flex items-center text-sm font-normal">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      {service.rating} ({service.reviewCount})
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                  <span>By {service.providerName}</span>
                  <span>{service.duration}</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">No services found in this category.</p>
        </div>
      )}
    </div>
  );
};
