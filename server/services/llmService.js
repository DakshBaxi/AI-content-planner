

import { GoogleGenerativeAI } from "@google/generative-ai"
import  { v4 as uuidv4}  from 'uuid'
import dotenv from 'dotenv';
dotenv.config();
const apikey= process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(apikey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
function buildPrompt(input, numberOfPosts) {
  return `
You are a social media strategist.
Generate a content plan for ${input.platform} based on:
- StartDate: ${input.startDate}
- EndDate: ${input.EndDate}
- Pillars: ${input.contentPillars.join(',')}
- Tone: ${input.tone}
- Frequency: ${input.frequency} posts/week
- Goal: ${input.goal || 'engagement'}
Return a list of ${numberOfPosts} content ideas in JSON format:
[
 {
 "date": "YYYY-MM-DD",
"title": "Post Title",
   "description": "Post Description",
    "type": "text/image/video",
    "platform": "X/LinkedIn/Instagram"
  },
  ...
]
`;
}
async function generatePlan(input) {
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.EndDate);
  const timeDifference = endDate.getTime() - startDate.getTime();
  const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
  const numberOfWeeks = Math.ceil(daysDifference / 7);
  const numberOfPosts = input.frequency * numberOfWeeks;
  const prompt = buildPrompt(input, numberOfPosts);
  const result = await model.generateContent(prompt);
  const response = await result.response.text();
  try {
  const jsonMatch = response.match(/\[\s*{[\s\S]*?}\s*\]/);
    if (!jsonMatch) throw new Error("No valid JSON array found in response");
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.map(post => ({ ...post, id: uuidv4() }));
  } catch (err) {
    console.error('❌ Error parsing Gemini output:', err.message);
    return [];
  }
}
async function editPlan(existingPlan, instructions) {
  const editPrompt = `
You are an assistant. A content planner has been created. Modify it based on the instructions.
Original Plan:
${JSON.stringify(existingPlan, null, 2)}
Instructions: ${instructions}
Return only the modified plan in the same JSON format.
  `;
  const result = await model.generateContent(editPrompt);
  const response = await result.response.text();
  try {
    const jsonMatch = response.match(/\[\s*{[\s\S]*?}\s*\]/);
    if (!jsonMatch) throw new Error("No valid JSON array found in response");
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.map(post => ({ ...post, id: uuidv4() }));
  } catch (err) {
    console.error('❌ Error parsing Gemini edit output:', err.message);
    return existingPlan;
  }
}
export { generatePlan, editPlan };