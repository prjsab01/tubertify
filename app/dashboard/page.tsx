'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers'
import { createSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Clock, 
  Star, 
  TrendingUp,
  Play,
  Award,
  Calendar,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalPoints: number
  currentStreak: number
  coursesCompleted: number
  coursesInProgress: number
  certificatesEarned: number
  totalWatchTime: number
}

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalPoints: 0,
    currentStreak: 0,
    coursesCompleted: 0,
    coursesInProgress: 0,
    certificatesEarned: 0,
    totalWatchTime: 0
  })
  const [recentCourses, setRecentCourses] = useState([])
  const [featuredCourses, setFeaturedCourses] = useState([])
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && profile) {
      loadDashboardData()
    }
  }, [user, profile])

  const loadDashboardData = async () => {
    try {
      // Load user stats
      const { data: progressData } = await supabase
        .from('course_progress')
        .select('status')
        .eq('user_id', user!.id)

      const { data: certificatesData } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', user!.id)

      const completed = progressData?.filter(p => p.status === 'completed').length || 0
      const inProgress = progressData?.filter(p => p.status === 'in_progress').length || 0

      setStats({
        totalPoints: profile.total_points || 0,
        currentStreak: profile.current_streak || 0,
        coursesCompleted: completed,
        coursesInProgress: inProgress,
        certificatesEarned: certificatesData?.length || 0,
        totalWatchTime: 0 // Calculate from video progress
      })

      // Load recent courses
      const { data: recentData } = await supabase
        .from('course_progress')
        .select(`
          *,
          courses (
            id,
            title,
            thumbnail_url,
            tags
          )
        `)
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false })
        .limit(3)

      setRecentCourses(recentData || [])

      // Load featured courses
      const { data: featuredData } = await supabase
        .from('courses')
        .select('*')
        .eq('is_featured', true)
        .limit(4)

      setFeaturedCourses(featuredData || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !profile) return null

  const statCards = [
    {
      title: "Total Points",
      value: stats.totalPoints.toLocaleString(),
      icon: <Trophy className="h-6 w-6" />,
      color: "text-yellow-500"
    },
    {
      title: "Current Streak",
      value: `${stats.currentStreak} days`,
      icon: <Zap className="h-6 w-6" />,
      color: "text-orange-500"
    },
    {
      title: "Completed Courses",
      value: stats.coursesCompleted,
      icon: <BookOpen className="h-6 w-6" />,
      color: "text-green-500"
    },
    {
      title: "In Progress",
      value: stats.coursesInProgress,
      icon: <Clock className="h-6 w-6" />,
      color: "text-blue-500"
    },
    {
      title: "Certificates",
      value: stats.certificatesEarned,
      icon: <Award className="h-6 w-6" />,
      color: "text-purple-500"
    },
    {
      title: "Watch Time",
      value: `${Math.floor(stats.totalWatchTime / 60)}h`,
      icon: <Play className="h-6 w-6" />,
      color: "text-red-500"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {profile.display_name || profile.full_name}!</h1>
              <p className="text-muted-foreground mt-1">Continue your learning journey</p>
            </div>
            <Button onClick={() => router.push('/course/create')}>
              <Target className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className={stat.color}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-lg font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  Continue Learning
                </CardTitle>
                <CardDescription>
                  Pick up where you left off
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentCourses.length > 0 ? (
                  <div className="space-y-4">
                    {recentCourses.map((progress: any) => (
                      <div key={progress.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{progress.courses.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Progress: {Math.round(progress.progress_percentage)}%
                          </p>
                          <div className="w-full bg-muted rounded-full h-2 mt-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${progress.progress_percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <Button size="sm">Continue</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No courses in progress</p>
                    <Button className="mt-4" onClick={() => router.push('/catalog')}>
                      Browse Courses
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Library
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Star className="mr-2 h-4 w-4" />
                  View Bookmarks
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Award className="mr-2 h-4 w-4" />
                  My Certificates
                </Button>
              </CardContent>
            </Card>

            {/* Streak Calendar */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Learning Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stats.currentStreak}
                  </div>
                  <p className="text-sm text-muted-foreground">Days in a row</p>
                  <div className="mt-4 grid grid-cols-7 gap-1">
                    {Array.from({ length: 14 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-sm ${
                          i < stats.currentStreak ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Courses */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Featured Courses
            </CardTitle>
            <CardDescription>
              Handpicked courses for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredCourses.map((course: any) => (
                <div key={course.id} className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer">
                  <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Play className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{course.title}</h3>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {course.tags?.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button size="sm" className="w-full">Start Learning</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}