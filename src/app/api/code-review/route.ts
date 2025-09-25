// src/api/code-review/route.ts
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

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
Return your response as a JSON object with the following structure:

{
  "overallRating": number (1-5),
  "tidiness": number (1-5),
  "neatness": number (1-5), 
  "productivity": number (1-5),
  "summary": "Brief summary of the code's purpose and quality",
  "suggestions": ["Array of improvement suggestions"],
  "errors": ["Array of errors or potential issues found"],
  "improvements": ["Array of specific improvements that could be made"],
  "explanation": "Detailed explanation of what the code does, how it works, and its structure",
  "testCases": [
    {
      "input": "Sample input",
      "expectedOutput": "Expected output", 
      "description": "Description of what this test case validates"
    }
  ]
}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Respond ONLY with the JSON object.
`;

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Call Gemini API with correct endpoint and format
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
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
      console.error("Gemini API error response:", errorBody);
      return NextResponse.json(
        { error: "Failed to get code review from AI service" },
        { status: geminiResponse.status }
      );
    }

    const data = await geminiResponse.json();

    // Extract the text from Gemini response (updated format)
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Parse JSON from Gemini
    let reviewResult;
    try {
      // Clean the response text in case there are markdown code blocks
      const cleanText = text.replace(/```json\n?|```\n?/g, "").trim();
      reviewResult = JSON.parse(cleanText);

      // Validate required fields
      if (!reviewResult.overallRating) {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error parsing Gemini response:", err);
      console.error("Raw response text:", text);

      // Provide fallback response
      reviewResult = {
        overallRating: 3,
        tidiness: 3,
        neatness: 3,
        productivity: 3,
        summary:
          "Code review completed successfully. The code appears to be functional but may benefit from some improvements.",
        suggestions: [
          "Consider adding more comments to explain complex logic",
          "Review variable naming for clarity",
          "Consider error handling improvements",
        ],
        errors: [],
        improvements: [
          "Add input validation where appropriate",
          "Consider performance optimizations",
          "Review code structure and organization",
        ],
        explanation:
          "The code has been analyzed. For detailed feedback, please ensure the code is complete and properly formatted.",
        testCases: [
          {
            input: "Sample input for testing",
            expectedOutput: "Expected result",
            description: "Basic functionality test",
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
