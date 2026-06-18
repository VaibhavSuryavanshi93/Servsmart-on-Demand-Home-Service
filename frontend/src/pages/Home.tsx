import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Category } from '../types';
import { CATEGORIES } from '../constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';
import { ArrowRight, Star, Shield, Clock, Search, MapPin, CheckCircle } from 'lucide-react';

export const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

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

  return (
    <div className="flex flex-col space-y-20 md:space-y-32 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100svh-5rem)] overflow-hidden bg-[#f8f7f4] py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1920"
            alt="Modern Living Room"
            className="w-full h-full object-cover object-left md:object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/35 lg:from-white/90 lg:via-white/55 lg:to-transparent" />
        </div>

        <div className="container relative z-10 flex min-h-[calc(100svh-11rem)] items-center px-4 sm:px-6 lg:px-12">
          <div className="w-full max-w-4xl space-y-6 text-left sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="max-w-3xl text-4xl font-extrabold uppercase leading-[1.05] text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem]">
                Home Services, <br />
                <span className="text-[#1a4d2e]">On Demand</span>
              </h1>
              <p className="max-w-2xl text-base font-medium leading-7 text-gray-700 sm:text-lg md:text-xl">
                Experience the ease of booking top-rated professionals for all your home needs. Excellence at your doorstep.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid w-full max-w-3xl gap-3 rounded-3xl bg-white/95 p-3 shadow-2xl backdrop-blur sm:p-4 md:grid-cols-[1fr_1fr_auto]"
            >
              <div className="flex min-h-14 items-center rounded-2xl border border-gray-100 bg-gray-50 px-4">
                <Search className="mr-3 h-5 w-5 shrink-0 text-[#1a4d2e]" />
                <Input 
                  placeholder="What service?" 
                  className="h-12 border-none bg-transparent px-0 text-base focus-visible:ring-0 sm:text-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex min-h-14 items-center rounded-2xl border border-gray-100 bg-gray-50 px-4">
                <MapPin className="mr-3 h-5 w-5 shrink-0 text-[#1a4d2e]" />
                <Input 
                  placeholder="Where?" 
                  className="h-12 border-none bg-transparent px-0 text-base focus-visible:ring-0 sm:text-lg"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button 
                size="lg" 
                className="min-h-14 rounded-2xl bg-[#1a4d2e] px-8 text-base font-bold text-white hover:bg-[#143d24] sm:text-lg md:min-w-36"
                onClick={() => navigate(`/services?search=${search}&location=${location}`)}
              >
                Search
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:gap-6 md:pt-4"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    alt="user"
                    className="h-10 w-10 rounded-full border-4 border-white shadow-sm sm:h-12 sm:w-12"
                  />
                ))}
              </div>
              <div className="text-sm font-medium">
                <div className="flex text-yellow-500 mb-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <span className="text-gray-900">4.9/5 from 10k+ happy users</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="container mx-auto px-4 text-center space-y-16">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">How it Works</h2>
          <p className="text-muted-foreground text-lg italic">The smartest way to take care of your home</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            { icon: Search, title: 'Choose a Service', desc: 'Select from our wide range of professional services.' },
            { icon: MapPin, title: 'Provide Details', desc: 'Pick your preferred date, time, and service location.' },
            { icon: CheckCircle, title: 'Relax & Enjoy', desc: 'Our expert arrives and gets the job done perfectly.' }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="flex flex-col items-center space-y-6"
            >
              <div className="h-20 w-20 rounded-3xl bg-[#1a4d2e]/10 flex items-center justify-center text-[#1a4d2e]">
                <item.icon className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4 space-y-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold">Popular Categories</h2>
              <p className="text-muted-foreground">Tailored solutions for every corner of your home</p>
            </div>
            <Button variant="ghost" asChild className="hover:text-[#1a4d2e] gap-2">
              <Link to="/services" className="flex items-center font-bold">
                View All <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.isArray(categories) && categories.map((category, index) => (
              <motion.div
                key={category._id || category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/services?category=${category._id || category.id}`}>
                  <Card className="hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border-none group rounded-[2rem]">
                    <div className="aspect-[3/4] relative">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                        <span className="text-white font-bold text-xl tracking-tight">{category.name}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Professional Section */}
      <section className="container mx-auto px-4">
        <div className="relative rounded-[3rem] overflow-hidden bg-[#1a4d2e] text-white">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1920" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
              alt="Professional"
            />
          </div>
          <div className="relative z-10 py-24 px-12 md:px-24 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl space-y-6">
              <h2 className="text-5xl font-bold leading-tight">Empower your skills & grow with ServeSmart</h2>
              <p className="text-white/80 text-xl leading-relaxed">
                Join our elite network of service providers. Get more leads, manage your schedule, and grow your business today.
              </p>
            </div>
            <Button 
              size="lg" 
              variant="secondary" 
              asChild 
              className="rounded-full px-12 h-16 text-xl bg-white text-[#1a4d2e] hover:bg-gray-100 transition-all hover:scale-105"
            >
              <Link to="/register?role=provider">Register as a Partner</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="container mx-auto px-4 border-t pt-16">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { icon: Star, title: 'Expert Verification', desc: 'Every pro is extensively vetted for skill and trustworthiness.' },
            { icon: Shield, title: 'Safe Payments', desc: 'Secure billing and simple online payments for peace of mind.' },
            { icon: Clock, title: 'Smart Scheduling', desc: 'Instant bookings and 24/7 support for all your home needs.' }
          ].map((item, i) => (
            <div key={i} className="flex gap-6">
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-900">
                <item.icon className="h-8 w-8" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
