import { GameCanvasLoader } from "@/components/canvas/GameCanvasLoader";
import { AudioDirector } from "@/components/ui/AudioDirector";
import { GameHud } from "@/components/ui/GameHud";
import { GameOverModal } from "@/components/ui/GameOverModal";
import { MainMenu } from "@/components/ui/MainMenu";

export default function Home() {
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden">
      <GameCanvasLoader />
      <AudioDirector />
      <GameHud />
      <MainMenu />
      <GameOverModal />
    </main>
  );
}
