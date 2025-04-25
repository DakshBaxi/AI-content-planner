// "use server"
// import type { Plan, PlanSummary } from "@/types/plan"
// // import { useAuth } from "@clerk/nextjs"
// import { auth } from "@clerk/nextjs/server"




// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/plan-route"

// async function getAuthHeaders() {
//   const { getToken } = await auth()
//   const token = await getToken()

//   return {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   }
// }

// async function handleResponse(response: Response) {
//   if (!response.ok) {
//     const error = await response.json().catch(() => ({}))
//     console.log(error);
//     throw new Error(error.message || "An error occurred while fetching data")
//   }
//   return response.json()
// }

// export async function fetchPlans(): Promise<PlanSummary[]> {
//   const headers = await getAuthHeaders()
//   const response = await fetch(`${API_BASE_URL}/myplans`, { headers })
//   const data = response.json()
//   return data
// }

// export async function fetchPlanById(id: string): Promise<Plan> {
//   const headers = await getAuthHeaders()
//   const response = await fetch(`${API_BASE_URL}/plans/${id}`, { headers })
//   return handleResponse(response)
// }

// export async function createPlan(planData: Omit<Plan, "id" | "posts">): Promise<Plan> {
//   const headers = await getAuthHeaders()
//   const response = await fetch(`${API_BASE_URL}/plans`, {
//     method: "POST",
//     headers,
//     body: JSON.stringify(planData),
//   })
//   return handleResponse(response)
// }

// export async function editPlan(planId: string, instructions: string): Promise<Plan> {
//   const headers = await getAuthHeaders()
//   const response = await fetch(`${API_BASE_URL}/plans/${planId}`, {
//     method: "PATCH",
//     headers,
//     body: JSON.stringify({ instructions }),
//   })
//   return handleResponse(response)
// }

// export async function deletePlan(planId: string): Promise<void> {
//   const headers = await getAuthHeaders()
//   const response = await fetch(`${API_BASE_URL}/plans/${planId}`, {
//     method: "DELETE",
//     headers,
//   })
//   if (!response.ok) {
//     const error = await response.json().catch(() => ({}))
//     throw new Error(error.message || "Failed to delete plan")
//   }
// }

"use server"
import type { Plan, PlanSummary } from "@/types/plan"
import { auth } from "@clerk/nextjs/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/plan-route"

async function getAuthHeaders() {
  const { getToken } = await auth()
  const token = await getToken()

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    console.log(error)
    throw new Error(error.message || "An error occurred while fetching data")
  }
  return response.json()
}

// ✅ Fetch all plans for current user
export async function fetchPlans(): Promise<PlanSummary[]> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/myplans`, { headers })
  return handleResponse(response)
}

// ✅ Create a new plan (POST /generate-plan)
export async function createPlan(planData: Omit<Plan, "id" | "posts">): Promise<Plan> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/generate-plan`, {
    method: "POST",
    headers,
    body: JSON.stringify(planData),
  })
  return handleResponse(response)
}

// geting unique plan 
export async function getUniquePlan(planId: string): Promise<Plan> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/my-plan/${planId}`, {
    method: "GET",
    headers,
  })
  return handleResponse(response)
}

// ✅ Edit existing plan (POST /edit-plan)
export async function editPlan(planId: string, instructions: string): Promise<Plan> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/edit-plan`, {
    method: "POST",
    headers,
    body: JSON.stringify({ planId, instructions }),
  })
  return handleResponse(response)
}

// ✅ Delete a plan (DELETE /delete-plan/:planId)
export async function deletePlan(planId: string): Promise<void> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/delete-plan/${planId}`, {
    method: "DELETE",
    headers,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || "Failed to delete plan")
  }
}

// ✅ Delete a post (DELETE /delete-post/:postId)
export async function deletePost(postId: string): Promise<void> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/delete-post/${postId}`, {
    method: "DELETE",
    headers,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || "Failed to delete post")
  }
}

// ✅ Edit a post (PUT /edit-post/:postId)
export async function editPost(postId: string, update: {
  title: string
  description: string
  type: string
  date: Date
}): Promise<any> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/edit-post/${postId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(update),
  })
  return handleResponse(response)
}
