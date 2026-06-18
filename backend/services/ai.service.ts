import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getAIRecommendations = async (
  userInterests: string,
  availableServices: any[],
) => {
  if (!process.env.GEMINI_API_KEY) {
    return availableServices.slice(0, 3);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const servicesList = availableServices
      .map((s) => `- ${s.name}: ${s.description}`)
      .join("\n");

    const prompt = `
User likes: ${userInterests}
Available services:
${servicesList}

Recommend top 3 services.
Return ONLY a JSON array of service names.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const match = text.match(/\[.*\]/s);
    if (match) {
      const recommendedNames = JSON.parse(match[0]);
      return availableServices.filter((s) => recommendedNames.includes(s.name));
    }

    return availableServices.slice(0, 3);
  } catch (error) {
    console.error("AI Recommendation error:", error);
    return availableServices.slice(0, 3);
  }
};
