import { createFileRoute, useNavigate } from "@tanstack/react-router"
import * as React from "react"
import { Check, ChevronsUpDown, Minus, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { InventoryRepository } from "@/lib/db/repositories/inventory-repository"
import { DebtorsRepository } from "@/lib/db/repositories/debtors-repository"
import { PurchasesRepository } from "@/lib/db/repositories/purchases-repository"
import { InventoryItem, Debtor } from "@/lib/db/types"

export const Route = createFileRoute("/transactions/new")({
  component: NewTransaction,
})

type CartItem = InventoryItem & {
  cartQuantity: number
}

function NewTransaction() {
  const navigate = useNavigate()
  const [items, setItems] = React.useState<InventoryItem[]>([])
  const [debtors, setDebtors] = React.useState<Debtor[]>([])
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [selectedDebtorId, setSelectedDebtorId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  // Debtor combobox state
  const [openDebtorBox, setOpenDebtorBox] = React.useState(false)

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedItems, loadedDebtors] = await Promise.all([
          InventoryRepository.getAll(),
          DebtorsRepository.getAll(),
        ])
        setItems(loadedItems)
        setDebtors(loadedDebtors)
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load inventory or debtors")
      }
    }
    loadData()
  }, [])

  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return items
    const lower = searchQuery.toLowerCase()
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.sku?.toLowerCase().includes(lower)
    )
  }, [items, searchQuery])

  const addToCart = (item: InventoryItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i
        )
      }
      return [...prev, { ...item, cartQuantity: 1 }]
    })
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(1, item.cartQuantity + delta)
          return { ...item, cartQuantity: newQty }
        }
        return item
      })
    )
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId))
  }

  const totalAmount = cart.reduce(
    (acc, item) => acc + (item.cartQuantity * (item.selling_price || 0)),
    0
  )

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }

    setIsLoading(true)
    try {
      const cartItemsForDb = cart.map((item) => ({
        itemId: item.id,
        quantity: item.cartQuantity,
        unitPrice: item.selling_price || 0,
      }))

      await PurchasesRepository.create(cartItemsForDb, selectedDebtorId, totalAmount)
      toast.success("Sale completed successfully")
      navigate({ to: "/transactions" })
    } catch (error) {
      console.error("Checkout failed:", error)
      toast.error("Failed to process sale")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4">
      {/* Left Column: Item Selection */}
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items by name or SKU..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="flex-1 rounded-md border p-4">
          <div className="grid grid-cols-2 p-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => addToCart(item)}
              >
                <CardHeader className="px-4">
                  <CardTitle className="text-sm font-medium leading-none">
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                  <div className="text-sm text-muted-foreground">{item.sku}</div>
                  <div className="mt-2 font-bold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.selling_price || 0)}
                  </div>
                  <div className={`mt-1 text-xs ${item.quantity <= 0 ? "text-destructive" : "text-muted-foreground"}`}>
                    Stock: {item.quantity}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                No items found.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Column: Cart & Checkout */}
      <Card className="flex w-[400px] flex-col">
        <CardHeader>
          <CardTitle>Current Sale</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="truncate max-w-[120px]" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(item.selling_price || 0)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-4 text-center text-sm">
                          {item.cartQuantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format((item.selling_price || 0) * item.cartQuantity)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {cart.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Cart is empty
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col gap-4 bg-muted/20 p-6">
          <div className="flex w-full flex-col gap-2">
            <span className="text-sm font-medium">Customer (Optional)</span>
            <Popover open={openDebtorBox} onOpenChange={setOpenDebtorBox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openDebtorBox}
                  className="w-full justify-between"
                >
                  {selectedDebtorId
                    ? debtors.find((d) => d.id === selectedDebtorId)?.name
                    : "Select customer..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0">
                <Command>
                  <CommandInput placeholder="Search customer..." />
                  <CommandList>
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                      {debtors.map((debtor) => (
                        <CommandItem
                          key={debtor.id}
                          value={debtor.name}
                          onSelect={() => {
                            setSelectedDebtorId(
                              debtor.id === selectedDebtorId ? null : debtor.id
                            )
                            setOpenDebtorBox(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedDebtorId === debtor.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {debtor.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex w-full items-center justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalAmount)}
            </span>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={cart.length === 0 || isLoading}
          >
            {isLoading ? "Processing..." : "Complete Sale"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
