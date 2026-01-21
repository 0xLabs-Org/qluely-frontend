'use client';

import { useEffect, useState } from 'react';
import { Globe, Users, Target, Lightbulb, Shield, Zap, Heart, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <Navigation />
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-6xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Built with passion
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
              Meet the Team
            </h1>

            <p className="lg:text-2xl ms:text-2xl sm:text-sm text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              We're a passionate team of innovators building the future of undetectable AI
              assistance for meetings and workflows.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Trusted by 100+ users</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">100% Privacy Focused</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm">
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Lightning Fast</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-gradient-to-br from-green-200 to-blue-200 rounded-full opacity-25 animate-pulse delay-75"></div>
      </section>

      {/* Mission & Vision Cards */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card
              className={`p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-xl transform transition-all duration-700 hover:scale-105 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Our Mission</h2>
              </div>
              <p className="text-blue-100 text-lg leading-relaxed">
                To democratize AI assistance by creating undetectable, privacy-first tools that
                empower professionals to excel in meetings, interviews, and presentations without
                compromising authenticity.
              </p>
            </Card>

            <Card
              className={`p-8 bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl transform transition-all duration-700 hover:scale-105 delay-100 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-purple-100 text-lg leading-relaxed">
                A world where technology seamlessly enhances human capability, where every
                professional has access to intelligent assistance that respects privacy and
                maintains authenticity.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-12 transition-all duration-700 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Drives Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our core values guide every decision we make and every line of code we write.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Privacy First',
                description:
                  'Your data stays on your device. We never collect, store, or share your meeting content.',
                color: 'from-green-400 to-emerald-500',
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description:
                  'Real-time AI assistance with millisecond response times. No lag, no delays.',
                color: 'from-yellow-400 to-orange-500',
              },
              {
                icon: Users,
                title: 'User-Centric',
                description:
                  'Every feature is designed based on real user feedback and genuine needs.',
                color: 'from-blue-400 to-cyan-500',
              },
              {
                icon: Heart,
                title: 'Authentic',
                description:
                  'Technology that enhances, not replaces, human intelligence and creativity.',
                color: 'from-pink-400 to-rose-500',
              },
              {
                icon: Globe,
                title: 'Accessible',
                description:
                  'Building tools that work for everyone, regardless of technical expertise.',
                color: 'from-purple-400 to-violet-500',
              },
              {
                icon: Star,
                title: 'Excellence',
                description: 'Obsessing over details to deliver the best possible experience.',
                color: 'from-indigo-400 to-blue-500',
              },
            ].map((value, index) => (
              <Card
                key={value.title}
                className={`p-6 bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${value.color} flex items-center justify-center mb-4`}
                >
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <Card
            className={`p-8 sm:p-12 text-gray-800  border-none transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Our Story</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-pink-500 mx-auto mb-6"></div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Qluely was born from a simple observation: in an increasingly digital world,
                professionals needed better tools to excel in virtual meetings and presentations.
                But existing solutions were either detectable, privacy-invasive, or simply didn't
                work well.
              </p>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Our founding team, with backgrounds in AI research, software engineering, and user
                experience design, set out to create something different. We wanted to build AI
                assistance that was truly undetectable, completely private, and genuinely helpful.
              </p>

              <p className="text-gray-700 text-lg leading-relaxed">
                Today, Qluely serves thousands of professionals worldwide from job seekers acing
                interviews to executives delivering flawless presentations. We're just getting
                started on our mission to democratize AI-powered professional assistance.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-10 animate-spin-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-10 animate-spin-slow"></div>
      </div>
      <Footer />
    </div>
  );
}
