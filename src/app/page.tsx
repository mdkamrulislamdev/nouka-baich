import { GameCanvasLoader } from "@/components/canvas/GameCanvasLoader";
import { GameHud } from "@/components/ui/GameHud";
import { GameOverModal } from "@/components/ui/GameOverModal";
import { MainMenu } from "@/components/ui/MainMenu";

export default function Home() {
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden">
      <GameCanvasLoader />
      <GameHud />
      <MainMenu />
      <GameOverModal />
    </main>
  );
}
