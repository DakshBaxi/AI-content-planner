"use client"
import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Check, Sparkles, Building, Zap } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { submitEnterpriseForm } from "@/lib/api"
import { PricingTable } from '@clerk/nextjs'


const plans = [
  {
    name: "Free",
    price: "₹0",
    description: "Basic content planning for individuals",
    features: [
      "5 content plans per month",
      "Basic AI suggestions",
      // "Single platform support",
    ],
    cta: "Get Started",
    popular: false,
    icon: Zap,
  },
  // {  
  //   name: "Pro",
  //   price: "₹500",
  //   description: "Advanced features for content creators",
  //   features: [
  //     "Unlimited content plans",
  //     "Advanced AI suggestions",
  //     "Multi-platform support",
  //     "Content analytics",
  //     "Custom content pillars",
  //   ],
  //   cta: "Upgrade to Pro",
  //   popular: true,
  //   icon: Sparkles,
  // },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for teams and businesses",
    features: [
      "Unlimited content plans",
      "Premium AI suggestions",
      "Team collaboration",
      "Advanced analytics",
      "API access",
      "Dedicated support",
    ],
    cta: "Request Invite",
    popular: false,
    icon: Building,
  },
]

export default function PricingPage() {
  const [showEnterpriseDialog, setShowEnterpriseDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const router = useRouter()
  const { isSignedIn } = useAuth()

  const handleSubscribe = (planName: string) => {
    if (planName === "Free") {
      if (!isSignedIn) {
        router.push("/sign-up")
      } else {
        router.push("/planner")
      }
    }
    //  else if (planName === "Pro") {
    //   // In a real app, redirect to checkout
    //   alert("In a real app, this would redirect to a payment gateway for the Pro plan.")
    // }
     else if (planName === "Enterprise") {
      setShowEnterpriseDialog(true)
    }
  }

  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, send this data to your backend

    const res = await submitEnterpriseForm(formData)
    alert("Thank you for your interest! Our team will contact you soon.")
    setShowEnterpriseDialog(false)
    setFormData({
      name: "",
      email: "",
      message: "",
    })
  }
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">Choose Your Plan</h1>
          <p className="mt-4 text-xl text-muted-foreground">Select the perfect plan to power your content strategy</p>
        </motion.div>
    <div>
      {/* <PricingTable/> */}
    </div>
        <div className="grid gap-8 md:grid-cols-2">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`flex h-full flex-col ${plan.popular ? "border-primary shadow-lg shadow-primary/10" : ""}`}
              >
                <CardHeader>
                  {plan.popular && (
                    <Badge className="w-fit mb-2" variant="default">
                      Most Popular
                    </Badge>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1.5">
                      <plan.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.name !== "Enterprise" && <span className="text-muted-foreground">/month</span>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.name)}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <Dialog open={showEnterpriseDialog} onOpenChange={setShowEnterpriseDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request Enterprise Access</DialogTitle>
              <DialogDescription>
                Fill out the form below and our team will get in touch with you shortly.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEnterpriseSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEnterpriseDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
