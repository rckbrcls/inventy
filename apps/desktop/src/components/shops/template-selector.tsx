import * as React from "react"
import { Check } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ShopTemplate } from "@/lib/db/repositories/shop-templates-repository"

interface TemplateSelectorProps {
  templates: ShopTemplate[]
  selectedTemplate?: string
  onSelect: (templateCode: string) => void
}

export function TemplateSelector({
  templates,
  selectedTemplate,
  onSelect,
}: TemplateSelectorProps) {
  const getModulesFromTemplate = (template: ShopTemplate) => {
    try {
      if (template.features_config) {
        const config = JSON.parse(template.features_config)
        return Object.keys(config).filter((key) => config[key] === true)
      }
    } catch {
      return []
    }
    return []
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => {
        const isSelected = selectedTemplate === template.code
        const modules = getModulesFromTemplate(template)

        return (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onSelect(template.code)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{template.name}</CardTitle>
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              {template.category && (
                <Badge variant="secondary" className="mt-2 w-fit">
                  {template.category}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {template.description || "No description available"}
              </CardDescription>
              {modules.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Modules included:</p>
                  <div className="flex flex-wrap gap-1">
                    {modules.slice(0, 5).map((module) => (
                      <Badge key={module} variant="outline" className="text-xs">
                        {module}
                      </Badge>
                    ))}
                    {modules.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{modules.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
