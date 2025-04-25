"use client"

import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function LoadingState() {
  const loadingMessages = [
    "Analyzing your content pillars...",
    "Crafting engaging post ideas...",
    "Optimizing for your platform...",
    "Scheduling your content calendar...",
    "Finalizing your content strategy...",
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 space-y-6"
    >
      <div className="relative w-24 h-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute inset-0"
        >
          <Loader2 className="w-24 h-24 text-primary" />
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className="text-center"
      >
        <h3 className="text-xl font-medium mb-2">Generating Your Content Plan</h3>
        <p className="text-muted-foreground">Our AI is crafting the perfect content strategy for you...</p>
      </motion.div>

      <div className="w-full max-w-md">
        <div className="space-y-2">
          {loadingMessages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.5, duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
              <p className="text-sm text-muted-foreground">{message}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
