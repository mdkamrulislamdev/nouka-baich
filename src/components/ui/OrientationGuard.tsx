"use client";

import { useEffect, useState } from "react";

function isPortraitTouch(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(pointer: coarse)").matches &&
    window.matchMedia("(orientation: portrait)").matches
  );
}

export function OrientationGuard() {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const sync = () => {
      setShowHint(isPortraitTouch());
    };

    sync();

    const portrait = window.matchMedia("(orientation: portrait)");
    const coarse = window.matchMedia("(pointer: coarse)");
    portrait.addEventListener("change", sync);
    coarse.addEventListener("change", sync);
    window.addEventListener("orientationchange", sync);
    window.addEventListener("resize", sync);

    return () => {
      portrait.removeEventListener("change", sync);
      coarse.removeEventListener("change", sync);
      window.removeEventListener("orientationchange", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  if (!showHint) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-40 flex justify-center px-4">
      <div className="rounded-sm border border-[#e4c36a]/70 bg-[#1a0c08]/88 px-4 py-2 text-center shadow-[0_10px_28px_rgba(0,0,0,0.4)] backdrop-blur-[3px]">
        <p className="font-bengali text-sm text-[#f6e6c2]">
          ভালোভাবে খেলতে ফোনটি আড়াআড়ি ঘোরান
        </p>
        <p className="mt-0.5 text-[0.6rem] tracking-[0.2em] text-[#e4c36a]/85 uppercase">
          Rotate for landscape
        </p>
      </div>
    </div>
  );
}
