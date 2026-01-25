import { createFileRoute } from "@tanstack/react-router"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"

export const Route = createFileRoute("/templates")({
    component: TemplatesPage,
})

function TemplatesPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Templates</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage document templates for invoices, receipts, and reports.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 size-4" />
                    New Template
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="size-4 text-muted-foreground" />
                            <CardTitle className="text-base">Invoice Template</CardTitle>
                        </div>
                        <CardDescription>
                            Default template for customer invoices
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" size="sm">
                            Edit Template
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="size-4 text-muted-foreground" />
                            <CardTitle className="text-base">Receipt Template</CardTitle>
                        </div>
                        <CardDescription>
                            Template for POS receipts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" size="sm">
                            Edit Template
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="size-4 text-muted-foreground" />
                            <CardTitle className="text-base">Report Template</CardTitle>
                        </div>
                        <CardDescription>
                            Template for sales reports
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" size="sm">
                            Edit Template
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10">
                    <FileText className="size-10 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground text-center">
                        Template customization coming soon.
                        <br />
                        You&apos;ll be able to create and edit document templates here.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
