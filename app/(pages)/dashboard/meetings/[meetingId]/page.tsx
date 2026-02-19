// app/(pages)/dashboard/meetings/[meetingId]/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { STORAGE_KEYS } from '@/lib/storage';
import { MeetingOverviewResponse } from '@/lib/types';
import { ChevronLeft, Loader2, FileText, Share2, Download, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { markdownToHtml } from '@/lib/markdown';
import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function MeetingDetailsPage() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { meetingId } = useParams();
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!contentRef.current || downloading) return;

        try {
            setDownloading(true);
            const element = contentRef.current;

            // Temporary styles for capture to ensure consistent width
            const originalStyle = element.style.width;
            element.style.width = '800px'; // Fixed width for consistent scaling

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 800
            });

            // Restore original style
            element.style.width = originalStyle;

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = pdfWidth;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`meeting-overview-${meetingId}.pdf`);
        } catch (err) {
            console.error('Error generating PDF:', err);
        } finally {
            setDownloading(false);
        }
    };

    const fetchOverview = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            if (!token) {
                setError('No authentication token found');
                return;
            }

            const response = await fetch('/api/v1/meeting/overview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ meetingId }),
            });

            if (response.status === 401) {
                logout();
                return;
            }

            const data: MeetingOverviewResponse = await response.json();

            if (data.success && data.data) {
                setContent(data.data);
            } else {
                setError(data.message || 'Failed to fetch meeting overview');
            }
        } catch (err) {
            console.error('Error fetching meeting overview:', err);
            setError('Failed to fetch meeting overview');
        } finally {
            setLoading(false);
        }
    }, [logout, meetingId]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && meetingId) {
            fetchOverview();
        }
    }, [user, meetingId, fetchOverview]);

    if (authLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="dash-fade-in flex flex-col gap-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/meetings"
                        className="inline-flex items-center justify-center rounded-lg border border-[var(--dash-border)] bg-white p-2 hover:bg-[#fafafa] transition-all"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-[var(--dash-text)]">Meeting Details</h1>
                        <p className="text-sm text-[var(--dash-text-muted)] font-mono">{meetingId}</p>
                    </div>
                </div>
                {/* <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        disabled={downloading || !content}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {downloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        {downloading ? 'Generating...' : 'Download'}
                    </button>
                </div> */}
            </div>

            {error && (
                <div className="dash-section dash-fade-in">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--dash-state-critical)]/20 bg-[var(--dash-state-critical)]/5">
                        <p className="text-[13px] text-[var(--dash-state-critical)] flex-1">{error}</p>
                        <button
                            onClick={fetchOverview}
                            className="text-[13px] font-medium text-[var(--dash-state-critical)] hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="rounded-2xl border border-[var(--dash-border)] bg-white shadow-sm min-h-[500px] flex flex-col">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-12">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                        <p className="text-sm text-[var(--dash-text-muted)] animate-pulse">Generating your meeting intelligence...</p>
                    </div>
                ) : content ? (
                    <div className="p-8 lg:p-12" ref={contentRef}>
                        <div className="prose prose-slate max-w-none">
                            <div
                                className="text-[var(--dash-text)] leading-relaxed font-sans text-base"
                                dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
                            />
                        </div>
                    </div>
                ) : !error && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12 text-center">
                        <div className="p-4 rounded-full bg-gray-50">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-base font-medium text-[var(--dash-text)]">No overview available</p>
                            <p className="text-sm text-[var(--dash-text-muted)] max-w-xs mx-auto">
                                We couldn&apos;t find an analysis for this meeting. Please try again later.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
