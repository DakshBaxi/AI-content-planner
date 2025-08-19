export type Post = {
  id: string
  date: Date
  title: string
  description: string
  type: string
}

export type Plan = {
  id: string
  platform: string
  contentPillars: string[]
  frequency: number
  tone: string
  goal?: string
  posts: Post[]
  model ?: string
}

export type PlanSummary = {
  id: string
  name?: string
  platform: string
  contentPillars: string[]
  frequency: number
  postCount: number
  createdAt: string
}
