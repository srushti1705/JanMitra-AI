"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "@/components/SplashScreen";
import { useApp } from "@/context/AppContext";

export default function RootPage() {
  const [splashFinished, setSplashFinished] = useState(false);
  const { user, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (splashFinished && !loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [splashFinished, loading, user, router]);

  const handleSplashFinish = () => {
    setSplashFinished(true);
  };

  // We render the Splash Screen as the full entrance page.
  // When it finishes, it sets splashFinished = true and checks user auth.
  return <SplashScreen onFinish={handleSplashFinish} />;
}
