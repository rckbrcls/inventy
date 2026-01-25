import { createFileRoute } from "@tanstack/react-router"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Shield, User } from "lucide-react"

export const Route = createFileRoute("/users")({
    component: UsersPage,
})

const mockUsers = [
    {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
        status: "active",
    },
    {
        id: "2",
        name: "Manager",
        email: "manager@example.com",
        role: "manager",
        status: "active",
    },
    {
        id: "3",
        name: "Cashier",
        email: "cashier@example.com",
        role: "cashier",
        status: "active",
    },
]

function UsersPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Users</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage system users and their permissions.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 size-4" />
                    Add User
                </Button>
            </div>

            <div className="grid gap-4">
                {mockUsers.map((user) => (
                    <Card key={user.id}>
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarFallback>
                                        {user.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge
                                    variant={user.role === "admin" ? "default" : "secondary"}
                                    className="flex items-center gap-1"
                                >
                                    {user.role === "admin" ? (
                                        <Shield className="size-3" />
                                    ) : (
                                        <User className="size-3" />
                                    )}
                                    {user.role}
                                </Badge>
                                <Badge
                                    variant={user.status === "active" ? "outline" : "secondary"}
                                >
                                    {user.status}
                                </Badge>
                                <Button variant="ghost" size="sm">
                                    Edit
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Users className="size-4 text-muted-foreground" />
                        <CardTitle className="text-base">User Roles</CardTitle>
                    </div>
                    <CardDescription>
                        Available roles and their permissions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="size-4" />
                            <span className="font-medium">Admin</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Full system access
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="size-4" />
                            <span className="font-medium">Manager</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Manage shops and staff
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="size-4" />
                            <span className="font-medium">Cashier</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            POS and checkout access
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
