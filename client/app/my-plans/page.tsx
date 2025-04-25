"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Loader2, ExternalLink } from "lucide-react"
import { fetchPlans } from "@/lib/api"
import type { PlanSummary } from "@/types/plan"
import EmptyState from "@/components/empty-state"

export default function MyPlansPage() {
  const [plans, setPlans] = useState<PlanSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { isLoaded, isSignedIn, userId } = useAuth()

  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
      return
    }

    if (isSignedIn && userId) {
      loadPlans()
    }
  }, [isLoaded, isSignedIn, userId, router])

  const loadPlans = async () => {
    try {
      setIsLoading(true)
      const data = await fetchPlans()
      setPlans(data)
    } catch (error) {
      console.error("Failed to load plans:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (!isLoaded || (isLoaded && !isSignedIn)) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">My Content Plans</h1>
            <p className="mt-2 text-muted-foreground">View and manage all your content plans</p>
          </div>
          <Button onClick={() => router.push("/planner")} className="gap-2">
            <Plus className="h-4 w-4" /> Create New Plan
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <EmptyState
            title="No plans yet"
            description="Create your first content plan to get started"
            action={
              <Button onClick={() => router.push("/planner")} className="gap-2">
                <Plus className="h-4 w-4" /> Create New Plan
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col">
                  <CardContent className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className="font-normal">
                        {plan.platform}
                      </Badge>
                      <Badge variant="secondary">{plan.frequency} posts/week</Badge>
                    </div>
                    <div className="mb-4">
                      <h3 className="font-medium text-lg mb-1 line-clamp-1">{plan.contentPillars[0] || "Content Plan"}</h3>
                      <p className="text-sm text-muted-foreground mb-2">Created: {formatDate(plan.createdAt)}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {plan.contentPillars.slice(0, 3).map((pillar) => (
                          <Badge key={pillar} variant="outline" className="bg-primary/10">
                            {pillar}
                          </Badge>
                        ))}
                        {plan.contentPillars.length > 3 && (
                          <Badge variant="outline">+{plan.contentPillars.length - 3} more</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{plan.postCount} posts</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button variant="default" className="w-full gap-2" onClick={() => router.push(`/plans/${plan.id}`)}>
                      View Plan <ExternalLink className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
