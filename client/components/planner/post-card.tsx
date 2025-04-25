"use client"

import { useState } from "react"
import type { Post } from "@/types/plan"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, ImageIcon, FileText, Video } from "lucide-react"
import EditPostModal from "@/components/planner/edit-post-modal"

type PostCardProps = {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentPost, setCurrentPost] = useState<Post>(post)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "video":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      default:
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    }
  }

  const handleEditPost = (updatedPost: Post) => {
    setCurrentPost(updatedPost)
    setIsEditModalOpen(false)
  }

  return (
    <>
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="font-normal">
              {formatDate(currentPost.date)}
            </Badge>
            <Badge variant="outline" className={`flex items-center gap-1 ${getTypeColor(currentPost.type)}`}>
              {getTypeIcon(currentPost.type)}
              {currentPost.type}
            </Badge>
          </div>
          <h3 className="font-medium line-clamp-2 mb-2">{currentPost.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{currentPost.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardFooter>
      </Card>

      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={currentPost}
        onSubmit={handleEditPost}
      />
    </>
  )
}
