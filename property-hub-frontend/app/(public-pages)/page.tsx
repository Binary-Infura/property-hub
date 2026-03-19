"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/app/components/Navbar";
import LoanCalculator from "@/app/components/LoanCalculator";
import DynamicReviews from "@/app/components/DynamicReviews";
import { motion } from "framer-motion";

const Building3D = dynamic(() => import("@/app/components/Building3D"), { ssr: false });
const InteractiveIcon3D = dynamic(() => import("@/app/components/InteractiveIcon3D"), { ssr: false });
const FloatingBackground = dynamic(() => import("@/app/components/FloatingBackground"), { ssr: false });
const MouseGlow = dynamic(() => import("@/app/components/MouseGlow"), { ssr: false });

const fadeInUp = {
  initial: { opacity: 0, y: 15 }, // Reduced distance
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10%" }, // Trigger slightly earlier
  transition: { duration: 0.5, ease: "easeOut" } // Faster, smoother
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  return (
    <div className="bg-white relative min-h-screen overflow-x-hidden">
      <FloatingBackground />
      <MouseGlow />
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Full-width 3D Background */}
        <div className="absolute inset-0 z-0">
          <Building3D />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-block mb-4 pointer-events-auto">
              <span className="bg-blue-600/10 backdrop-blur-md text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200 shadow-sm animate-pulse">
                Expert-Guided Property Search
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 leading-[1.05] mb-6 tracking-tight">
              Find Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Perfect Home</span>
            </h1>
            <p className="text-xl text-gray-700 mb-10 leading-relaxed max-w-xl font-light text-balance">
              Stop browsing endless listings. Get matched with curated properties by our experienced consultants who understand your needs, budget, and dreams.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 pointer-events-auto">
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/consultation" 
                className="bg-blue-600 text-white px-10 py-5 rounded-2xl hover:bg-blue-700 font-bold text-lg transition-all shadow-xl shadow-blue-200 text-center"
              >
                Start Free Consultation
              </motion.a>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-900 px-10 py-5 rounded-2xl hover:border-blue-300 font-bold text-lg transition-all shadow-lg"
              >
                Watch Demo
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center p-1">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-gray-400 rounded-full" 
            />
          </div>
        </motion.div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white/50 backdrop-blur-sm border-y border-gray-100 py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center"
          >
            {[
              { val: "5000+", label: "Homes Matched" },
              { val: "250+", label: "Expert Consultants" },
              { val: "98%", label: "Client Satisfaction" },
              { val: "15yrs", label: "Industry Experience" }
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <p className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-2">{stat.val}</p>
                <p className="text-gray-500 font-medium tracking-widest text-xs uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 md:py-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <motion.h2 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-8"
            >
              How Our Expert Process Works
            </motion.h2>
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-8"
            />
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-12"
          >
            {[
              { title: "Tell Us Your Needs", desc: "Answer a few simple questions about your budget, location, size, and preferences. Our consultants analyze your requirements thoroughly." },
              { title: "Get Curated Matches", desc: "Receive hand-picked properties that perfectly match your criteria. No endless scrolling through irrelevant listings." },
              { title: "Expert Support", desc: "Our consultants guide you through negotiations, inspections, and documentation. We're with you every step until you get the keys." }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                whileHover={{ y: -15, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-xl p-12 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 group transition-all"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mb-10 shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
                  0{i + 1}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-5">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why" className="py-24 md:py-40 bg-gray-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-10 leading-tight">
                Why Homebuyers <br />
                <span className="text-blue-600 italic">Trust PropertyHub</span>
              </h2>
              <div className="grid gap-8">
                {[
                  { title: "Verified & Transparent", desc: "Every property is verified by our team. No hidden issues, no surprises." },
                  { title: "Expert Consultants", desc: "Our team has 10+ years of experience in real estate negotiations." },
                  { title: "Personalized Service", desc: "One dedicated consultant understands your unique lifestyle needs." },
                  { title: "End-to-End Support", desc: "From site visits to legal documentation, we handle everything." }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 group"
                  >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 text-blue-600 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{item.title}</h4>
                      <p className="text-gray-600 font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="relative h-[600px] w-full bg-white rounded-[3rem] shadow-2xl flex items-center justify-center overflow-hidden border border-gray-100"
            >
              <InteractiveIcon3D />
              <div className="absolute top-10 right-10 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl" />
              <div className="absolute bottom-10 left-10 w-40 h-40 bg-indigo-100/50 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partner With Us */}
      <section id="partner" className="py-32 md:py-48 bg-gray-900 relative overflow-hidden">
        {/* Native CSS Grid Pattern instead of external image */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-extrabold mb-10 tracking-tight"
          >
            Partner With <span className="text-blue-400">Us</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 md:max-w-3xl mx-auto mb-16 leading-relaxed font-light opacity-80"
          >
            Join Mumbai's fastest-growing real estate network. We bridge the gap between quality properties and happy homeowners.
          </motion.p>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/partners" 
            className="inline-block bg-white text-gray-900 px-14 py-6 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all"
          >
            Explore Opportunities
          </motion.a>
        </div>
      </section>

      {/* Interactive Sections */}
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="space-y-24 py-24"
      >
        <LoanCalculator />
        <DynamicReviews />
      </motion.div>

      {/* Final CTA */}
      <section className="py-32 md:py-48 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-900" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-bold text-white mb-10"
          >
            Your Dream Home <br /> Awaits.
          </motion.h2>
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/consultation" 
              className="bg-white text-blue-600 px-12 py-6 rounded-2xl font-bold text-xl transition shadow-2xl shadow-black/10"
            >
              Book Free Consultation
            </motion.a>
            <motion.button 
              whileHover={{ x: 10 }}
              className="text-white font-bold text-xl flex items-center gap-4 group"
            >
              +91 80008 12345 
              <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </motion.button>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer id="contact" className="bg-white border-t border-gray-100 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-16 mb-24">
            <div className="col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl shadow-xl shadow-blue-100" />
                <span className="font-black text-3xl text-gray-900 tracking-tighter uppercase">PropertyHub</span>
              </div>
              <p className="text-gray-500 text-lg leading-relaxed font-light max-w-sm">
                Redefining the real estate experience with expert intelligence and 3D visualization.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-gray-900 mb-8 uppercase tracking-[0.2em] text-[10px]">Navigate</h5>
              <ul className="space-y-4 text-gray-500 font-light">
                <li><a href="#how" className="hover:text-blue-600 transition-colors">Process</a></li>
                <li><a href="#why" className="hover:text-blue-600 transition-colors">Philosophy</a></li>
                <li><a href="#properties" className="hover:text-blue-600 transition-colors">Listings</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-gray-900 mb-8 uppercase tracking-[0.2em] text-[10px]">Reach Out</h5>
              <ul className="space-y-4 text-gray-500 font-light">
                <li><a href="tel:+918000812345" className="hover:text-blue-600 transition-colors">+91 8000 812 345</a></li>
                <li><a href="mailto:hello@propertyhub.com" className="hover:text-blue-600 transition-colors">hello@propertyhub.com</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-gray-900 mb-8 uppercase tracking-[0.2em] text-[10px]">Legal</h5>
              <ul className="space-y-4 text-gray-500 font-light">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-16 flex flex-col md:flex-row justify-between items-center gap-8 text-gray-400 text-sm font-light">
            <p>&copy; 2024 PropertyHub Global. All rights reserved.</p>
            <div className="flex gap-8">
              <span className="hover:text-gray-900 cursor-pointer transition-colors">Instagram</span>
              <span className="hover:text-gray-900 cursor-pointer transition-colors">LinkedIn</span>
              <span className="hover:text-gray-900 cursor-pointer transition-colors">Twitter</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
