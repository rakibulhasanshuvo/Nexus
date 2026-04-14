import type { Metadata } from "next";
import ResourceFinder from "@/components/ResourceFinder";

export const metadata: Metadata = {
  title: "Resources | BOU Study Pilot",
  description: "Browse your syllabus vault, generate cheat sheets, and find the best tutorials for your BOU CSE courses.",
};

export default function ResourcesPage() {
  return <ResourceFinder />;
}
