"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Report {
    id: string;
    term: string;
    minScore: number;
    maxScore: number;
    avgScore: number;
    studentCnt: number;
    status: string;
    uploadedAt: string;
    course: {
        code: string;
        name: string;
        lecturer: { fullName: string };
    };
}

export default function ManagerDashboard() {
    const { data: session } = useSession();
    const [pendingReports, setPendingReports] = useState<Report[]>([]);
    const [recentActions, setRecentActions] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await fetch("/api/reports");
            const data = await res.json();
            const reports = Array.isArray(data) ? data : [];

            setPendingReports(reports.filter((r: Report) => r.status === "PENDING"));
            setRecentActions(reports.filter((r: Report) => r.status !== "PENDING").slice(0, 5));
        } catch (error) {
            console.error("Raporlar alınamadı:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (reportId: string, status: "APPROVED" | "REJECTED") => {
        setProcessing(reportId);
        try {
            const res = await fetch(`/api/reports/${reportId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                const updated = await res.json();
                setPendingReports((prev) => prev.filter((r) => r.id !== reportId));
                setRecentActions((prev) => [updated, ...prev].slice(0, 5));
            }
        } catch (error) {
            console.error("İşlem başarısız:", error);
        } finally {
            setProcessing(null);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Günaydın";
        if (hour < 18) return "İyi günler";
        return "İyi akşamlar";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 rounded-2xl p-8 border border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-green-400 text-sm font-medium mb-1">{getGreeting()}</p>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {session?.user?.fullName || "Müdür Yardımcısı"}
                        </h1>
                        <p className="text-slate-400">
                            Rapor Onay Paneli
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        {pendingReports.length > 0 && (
                            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl px-4 py-2">
                                <p className="text-yellow-400 font-bold text-2xl">{pendingReports.length}</p>
                                <p className="text-yellow-400/70 text-xs">Bekleyen</p>
                            </div>
                        )}
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Reports */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Onay Bekleyen Raporlar
                    </h2>
                </div>

                {pendingReports.length > 0 ? (
                    <div className="divide-y divide-slate-700">
                        {pendingReports.map((report) => (
                            <div key={report.id} className="p-6 hover:bg-slate-700/30 transition-colors">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Report Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded font-mono">
                                                {report.course?.code}
                                            </span>
                                            <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded">
                                                {report.term}
                                            </span>
                                        </div>
                                        <h3 className="text-white font-medium">{report.course?.name}</h3>
                                        <p className="text-slate-400 text-sm">
                                            Yükleyen: {report.course?.lecturer?.fullName}
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-xl font-bold text-white">{report.studentCnt}</p>
                                            <p className="text-xs text-slate-400">Öğrenci</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl font-bold text-blue-400">{report.avgScore}</p>
                                            <p className="text-xs text-slate-400">Ortalama</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm">
                                                <span className="text-red-400">{report.minScore}</span>
                                                <span className="text-slate-500 mx-1">-</span>
                                                <span className="text-green-400">{report.maxScore}</span>
                                            </p>
                                            <p className="text-xs text-slate-400">Min/Max</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction(report.id, "REJECTED")}
                                            disabled={processing === report.id}
                                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Reddet
                                        </button>
                                        <button
                                            onClick={() => handleAction(report.id, "APPROVED")}
                                            disabled={processing === report.id}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {processing === report.id ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            Onayla
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Tüm Raporlar İncelendi!</h3>
                        <p className="text-slate-400">Bekleyen rapor bulunmuyor.</p>
                    </div>
                )}
            </div>

            {/* Recent Actions */}
            {recentActions.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Son İşlemler
                    </h3>
                    <div className="space-y-3">
                        {recentActions.map((report) => (
                            <div key={report.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded font-mono">
                                        {report.course?.code}
                                    </span>
                                    <span className="text-white">{report.course?.name}</span>
                                    <span className="text-slate-400">- {report.term}</span>
                                </div>
                                <span className={`px-3 py-1 text-xs rounded-full ${report.status === "APPROVED"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-red-500/20 text-red-400"
                                    }`}>
                                    {report.status === "APPROVED" ? "Onaylandı" : "Reddedildi"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
