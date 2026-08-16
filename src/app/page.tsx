import { GameCanvasLoader } from "@/components/canvas/GameCanvasLoader";
import { MainMenu } from "@/components/ui/MainMenu";

export default function Home() {
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden">
      <GameCanvasLoader />
      <MainMenu />
    </main>
  );
}
