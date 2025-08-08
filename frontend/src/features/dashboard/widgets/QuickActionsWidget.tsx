import { Timer, Activity, Palette, Users, Target } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { useViewManager } from "../../../hooks/useViewManager";

export function QuickActionsWidget() {
    const viewManager = useViewManager();

    const onNavigate = (view: string) => {
        if (view === "dashboard") {
            viewManager.goToDashboard();
        } else {
            viewManager.setActiveSubmodule(view);
        }
    };

    return (
        <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex-shrink-0">
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button 
                    onClick={() => onNavigate("sessions")}
                    className="w-full bg-red-600 hover:bg-red-700 justify-start"
                >
                    <Timer className="w-4 h-4 mr-2" />
                    View All Sessions
                </Button>
                <Button 
                    onClick={() => onNavigate("engineer")}
                    variant="outline" 
                    className="w-full border-zinc-600 bg-transparent justify-start"
                >
                    <Activity className="w-4 h-4 mr-2" />
                    Race Engineer
                </Button>
                <Button 
                    onClick={() => onNavigate("paintshop")}
                    variant="outline" 
                    className="w-full border-zinc-600 bg-transparent justify-start"
                >
                    <Palette className="w-4 h-4 mr-2" />
                    Paint Shop
                </Button>
                <Button 
                    onClick={() => onNavigate("teams")}
                    variant="outline" 
                    className="w-full border-zinc-600 bg-transparent justify-start"
                >
                    <Users className="w-4 h-4 mr-2" />
                    Team Management
                </Button>
                <Button 
                    variant="outline" 
                    className="w-full border-zinc-600 bg-transparent justify-start"
                >
                    <Target className="w-4 h-4 mr-2" />
                    Performance Goals
                </Button>
            </CardContent>
        </Card>
    )
}
