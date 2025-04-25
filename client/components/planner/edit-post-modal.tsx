"use client"

import type React from "react"

import { useState } from "react"
import type { Post } from "@/types/plan"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { editPost } from "@/lib/api"
import { string } from "zod"

type EditPostModalProps = {
  isOpen: boolean
  onClose: () => void
  post: Post
  onSubmit: (post: Post) => void
}

export default function EditPostModal({ isOpen, onClose, post, onSubmit }: EditPostModalProps) {
  const [title, setTitle] = useState(post.title)
  const [description, setDescription] = useState(post.description)
  const [type, setType] = useState(post.type)
  const [date, setDate] = useState(post.date instanceof Date ? post.date : new Date(post.date))
  const [isLoading, setIsLoading] = useState(false)  // To handle loading state during the API call
  const [error, setError] = useState<string | null>(null)  // For error handling

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!title.trim() || !description.trim()) {
      return
    }

    setIsLoading(true)
    setError(null)  // Reset error message if any

    try {
      // Call editPost function from the API
      const updatedPost = await editPost(post.id, { title, description , type,  date})

      // If the update is successful, call onSubmit with the updated post data
      onSubmit(updatedPost)

      // Close the modal after successful update
      onClose()
    } catch (err) {
      console.error("Error editing post:", err)
      setError("Failed to update the post. Please try again.")  // Set error message if the API call fails
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Content Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid gap-2">
              <Label htmlFor="date">Post Date</Label>
              <Input
                id="date"
                type="date"
                value={date.toISOString().split("T")[0]} // Ensure date is formatted as a valid ISO string
                onChange={(e) => setDate(new Date(e.target.value))} // Convert input string to Date object
              />
            </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !description.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
