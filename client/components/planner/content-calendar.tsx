"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { Plan } from "@/types/plan"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit, ArrowLeft } from "lucide-react"
import EditPlanModal from "@/components/planner/edit-plan-modal"
import PostCard from "@/components/planner/post-card"
import CreatePostModal from "./create-post-model"

type ContentCalendarProps = {
  plan: Plan
  onEditPlan: (planId: string, instructions: string) => void
}

export default function ContentCalendar({ plan, onEditPlan }: ContentCalendarProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  // console.log(plan)
  // Group posts by week
  const postsByWeek: { [key: string]: typeof plan.posts } = {}

  plan.posts.forEach((post) => {
    const date = new Date(post.date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)

    const weekKey = weekStart.toISOString().split("T")[0]

    if (!postsByWeek[weekKey]) {
      postsByWeek[weekKey] = []
    }

    postsByWeek[weekKey].push(post)
  })

  const handleEditPlan = (instructions: string) => {
    onEditPlan(plan.id, instructions)
    setIsEditModalOpen(false)
  }

 

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Content Plan
                </h2>
                <div className="text-muted-foreground mt-1">
                  Platform:{" "}
                  <Badge variant="outline" className="ml-1">
                    {plan.platform}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Content Pillars:</span>
                  {plan.contentPillars.map((pillar) => (
                    <Badge key={pillar} variant="secondary">
                      {pillar}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Frequency: {plan.frequency} posts per week • Tone: {plan.tone}
                </p>
                {plan.goal && (
                  <p className="text-sm mt-2">
                    <span className="font-medium">Goal:</span> {plan.goal}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {/* <Button variant="outline" onClick={() => window.location.reload()} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> New Plan
                </Button> */}
                {/* <Button onClick={() => setIsEditModalOpen(true)} className="gap-1">
                  <Edit className="h-4 w-4" /> Edit Plan
                </Button> */}
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-1">
  <Edit className="h-4 w-4" /> Create Post
</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-8">
        {Object.entries(postsByWeek).map(([weekKey, posts], weekIndex) => {
          const weekStart = new Date(weekKey)
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)

          const formatDate = (date: Date) => {
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }

          return (
            <motion.div
              key={weekKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: weekIndex * 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-medium">
                Week of {formatDate(weekStart)} - {formatDate(weekEnd)}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post, postIndex) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: postIndex * 0.05 + weekIndex * 0.1 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      <EditPlanModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditPlan} />
      <CreatePostModal
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
  onSubmit={() => {
    setIsCreateModalOpen(false)
    window.location.reload()
  }}
  planId={plan.id}
/>
    </div>
  )
}