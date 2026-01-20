"use client";

import { useEffect, useState } from "react";

export function useOS() {
  const [os, setOS] = useState("Unknown");

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    if (platform.includes("win")) setOS("Windows");
    else if (userAgent.includes("mac") || platform.includes("mac")) setOS("macOS");
    else if (userAgent.includes("linux") || platform.includes("linux")) setOS("Linux");
    else if (userAgent.includes("android")) setOS("Android");
    else if (userAgent.includes("iphone") || userAgent.includes("ipad")) setOS("iOS");
  }, []);

  return os;
}
