"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Zap } from "lucide-react"
import { fetchUserUsage } from "@/lib/api"

export default function UsageProgress() {
  const [usage, setUsage] = useState<{ count: number; limit: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsage = async () => {
      try {
        const data = await fetchUserUsage()
        setUsage(data)
      } catch (error) {
        console.error("Failed to load usage data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUsage()
  }, [])

  if (loading || !usage) {
    return null
  }

  const percentage = Math.min(Math.round((usage.count / usage.limit) * 100), 100)
  const remaining = usage.limit - usage.count

  // Determine color based on usage
  let progressColor = "bg-primary"
  if (percentage > 90) {
    progressColor = "bg-destructive"
  } else if (percentage > 70) {
    progressColor = "bg-amber-500"
  }

  return (
    <TooltipProvider >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className=" flex items-center gap-2 min-w-[140px]">
            <Zap className="h-4 w-4 text-primary" />
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1">
                <span>
                  {usage.count} / {usage.limit}
                </span>
                <span>{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-2" indicatorClassName={progressColor} />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {remaining > 0
              ? `${remaining} generations remaining this month`
              : "Generation limit reached. Upgrade for more!"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
