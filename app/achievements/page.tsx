'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../components/providers'
import { createSupabaseClient } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { motion } from 'framer-motion'
import { LoadingSpinner } from '../../components/loading'
import { Trophy, Star, Award, Target, Zap, BookOpen, Clock, Flame } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  points: number
  unlocked_at: string | null
  category: string
}

interface UserStats {
  totalPoints: number
  currentStreak: number
  longestStreak: number
  coursesCompleted: number
  totalWatchTime: number
}

export default function AchievementsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    coursesCompleted: 0,
    totalWatchTime: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadAchievements()
      loadStats()
    }
  }, [user])

  const loadAchievements = async () => {
    try {
      if (!supabase) return

      // Get user achievements
      const { data: userAchievements, error } = await supabase
        .from('user_achievements')
        .select(`
          id,
          unlocked_at,
          achievements (
            id,
            title,
            description,
            icon,
            points,
            category
          )
        `)
        .eq('user_id', user!.id)

      if (error) throw error

      // Transform data
      const achievementsData: Achievement[] = userAchievements?.map(ua => ({
        ...ua.achievements,
        unlocked_at: ua.unlocked_at
      })) || []

      setAchievements(achievementsData)
    } catch (error) {
      console.error('Error loading achievements:', error)
    }
  }

  const loadStats = async () => {
    try {
      if (!supabase) return

      // Get user profile stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points, current_streak, longest_streak')
        .eq('id', user!.id)
        .single()

      // Get course completion stats
      const { data: progressData } = await supabase
        .from('course_progress')
        .select('status')
        .eq('user_id', user!.id)

      const completed = progressData?.filter(p => p.status === 'completed').length || 0

      setStats({
        totalPoints: profile?.total_points || 0,
        currentStreak: profile?.current_streak || 0,
        longestStreak: profile?.longest_streak || 0,
        coursesCompleted: completed,
        totalWatchTime: 0 // Could be calculated from watch history
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      trophy: <Trophy className="h-6 w-6" />,
      star: <Star className="h-6 w-6" />,
      award: <Award className="h-6 w-6" />,
      target: <Target className="h-6 w-6" />,
      zap: <Zap className="h-6 w-6" />,
      book: <BookOpen className="h-6 w-6" />,
      clock: <Clock className="h-6 w-6" />,
      flame: <Flame className="h-6 w-6" />
    }
    return icons[iconName] || <Award className="h-6 w-6" />
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      learning: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      streak: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      completion: 'bg-green-500/10 text-green-500 border-green-500/20',
      points: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    }
    return colors[category] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <LoadingSpinner size="lg" text="Loading achievements..." />
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
            <h1 className="text-4xl font-bold mb-4">Achievements</h1>
            <p className="text-xl text-muted-foreground">
              Track your learning progress and unlock rewards
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalPoints}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.coursesCompleted}</div>
                <div className="text-sm text-muted-foreground">Courses Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.longestStreak}</div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements Grid */}
          {loading ? (
            <LoadingSpinner size="lg" text="Loading achievements..." />
          ) : achievements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No achievements yet</h3>
              <p className="text-muted-foreground mb-6">
                Start learning to unlock your first achievement!
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`relative overflow-hidden ${achievement.unlocked_at ? 'border-primary/50 bg-primary/5' : 'border-muted'}`}>
                    {achievement.unlocked_at && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Star className="h-3 w-3" />
                        </div>
                      </div>
                    )}

                    <CardHeader className="text-center">
                      <div className={`mx-auto mb-2 p-3 rounded-full ${achievement.unlocked_at ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {getIcon(achievement.icon)}
                      </div>
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <CardDescription>{achievement.description}</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(achievement.category)}`}>
                          {achievement.category}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {achievement.points} pts
                        </span>
                      </div>

                      {achievement.unlocked_at && (
                        <div className="mt-4 text-xs text-muted-foreground text-center">
                          Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                        </div>
                      )}
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