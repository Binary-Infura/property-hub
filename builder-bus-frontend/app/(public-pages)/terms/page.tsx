"use client";

import React from "react";
import Navbar from "@/app/components/Navbar";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const FloatingBackground = dynamic(() => import("@/app/components/Navbar").then(() => import("@/app/components/FloatingBackground")), { ssr: false });
const MouseGlow = dynamic(() => import("@/app/components/Navbar").then(() => import("@/app/components/MouseGlow")), { ssr: false });

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function TermsPage() {
  const lastUpdated = "April 2, 2026";

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing or using the BuilderBus platform ("Platform"), including our website and mobile applications, you ("User", "you", or "your") agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use our services. These Terms constitute a legally binding agreement between you and BuilderBus Global.`
    },
    {
      title: "2. Description of Service",
      content: `BuilderBus provides an online platform that connects property seekers with expert real estate consultants, developers, and property owners. We offer property listings, 3D visualization tools, consultation services, and a network of partners to facilitate home buying and real estate transactions. BuilderBus is a facilitator and does not own the properties listed unless explicitly stated.`
    },
    {
      title: "3. User Eligibility",
      content: `You must be at least 18 years of age and possess the legal authority to enter into this agreement to use our Platform. By using reach-out services, you represent and warrant that all registration information you submit is truthful and accurate.`
    },
    {
      title: "4. User Accounts",
      content: `To access certain features, you may be required to register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.`
    },
    {
      title: "5. Property Listings & Information",
      content: `While we strive for accuracy, BuilderBus does not guarantee the completeness or accuracy of property listings, floor plans, 3D models, or pricing information. Users are encouraged to conduct their own due diligence and site visits before making any financial commitments. All property information is subject to change without notice.`
    },
    {
      title: "6. Professional Consultation",
      content: `Consultants on our platform are independent experts or representatives of our network. Their advice is based on their professional judgment and current market trends. BuilderBus is not liable for any decisions made based on such consultations, although we do vet our partners for quality and reliability.`
    },
    {
      title: "7. Intellectual Property",
      content: `All content on this Platform, including logo, text, graphics, 3D models, code, and software, is the property of BuilderBus or its licensors and is protected by copyright and intellectual property laws. You may not reproduce, distribute, or modify any part of the Platform without prior written consent.`
    },
    {
      title: "8. Prohibited Activities",
      content: `Users are prohibited from:
      - Posting false, misleading, or fraudulent information.
      - Scraping or using automated systems to extract data from the Platform.
      - Interfering with the Platform's security or functionality.
      - Harassing other users or consultants.
      - Using the Platform for any illegal purposes.`
    },
    {
      title: "9. Limitation of Liability",
      content: `To the maximum extent permitted by law, BuilderBus shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the Platform. We do not guarantee that the Platform will be error-free or uninterrupted.`
    },
    {
      title: "10. Indemnification",
      content: `You agree to indemnify and hold BuilderBus and its affiliates harmless from any claims, losses, or damages, including legal fees, resulting from your violation of these Terms or your use of the Platform.`
    },
    {
      title: "11. Governing Law",
      content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.`
    },
    {
      title: "12. Modifications to Terms",
      content: `BuilderBus reserves the right to modify these Terms at any time. Changes will be effective immediately upon posting on the Platform. Your continued use of the Platform following any changes constitutes your acceptance of the new Terms.`
    },
    {
      title: "13. Contact Us",
      content: `If you have any questions about these Terms, please contact us at legal@propertyhub.com or +91 8000 812 345.`
    }
  ];

  return (
    <div className="bg-white relative min-h-screen">
      <FloatingBackground />
      <MouseGlow />
      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
            <p className="text-gray-500 text-lg">Last Updated: {lastUpdated}</p>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mt-8" />
          </motion.div>

          <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-gray-100/50 space-y-12">
            {sections.map((section, index) => (
              <motion.section 
                key={index}
                {...fadeInUp}
                className="group"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {section.title}
                </h2>
                <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-line font-light">
                  {section.content}
                </div>
              </motion.section>
            ))}
          </div>

          <motion.div 
            {...fadeInUp}
            className="mt-16 p-8 bg-blue-50 rounded-3xl border border-blue-100 text-center"
          >
            <p className="text-blue-800 font-medium">
              Need more clarification? Our legal team is here to help.
            </p>
            <a 
              href="mailto:legal@propertyhub.com" 
              className="inline-block mt-4 text-blue-600 font-bold hover:underline"
            >
              Email Legal Team →
            </a>
          </motion.div>
        </div>
      </main>

      {/* Simple Footer for Policy Pages */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            &copy; 2024 BuilderBus Global. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
