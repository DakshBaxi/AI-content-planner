"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useState } from "react"
import { createPlan } from "@/lib/api"

const formSchema = z.object({
  platform: z.string({
    required_error: "Please select a platform",
  }),
  contentPillars: z.array(z.string()).min(1, {
    message: "Please add at least one content pillar",
  }),
  frequency: z.coerce.number().min(1).max(7),
  tone: z.string({
    required_error: "Please select a tone",
  }),
  goal: z.string().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please select a valid start date",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please select a valid end date",
  })
}).refine(
  (data) => {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    const diffInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    return diffInDays >= 0 && diffInDays <= 60
  },
  {
    message: "End date must be within 60 days after the start date.",
    path: ["endDate"],
  }
)

type PlannerFormProps = {
  onSubmit: (values: z.infer<typeof formSchema>) => void
}

export default function PlannerForm({ onSubmit }: PlannerFormProps) {
  const [pillarInput, setPillarInput] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: "",
      contentPillars: [],
      frequency: 3,
      tone: "",
      goal: "",
      startDate:"",
      endDate: "",
    },
  })

  const addPillar = () => {
    if (pillarInput.trim() === "") return

    const currentPillars = form.getValues("contentPillars")
    if (!currentPillars.includes(pillarInput.trim())) {
      form.setValue("contentPillars", [...currentPillars, pillarInput.trim()])
    }
    setPillarInput("")
  }

  const removePillar = (pillar: string) => {
    const currentPillars = form.getValues("contentPillars")
    form.setValue(
      "contentPillars",
      currentPillars.filter((p) => p !== pillar),
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addPillar()
    }
  }



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border bg-card p-6 shadow-sm"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">X (Twitter)</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Choose the platform where you want to publish your content.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contentPillars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content Pillars</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {field.value.map((pillar) => (
                    <Badge key={pillar} variant="secondary" className="text-sm py-1 px-2">
                      {pillar}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0"
                        onClick={() => removePillar(pillar)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {pillar}</span>
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="Add a content pillar"
                      value={pillarInput}
                      onChange={(e) => setPillarInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </FormControl>
                  <Button type="button" variant="outline" onClick={addPillar}>
                    Add
                  </Button>
                </div>
                <FormDescription>Add topics or themes that your content will focus on.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posting Frequency</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={7} {...field} />
                </FormControl>
                <FormDescription>How many posts per week do you want to publish?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tone</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="authoritative">Authoritative</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Choose the tone of voice for your content.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="What do you want to achieve with this content plan?" {...field} />
                </FormControl>
                <FormDescription>
                  Describe your content marketing goals to help the AI generate more relevant suggestions.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        <div className="flex gap-4">
        <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>Choose the start date for your content planning.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>Choose the end date for your content planning.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

          <Button type="submit" className="w-full">
            Generate Content Plan
          </Button>
        </form>
      </Form>
    </motion.div>
  )
}
