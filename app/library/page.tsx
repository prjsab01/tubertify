'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../components/providers'
import { createSupabaseClient } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { motion } from 'framer-motion'
import { LoadingSpinner, CardSkeleton } from '../../components/loading'
import { BookOpen, Play, Clock, Star, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  tags: string[] | null
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  total_modules: number
  created_at: string
  progress?: {
    status: string
    progress_percentage: number
  }
}

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadLibrary()
    }
  }, [user])

  const loadLibrary = async () => {
    try {
      if (!supabase) return

      // Get all courses with user's progress
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          thumbnail_url,
          tags,
          difficulty_level,
          total_modules,
          created_at,
          course_progress!inner(
            status,
            progress_percentage
          )
        `)
        .eq('course_progress.user_id', user!.id)

      if (error) throw error

      setCourses(coursesData || [])
    } catch (error) {
      console.error('Error loading library:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-500'
      case 'intermediate': return 'text-yellow-500'
      case 'advanced': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <LoadingSpinner size="lg" text="Loading your library..." />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-4">My Library</h1>
            <p className="text-xl text-muted-foreground">
              Continue your learning journey with your enrolled courses
            </p>
          </motion.div>

          {/* Courses Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your learning journey by creating your first course from YouTube content.
              </p>
              <Button onClick={() => router.push('/course/create')}>
                Create Your First Course
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-background/80 backdrop-blur ${getDifficultyColor(course.difficulty_level)}`}>
                          {course.difficulty_level}
                        </span>
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                      {course.description && (
                        <CardDescription className="line-clamp-2">
                          {course.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{course.total_modules} modules</span>
                          </div>
                        </div>
                      </div>

                      {course.progress && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{course.progress.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        onClick={() => router.push(`/course/${course.id}`)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {course.progress?.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}