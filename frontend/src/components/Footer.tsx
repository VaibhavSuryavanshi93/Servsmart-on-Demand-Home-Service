import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 text-white">
              <div className="bg-[#1a4d2e] p-2 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">ServeSmart</span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Premium home services at your fingertips. Bringing professional expertise and reliability to your doorstep.
            </p>
            <div className="flex space-x-4">
              <Link to="#" className="hover:text-white transition-colors"><Facebook className="h-5 w-5" /></Link>
              <Link to="#" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></Link>
              <Link to="#" className="hover:text-white transition-colors"><Instagram className="h-5 w-5" /></Link>
              <Link to="#" className="hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Browse Services</Link></li>
              <li><Link to="/register?role=provider" className="hover:text-white transition-colors">Become a Partner</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Popular Services */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Popular Services</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/services?category=cleaning" className="hover:text-white transition-colors">Home Cleaning</Link></li>
              <li><Link to="/services?category=plumbing" className="hover:text-white transition-colors">Plumbing Works</Link></li>
              <li><Link to="/services?category=repairs" className="hover:text-white transition-colors">AC Repairs</Link></li>
              <li><Link to="/services?category=salon" className="hover:text-white transition-colors">Salon for Women</Link></li>
              <li><Link to="/services?category=painting" className="hover:text-white transition-colors">Home Painting</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 shrink-0 text-[#1a4d2e]" />
                <span>123 Service Lane, Business park, City 560001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 shrink-0 text-[#1a4d2e]" />
                <span>+1 (800) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 shrink-0 text-[#1a4d2e]" />
                <span>hello@servesmart.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2026 ServeSmart. All rights reserved.</p>
          <div className="flex space-x-8">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
