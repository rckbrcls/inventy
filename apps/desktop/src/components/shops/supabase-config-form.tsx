import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export interface SupabaseConfig {
  projectUrl: string
  apiKey: string
  databaseName: string
  port?: number
}

interface SupabaseConfigFormProps {
  config: SupabaseConfig
  onChange: (config: SupabaseConfig) => void
}

export function SupabaseConfigForm({ config, onChange }: SupabaseConfigFormProps) {
  const handleChange = (field: keyof SupabaseConfig, value: string | number) => {
    onChange({
      ...config,
      [field]: value,
    })
  }

  const generateConnectionString = (): string => {
    if (!config.projectUrl || !config.apiKey) {
      return ""
    }
    
    try {
      const port = config.port || 5432
      // Extract host from project URL (e.g., https://xxx.supabase.co -> xxx.supabase.co)
      const url = new URL(config.projectUrl)
      const host = url.hostname.replace(/^https?:\/\//, "").replace(/\.supabase\.co$/, "")
      
      if (!host) {
        return ""
      }
      
      // Supabase connection string format:
      // postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
      return `postgresql://postgres:${encodeURIComponent(config.apiKey)}@db.${host}.supabase.co:${port}/${config.databaseName || "postgres"}`
    } catch {
      return ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="projectUrl">
          Supabase Project URL <span className="text-destructive">*</span>
        </Label>
        <Input
          id="projectUrl"
          type="url"
          value={config.projectUrl}
          onChange={(e) => handleChange("projectUrl", e.target.value)}
          placeholder="https://xxx.supabase.co"
          required
        />
        <p className="text-xs text-muted-foreground">
          Your Supabase project URL (found in Project Settings)
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="apiKey">
          Database Password / API Key <span className="text-destructive">*</span>
        </Label>
        <Input
          id="apiKey"
          type="password"
          value={config.apiKey}
          onChange={(e) => handleChange("apiKey", e.target.value)}
          placeholder="Your database password"
          required
        />
        <p className="text-xs text-muted-foreground">
          Your Supabase database password (found in Database Settings)
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="databaseName">Database Name</Label>
        <Input
          id="databaseName"
          value={config.databaseName}
          onChange={(e) => handleChange("databaseName", e.target.value)}
          placeholder="postgres"
        />
        <p className="text-xs text-muted-foreground">
          Database name (usually "postgres" for Supabase)
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="port">Port</Label>
        <Input
          id="port"
          type="number"
          value={config.port || 5432}
          onChange={(e) => handleChange("port", parseInt(e.target.value) || 5432)}
          placeholder="5432"
        />
        <p className="text-xs text-muted-foreground">
          Database port (default: 5432)
        </p>
      </div>

      <div className="grid gap-2">
        <Label>Connection String (Generated)</Label>
        <Textarea
          value={generateConnectionString()}
          readOnly
          className="font-mono text-xs"
          rows={2}
        />
        <p className="text-xs text-muted-foreground">
          This connection string will be stored securely
        </p>
      </div>
    </div>
  )
}
