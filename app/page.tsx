import Image from "next/image";
import LeadCaptureForm from "./components/LeadCaptureForm";
import ConsultantProfile from "./components/ConsultantProfile";
import RecommendedProperties from "./components/RecommendedProperties";

export default function Home() {
  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
              <span className="font-bold text-lg text-gray-900">PropertyHub</span>
            </div>
            <div className="hidden md:flex gap-8">
              <a href="#how" className="text-gray-600 hover:text-gray-900">How It Works</a>
              <a href="#why" className="text-gray-600 hover:text-gray-900">Why Us</a>
              <a href="#consultants" className="text-gray-600 hover:text-gray-900">Consultants</a>
              <a href="#recommended" className="text-gray-600 hover:text-gray-900">Properties</a>
            </div>
            <div className="flex gap-3">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium">
                Dashboards
              </a>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
                Free Consultation
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 md:py-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  Expert-Guided Property Search
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Find Your Perfect Home With Expert Guidance
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Stop browsing endless listings. Get matched with curated properties by our experienced consultants who understand your needs, budget, and dreams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg transition">
                  Start Free Consultation
                </button>
                <button className="border-2 border-gray-300 text-gray-900 px-8 py-4 rounded-lg hover:border-gray-400 font-semibold text-lg transition">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="relative h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-xl flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block">
                  <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <p className="text-gray-500 mt-4">Hero Image</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900">5000+</p>
              <p className="text-gray-600 mt-2">Homes Matched</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">250+</p>
              <p className="text-gray-600 mt-2">Expert Consultants</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">98%</p>
              <p className="text-gray-600 mt-2">Client Satisfaction</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">15yrs</p>
              <p className="text-gray-600 mt-2">Industry Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Our Expert Process Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've simplified the home-buying journey into 3 easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4 mb-3">Tell Us Your Needs</h3>
              <p className="text-gray-600 leading-relaxed">
                Answer a few simple questions about your budget, location, size, and preferences. Our consultants analyze your requirements thoroughly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4 mb-3">Get Curated Matches</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive hand-picked properties that perfectly match your criteria. No endless scrolling through irrelevant listings—only quality options.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4 mb-3">Expert Support Throughout</h3>
              <p className="text-gray-600 leading-relaxed">
                Our consultants guide you through negotiations, inspections, and documentation. We're with you every step until you get the keys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why" className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Homebuyers Trust Us
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Verified & Transparent Properties</h3>
                    <p className="text-gray-600">Every property is verified by our team. No hidden issues, no surprises. Full transparency from day one.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Expert Consultants</h3>
                    <p className="text-gray-600">Our consultants have 10+ years of experience in real estate. They negotiate better deals and protect your interests.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Personalized Service</h3>
                    <p className="text-gray-600">One dedicated consultant understands your unique needs and stays with you throughout the entire journey.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Complete Support</h3>
                    <p className="text-gray-600">From site visits to legal documentation, inspections to final handover—we handle everything for you.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-96 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-32 h-32 text-blue-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section id="properties" className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recently Matched Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These are recent matches for our clients. See how curated our selection is.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="h-56 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">$45L</p>
                      <p className="text-gray-500">3 BHK, Andheri</p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Great Deal</span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600 mb-4">
                    <span>1500 sqft</span>
                    <span>•</span>
                    <span>5-yr old</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    "Perfect for growing families. Strong community, great schools nearby." - Your Consultant
                  </p>
                  <button className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 font-medium">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Want to see properties matched specifically for your needs?
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold">
              Get Your Personalized List
            </button>
          </div>
        </div>
      </section>

      {/* Lead Capture Form */}
      <LeadCaptureForm />

      {/* Consultant Profile Section */}
      <ConsultantProfile />

      {/* Recommended Properties */}
      <RecommendedProperties />

      {/* Testimonials */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Homebuyers
            </h2>
            <p className="text-xl text-gray-600">Real stories from real clients</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Rajesh Kumar",
                role: "First-time Buyer",
                text: "PropertyHub saved me months of searching. My consultant found the perfect home within my budget in just 2 weeks. Amazing service!"
              },
              {
                name: "Priya Sharma",
                role: "Family Relocation",
                text: "We were overwhelmed with options until we met our consultant. She understood our needs perfectly and negotiated a 5% better price for us."
              },
              {
                name: "Arun Patel",
                role: "Investment Buyer",
                text: "The transparency and expertise are unmatched. My consultant guided me through legal checks and documents. Best decision ever."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation with our experts today. No commitments, no pressure—just honest advice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 font-semibold text-lg transition">
              Book Free Consultation
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 font-semibold text-lg transition">
              Call us: +91 80008 12345
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                <span className="font-bold text-white">PropertyHub</span>
              </div>
              <p className="text-sm">Expert-guided home buying for everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how" className="hover:text-white">How It Works</a></li>
                <li><a href="#why" className="hover:text-white">Why Us</a></li>
                <li><a href="#properties" className="hover:text-white">Properties</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="tel:+918000812345" className="hover:text-white">+91 8000 812 345</a></li>
                <li><a href="mailto:hello@propertyhub.com" className="hover:text-white">hello@propertyhub.com</a></li>
                <li>Mumbai, India</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 PropertyHub. All rights reserved. Trusted by thousands of homebuyers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
