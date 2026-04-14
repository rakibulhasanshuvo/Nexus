import type { Metadata } from "next";
import RoutineAnalyzer from "@/components/RoutineAnalyzer";

export const metadata: Metadata = {
  title: "Routine Analyzer | BOU Study Pilot",
  description: "Upload your exam routine image and get AI-extracted schedules with countdown timers and study plans.",
};

export default function RoutinePage() {
  return <RoutineAnalyzer />;
}
