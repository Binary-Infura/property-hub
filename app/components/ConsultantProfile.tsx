export default function ConsultantProfile() {
  const consultants = [
    {
      id: 1,
      name: "Priya Desai",
      experience: "12 years",
      speciality: "Residential Properties",
      image: "PD",
      background: "from-blue-400 to-blue-600",
    },
    {
      id: 2,
      name: "Amit Verma",
      experience: "10 years",
      speciality: "Investment & Commercial",
      image: "AV",
      background: "from-emerald-400 to-emerald-600",
    },
    {
      id: 3,
      name: "Neha Patel",
      experience: "8 years",
      speciality: "Budget & First-time Buyers",
      image: "NP",
      background: "from-purple-400 to-purple-600",
    },
  ];

  return (
    <section id="consultants" className="py-20 md:py-32 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              Your Dedicated Advisor
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            A Personal Consultant Just For You
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every PropertyHub client gets a dedicated consultant who knows your needs, understands your budget, and works tirelessly to find your perfect property
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {consultants.map((consultant) => (
            <div
              key={consultant.id}
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition duration-300"
            >
              {/* Photo/Avatar */}
              <div className={`h-64 bg-gradient-to-br ${consultant.background} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-blue-600">{consultant.image}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {consultant.name}
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-blue-600 font-medium text-sm">{consultant.experience} experience</span>
                  <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {consultant.speciality}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <p className="text-gray-600 italic font-medium text-center text-lg">
                    "Your personal property advisor"
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-gray-600 text-sm">Personalized property matches</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-gray-600 text-sm">Expert negotiation & guidance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-gray-600 text-sm">24/7 support & follow-up</span>
                  </li>
                </ul>

                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition">
                  Connect with {consultant.name.split(' ')[0]}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-blue-50 border border-blue-200 rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              How Our Consultant-Led Process Works
            </h3>
            <p className="text-gray-700 mb-8 leading-relaxed">
              When you sign up, we match you with the perfect consultant based on your needs, budget, and property type. They'll personally guide you through every step of your home-buying journey—from initial consultation to final possession. No handoffs, no delays, just dedicated expertise.
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold transition">
              Get Your Personal Consultant Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
