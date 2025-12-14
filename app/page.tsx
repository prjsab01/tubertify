'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../components/providers'
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Users, 
  Zap, 
  Star,
  Play,
  Award,
  Target
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { user, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (!mounted) return null

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Learning",
      description: "Transform YouTube videos into structured courses with AI-generated summaries and study notes."
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Gamified Experience",
      description: "Earn points, maintain streaks, and unlock achievements as you progress through your learning journey."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Certificates",
      description: "Earn verified certificates upon course completion to showcase your new skills and knowledge."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Personalized Tests",
      description: "Take AI-generated MCQ tests to validate your understanding and track your progress."
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Digital Library",
      description: "Access curated books and resources to supplement your video-based learning."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Courses",
      description: "Learn from courses created by the community and share your own knowledge."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-6xl font-bold mb-6">
                <span className="gradient-text">Tubertify</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Transform YouTube videos into structured learning experiences with AI-powered summaries, 
                interactive tests, and verified certificates. Your personalized learning platform awaits.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg" 
                onClick={signInWithGoogle}
                className="text-lg px-8 py-6 h-auto"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Learning with Google
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                <Star className="mr-2 h-5 w-5" />
                Explore Features
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose Tubertify?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of online learning with our comprehensive platform designed for modern learners.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-primary/20">
                  <CardHeader>
                    <div className="text-primary mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-4 gap-8 text-center"
          >
            {[
              { number: "10K+", label: "Active Learners" },
              { number: "500+", label: "Courses Created" },
              { number: "50K+", label: "Videos Processed" },
              { number: "95%", label: "Completion Rate" }
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of learners who are already using Tubertify to accelerate their knowledge and skills.
            </p>
            <Button 
              size="lg" 
              onClick={signInWithGoogle}
              className="text-lg px-8 py-6 h-auto"
            >
              <Zap className="mr-2 h-5 w-5" />
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Tubertify</h3>
              <p className="text-muted-foreground">
                AI-powered learning platform for the modern world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>About</li>
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>GitHub</li>
                <li>Support</li>
                <li>Community</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; 2024 Tubertify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}