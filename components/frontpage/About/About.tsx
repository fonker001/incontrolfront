'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Shield, Truck, Users, 
  Target, Eye, Star, ThumbsUp 
} from 'lucide-react';

// ============================================================================
// CONSTANTS & DATA
// ============================================================================

const BRAND_COLORS = {
  primary: '#0091AD',
  secondary: '#00b8d4',
  light: '#e6f7fb',
  lighter: '#f8fdff',
  gradient: 'linear-gradient(135deg, #5fb3cc 0%, #0091AD 100%)',
} as const;

const VALUES = [
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'Every product meets the highest standards of quality and safety',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Same-day delivery available in Juja and surrounding areas',
  },
  {
    icon: Users,
    title: 'Community Focused',
    description: 'Supporting local communities with affordable solutions',
  },
] as const;

const ACHIEVEMENTS = [
  { number: '5+', label: 'Years Serving Kenya', icon: Target },
  { number: '50+', label: 'Premium Products', icon: Star },
  { number: '1000+', label: 'Happy Families', icon: ThumbsUp },
  { number: '24/7', label: 'Customer Support', icon: CheckCircle },
] as const;

const ANIMATION_CONFIG = {
  fadeUp: {
    initial: { opacity: 0, y: -20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true },
  },
  fadeLeft: {
    initial: { opacity: 0, x: -50 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true },
  },
  fadeRight: {
    initial: { opacity: 0, x: 50 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.6, delay: 0.2 },
    viewport: { once: true },
  },
  fadeScale: {
    initial: { opacity: 0, scale: 0.9 },
    whileInView: { opacity: 1, scale: 1 },
    transition: { duration: 0.4 },
    viewport: { once: true },
  },
} as const;

// ============================================================================
// COMPONENTS
// ============================================================================

interface SectionHeaderProps {
  pretitle?: string;
  title: React.ReactNode;
  subtitle?: string;
  centered?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  pretitle, 
  title, 
  subtitle,
  centered = false 
}) => (
  <div className={`space-y-6 ${centered ? 'text-center' : ''}`}>
    {pretitle && (
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#e6f7fb] to-[#d1f2f7] px-4 py-2 rounded-full">
        <CheckCircle size={20} className="text-[#0091AD]" />
        <span className="text-sm font-semibold text-[#0091AD]">{pretitle}</span>
      </div>
    )}
    
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
      {title}
    </h2>
    
    {subtitle && (
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        {subtitle}
      </p>
    )}
  </div>
);

interface IconCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}

const IconCard: React.FC<IconCardProps> = ({ 
  icon: Icon, 
  title, 
  description,
  delay = 0 
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay }}
    viewport={{ once: true }}
    whileHover={{ x: 5 }}
    className="flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-gradient-to-r hover:from-white hover:to-[#f8fdff] transition-all group cursor-pointer border border-gray-100"
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e6f7fb] to-[#d1f2f7] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
      <Icon size={24} className="text-[#0091AD]" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-gray-900 mb-1 truncate">{title}</h4>
      <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
    </div>
  </motion.div>
);

interface AchievementCardProps {
  achievement: typeof ACHIEVEMENTS[number];
  index: number;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, index }) => {
  const Icon = achievement.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      className="bg-gradient-to-b from-white to-[#f8fdff] rounded-xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#e6f7fb] to-[#d1f2f7] flex items-center justify-center mb-4">
        <Icon size={28} className="text-[#0091AD]" />
      </div>
      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        {achievement.number}
      </div>
      <div className="text-sm text-gray-600 font-medium">
        {achievement.label}
      </div>
    </motion.div>
  );
};

interface MissionVisionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const MissionVisionCard: React.FC<MissionVisionCardProps> = ({ 
  icon: Icon, 
  title, 
  description 
}) => (
  <div className="bg-gradient-to-br from-white to-[#f8fdff] rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full">
    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#e6f7fb] to-[#d1f2f7] flex items-center justify-center mb-4">
      <Icon size={24} className="text-[#0091AD]" />
    </div>
    <h4 className="text-xl font-bold text-gray-900 mb-3">{title}</h4>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </div>
);

