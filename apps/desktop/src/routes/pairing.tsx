import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Smartphone, Tablet } from "lucide-react"

export const Route = createFileRoute("/pairing")({
  component: Pairing,
})

function Pairing() {
  const [pin, setPin] = React.useState("8291");
  const [isRegenerating, setIsRegenerating] = React.useState(false);

  const regeneratePin = () => {
    setIsRegenerating(true);
    // Simulate API call
    setTimeout(() => {
      setPin(Math.floor(1000 + Math.random() * 9000).toString());
      setIsRegenerating(false);
    }, 800)
  }

  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Connect Device</h2>
        <p className="text-muted-foreground">
          Use the mobile app to scan the network or enter the PIN below.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-sm uppercase text-muted-foreground tracking-wider">Pairing PIN</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="text-7xl font-mono font-bold tracking-[1rem] text-primary">
            {pin}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Broadcasting via mDNS
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button variant="outline" onClick={regeneratePin} disabled={isRegenerating}>
            {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Regenerate PIN
          </Button>
        </CardFooter>
      </Card>

      <div className="w-full max-w-md space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">Connected Devices</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Samsung Galaxy S22</div>
                <div className="text-xs text-muted-foreground">Connected 2m ago</div>
              </div>
            </div>
            <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Tablet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">iPad Pro</div>
                <div className="text-xs text-muted-foreground">Connected 15m ago</div>
              </div>
            </div>
            <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</div>
          </div>
        </div>
      </div>
    </div>
  )
}
