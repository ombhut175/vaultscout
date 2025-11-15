"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  User,
  Settings,
  LogOut,
  Bell,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  BookOpen,
  GraduationCap,
  ShoppingCart,
  Package,
  BarChart3,
  Zap,
  Heart,
  MessageCircle,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SpecimenPageProps {
  title: string;
  theme: "fintech" | "health" | "edtech" | "ecommerce" | "saas" | "social";
  className?: string;
}

const themeConfigs = {
  fintech: {
    brandName: "FinanceApp",
    greeting: "Portfolio Overview",
    description:
      "Monitor your investments and trading performance in real-time.",
    tabs: ["Portfolio", "Trading", "Analytics", "Reports"],
    kpis: [
      {
        title: "Portfolio Value",
        value: "$2,847,392",
        change: "+12.3%",
        trend: "up",
        icon: DollarSign,
      },
      {
        title: "Daily P&L",
        value: "+$23,847",
        change: "+2.1%",
        trend: "up",
        icon: TrendingUp,
      },
      {
        title: "Active Positions",
        value: "47",
        change: "+3",
        trend: "up",
        icon: BarChart3,
      },
      {
        title: "Win Rate",
        value: "73.2%",
        change: "+1.8%",
        trend: "up",
        icon: Activity,
      },
    ],

    tableTitle: "Recent Transactions",
    tableData: [
      {
        id: "TXN-4521",
        status: "Completed",
        type: "AAPL Buy",
        amount: "$12,450.00",
        time: "2 min ago",
        badge: "default",
      },
      {
        id: "TXN-4520",
        status: "Pending",
        type: "TSLA Sell",
        amount: "$8,230.50",
        time: "5 min ago",
        badge: "secondary",
      },
      {
        id: "TXN-4519",
        status: "Failed",
        type: "MSFT Buy",
        amount: "$5,670.25",
        time: "12 min ago",
        badge: "destructive",
      },
    ],

    emptyFirstMessage:
      "No transactions yet. Start trading to see your activity here.",
    emptySearchMessage:
      "No transactions match your search criteria. Try adjusting filters.",
    errorMessage:
      "Failed to load transaction data. Market data may be delayed.",
  },
  health: {
    brandName: "HealthPortal",
    greeting: "Welcome to your health dashboard",
    description:
      "Track your wellness journey and manage your care with confidence.",
    tabs: ["Overview", "Appointments", "Records", "Wellness"],
    kpis: [
      {
        title: "Next Appointment",
        value: "Tomorrow",
        change: "Dr. Smith - Cardiology",
        trend: "neutral",
        icon: Calendar,
      },
      {
        title: "Health Score",
        value: "87/100",
        change: "+5 this week",
        trend: "up",
        icon: Heart,
      },
      {
        title: "Medications",
        value: "3 active",
        change: "All up to date",
        trend: "neutral",
        icon: Plus,
      },
      {
        title: "Steps Today",
        value: "8,247",
        change: "Goal: 10,000",
        trend: "up",
        icon: Activity,
      },
    ],

    tableTitle: "Upcoming Appointments",
    tableData: [
      {
        id: "APT-301",
        status: "Confirmed",
        type: "Dr. Johnson - General",
        amount: "Tomorrow 2:00 PM",
        time: "Confirmed",
        badge: "default",
      },
      {
        id: "APT-302",
        status: "Pending",
        type: "Dr. Lee - Dermatology",
        amount: "Friday 10:30 AM",
        time: "Awaiting confirmation",
        badge: "secondary",
      },
      {
        id: "APT-303",
        status: "Cancelled",
        type: "Dr. Brown - Orthopedic",
        amount: "Next Monday 3:15 PM",
        time: "Patient cancelled",
        badge: "destructive",
      },
    ],

    emptyFirstMessage:
      "No appointments scheduled. Book your first appointment to get started.",
    emptySearchMessage: "No appointments found for your search criteria.",
    errorMessage:
      "Unable to load appointment data. Please contact support if this continues.",
  },
  edtech: {
    brandName: "LearnHub",
    greeting: "Ready to learn something new?",
    description: "Continue your learning journey and unlock your potential.",
    tabs: ["Courses", "Progress", "Assignments", "Community"],
    kpis: [
      {
        title: "Courses Enrolled",
        value: "12",
        change: "+2 this month",
        trend: "up",
        icon: BookOpen,
      },
      {
        title: "Completion Rate",
        value: "78%",
        change: "+15% improvement",
        trend: "up",
        icon: GraduationCap,
      },
      {
        title: "Study Streak",
        value: "23 days",
        change: "Keep it up!",
        trend: "up",
        icon: Activity,
      },
      {
        title: "Certificates",
        value: "5 earned",
        change: "+1 this week",
        trend: "up",
        icon: Star,
      },
    ],

    tableTitle: "Course Progress",
    tableData: [
      {
        id: "CS-101",
        status: "In Progress",
        type: "React Fundamentals",
        amount: "78% Complete",
        time: "Due: Dec 15",
        badge: "secondary",
      },
      {
        id: "CS-102",
        status: "Completed",
        type: "JavaScript Mastery",
        amount: "100% Complete",
        time: "Completed Nov 28",
        badge: "default",
      },
      {
        id: "CS-103",
        status: "Not Started",
        type: "Node.js Backend",
        amount: "0% Complete",
        time: "Starts Jan 5",
        badge: "outline",
      },
    ],

    emptyFirstMessage:
      "Start your learning journey! Enroll in your first course.",
    emptySearchMessage: "No courses match your search. Try different keywords.",
    errorMessage:
      "Oops! We couldn't load your courses. Please refresh and try again.",
  },
  ecommerce: {
    brandName: "ShopCenter",
    greeting: "Your store dashboard",
    description: "Manage your products, orders, and grow your business.",
    tabs: ["Orders", "Products", "Customers", "Analytics"],
    kpis: [
      {
        title: "Total Sales",
        value: "$45,231",
        change: "+20.1% vs last month",
        trend: "up",
        icon: DollarSign,
      },
      {
        title: "Orders Today",
        value: "127",
        change: "+15% from yesterday",
        trend: "up",
        icon: ShoppingCart,
      },
      {
        title: "Products",
        value: "1,247",
        change: "+23 new this week",
        trend: "up",
        icon: Package,
      },
      {
        title: "Customers",
        value: "8,429",
        change: "+201 new signups",
        trend: "up",
        icon: Users,
      },
    ],

    tableTitle: "Recent Orders",
    tableData: [
      {
        id: "ORD-8821",
        status: "Shipped",
        type: "Wireless Headphones",
        amount: "$299.99",
        time: "Order #8821",
        badge: "default",
      },
      {
        id: "ORD-8822",
        status: "Processing",
        type: "Smartphone Case",
        amount: "$24.99",
        time: "Order #8822",
        badge: "secondary",
      },
      {
        id: "ORD-8823",
        status: "Cancelled",
        type: "Laptop Stand",
        amount: "$89.99",
        time: "Order #8823",
        badge: "destructive",
      },
    ],

    emptyFirstMessage: "No orders yet. Share your store to start selling!",
    emptySearchMessage: "No orders found. Try adjusting your search filters.",
    errorMessage: "Unable to load orders. Check your connection and try again.",
  },
  saas: {
    brandName: "CloudDash",
    greeting: "System Overview",
    description:
      "Monitor your application performance and user metrics in real-time.",
    tabs: ["Dashboard", "Analytics", "Users", "Settings"],
    kpis: [
      {
        title: "Active Users",
        value: "12,847",
        change: "+8.2% this month",
        trend: "up",
        icon: Users,
      },
      {
        title: "API Calls",
        value: "2.4M",
        change: "+12% from last week",
        trend: "up",
        icon: Zap,
      },
      {
        title: "Uptime",
        value: "99.97%",
        change: "All systems operational",
        trend: "up",
        icon: Activity,
      },
      {
        title: "Revenue",
        value: "$28,450",
        change: "+18.5% growth",
        trend: "up",
        icon: DollarSign,
      },
    ],

    tableTitle: "System Events",
    tableData: [
      {
        id: "EVT-1001",
        status: "Info",
        type: "Database backup completed",
        amount: "2.3GB backed up",
        time: "5 min ago",
        badge: "default",
      },
      {
        id: "EVT-1002",
        status: "Warning",
        type: "High memory usage detected",
        amount: "Server: web-01",
        time: "12 min ago",
        badge: "secondary",
      },
      {
        id: "EVT-1003",
        status: "Error",
        type: "API rate limit exceeded",
        amount: "Endpoint: /api/users",
        time: "25 min ago",
        badge: "destructive",
      },
    ],

    emptyFirstMessage: "No events to display. Your system is running smoothly.",
    emptySearchMessage: "No events match your criteria.",
    errorMessage: "Failed to load system events. Please check system status.",
  },
  social: {
    brandName: "SocialHub",
    greeting: "What's happening today?",
    description: "Connect with friends and share your moments.",
    tabs: ["Feed", "Messages", "Friends", "Profile"],
    kpis: [
      {
        title: "New Messages",
        value: "23",
        change: "5 unread",
        trend: "neutral",
        icon: MessageCircle,
      },
      {
        title: "Friend Requests",
        value: "7",
        change: "3 pending",
        trend: "neutral",
        icon: Users,
      },
      {
        title: "Posts This Week",
        value: "12",
        change: "+4 from last week",
        trend: "up",
        icon: Edit,
      },
      {
        title: "Likes Received",
        value: "284",
        change: "+47 today",
        trend: "up",
        icon: Heart,
      },
    ],

    tableTitle: "Recent Activity",
    tableData: [
      {
        id: "ACT-501",
        status: "New",
        type: "Sarah liked your photo",
        amount: "Beach vacation post",
        time: "2 min ago",
        badge: "default",
      },
      {
        id: "ACT-502",
        status: "New",
        type: "Mike commented on your post",
        amount: "Weekend plans discussion",
        time: "15 min ago",
        badge: "default",
      },
      {
        id: "ACT-503",
        status: "Read",
        type: "Emma sent you a message",
        amount: "Hey! How are you doing?",
        time: "1 hour ago",
        badge: "outline",
      },
    ],

    emptyFirstMessage: "No activity yet. Start connecting with friends!",
    emptySearchMessage: "No activity found. Try different search terms.",
    errorMessage: "Couldn't load your activity feed. Please try refreshing.",
  },
};

