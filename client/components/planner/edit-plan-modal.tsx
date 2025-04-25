"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type EditPlanModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (instructions: string) => void
}

export default function EditPlanModal({ isOpen, onClose, onSubmit }: EditPlanModalProps) {
  const [instructions, setInstructions] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (instructions.trim()) {
      onSubmit(instructions)
      setInstructions("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Content Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Provide instructions for how you'd like to modify your content plan. For example: 'Make the posts shorter' or 'Add more detailed descriptions'."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!instructions.trim()}>
              Update Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
