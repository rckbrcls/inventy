import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Module } from "@/lib/db/repositories/modules-repository"

interface ModuleSelectorProps {
  modules: Module[]
  selectedModules: string[]
  onSelectionChange: (modules: string[]) => void
}

const CORE_MODULES = ["products", "customers", "orders", "transactions", "payments"]

export function ModuleSelector({
  modules,
  selectedModules,
  onSelectionChange,
}: ModuleSelectorProps) {
  const groupedModules = React.useMemo(() => {
    const groups: Record<string, Module[]> = {}
    modules.forEach((module) => {
      const category = module.category || "other"
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(module)
    })
    return groups
  }, [modules])

  const handleToggleModule = (moduleCode: string, isCore: boolean) => {
    if (isCore) {
      // Core modules cannot be deselected
      return
    }

    const newSelection = selectedModules.includes(moduleCode)
      ? selectedModules.filter((code) => code !== moduleCode)
      : [...selectedModules, moduleCode]

    onSelectionChange(newSelection)
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedModules).map(([category, categoryModules]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category}</CardTitle>
            <CardDescription>
              Select modules for this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryModules.map((module) => {
                const isCore = CORE_MODULES.includes(module.code)
                const isSelected =
                  isCore || selectedModules.includes(module.code)

                return (
                  <div
                    key={module.id}
                    className="flex items-start space-x-3 rounded-lg border p-3"
                  >
                    <Checkbox
                      id={module.id}
                      checked={isSelected}
                      disabled={isCore}
                      onCheckedChange={() =>
                        handleToggleModule(module.code, isCore)
                      }
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={module.id}
                          className="cursor-pointer font-medium"
                        >
                          {module.name}
                        </Label>
                        {isCore && (
                          <Badge variant="default" className="text-xs">
                            Core
                          </Badge>
                        )}
                      </div>
                      {module.description && (
                        <p className="text-sm text-muted-foreground">
                          {module.description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
