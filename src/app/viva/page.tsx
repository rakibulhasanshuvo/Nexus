import type { Metadata } from "next";
import VivaSimulator from "@/components/VivaSimulator";

export const metadata: Metadata = {
  title: "Viva Simulator | BOU Study Pilot",
  description: "Practice for your viva voce examination with an AI-powered external examiner simulation.",
};

export default function VivaPage() {
  return <VivaSimulator />;
}
