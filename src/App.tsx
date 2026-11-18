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
import { useDeviceViewport } from './hooks/useDeviceViewport';

export function App() {
  const { isMobile } = useDeviceViewport();
  const rightDrawerOpen = useSimulationStore((s) => s.rightDrawerOpen);
  const selectedMachineId = useSimulationStore((s) => s.selectedMachineId);
  const selectedHseId = useSimulationStore((s) => s.selectedHseId);
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

  const hasLeftSelection = Boolean(selectedMachineId || selectedHseId);
  const hideChallengeOnMobile = isMobile && hasLeftSelection;

  return (
    <div className="w-screen h-[100dvh] flex flex-col overflow-hidden bg-[var(--ce-bg-page)] text-[var(--ce-text-primary)]">
      <TopHeader />

      <main className="flex-1 flex relative overflow-hidden">
        {/* 85%+ Pure Interactive 3D Stage */}
        <div className="flex-1 relative h-full overflow-hidden">
          <PlantCanvas />

          {/* Top-Left Contextual Card (Appears ONLY when clicking a machine or HSE incident) */}
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 pointer-events-none">
            <AssetAndHseInspectorCard />
          </div>

          {/* Top-Right Compact Playable 3-Mission Challenge (Never overlaps inspector card on mobile) */}
          {!rightDrawerOpen && !hideChallengeOnMobile && (
            <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 pointer-events-none">
              <ExecutiveChallengeHUD />
            </div>
          )}

          {/* Bottom Configurator Quick-Jump Dock (Keys 0-8 + Emergency Spawner) */}
          <div className="absolute bottom-2.5 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 z-10 pointer-events-none flex justify-center">
            <StationQuickDock />
          </div>
        </div>

        {/* Optional Deep Analytics Drawer (Side panel on PC/Laptop, Full Overlay on Tablet/Mobile) */}
        <RightAnalyticsDrawer />
      </main>

      {/* Modals */}
      <FortyExcelsModal />
      <SapPmModal />
    </div>
  );
}

export default App;
