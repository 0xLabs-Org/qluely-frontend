// app/(pages)/dashboard/meetings/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { STORAGE_KEYS } from '@/lib/storage';
import { Meeting, MeetingsResponse } from '@/lib/types';
import { Calendar, MessageSquare, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function MeetingsPage() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const limit = 10;

    const fetchMeetings = useCallback(async (pageNum: number) => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            if (!token) {
                setError('No authentication token found');
                return;
            }

            const response = await fetch(`/api/v1/meetings?page=${pageNum}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                logout();
                return;
            }

            const data: MeetingsResponse = await response.json();

            if (data.success && data.data) {
                setMeetings(data.data.meetings);
                setTotal(data.data.total);
            } else {
                setError(data.message || 'Failed to fetch meetings');
            }
        } catch (err) {
            console.error('Error fetching meetings:', err);
            setError('Failed to fetch meetings');
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchMeetings(page);
        }
    }, [user, page, fetchMeetings]);

    const totalPages = Math.ceil(total / limit);

    if (authLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="dash-fade-in flex flex-col gap-6">
            <div className="dash-greeting">
                <h1 className="dash-greeting__title">Your Meetings</h1>
                <p className="dash-greeting__subtitle">
                    Manage and review your recorded meetings.
                </p>
            </div>

            {error && (
                <div className="dash-section dash-fade-in">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--dash-state-critical)]/20 bg-[var(--dash-state-critical)]/5">
                        <p className="text-[13px] text-[var(--dash-state-critical)] flex-1">{error}</p>
                        <button
                            onClick={() => fetchMeetings(page)}
                            className="text-[13px] font-medium text-[var(--dash-state-critical)] hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-[var(--dash-border)] bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[var(--dash-border)] bg-[#fafafa]">
                                <th className="px-6 py-4 font-semibold text-[var(--dash-text-muted)]">Meeting ID</th>
                                <th className="px-6 py-4 font-semibold text-[var(--dash-text-muted)]">Date</th>
                                <th className="px-6 py-4 font-semibold text-[var(--dash-text-muted)]">Requests</th>
                                <th className="px-6 py-4 font-semibold text-[var(--dash-text-muted)] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--dash-border)]">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-100 rounded"></div></td>
                                        <td className="px-6 py-4 flex justify-end"><div className="h-8 w-20 bg-gray-100 rounded"></div></td>
                                    </tr>
                                ))
                            ) : meetings.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-[var(--dash-text-muted)]">
                                        No meetings found. Start a new meeting to see it here!
                                    </td>
                                </tr>
                            ) : (
                                meetings.map((meeting) => (
                                    <tr key={meeting.id} className="hover:bg-[#fafafa] transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-[var(--dash-text)]">
                                            {meeting.id}
                                        </td>
                                        <td className="px-6 py-4 text-[var(--dash-text)]">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-[var(--dash-text-muted)]" />
                                                {new Date(meeting.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--dash-text)]">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-3 w-3 text-[var(--dash-text-muted)]" />
                                                {meeting._count?.Request ?? 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {meeting._count?.Request!! > 5 ? <button
                                                className="text-[13px] font-medium bg-blue-600 hover:bg-blue-500  text-white px-2 py-1 rounded"
                                                onClick={() => router.push(`/dashboard/meetings/${meeting.id}`)}
                                            >
                                                View Details
                                            </button> : <button
                                                className="text-[13px] font-medium"
                                            >
                                                No Overview
                                            </button>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > limit && (
                    <div className="flex items-center justify-between px-6 py-4 bg-[#fafafa] border-t border-[var(--dash-border)] text-xs text-[var(--dash-text-muted)]">
                        <div>
                            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of <span className="font-medium">{total}</span> meetings
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1 || loading}
                                onClick={() => setPage(page - 1)}
                                className="inline-flex items-center justify-center rounded-lg border border-[var(--dash-border)] bg-white p-2 hover:bg-[#fafafa] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                disabled={page >= totalPages || loading}
                                onClick={() => setPage(page + 1)}
                                className="inline-flex items-center justify-center rounded-lg border border-[var(--dash-border)] bg-white p-2 hover:bg-[#fafafa] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
