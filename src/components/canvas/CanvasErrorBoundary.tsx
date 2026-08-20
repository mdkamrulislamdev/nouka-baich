"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * Keeps the DOM menu/HUD alive if the WebGL tree throws.
 * Without this, a single R3F crash can blank the entire page.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[GameCanvas] crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a0c08] px-6 text-center">
            <div>
              <p className="font-bengali text-lg text-[#f6e6c2]">
                ৩ডি দৃশ্য লোড করা যায়নি
              </p>
              <p className="mt-2 text-sm text-[#e4c36a]/90">
                3D scene failed to load. Refresh the page.
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
