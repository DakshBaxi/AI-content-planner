

"use server"
import type { Plan, PlanSummary, Post } from "@/types/plan"
import { auth } from "@clerk/nextjs/server"
import axios from "axios"

const API_BASE_URL =process.env.NEXT_PUBLIC_API_URL
console.log("API_BASE_URL", API_BASE_URL)
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
    // const error = await response.json().catch((error) => ({
    //   message: "An error occurred while processing your request",
    //   details: error.message || "Unknown error",
    // }))
    // console.log(error)
    // throw new Error(error.message || "An error occurred while fetching data")
    console.log("Error response:", response)
  }
  return response.json()
}

// ✅ Fetch all plans for current user
export async function fetchPlans(): Promise<PlanSummary[]> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/api/plan-route/myplans`, { headers })
  return handleResponse(response)
}

// ✅ Create a new plan (POST /generate-plan)
export async function createPlan(planData: Omit<Plan, "id" | "posts">): Promise<Plan> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/api/plan-route/generate-plan`, {
    method: "POST",
    headers,
    body: JSON.stringify(planData),
  })
  return handleResponse(response)
}

// geting unique plan 
export async function getUniquePlan(planId: string): Promise<Plan> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/api/plan-route/my-plan/${planId}`, {
    method: "GET",
    headers,
  })
  return handleResponse(response)
}



// ✅ Edit existing plan (POST /edit-plan)
export async function editPlan(planId: string, instructions: string): Promise<Plan> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/api/plan-route/edit-plan`, {
    method: "POST",
    headers,
    body: JSON.stringify({ planId, instructions }),
  })
  return handleResponse(response)
}

// ✅ Delete a plan (DELETE /delete-plan/:planId)
export async function deletePlan(planId: string): Promise<void> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/api/plan-route/delete-plan/${planId}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/plan-route/delete-post/${postId}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/plan-route/edit-post/${postId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(update),
  })
  return handleResponse(response)
}

export async function fetchUserUsage(): Promise<{ count: number; limit: number }> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/api/plan-route/user/usage`, {
    method: "GET",
    headers,
  })
 
  return handleResponse(response)
  
}

export async function fetchUserTier() {
  const headers = await getAuthHeaders()
  const response = await axios.get(`${API_BASE_URL}/api/plan-route/user/model`, {
    headers
  })
  // console.log(response.data);
  return response.data.proModel;
  
  // return handleResponse(response)
}

// /lib/api.ts
export async function createPost(planId: string, postData: { title: string; description: string; type: string; date: Date }) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_BASE_URL}/api/plan-route/create-custom-post/${planId}`, {
    method: "POST",
    headers,
    body: JSON.stringify(postData),
  })

  if (!res.ok) {
    throw new Error("Failed to create post")
  }

  return await res.json()
}

export async function submitEnterpriseForm(formData:{name:string,email:string,message:string}){
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_BASE_URL}/api/plan-route/submitEnterpriseForm`, {
    method: "POST",
    headers,
    body: JSON.stringify(formData),
  })
  if (!res.ok) {
    throw new Error("Failed to submit form")
  }

  return await res.json()
}