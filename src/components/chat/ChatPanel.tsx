"use client";

import { useChat } from "ai/react";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef, useState } from "react";
import { X, Zap } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useSend } from "@/hooks/useSend";
import { TEMPO_EXPLORER } from "@/lib/tempo/client";
import { toast } from "sonner";

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { user } = usePrivy();
  const wallet = user?.wallet?.address;
  const { send, isSending } = useSend();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pendingAction, setPendingAction] = useState<any>(null);

  const { messages, append, isLoading } = useChat({
    api: "/api/chat",
    body: { userWallet: wallet },
    onFinish: (message) => {
      // Check for payment actions in tool results
      if (message.toolInvocations) {
        for (const inv of message.toolInvocations) {
          if (inv.state === "result" && inv.result?.action === "send_payment") {
            setPendingAction(inv.result);
          }
        }
      }
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (content: string) => {
    append({ role: "user", content });
  };

  const handleConfirmPayment = async () => {
    if (!pendingAction) return;
    try {
      const txHash = await send(
        pendingAction.to,
        pendingAction.amount,
        pendingAction.memo
      );
      toast.success(`Payment sent! $${pendingAction.amount} to ${pendingAction.toDisplay}`);
      append({
        role: "user",
        content: `Payment confirmed! Transaction: ${TEMPO_EXPLORER}/tx/${txHash}`,
      });
      setPendingAction(null);
    } catch (err) {
      toast.error("Payment failed. Please try again.");
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white border-l shadow-xl z-50 flex flex-col transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-pulse-600 text-white">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          <span className="font-semibold">Pulse AI</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-pulse-700 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pulse-100 flex items-center justify-center">
              <Zap className="w-8 h-8 text-pulse-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Hey! I&apos;m Pulse</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
              Your AI financial agent. Try saying:
            </p>
            <div className="mt-4 space-y-2">
              {[
                "Send $10 to john@email.com for coffee",
                "Create an invoice for $500",
                "Split $90 dinner between 3 people",
                "What's my balance?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="block w-full text-left px-3 py-2 rounded-lg bg-gray-50 text-sm text-gray-600 hover:bg-pulse-50 hover:text-pulse-700 transition-colors"
                >
                  &ldquo;{suggestion}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role as "user" | "assistant"}
            content={msg.content}
            toolInvocations={msg.toolInvocations}
          />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
            <div className="flex gap-1">
              <span className="typing-dot w-2 h-2 rounded-full bg-pulse-400" />
              <span className="typing-dot w-2 h-2 rounded-full bg-pulse-400" />
              <span className="typing-dot w-2 h-2 rounded-full bg-pulse-400" />
            </div>
          </div>
        )}
      </div>

      {/* Pending payment confirmation */}
      {pendingAction && (
        <div className="px-4 py-3 border-t bg-amber-50">
          <p className="text-sm font-medium text-amber-800">Confirm Payment</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Send ${pendingAction.amount} to {pendingAction.toDisplay}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleConfirmPayment}
              disabled={isSending}
              className="flex-1 py-1.5 rounded-lg bg-pulse-600 text-white text-sm font-medium hover:bg-pulse-700 disabled:opacity-50"
            >
              {isSending ? "Sending..." : "Confirm"}
            </button>
            <button
              onClick={() => setPendingAction(null)}
              className="px-4 py-1.5 rounded-lg border text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
