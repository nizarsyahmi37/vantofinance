"use client";

import { Zap, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: any[];
}

export function ChatMessage({ role, content, toolInvocations }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-gray-200" : "bg-pulse-100"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-gray-600" />
        ) : (
          <Zap className="w-4 h-4 text-pulse-600" />
        )}
      </div>

      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : ""}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-pulse-600 text-white rounded-br-md"
              : "bg-gray-100 text-gray-800 rounded-bl-md"
          }`}
        >
          {content && <p className="whitespace-pre-wrap">{content}</p>}
        </div>

        {toolInvocations?.map((invocation, i) => (
          <ToolResult key={i} invocation={invocation} />
        ))}
      </div>
    </div>
  );
}

function ToolResult({ invocation }: { invocation: any }) {
  if (invocation.state !== "result") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pulse-50 text-pulse-600 text-xs">
        <div className="flex gap-1">
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-pulse-400" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-pulse-400" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-pulse-400" />
        </div>
        <span>Working on it...</span>
      </div>
    );
  }

  const result = invocation.result;
  if (!result || !result.success) return null;

  // Show action-specific UI
  if (result.action === "send_payment") {
    return (
      <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm">
        <p className="font-medium text-green-800">Payment Ready</p>
        <p className="text-green-600 text-xs mt-0.5">
          ${result.amount} to {result.toDisplay}
        </p>
      </div>
    );
  }

  return null;
}
