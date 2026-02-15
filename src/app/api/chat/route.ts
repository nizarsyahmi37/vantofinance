import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createTools } from "@/lib/ai/tools";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { NextRequest } from "next/server";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  compatibility: "compatible",
});

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { messages, userWallet } = await req.json();

  if (!userWallet) {
    return new Response("Missing userWallet", { status: 400 });
  }

  const tools = createTools(userWallet);

  const result = streamText({
    model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini", {
      structuredOutputs: false,
    }),
    system: SYSTEM_PROMPT + `\n\nCurrent user wallet: ${userWallet}`,
    messages,
    tools,
    maxSteps: 5,
    toolChoice: "auto",
    onStepFinish({ toolCalls, toolResults, finishReason, text }) {
      console.log("[chat] step finished:", {
        finishReason,
        toolCalls: toolCalls?.length || 0,
        toolResults: toolResults?.length || 0,
        textLength: text?.length || 0,
      });
    },
  });

  return result.toDataStreamResponse({
    getErrorMessage: (error: unknown) => {
      console.error("[chat] stream error:", error);
      if (error instanceof Error) return error.message;
      return "An unexpected error occurred";
    },
  });
}
