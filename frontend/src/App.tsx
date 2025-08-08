import { ViewManagerProvider } from "./hooks/useViewManager";
import { ContentPane } from "./components/layout/ContentPane";

export function App() {
  return (
    <ViewManagerProvider>
      <div>
        <ContentPane />
      </div>
    </ViewManagerProvider>
  );
}