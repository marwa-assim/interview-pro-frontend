import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme

// Assuming you have these components or will create them
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Brain, 
//   FileText, 
//   CreditCard, 
//   Users, 
//   Star, 
//   CheckCircle,
//   Globe,
//   Mic,
//   Camera,
//   BarChart3
// } from 'lucide-react';

function LandingPage() {
  const { theme, toggleTheme } = useTheme(); // Use the theme hook

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">InterviewPro</h1>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/login" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Sign In</Link></li>
            <li><Link to="/register" className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50">Get Started</Link></li>
            <li>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                Toggle Theme ({theme === 'light' ? 'Dark' : 'Light'})
              </button>
            </li>
          </ul>
        </nav>
      </header>
      {/* Rest of your LandingPage content */}
      <main className="container mx-auto p-8 text-center">
        <h2 className="text-4xl font-extrabold mb-4">AI-Powered Interview Training Platform</h2>
        <p className="text-lg mb-8">Master your interview skills with AI-generated questions, build professional CVs, and create stunning digital business cards. All in English and Arabic.</p>
        <div className="space-x-4">
          <Link to="/register" className="px-6 py-3 rounded-md bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700">Start Free Trial</Link>
          <button className="px-6 py-3 rounded-md border border-blue-600 text-blue-600 text-lg font-semibold hover:bg-blue-50">Watch Demo</button>
        </div>
       

      </main>
      {/* Placeholder for other sections like Features, How It Works, Testimonials, Pricing, CTA, Footer */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Features</h2>
          <p className="text-gray-700 dark:text-gray-300">Detailed features will go here.</p>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">InterviewPro</h3>
              <p className="text-gray-400">
                AI-powered interview training platform helping professionals succeed worldwide.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Mock Interviews</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CV Builder</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Cards</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500">
            &copy; {new Date().getFullYear()} InterviewPro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;


