import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are JanMitra AI, an intelligent civic assistant for Indian citizens. Explain government services in simple language. Never invent information. If information is unavailable, clearly state that it could not be verified. Every response should end with:
1. Official Government Source
2. Suggested Next Action
3. Related Government Services.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt : "";
    const language = typeof body?.language === "string" ? body.language : "English";
    const imageBase64 = typeof body?.imageBase64 === "string" ? body.imageBase64 : null;
    const mimeType = typeof body?.mimeType === "string" ? body.mimeType : "image/jpeg";
    const threadTitle = typeof body?.threadTitle === "string" ? body.threadTitle : "Civic query";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!prompt.trim()) {
      return NextResponse.json({ error: "A prompt is required." }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API is not configured on the server." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const formattedPrompt = `Conversation topic: ${threadTitle}\nUser language: ${language}\n\n${prompt}`;

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: `${SYSTEM_PROMPT}\n\n${formattedPrompt}` },
    ];

    if (imageBase64) {
      const data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
      parts.push({
        inlineData: {
          mimeType,
          data,
        },
      });
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });

    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Gemini API error", error);
    return NextResponse.json(
      { error: "The civic assistant could not verify that request right now." },
      { status: 502 }
    );
  }
}
