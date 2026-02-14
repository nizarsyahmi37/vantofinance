import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createTools } from "@/lib/ai/tools";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { NextRequest } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { messages, userWallet } = await req.json();

  if (!userWallet) {
    return new Response("Missing userWallet", { status: 400 });
  }

  const tools = createTools(userWallet);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT + `\n\nCurrent user wallet: ${userWallet}`,
    messages,
    tools,
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
