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

export default function PrivacyPage() {
  const lastUpdated = "April 2, 2026";

  const sections = [
    {
      title: "1. Information We Collect",
      content: `We collect information to provide better services to our users. The types of information we collect include:
      - **Personal Information:** Name, email address, phone number, and mailing address provided during registration or consultation requests.
      - **Usage Data:** Details of your visits to our Platform, including traffic data, location data, logs, and other communication data.
      - **Device Information:** IP address, browser type, and operating system.`
    },
    {
      title: "2. How We Use Your Information",
      content: `BuilderBus uses the collected data for various purposes:
      - To provide and maintain our Platform.
      - To notify you about changes to our service.
      - To allow you to participate in interactive features.
      - To provide expert consultation and customer support.
      - To gather analysis or valuable information so that we can improve our Platform.
      - To monitor the usage of our Platform.
      - To detect, prevent, and address technical issues.`
    },
    {
      title: "3. Data Sharing and Disclosure",
      content: `We do not sell your personal data. We may share your information with:
      - **Expert Consultants:** To facilitate the property search and consultation process you requested.
      - **Service Providers:** Third-party companies that perform services on our behalf (e.g., hosting, analytics).
      - **Legal Authorities:** If required by law or in response to valid requests by public authorities.`
    },
    {
      title: "4. Cookies and Tracking Technologies",
      content: `We use cookies and similar tracking technologies to track the activity on our Platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.`
    },
    {
      title: "5. Data Security",
      content: `The security of your data is important to us. We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, remember that no method of transmission over the Internet is 100% secure.`
    },
    {
      title: "6. Your Data Protection Rights",
      content: `You have certain data protection rights, including:
      - The right to access, update, or delete the information we have on you.
      - The right of rectification.
      - The right to object to processing.
      - The right of restriction.
      - The right to data portability.
      - The right to withdraw consent.`
    },
    {
      title: "7. Third-Party Links",
      content: `Our Platform may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.`
    },
    {
      title: "8. Children's Privacy",
      content: `Our services are not intended for use by children under the age of 18. We do not knowingly collect personally identifiable information from anyone under the age of 18.`
    },
    {
      title: "9. Changes to This Privacy Policy",
      content: `We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.`
    },
    {
      title: "10. Contact Us",
      content: `If you have any questions about this Privacy Policy, please contact our Data Protection Officer at privacy@propertyhub.com or visit our office at BuilderBus HQ, Mumbai.`
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
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-500 text-lg">Last Updated: {lastUpdated}</p>
            <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full mt-8" />
          </motion.div>

          <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-gray-100/50 space-y-12">
            {sections.map((section, index) => (
              <motion.section 
                key={index}
                {...fadeInUp}
                className="group"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
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
            className="mt-16 p-8 bg-indigo-50 rounded-3xl border border-indigo-100 text-center"
          >
            <p className="text-indigo-800 font-medium">
              Your privacy is our priority. For any data-related queries, reach out to our privacy team.
            </p>
            <a 
              href="mailto:privacy@propertyhub.com" 
              className="inline-block mt-4 text-indigo-600 font-bold hover:underline"
            >
              Contact Privacy Officer →
            </a>
          </motion.div>
        </div>
      </main>

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