// ============================================================================
// BACKGROUND ELEMENTS
// ============================================================================

const BackgroundElements: React.FC = () => (
  <>
    <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8fdff] to-white" />
    
    <motion.div
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 6, repeat: Infinity }}
      className="absolute top-20 left-10 w-40 h-40 rounded-full opacity-5 blur-3xl"
      style={{ background: BRAND_COLORS.gradient }}
    />
  </>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const About: React.FC = () => {
  return (
    <section id="about" className="relative min-h-[60vh] md:min-h-[75vh] overflow-hidden py-12">
      <BackgroundElements />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Header */}
        <motion.div {...ANIMATION_CONFIG.fadeUp} className="mb-16">
          <SectionHeader
            pretitle="Trusted Since 2020"
            title={
              <>
                More Than Just A Store
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0091AD] to-[#00b8d4]">
                  Your Wellness Partner
                </span>
              </>
            }
            subtitle="MAM's Enterprise is your trusted source for premium hygiene products, combining quality, affordability, and exceptional service since our founding."
            centered
          />
        </motion.div>

        {/* Mission & Vision Section - NEW POSITION */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-1 bg-gradient-to-r from-[#0091AD] to-[#00b8d4]" />
              <span className="text-sm font-semibold uppercase tracking-wider text-[#0091AD]">
                Our Purpose
              </span>
              <div className="w-10 h-1 bg-gradient-to-r from-[#0091AD] to-[#00b8d4]" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Driven by Clear Goals & Vision
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <MissionVisionCard
              icon={Target}
              title="Our Mission"
              description="To improve everyday hygiene and comfort by making trusted diapers and tissue brands easily accessible and affordable."
            />
            
            <MissionVisionCard
              icon={Eye}
              title="Our Vision"
              description="To become Kenya's most trusted hygiene products provider, transforming lives through quality and accessibility."
            />
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column - Our Story */}
          <motion.div {...ANIMATION_CONFIG.fadeLeft} className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-1 bg-gradient-to-r from-[#0091AD] to-[#00b8d4]" />
                <span className="text-sm font-semibold uppercase tracking-wider text-[#0091AD]">
                  Our Journey
                </span>
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Building Trust Through Quality & Service
              </h3>
              
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  Founded in 2020 in DCI Juja,{' '}
                  <span className="font-semibold text-gray-900">MAM&apos;s Enterprise</span>{' '}
                  began with a simple mission: to provide families with access to premium 
                  hygiene products at affordable prices.
                </p>
                
                <div className="bg-gradient-to-r from-[#f8fdff] to-transparent p-6 rounded-xl border-l-4 border-[#0091AD]">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-[#0091AD] mt-1 flex-shrink-0" />
                    <p className="text-gray-600">
                      We specialize in{' '}
                      <span className="font-semibold text-gray-900">
                        baby diapers, adult diapers, and tissue products
                      </span>
                      , serving households, institutions, and bulk buyers across Kenya 
                      with reliable solutions.
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 leading-relaxed">
                  What started as a small retail operation has grown into a trusted 
                  enterprise, known for our commitment to quality, customer satisfaction, 
                  and community impact.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Our Values */}
          <motion.div {...ANIMATION_CONFIG.fadeRight} className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-10 h-1 bg-gradient-to-r from-[#0091AD] to-[#00b8d4]" />
                <span className="text-sm font-semibold uppercase tracking-wider text-[#0091AD]">
                  Our Values
                </span>
              </div>
              
              <div className="space-y-4">
                {VALUES.map((value, index) => (
                  <IconCard
                    key={index}
                    icon={value.icon}
                    title={value.title}
                    description={value.description}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};