"use client";

import { useEffect, useState } from "react";

const MOBILE_QUERY = "(pointer: coarse), (max-width: 767px)";

function readDpr(): number {
  if (typeof window === "undefined") {
    return 2;
  }

  const cap = window.matchMedia(MOBILE_QUERY).matches ? 1.75 : 2;
  return Math.min(cap, Math.max(1, window.devicePixelRatio || 1));
}

export function useGameDpr(): number {
  const [dpr, setDpr] = useState(readDpr);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);

    const sync = () => {
      setDpr(readDpr());
    };

    sync();
    media.addEventListener("change", sync);
    window.addEventListener("resize", sync);

    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return dpr;
}
