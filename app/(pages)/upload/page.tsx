'use client';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UploadForm } from '@/components/dashboard/UploadForm';

export default function UploadPage() {
    return (
        <TooltipProvider>
            <SidebarProvider>
                <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <main className="flex-1 overflow-auto bg-[#fafafa]">
                        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white/50 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6">
                            <SidebarTrigger className="-ml-1" />
                            <div className="flex-1">
                                <h1 className="text-sm font-medium text-muted-foreground">Upload Documents</h1>
                            </div>
                        </div>

                        <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-8 mt-12">
                            <div className="space-y-4 text-center">
                                <h2 className="text-3xl font-bold tracking-tight">Upload Center</h2>
                                <p className="text-muted-foreground">
                                    Quickly upload and process your PDF documents.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <UploadForm />

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Note</h3>
                                    <p className="text-sm text-blue-700 leading-relaxed">
                                        Upload relevant documents like Resume/CV, Cover Letter, Project Overview etc keep it simple.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    );
}
