import { createFileRoute } from "@tanstack/react-router"
import { useTheme } from "@/components/theme-provider"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { SettingsRepository } from "@/lib/db/repositories/settings-repository"

export const Route = createFileRoute("/settings")({
  component: Settings,
})

function Settings() {
  const { theme, setTheme } = useTheme()
  const [organizationName, setOrganizationName] = useState("")
  const [ownerEmail, setOwnerEmail] = useState("")
  const [serverPort, setServerPort] = useState("3000")
  const [serverProtocol, setServerProtocol] = useState("http")
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingNetwork, setIsSavingNetwork] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const settings = await SettingsRepository.getAll()
      if (settings.organization_name !== undefined) {
        setOrganizationName(settings.organization_name)
      }
      if (settings.owner_email !== undefined) {
        setOwnerEmail(settings.owner_email)
      }
      if (settings.server_port !== undefined) {
        setServerPort(settings.server_port)
      }
      if (settings.server_protocol !== undefined) {
        setServerProtocol(settings.server_protocol)
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveProfile() {
    try {
      setIsSavingProfile(true)
      await SettingsRepository.set("organization_name", organizationName)
      await SettingsRepository.set("owner_email", ownerEmail)
      await loadSettings()
      toast.success("Profile saved successfully")
    } catch (error) {
      console.error("Failed to save profile:", error)
      toast.error("Failed to save profile")
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleSaveNetwork() {
    try {
      setIsSavingNetwork(true)
      await SettingsRepository.set("server_port", serverPort)
      await SettingsRepository.set("server_protocol", serverProtocol)
      await loadSettings()
      toast.success("Network settings saved")
    } catch (error) {
      console.error("Failed to save network settings:", error)
      toast.error("Failed to save network settings")
    } finally {
      setIsSavingNetwork(false)
    }
  }

  async function handleRestartServer() {
    console.log("Restarting server with:", { serverPort, serverProtocol });
    // TODO: Implement actual restart logic
    alert("Server restart triggering...");
  }

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your store preferences and network configuration.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Profile</CardTitle>
            <CardDescription>
              This is how your organization will appear to connected devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="organization-name">Organization Name</Label>
              <Input
                id="organization-name"
                placeholder="My Organization"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="owner-email">Owner Email</Label>
              <Input
                id="owner-email"
                type="email"
                placeholder="owner@example.com"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Configuration</CardTitle>
            <CardDescription>
              Advanced settings for the local sync server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="port">Server Port</Label>
                <Input
                  id="port"
                  value={serverPort}
                  onChange={(e) => setServerPort(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="protocol">Protocol</Label>
                <Select
                  value={serverProtocol}
                  onValueChange={setServerProtocol}
                >
                  <SelectTrigger id="protocol">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="https">HTTPS (Web SSL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-md bg-muted p-4">
              <div className="text-sm font-medium">Local IP Address</div>
              <div className="text-xs text-muted-foreground break-all">
                The server is running at:{" "}
                <span className="font-mono text-foreground">
                  {serverProtocol}://192.168.1.50:{serverPort}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex w-full gap-2 justify-start">
              <Button onClick={handleSaveNetwork} disabled={isSavingNetwork}>
                {isSavingNetwork ? "Saving..." : "Save Configuration"}
              </Button>
              <Button variant="destructive" onClick={handleRestartServer}>
                Restart Server
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Theme</Label>
              <Select
                value={theme}
                onValueChange={(val) => setTheme(val as "light" | "dark" | "system")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
