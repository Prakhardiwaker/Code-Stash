import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

// Define types for Gemini API response
interface GeminiPart {
  text: string;
}

interface GeminiContent {
  parts: GeminiPart[];
}

interface GeminiCandidate {
  content: GeminiContent;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user with Convex
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const convexUser = await convex.query(api.users.getUser, {
      userId: user.id,
    });
    if (!convexUser?.isPro) {
      return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
    }

    // Parse request body
    const { code, language } = await request.json();
    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    // Generate prompt
    const prompt = `
Please analyze the following ${language} code and provide a comprehensive code review.
Respond ONLY as a JSON object with the specified structure.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`
`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            topP: 0.8,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json();
      console.error("Gemini API error:", errorBody);
      return NextResponse.json(
        { error: "Failed to get code review from AI service" },
        { status: geminiResponse.status }
      );
    }

    const data: GeminiResponse = await geminiResponse.json();

    // Extract and parse text safely
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    let reviewResult;

    try {
      const cleanText = text.replace(/```json\n?|```\n?/g, "").trim();
      reviewResult = JSON.parse(cleanText);

      if (!reviewResult.overallRating) {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error parsing Gemini response:", err);
      console.error("Raw response text:", text);

      // Fallback review
      reviewResult = {
        overallRating: 3,
        tidiness: 3,
        neatness: 3,
        productivity: 3,
        summary: "Code review completed. Functional but may need improvements.",
        suggestions: [
          "Add comments",
          "Improve variable names",
          "Enhance error handling",
        ],
        errors: [],
        improvements: [
          "Add input validation",
          "Optimize performance",
          "Refactor structure",
        ],
        explanation:
          "Code analyzed. Ensure it's complete and formatted for detailed feedback.",
        testCases: [
          {
            input: "Sample input",
            expectedOutput: "Expected result",
            description: "Basic test",
          },
        ],
      };
    }

    return NextResponse.json(reviewResult);
  } catch (err) {
    console.error("Code review API error:", err);
    return NextResponse.json(
      { error: "Failed to analyze code" },
      { status: 500 }
    );
  }
}
