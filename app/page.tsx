'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { 
  DocumentTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  StarIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BoltIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Quote request:', formData);
    alert('Thank you for your interest! We\'ll contact you within 24 hours.');
  };

  const features = [
    {
      icon: DocumentTextIcon,
      title: 'FBR Compliant Invoicing',
      description: 'Generate invoices that meet all FBR Pakistan requirements automatically'
    },
    {
      icon: ChartBarIcon,
      title: 'Real-time Analytics',
      description: 'Track your business performance with comprehensive dashboards'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Bank-Grade Security',
      description: 'Your data is protected with enterprise-level security measures'
    },
    {
      icon: UserGroupIcon,
      title: 'Multi-User Access',
      description: 'Manage your team with role-based permissions and access control'
    }
  ];

//   const testimonials = [
//     {
//       name: 'Ahmed Khan',
//       company: 'Tech Solutions Ltd',
//       content: 'This platform transformed our invoicing process. FBR compliance is now effortless!',
//       rating: 5
//     },
//     {
//       name: 'Sarah Ahmed',
//       company: 'Retail Plus',
//       content: 'The analytics dashboard gives us insights we never had before. Highly recommended!',
//       rating: 5
//     },
//     {
//       name: 'Muhammad Ali',
//       company: 'Manufacturing Co',
//       content: 'Setup was quick and the support team is excellent. Our invoicing is now 100% digital.',
//       rating: 5
//     }
//   ];

  const stats = [
    { label: 'Happy Customers', value: '500+', icon: UserGroupIcon },
    { label: 'Invoices Processed', value: '50K+', icon: DocumentTextIcon },
    { label: 'FBR Success Rate', value: '99.8%', icon: CheckCircleIcon },
    { label: 'Average Setup Time', value: '2 Hours', icon: ClockIcon }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Welcome back, {user.sellerData?.businessName || 'User'}!
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Ready to manage your invoices and business operations?
            </p>
            <Link
              href="/dashboard"
              className="btn-professional inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-professional"
            >
              Go to Dashboard
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="glass-effect border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">DI</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Digital Invoicing</h1>
                <p className="text-xs text-slate-500 font-medium">Enterprise Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="#features"
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Features
              </Link>
              <Link
                href="#contact"
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Contact
              </Link>
              <Link
                href="/login"
                className="btn-professional bg-slate-700 hover:bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-professional"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 py-20 lg:py-32">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Transform Your
              <span className="text-slate-300 block">Invoicing Game</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-4xl mx-auto leading-relaxed">
              Stop struggling with manual invoicing! Get FBR-compliant, automated invoicing that saves you 
              <span className="text-slate-300 font-semibold"> 10+ hours per week</span> and eliminates errors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="#contact"
                className="btn-professional inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-slate-800 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white shadow-professional-lg transform hover:-translate-y-1"
              >
                Get Free Quote
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="btn-professional inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
              >
                LogIn
              </Link>
            </div>
            <div className="text-slate-200 text-sm">
              <p>✓ No setup fees • ✓ 30-day free trial • ✓ FBR compliance guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <stat.icon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Why Choose Us ?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We don't just provide software – we provide a complete solution that transforms your business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-professional bg-white p-6 rounded-xl shadow-professional border border-slate-200">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <feature.icon className="h-6 w-6 text-slate-700" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it – hear from businesses like yours
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Contact/Quote Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Transform Your Invoicing?
              </h2>
              <p className="text-xl text-slate-200 mb-8">
                Get a personalized quote and see how we can save you time, reduce errors, 
                and ensure FBR compliance. Our experts will contact you within 24 hours.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-slate-200">
                  <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3" />
                  <span>Free consultation and setup</span>
                </div>
                <div className="flex items-center text-slate-200">
                  <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center text-slate-200">
                  <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3" />
                  <span>FBR compliance guaranteed</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-professional-lg border border-slate-200">
              <h3 className="text-2xl font-bold gradient-text mb-6">Get Your Free Quote</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tell us about your invoicing needs</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="How many invoices do you process monthly? Any specific requirements?"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-professional w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-lg shadow-professional"
                >
                  Get My Free Quote
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DI</span>
                </div>
                <h3 className="text-lg font-semibold">Digital Invoicing</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Pakistan's #1 FBR-compliant invoicing platform trusted by 500+ businesses.
              </p>
              <div className="flex space-x-4">
                <PhoneIcon className="h-5 w-5 text-slate-400" />
                <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                <MapPinIcon className="h-5 w-5 text-slate-400" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">Features</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">Pricing</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">Demo</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">Help Center</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">Contact Us</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">Status</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">Training</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">About</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">Blog</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">Careers</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Digital Invoicing. All rights reserved. | FBR Compliant | Made in Pakistan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
