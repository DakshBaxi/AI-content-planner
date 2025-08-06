"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@clerk/nextjs"
import PlannerForm from "@/components/planner/planner-form"
import ContentCalendar from "@/components/planner/content-calendar"
import type { Plan } from "@/types/plan"
import LoadingState from "@/components/planner/loading-state"
import { createPlan, editPlan, fetchUserTier, fetchUserUsage } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"


export default function PlannerPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const router = useRouter()
  const [usage, setUsage] = useState<{ count: number; limit: number } | null>(null)
  const [usageLoading, setUsageLoading] = useState(true)
  const { isSignedIn } = useAuth()
  const [proModel,setProModel]= useState(false);

  useEffect(() => {
    if (isSignedIn) {
      loadUsage()
    }
  }, [isSignedIn])

  const loadUsage = async () => {
    try {
      setUsageLoading(true)
      const data = await fetchUserUsage()
      const proModel = await fetchUserTier();
      // @ts-ignore
      setProModel(proModel) 
      setUsage(data)
    } catch (error) {
      console.error("Failed to load usage data:", error)
    } finally {
      setUsageLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      // Check if user is signed in
      if (!isSignedIn) {
        router.push("/sign-in")
        return
      }
      

         // Check usage limits
    if (usage && usage.count >= usage.limit) {
      toast({
        title: "Generation limit reached",
        description: "You've reached your plan's generation limit. Please upgrade to continue.",
        variant: "destructive",
      })
      router.push("/pricing")
      return
    }

      // In a real app, this would be an actual API call
      // const response = await createPlan(formData)
      // setPlan(response)
      const newPlan = await createPlan(formData)
      

      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setPlan(newPlan)
      if (usage) {
        setUsage({
          ...usage,
          count: usage.count + 1,
        })
      }
    } catch (error) {
      console.error("Error generating plan:", error)
      // Handle error state
    } finally {
      setIsLoading(false)
    }
  }



  const handleEditPlan = async (planId: string, instructions: string) => {
    setIsLoading(true)

    try {
      // Check if user is signed in
      if (!isSignedIn) {
        router.push("/sign-in")
        return
      }

      // In a real app, this would be an actual API call
      const response = await editPlan(planId, instructions)
      setPlan(response)

      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update the existing plan with some modifications based on instructions
   
    } catch (error) {
      console.error("Error editing plan:", error)
      // Handle error state
    } finally {
      setIsLoading(false)
    }
  }

  

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Content Planner</h1>
          <p className="mt-2 text-muted-foreground">Generate your AI-powered content strategy in minutes</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingState />
            </motion.div>
          ) : plan ? (
            <motion.div
              key="calendar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ContentCalendar plan={plan} onEditPlan={handleEditPlan} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              
               
                  <PlannerForm onSubmit={handleSubmit} proModel={proModel}/>
                
              
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
