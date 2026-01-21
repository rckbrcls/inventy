import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"
import { toast } from "sonner"
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { MovementsTable } from "@/components/tables/movements-table"
import { InventoryLevelsRepository } from "@/lib/db/repositories/inventory-levels-repository"
import { ProductsRepository, Product } from "@/lib/db/repositories/products-repository"
import { LocationsRepository, Location } from "@/lib/db/repositories/locations-repository"

export const Route = createFileRoute("/movements")({
  component: MovementsRoute,
})

function MovementsRoute() {
  const [activeTab, setActiveTab] = React.useState("list")
  const [isSaving, setIsSaving] = React.useState(false)
  const [products, setProducts] = React.useState<Product[]>([])
  const [locations, setLocations] = React.useState<Location[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Adjust Stock Form
  const [adjustForm, setAdjustForm] = React.useState({
    product_id: "",
    location_id: "",
    new_quantity: "",
    reason: "",
  })

  // Transfer Stock Form
  const [transferForm, setTransferForm] = React.useState({
    product_id: "",
    from_location_id: "",
    to_location_id: "",
    quantity: "",
    reason: "",
  })

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [productsList, locationsList] = await Promise.all([
          ProductsRepository.list(),
          LocationsRepository.list(),
        ])
        setProducts(productsList)
        setLocations(locationsList)
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load products and locations")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAdjustChange = (field: string, value: string) => {
    setAdjustForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleTransferChange = (field: string, value: string) => {
    setTransferForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!adjustForm.product_id || !adjustForm.location_id) {
      toast.error("Please select a product and location")
      return
    }

    if (!adjustForm.new_quantity) {
      toast.error("Please enter the new quantity")
      return
    }

    try {
      setIsSaving(true)

      await InventoryLevelsRepository.adjustStock({
        product_id: adjustForm.product_id,
        location_id: adjustForm.location_id,
        new_quantity: parseFloat(adjustForm.new_quantity),
        reason: adjustForm.reason || undefined,
      })

      toast.success("Stock adjusted successfully")
      setAdjustForm({
        product_id: "",
        location_id: "",
        new_quantity: "",
        reason: "",
      })
      setActiveTab("list")
    } catch (error) {
      console.error("Failed to adjust stock:", error)
      toast.error(typeof error === "string" ? error : "Failed to adjust stock")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transferForm.product_id || !transferForm.from_location_id || !transferForm.to_location_id) {
      toast.error("Please select a product, source and destination locations")
      return
    }

    if (transferForm.from_location_id === transferForm.to_location_id) {
      toast.error("Source and destination locations must be different")
      return
    }

    if (!transferForm.quantity || parseFloat(transferForm.quantity) <= 0) {
      toast.error("Please enter a valid quantity")
      return
    }

    try {
      setIsSaving(true)

      await InventoryLevelsRepository.transferStock({
        product_id: transferForm.product_id,
        from_location_id: transferForm.from_location_id,
        to_location_id: transferForm.to_location_id,
        quantity: parseFloat(transferForm.quantity),
        reason: transferForm.reason || undefined,
      })

      toast.success("Stock transferred successfully")
      setTransferForm({
        product_id: "",
        from_location_id: "",
        to_location_id: "",
        quantity: "",
        reason: "",
      })
      setActiveTab("list")
    } catch (error) {
      console.error("Failed to transfer stock:", error)
      toast.error(typeof error === "string" ? error : "Failed to transfer stock")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">Inventory Movements</h3>
        <p className="text-sm text-muted-foreground">
          View movement history, adjust stock levels, or transfer between locations.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Movement History</TabsTrigger>
          <TabsTrigger value="adjust">Adjust Stock</TabsTrigger>
          <TabsTrigger value="transfer">Transfer Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <MovementsTable />
        </TabsContent>

        <TabsContent value="adjust" className="mt-4">
          <form onSubmit={handleAdjustSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownLeft className="h-5 w-5 text-green-500" />
                  <ArrowUpRight className="h-5 w-5 text-red-500" />
                  Adjust Stock
                </CardTitle>
                <CardDescription>
                  Adjust the stock quantity for a product at a specific location.
                  Use this for inventory counts, corrections, or shrinkage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="adjust-product">
                      Product <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={adjustForm.product_id}
                      onValueChange={(value) => handleAdjustChange("product_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="adjust-location">
                      Location <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={adjustForm.location_id}
                      onValueChange={(value) => handleAdjustChange("location_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name} ({location.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="adjust-new-quantity">
                    New Quantity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="adjust-new-quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    value={adjustForm.new_quantity}
                    onChange={(e) => handleAdjustChange("new_quantity", e.target.value)}
                    placeholder="Enter the new total quantity"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the actual quantity counted. A movement will be created for the difference.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="adjust-reason">Reason</Label>
                  <Textarea
                    id="adjust-reason"
                    value={adjustForm.reason}
                    onChange={(e) => handleAdjustChange("reason", e.target.value)}
                    placeholder="e.g., Inventory count, damaged goods, shrinkage"
                    rows={2}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("list")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Adjusting..." : "Adjust Stock"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="transfer" className="mt-4">
          <form onSubmit={handleTransferSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-blue-500" />
                  Transfer Stock
                </CardTitle>
                <CardDescription>
                  Transfer stock from one location to another.
                  Both locations must have inventory levels for the product.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="transfer-product">
                    Product <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={transferForm.product_id}
                    onValueChange={(value) => handleTransferChange("product_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="transfer-from">
                      From Location <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={transferForm.from_location_id}
                      onValueChange={(value) => handleTransferChange("from_location_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Source location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name} ({location.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="transfer-to">
                      To Location <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={transferForm.to_location_id}
                      onValueChange={(value) => handleTransferChange("to_location_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Destination location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name} ({location.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="transfer-quantity">
                    Quantity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="transfer-quantity"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={transferForm.quantity}
                    onChange={(e) => handleTransferChange("quantity", e.target.value)}
                    placeholder="Quantity to transfer"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="transfer-reason">Reason</Label>
                  <Textarea
                    id="transfer-reason"
                    value={transferForm.reason}
                    onChange={(e) => handleTransferChange("reason", e.target.value)}
                    placeholder="e.g., Stock rebalancing, store replenishment"
                    rows={2}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("list")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Transferring..." : "Transfer Stock"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
