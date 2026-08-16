import { GameCanvasLoader } from "@/components/canvas/GameCanvasLoader";

export default function Home() {
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden">
      <GameCanvasLoader />
    </main>
  );
}
