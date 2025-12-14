'use client'

import { useEffect } from 'react'
import { useAuth } from '../../../components/providers'
import { CourseCreator } from '../../../components/course-creator'
import { useRouter } from 'next/navigation'

export default function CreateCoursePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Create New Course</h1>
            <p className="text-xl text-muted-foreground">
              Transform YouTube content into structured learning experiences
            </p>
          </div>
          
          <CourseCreator />
        </div>
      </div>
    </div>
  )
}