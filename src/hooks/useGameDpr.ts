"use client";

import { useEffect, useState } from "react";

const MOBILE_QUERY = "(pointer: coarse), (max-width: 767px)";
const MOBILE_DPR: [number, number] = [1, 1.5];
const DESKTOP_DPR: [number, number] = [1, 2];

function readDprRange(): [number, number] {
  if (typeof window === "undefined") {
    return DESKTOP_DPR;
  }

  return window.matchMedia(MOBILE_QUERY).matches ? MOBILE_DPR : DESKTOP_DPR;
}

export function useGameDpr(): [number, number] {
  const [dpr, setDpr] = useState<[number, number]>(readDprRange);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);

    const sync = () => {
      setDpr(media.matches ? MOBILE_DPR : DESKTOP_DPR);
    };

    sync();
    media.addEventListener("change", sync);

    return () => {
      media.removeEventListener("change", sync);
    };
  }, []);

  return dpr;
}
