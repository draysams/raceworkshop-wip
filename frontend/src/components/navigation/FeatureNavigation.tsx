
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import {
  Activity,
  Search,
  Bell,
  Settings,
  Home,
  Timer,
  Radio,
  BarChart3,
  Palette,
  Users,
  Badge,
} from "lucide-react"
import { Button } from "../ui/button";
import { useViewManager } from "../../hooks/useViewManager";

export function FeatureNavigation() {
  const viewManager = useViewManager();

  const onNavigate = (view: string) => {
    if (view === "dashboard") {
      viewManager.goToDashboard();
    } else {
      viewManager.setActiveSubmodule(view);
    }
  }

  const navigationItems = [
    { view: "dashboard", label: "Dashboard", icon: Home },
    { view: "sessions", label: "Sessions", icon: Timer },
    { view: "transponder", label: "Transponder", icon: Radio },
    { view: "engineer", label: "Race Engineer", icon: BarChart3 },
    { view: "paintshop", label: "Paint Shop", icon: Palette },
    { view: "teams", label: "Teams", icon: Users },
  ]

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm flex-shrink-0">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Porsche Racing Studio</h1>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = item.view === "dashboard" 
                ? !viewManager.activeView.submodule 
                : viewManager.activeView.submodule === item.view ||
                  (item.view === "sessions" && viewManager.activeView.submodule === "session-detail") ||
                  (item.view === "engineer" && viewManager.activeView.submodule === "engineer")
              return (
                <Button
                  key={item.view}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onNavigate(item.view)}
                  className={
                    isActive
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-600" />
            </Button>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}
