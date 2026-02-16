import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/AppSidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <TooltipProvider>
            <SidebarProvider>
                <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <main className="flex-1 overflow-auto bg-[#fafafa]">
                        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white/50 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6">
                            <SidebarTrigger className="-ml-1" />
                            <div className="flex-1">
                                <h1 className="text-sm font-medium text-muted-foreground">Dashboard</h1>
                            </div>
                        </div>
                        <div className="p-4 lg:p-8">
                            {children}
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    )
}
