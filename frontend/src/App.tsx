import { useViewManager } from "./hooks/useViewManager";
import { PrimarySidebar } from "./components/navigation/PrimarySidebar";
import { TopBar } from "./components/layout/TopBar";
import { ContentPane } from "./components/layout/ContentPane";

export function App() {
  const viewManager = useViewManager();

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <PrimarySidebar activeModule={viewManager.activeView.module} onModuleSelect={viewManager.setActiveModule} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activeModule={viewManager.activeView.module}
          activeSubmodule={viewManager.activeView.submodule}
          onSubmoduleSelect={viewManager.setActiveSubmodule}
          onDashboardSelect={viewManager.goToDashboard}
        />

        <ContentPane
          activeView={viewManager.activeView}
          onNavigate={viewManager.setActiveSubmodule}
          onModuleSelect={viewManager.setActiveModule}
        />
      </div>
    </div>
  );
}