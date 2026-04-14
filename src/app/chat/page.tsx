import type { Metadata } from "next";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "AI Counselor | BOU Study Pilot",
  description: "Chat with your AI academic counselor for exam prep, degree planning, and TMA guidance — powered by Gemini.",
};

export default function ChatPage() {
  return <ChatBot />;
}
