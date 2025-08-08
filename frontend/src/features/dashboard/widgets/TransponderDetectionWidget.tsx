import { Play, Radio, Square, Zap } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

interface ITransponderDetectionWidgetProps {
    autoDetected: boolean;
    isTransponderActive: boolean;
    setIsTransponderActive: (active: boolean) => void;
    setAutoDetected: (detected: boolean) => void;
}

export function TransponderDetectionWidget({ autoDetected, isTransponderActive, setIsTransponderActive, setAutoDetected }: ITransponderDetectionWidgetProps) {
    return (
        <>
            {autoDetected && !isTransponderActive && (
                <Card className="bg-green-600/10 border-green-600/30 flex-shrink-0">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <div className="text-white font-semibold">Simulator Session Detected</div>
                                    <div className="text-green-300 text-sm">iRacing session active - Ready to start recording</div>
                                </div>
                            </div>
                            <Button
                                onClick={() => {
                                    setIsTransponderActive(true)
                                    setAutoDetected(false)
                                }}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Start Recording
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )
            }
            {/* Live Transponder Status */}
            <Card className="bg-zinc-900/50 border-zinc-800 flex-shrink-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center">
                                <Radio
                                    className={`w-6 h-6 ${isTransponderActive ? "text-red-500 animate-pulse" : "text-zinc-500"}`}
                                />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Live Transponder</h2>
                                <p className="text-zinc-400">
                                    {isTransponderActive ? "Recording active session data" : "Ready to capture live telemetry"}
                                </p>
                            </div>
                            <Badge
                                variant={isTransponderActive ? "default" : "secondary"}
                                className={isTransponderActive ? "bg-red-600 animate-pulse" : ""}
                            >
                                {isTransponderActive ? "RECORDING" : "STANDBY"}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" asChild className="border-zinc-600 bg-transparent">
                                <a href="/porsche/transponder">View Details</a>
                            </Button>
                            <Button
                                onClick={() => setIsTransponderActive(!isTransponderActive)}
                                className={
                                    isTransponderActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                                }
                            >
                                {isTransponderActive ? (
                                    <>
                                        <Square className="w-4 h-4 mr-2" />
                                        Stop Recording
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Start Recording
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>

    )
}
