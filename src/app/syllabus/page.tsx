import type { Metadata } from "next";
import SyllabusExplorer from "@/components/SyllabusExplorer";

export const metadata: Metadata = {
  title: "Syllabus Browser | BOU Study Pilot",
  description: "Explore the full BOU CSE curriculum with AI-powered topic explanations and interactive quizzes.",
};

export default function SyllabusPage() {
  return <SyllabusExplorer />;
}
