
"use client";

// This is a new page specifically for the engineer's profile.
// It reuses the ProfilePageContent component but is wrapped by the Engineer layout automatically.

import { ProfilePageContent } from "@/app/profile/page";

export default function EngineerProfilePage() {
  return <ProfilePageContent />;
}
