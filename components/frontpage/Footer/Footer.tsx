'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Instagram, Facebook, MessageCircle, Music2 } from 'lucide-react'; // TikTok often uses Music2 or a custom SVG



export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 text-white mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#0091AD' }}>Mams Entreprise</h3>
            <p className="text-gray-400 text-sm">
              Premium household and personal care products for confident, healthy families. Based in DCI Juja.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
            <h4 className="text-lg font-bold mb-4" style={{ color: '#0091AD' }}>Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-400">
  <li>
    <Link href="/" className="transition-colors" style={{ color: '#999' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0091AD'} onMouseLeave={(e) => e.currentTarget.style.color = '#999'}>
      Home
    </Link>
  </li>
  <li>
    <Link href="/#products" className="transition-colors" style={{ color: '#999' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0091AD'} onMouseLeave={(e) => e.currentTarget.style.color = '#999'}>
      Products
    </Link>
  </li>
  <li>
    <Link href="/about" className="transition-colors" style={{ color: '#999' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0091AD'} onMouseLeave={(e) => e.currentTarget.style.color = '#999'}>
      About Us
    </Link>
  </li>
  <li>
    <Link href="/contact" className="transition-colors" style={{ color: '#999' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0091AD'} onMouseLeave={(e) => e.currentTarget.style.color = '#999'}>
      Contact
    </Link>
  </li>
</ul>


          </motion.div>

          {/* Social Media */}
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
  <h4 className="text-lg font-bold mb-4" style={{ color: '#0091AD' }}>Social media</h4>
  <ul className="flex space-x-4 text-sm text-gray-400">
    {/* WhatsApp */}
    <li>
      <Link 
        href="+254 719 338 583" 
        target="_blank"
        className="transition-colors" 
        style={{ color: '#999' }} 
        onMouseEnter={(e) => e.currentTarget.style.color = '#0091AD'} 
        onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
      >
        <MessageCircle size={24} />
      </Link>
    </li>
    {/* Instagram */}
    <li>
      <Link 
        href="https://www.instagram.com/mamsenterprise/" 
        target="_blank"
        className="transition-colors" 
        style={{ color: '#999' }} 
        onMouseEnter={(e) => e.currentTarget.style.color = '#0091AD'} 
        onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
      >
        <Instagram size={24} />
      </Link>
    </li>
    {/* Facebook */}
    <li>
      <Link 
        href="https://web.facebook.com/people/MAMs-Enterprise/61567639457490/" 
        target="_blank"
        className="transition-colors" 
        style={{ color: '#999' }} 
        onMouseEnter={(e) => e.currentTarget.style.color = '#0091AD'} 
        onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
      >
        <Facebook size={24} />
      </Link>
    </li>
    {/* TikTok */}
    <li>
      <Link 
        href="https://tiktok.com/@yourhandle" 
        target="_blank"
        className="transition-colors" 
        style={{ color: '#999' }} 
        onMouseEnter={(e) => e.currentTarget.style.color = '#0091AD'} 
        onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
      >
        <Music2 size={24} />
      </Link>
    </li>
  </ul>
</motion.div>

          {/* Contact */}
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
            <h4 className="text-lg font-bold mb-4" style={{ color: '#0091AD' }}>Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail size={16} style={{ color: '#0091AD' }} />
                <span>info@mamsenterprise.co.ke</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} style={{ color: '#0091AD' }} />
                <span>+254 719 338 583</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} style={{ color: '#0091AD' }} />
                <span>DCI Juja, Kenya</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Mams Entreprise. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-sm transition-colors" style={{ color: '#999' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0091AD'} onMouseLeave={(e) => e.currentTarget.style.color = '#999'}>
                Terms of Service
              </a>
              <a href="#" className="text-sm transition-colors" style={{ color: '#a0a0a0' }} onMouseEnter={(e) => e.currentTarget.style.color = '#71A9F7'} onMouseLeave={(e) => e.currentTarget.style.color = '#a0a0a0'}>
                Privacy Policy
              </a>
              <a href="#" className="text-sm transition-colors" style={{ color: '#a0a0a0' }} onMouseEnter={(e) => e.currentTarget.style.color = '#71A9F7'} onMouseLeave={(e) => e.currentTarget.style.color = '#a0a0a0'}>
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
