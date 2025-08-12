import { useViewManager } from "../../hooks/useViewManager";

/**
 * Custom hook that provides pathname-like functionality using useViewManager
 * instead of React Router's useLocation
 */
export function usePathname() {
  const viewManager = useViewManager();
  
  const getCurrentPath = () => {
    const { module, submodule } = viewManager.activeView;
    if (!module) return "/";
    if (!submodule) return `/${module}`;
    return `/${module}/${submodule}`;
  };

  return {
    pathname: getCurrentPath(),
    viewManager
  };
} 