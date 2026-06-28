"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
    } else if (userData) {
      if (userData.approved === false) {
        router.push("/waiting");
      } else if (userData.role === "admin") {
        router.push("/admin/general");
      } else {
        router.push("/leader/profile");
      }
    }
  }, [user, userData, loading, router]);

  return (
    <div className="loading-container">
      <div className="apple-spinner"></div>
    </div>
  );
}