export function SpecimenPage({
  theme,
  className = "",
}: SpecimenPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [tableState, setTableState] = useState<
    "normal" | "loading" | "empty-first" | "empty-search" | "error"
  >("normal");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const config = themeConfigs[theme];

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
    return;
  }, [showToast]);

  const handleAction = async (_action: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setShowToast(true);
  };

  return (
    <TooltipProvider>
      <div
        className={`min-h-screen bg-background transition-colors duration-300 ${className}`}
        data-testid="specimen-page"
      >
        <header
          className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm"
          data-testid="nav"
        >
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary shadow-sm transition-transform hover:scale-105"></div>
                <span className="text-xl font-semibold tracking-tight">
                  {config.brandName}
                </span>
              </div>
            </div>

            <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
              <Tabs
                defaultValue={config.tabs[0].toLowerCase()}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                  {config.tabs.map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab.toLowerCase()}
                      className="transition-all hover:bg-background/80 data-[state=active]:shadow-sm"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </nav>

            <div className="ml-auto flex items-center space-x-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-muted/80 transition-colors"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                      3
                    </span>
                    <span className="sr-only">Notifications</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>3 new notifications</p>
                </TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/diverse-user-avatars.png" alt="User" />

                      <AvatarFallback className="bg-primary text-primary-foreground">
                        JD
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        John Doe
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        john@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover:bg-muted/80 transition-colors">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-muted/80 transition-colors">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover:bg-muted/80 transition-colors">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-8 p-6">
          <section className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {config.greeting}
              </h1>
              <p className="text-lg text-muted-foreground text-pretty max-w-2xl">
                {config.description}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {config.kpis.map((kpi, index) => (
                <Card
                  key={index}
                  className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 border-border/50"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </CardTitle>
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <kpi.icon className="h-4 w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl font-bold tracking-tight">
                        {kpi.value}
                      </div>
                      {kpi.trend === "up" && (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      )}
                      {kpi.trend === "down" && (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {kpi.change}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">
                {config.tableTitle}
              </h2>
              <Button
                className="shadow-sm hover:shadow-md transition-all"
                onClick={() => handleAction("add")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </div>

            <div
              className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border"
              data-testid="toolbar"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />

                  <Input
                    placeholder="Search transactions..."
                    className="pl-10 w-[320px] bg-background shadow-sm focus:shadow-md transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-muted/80 transition-colors bg-transparent"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="transition-all"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>List view</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="transition-all"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Grid view</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <Card className="shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Data Overview</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTableState("normal")}
                      className="text-xs"
                    >
                      Normal
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTableState("loading")}
                      className="text-xs"
                    >
                      Loading
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTableState("empty-first")}
                      className="text-xs"
                    >
                      Empty
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTableState("error")}
                      className="text-xs"
                    >
                      Error
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table data-testid="table-rows">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">
                        Description
                      </TableHead>
                      <TableHead className="font-semibold">Details</TableHead>
                      <TableHead className="text-right font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableState === "loading" && (
                      <>
                        {[...Array(3)].map((_, i) => (
                          <TableRow key={i} className="hover:bg-muted/30">
                            <TableCell>
                              <Skeleton className="h-4 w-[100px]" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-[80px] rounded-full" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-[160px]" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-[120px]" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-8 ml-auto rounded" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}

                    {tableState === "empty-first" && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                              <Plus className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-lg font-medium">
                                Getting started
                              </p>
                              <p className="text-sm text-muted-foreground max-w-sm">
                                {config.emptyFirstMessage}
                              </p>
                            </div>
                            <Button size="sm" className="shadow-sm">
                              Get Started
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {tableState === "empty-search" && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <Search className="h-12 w-12 text-muted-foreground" />

                            <div className="space-y-2">
                              <p className="text-lg font-medium">
                                No results found
                              </p>
                              <p className="text-sm text-muted-foreground max-w-sm">
                                {config.emptySearchMessage}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSearchQuery("")}
                            >
                              Clear search
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {tableState === "error" && (
                      <TableRow>
                        <TableCell colSpan={5} className="p-6">
                          <Alert
                            variant="destructive"
                            className="border-destructive/50"
                          >
                            <AlertCircle className="h-4 w-4" />

                            <AlertDescription className="ml-2">
                              {config.errorMessage}
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-4 bg-transparent"
                                onClick={() => setTableState("normal")}
                              >
                                Retry
                              </Button>
                            </AlertDescription>
                          </Alert>
                        </TableCell>
                      </TableRow>
                    )}

                    {tableState === "normal" && (
                      <>
                        {config.tableData.map((row, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="font-mono text-sm">
                              {row.id}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={row.badge as any}
                                className="shadow-sm"
                              >
                                {row.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {row.type}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              <div className="space-y-1">
                                <div>{row.amount}</div>
                                <div className="text-xs flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />

                                  {row.time}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-muted/80 transition-colors"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />

                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-40"
                                >
                                  <DropdownMenuItem className="hover:bg-muted/80 transition-colors">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive hover:bg-destructive/10 transition-colors">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Quick Actions</h2>

            {/* Enhanced Toast Notification */}
            {showToast && (
              <Alert className="border-green-200 bg-green-50 text-green-800 shadow-sm animate-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="h-4 w-4 text-green-600" />

                <AlertDescription className="flex items-center justify-between">
                  <span>Changes saved successfully!</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowToast(false)}
                    className="h-6 w-6 p-0 hover:bg-green-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Error Banner Example */}
            <Alert variant="destructive" className="shadow-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{config.errorMessage}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4 bg-transparent"
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm hover:shadow-md transition-all">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Item
                </Button>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-[425px] shadow-lg"
                data-testid="dialog-form"
              >
                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-xl">Edit Details</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Make changes here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="item-id" className="text-right font-medium">
                      ID
                    </Label>
                    <Input
                      id="item-id"
                      defaultValue={config.tableData[0]?.id || "#3210"}
                      className="col-span-3 shadow-sm focus:shadow-md transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right font-medium">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      defaultValue={config.tableData[0]?.amount || "$250.00"}
                      className="col-span-3 shadow-sm focus:shadow-md transition-all"
                    />
                  </div>
                  <div className="col-span-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                    Please enter a valid amount.
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    onClick={() => {
                      setDialogOpen(false);
                      handleAction("save");
                    }}
                    className="shadow-sm"
                  >
                    {isLoading ? "Saving..." : "Save changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </section>
        </main>
      </div>
    </TooltipProvider>
  );
}
