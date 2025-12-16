"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
    id: string;
    code: string;
    name: string;
}

interface Report {
    id: string;
    courseId: string;
    term: string;
    minScore: number;
    maxScore: number;
    avgScore: number;
    studentCnt: number;
    status: string;
    uploadedAt: string;
    course: Course;
}

export default function LecturerReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

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

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
        REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    const statusLabels: Record<string, string> = {
        PENDING: "Onay Bekliyor",
        APPROVED: "Onaylandı",
        REJECTED: "Reddedildi",
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Başarı oranı hesapla (ortalama >= 50 ise başarılı kabul)
    const calculatePassRate = (avg: number) => {
        // Basit tahmin: ortalama 50 üzeri ise %70+ başarı varsayımı
        if (avg >= 70) return 85;
        if (avg >= 60) return 70;
        if (avg >= 50) return 55;
        return 40;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Raporlarım</h1>
                    <p className="text-slate-400">Yüklediğiniz tüm ders raporlarını görüntüleyin</p>
                </div>
                <Link
                    href="/lecturer/upload"
                    className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Yeni Rapor
                </Link>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-white">{reports.length}</p>
                    <p className="text-sm text-slate-400">Toplam Rapor</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <p className="text-2xl font-bold text-green-400">{reports.filter(r => r.status === "APPROVED").length}</p>
                    <p className="text-sm text-slate-400">Onaylanan</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <p className="text-2xl font-bold text-yellow-400">{reports.filter(r => r.status === "PENDING").length}</p>
                    <p className="text-sm text-slate-400">Bekleyen</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-2xl font-bold text-red-400">{reports.filter(r => r.status === "REJECTED").length}</p>
                    <p className="text-sm text-slate-400">Reddedilen</p>
                </div>
            </div>

            {/* Reports List */}
            {reports.length > 0 ? (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700 bg-slate-800">
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Ders</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Dönem</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">İstatistikler</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Durum</th>
                                <th className="text-left p-4 text-sm font-medium text-slate-400">Tarih</th>
                                <th className="text-right p-4 text-sm font-medium text-slate-400">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-700/30">
                                    <td className="p-4">
                                        <div>
                                            <span className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded font-mono mr-2">
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
                                    <td className="p-4">
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-slate-400">Ort: <span className="text-white font-medium">{report.avgScore}</span></span>
                                            <span className="text-slate-400">Öğr: <span className="text-white font-medium">{report.studentCnt}</span></span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs rounded-full border ${statusColors[report.status]}`}>
                                            {statusLabels[report.status]}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-400">
                                        {formatDate(report.uploadedAt)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => setSelectedReport(report)}
                                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                                        >
                                            Detay
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-12 text-center">
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white mb-2">Henüz Rapor Yok</h3>
                    <p className="text-slate-400 mb-4">İlk raporunuzu yükleyerek başlayın.</p>
                    <Link
                        href="/lecturer/upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Rapor Yükle
                    </Link>
                </div>
            )}

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Rapor Detayı</h2>
                                    <p className="text-slate-400 text-sm">{selectedReport.course?.code} - {selectedReport.course?.name}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <p className="text-sm text-slate-400 mb-1">Sınav Türü</p>
                                    <p className="text-lg font-semibold text-white">{selectedReport.term}</p>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <p className="text-sm text-slate-400 mb-1">Durum</p>
                                    <span className={`px-3 py-1 text-sm rounded-full border ${statusColors[selectedReport.status]}`}>
                                        {statusLabels[selectedReport.status]}
                                    </span>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">YÖKAK İstatistikleri</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatBox label="Öğrenci Sayısı" value={selectedReport.studentCnt.toString()} color="blue" />
                                    <StatBox label="Sınıf Ortalaması" value={selectedReport.avgScore.toFixed(1)} color="purple" />
                                    <StatBox label="En Düşük Not" value={selectedReport.minScore.toString()} color="red" />
                                    <StatBox label="En Yüksek Not" value={selectedReport.maxScore.toString()} color="green" />
                                </div>
                            </div>

                            {/* Success Rate */}
                            <div className="bg-slate-700/30 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-medium text-slate-300">Tahmini Başarı Oranı</h4>
                                    <span className={`text-lg font-bold ${calculatePassRate(selectedReport.avgScore) >= 50 ? "text-green-400" : "text-red-400"}`}>
                                        %{calculatePassRate(selectedReport.avgScore)}
                                    </span>
                                </div>
                                <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${calculatePassRate(selectedReport.avgScore) >= 50 ? "bg-green-500" : "bg-red-500"}`}
                                        style={{ width: `${calculatePassRate(selectedReport.avgScore)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Upload Info */}
                            <div className="text-sm text-slate-400">
                                <p>Yüklenme Tarihi: {formatDate(selectedReport.uploadedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
    const colors: Record<string, string> = {
        blue: "bg-blue-500/20 border-blue-500/30",
        purple: "bg-purple-500/20 border-purple-500/30",
        red: "bg-red-500/20 border-red-500/30",
        green: "bg-green-500/20 border-green-500/30",
    };

    return (
        <div className={`p-4 rounded-xl border ${colors[color]}`}>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-400">{label}</p>
        </div>
    );
}
