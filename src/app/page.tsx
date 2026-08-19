import { GameCanvasLoader } from "@/components/canvas/GameCanvasLoader";
import { AudioDirector } from "@/components/ui/AudioDirector";
import { CloseCallToast } from "@/components/ui/CloseCallToast";
import { GameHud } from "@/components/ui/GameHud";
import { GameOverModal } from "@/components/ui/GameOverModal";
import { MainMenu } from "@/components/ui/MainMenu";
import { OrientationGuard } from "@/components/ui/OrientationGuard";
import { PersistStore } from "@/components/ui/PersistStore";
import { SettingsModal } from "@/components/ui/SettingsModal";

export default function Home() {
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden overscroll-none touch-none">
      <GameCanvasLoader />
      <PersistStore />
      <AudioDirector />
      <GameHud />
      <CloseCallToast />
      <MainMenu />
      <GameOverModal />
      <SettingsModal />
      <OrientationGuard />
    </main>
  );
}
