"use client";

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
    reviewedAt: string | null;
    course: {
        code: string;
        name: string;
        lecturer: { fullName: string };
    };
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("ALL");

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await fetch("/api/reports");
            const data = await res.json();
            setReports(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Raporlar alınamadı:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = filter === "ALL"
        ? reports
        : reports.filter(r => r.status === filter);

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-500/20 text-yellow-400",
        APPROVED: "bg-green-500/20 text-green-400",
        REJECTED: "bg-red-500/20 text-red-400",
    };

    const statusLabels: Record<string, string> = {
        PENDING: "Bekliyor",
        APPROVED: "Onaylandı",
        REJECTED: "Reddedildi",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Rapor Yönetimi</h1>
                    <p className="text-slate-400">Tüm sınav raporlarını görüntüleyin</p>
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                    {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === status
                                    ? "bg-blue-500 text-white"
                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                }`}
                        >
                            {status === "ALL" ? "Tümü" : statusLabels[status]}
                            {status !== "ALL" && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-white/20">
                                    {reports.filter(r => r.status === status).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Toplam Rapor" value={reports.length} color="blue" />
                <StatCard label="Bekleyen" value={reports.filter(r => r.status === "PENDING").length} color="yellow" />
                <StatCard label="Onaylanan" value={reports.filter(r => r.status === "APPROVED").length} color="green" />
                <StatCard label="Reddedilen" value={reports.filter(r => r.status === "REJECTED").length} color="red" />
            </div>

            {/* Reports Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700 bg-slate-800">
                            <th className="text-left p-4 text-sm font-medium text-slate-400">Ders</th>
                            <th className="text-left p-4 text-sm font-medium text-slate-400">Dönem</th>
                            <th className="text-left p-4 text-sm font-medium text-slate-400">Öğretim Üyesi</th>
                            <th className="text-center p-4 text-sm font-medium text-slate-400">Öğrenci</th>
                            <th className="text-center p-4 text-sm font-medium text-slate-400">Ortalama</th>
                            <th className="text-center p-4 text-sm font-medium text-slate-400">Min/Max</th>
                            <th className="text-center p-4 text-sm font-medium text-slate-400">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredReports.length > 0 ? (
                            filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-700/30">
                                    <td className="p-4">
                                        <div>
                                            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded font-mono mr-2">
                                                {report.course?.code}
                                            </span>
                                            <span className="text-white">{report.course?.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded">
                                            {report.term}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-300">{report.course?.lecturer?.fullName}</td>
                                    <td className="p-4 text-center text-white font-medium">{report.studentCnt}</td>
                                    <td className="p-4 text-center">
                                        <span className="text-lg font-bold text-blue-400">{report.avgScore}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-red-400">{report.minScore}</span>
                                        <span className="text-slate-500 mx-1">/</span>
                                        <span className="text-green-400">{report.maxScore}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[report.status]}`}>
                                            {statusLabels[report.status]}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-400">
                                    {filter === "ALL" ? "Henüz rapor bulunmuyor." : `${statusLabels[filter]} durumunda rapor yok.`}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        green: "bg-green-500/20 text-green-400 border-green-500/30",
        red: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    return (
        <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-400">{label}</p>
        </div>
    );
}
