type LockableOrientation = ScreenOrientation & {
  lock: (orientation: "landscape" | "portrait") => Promise<void>;
};

function getLockableOrientation(): LockableOrientation | null {
  if (typeof screen === "undefined" || !screen.orientation) {
    return null;
  }

  const orientation = screen.orientation as ScreenOrientation & {
    lock?: LockableOrientation["lock"];
  };
  if (typeof orientation.lock !== "function") {
    return null;
  }

  return orientation as LockableOrientation;
}

export async function requestLandscapeLock(): Promise<void> {
  const orientation = getLockableOrientation();
  if (!orientation) {
    return;
  }

  try {
    await orientation.lock("landscape");
  } catch {
    // Orientation lock requires fullscreen or a supported mobile browser.
  }
}
