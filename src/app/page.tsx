import { GameCanvasLoader } from "@/components/canvas/GameCanvasLoader";
import { AudioDirector } from "@/components/ui/AudioDirector";
import { CloseCallToast } from "@/components/ui/CloseCallToast";
import { ComboMeter } from "@/components/ui/ComboMeter";
import { GameHud } from "@/components/ui/GameHud";
import { GameOverModal } from "@/components/ui/GameOverModal";
import { HeatHud } from "@/components/ui/HeatHud";
import { KickButton } from "@/components/ui/KickButton";
import { MainMenu } from "@/components/ui/MainMenu";
import { OrientationGuard } from "@/components/ui/OrientationGuard";
import { PersistStore } from "@/components/ui/PersistStore";
import { ScorePopLayer } from "@/components/ui/ScorePopLayer";
import { SettingsModal } from "@/components/ui/SettingsModal";
import { SinkToast } from "@/components/ui/SinkToast";

export default function Home() {
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden overscroll-none touch-none">
      <GameCanvasLoader />
      <PersistStore />
      <AudioDirector />
      <GameHud />
      <ComboMeter />
      <HeatHud />
      <ScorePopLayer />
      <CloseCallToast />
      <SinkToast />
      <KickButton />
      <MainMenu />
      <GameOverModal />
      <SettingsModal />
      <OrientationGuard />
    </main>
  );
}
