import { useEffect } from 'react';
import { PlantCanvas } from './components/three/PlantCanvas';
import { TopHeader } from './components/ui/TopHeader';
import { StationQuickDock } from './components/ui/StationQuickDock';
import { AssetAndHseInspectorCard } from './components/ui/AssetAndHseInspectorCard';
import { ExecutiveChallengeHUD } from './components/ui/ExecutiveChallengeHUD';
import { RightAnalyticsDrawer } from './components/ui/RightAnalyticsDrawer';
import { FortyExcelsModal } from './components/ui/FortyExcelsModal';
import { SapPmModal } from './components/ui/SapPmModal';
import { useSimulationStore } from './store/simulationStore';

export function App() {
  const rightDrawerOpen = useSimulationStore((s) => s.rightDrawerOpen);
  const setFortyExcelsModalOpen = useSimulationStore((s) => s.setFortyExcelsModalOpen);
  const setSapModalOpen = useSimulationStore((s) => s.setSapModalOpen);
  const setChallengeScorecardOpen = useSimulationStore((s) => s.setChallengeScorecardOpen);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFortyExcelsModalOpen(false);
        setSapModalOpen(false);
        setChallengeScorecardOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setFortyExcelsModalOpen, setSapModalOpen, setChallengeScorecardOpen]);

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-[var(--ce-bg-page)] text-[var(--ce-text-primary)]">
      <TopHeader />

      <main className="flex-1 flex relative overflow-hidden">
        {/* 85%+ Pure Interactive 3D Stage */}
        <div className="flex-1 relative h-full overflow-hidden">
          <PlantCanvas />

          {/* Top-Left Contextual Card (Appears ONLY when clicking a machine or HSE incident) */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <AssetAndHseInspectorCard />
          </div>

          {/* Top-Right Compact Playable 3-Mission Challenge (Hidden if deep analytics drawer is open) */}
          {!rightDrawerOpen && (
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
              <ExecutiveChallengeHUD />
            </div>
          )}

          {/* Bottom Configurator Quick-Jump Dock (Keys 0-8 + Emergency Spawner) */}
          <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none flex justify-center">
            <StationQuickDock />
          </div>
        </div>

        {/* Optional Deep Analytics Drawer (Closed by default to prevent visual saturation) */}
        <RightAnalyticsDrawer />
      </main>

      {/* Modals */}
      <FortyExcelsModal />
      <SapPmModal />
    </div>
  );
}

export default App;
