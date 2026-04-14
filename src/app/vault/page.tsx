import type { Metadata } from "next";
import CGPAVault from "@/components/CGPAVault";

export const metadata: Metadata = {
  title: "Academic Vault | BOU Study Pilot",
  description: "Track your CGPA, predict future grades, and manage your academic transcript for Bangladesh Open University.",
};

export default function VaultPage() {
  return <CGPAVault />;
}
