'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/providers'
import { isValidYouTubeUrl } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Youtube, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export function CourseCreator() {
  const { user } = useAuth()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!url.trim()) {
      setError('Please enter a YouTube URL')
      return
    }

    if (!isValidYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/courses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          userId: user?.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create course')
      }

      setSuccess(true)
      setUrl('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Youtube className="mr-2 h-6 w-6 text-red-500" />
          Create Course from YouTube
        </CardTitle>
        <CardDescription>
          Transform any YouTube video or playlist into a structured learning course with AI-powered features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="youtube-url" className="block text-sm font-medium mb-2">
              YouTube URL
            </label>
            <input
              id="youtube-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/playlist?list=..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              disabled={loading}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-green-500"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Course created successfully!</span>
            </motion.div>
          )}

          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Course will be automatically added to the public catalog</li>
              <li>• AI will generate summaries and study materials</li>
              <li>• Interactive tests will be created based on content</li>
              <li>• You can earn points and certificates upon completion</li>
            </ul>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-600 mb-2">Rate Limits</h3>
            <p className="text-sm text-yellow-700">
              You can create 1 course per 24 hours to ensure quality and prevent spam.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !url.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Course...
              </>
            ) : (
              'Create Course'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}