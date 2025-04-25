"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import { getUniquePlan } from "@/lib/api"
import type { Plan } from "@/types/plan"
import ContentCalendar from "@/components/planner/content-calendar"


type Props = {
  params:Promise<{id:string}>
}

export default  function PlanDetailPage({ params }:  Props ) {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()
  const { id } = use(params); 
  useEffect(() => {
    // Redirect to sign-in if not authenticated

    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
      return
    }
    if (isSignedIn && id) {
      loadPlan(id)
    }
  }, [isLoaded, isSignedIn, params, router])

  const loadPlan = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getUniquePlan(id)
      setPlan(data)
    } catch (error) {
      console.error("Failed to load plan:", error)
      setError("Failed to load the plan. It may have been deleted or you don't have permission to view it.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditPlan = async (planId: string, instructions: string) => {
    setIsLoading(true)

    try {
      // In a real app, this would be an actual API call
      // const response = await editPlan(planId, instructions)
      // setPlan(response)

      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update the existing plan with some modifications based on instructions
      if (plan) {
        const updatedPlan = {
          ...plan,
          posts: plan.posts.map((post) => ({
            ...post,
            title: instructions.includes("shorter")
              ? post.title.substring(0, post.title.length / 2) + "..."
              : post.title + " (updated)",
            description: instructions.includes("detailed")
              ? post.description + " Now with more details based on audience research."
              : post.description + " (updated)",
          })),
        }

        setPlan(updatedPlan)
      }
    } catch (error) {
      console.error("Error editing plan:", error)
      setError("Failed to update the plan. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded || (isLoaded && !isSignedIn)) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-5xl">
          <Button variant="ghost" onClick={() => router.push("/my-plans")} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to My Plans
          </Button>
          <div className="p-8 text-center rounded-lg border">
            <h2 className="text-xl font-medium mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push("/my-plans")}>Go to My Plans</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-5xl">
          <Button variant="ghost" onClick={() => router.push("/my-plans")} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to My Plans
          </Button>
          <div className="p-8 text-center rounded-lg border">
            <h2 className="text-xl font-medium mb-2">Plan Not Found</h2>
            <p className="text-muted-foreground mb-4">The plan you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => router.push("/my-plans")}>Go to My Plans</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Button variant="ghost" onClick={() => router.push("/my-plans")} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to My Plans
          </Button>
        </motion.div>

        <ContentCalendar plan={plan} onEditPlan={handleEditPlan} />
      </div>
    </div>
  )
}
