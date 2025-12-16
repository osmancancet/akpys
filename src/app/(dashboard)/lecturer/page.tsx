"use client";

import { useSession } from "next-auth/react";
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
    avgScore: number;
    status: string;
    uploadedAt: string;
}

export default function LecturerDashboard() {
    const { data: session } = useSession();
    const [courses, setCourses] = useState<Course[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, reportsRes] = await Promise.all([
                fetch("/api/courses/my"),
                fetch("/api/reports"),
            ]);
            const coursesData = await coursesRes.json();
            const reportsData = await reportsRes.json();
            setCourses(Array.isArray(coursesData) ? coursesData : []);
            setReports(Array.isArray(reportsData) ? reportsData : []);
        } catch (error) {
            console.error("Veriler alınamadı:", error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Günaydın";
        if (hour < 18) return "İyi günler";
        return "İyi akşamlar";
    };

    const pendingCount = reports.filter(r => r.status === "PENDING").length;
    const approvedCount = reports.filter(r => r.status === "APPROVED").length;

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
            <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-rose-600/20 rounded-2xl p-8 border border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-purple-400 text-sm font-medium mb-1">{getGreeting()}</p>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {session?.user?.fullName || "Öğretim Görevlisi"}
                        </h1>
                        <p className="text-slate-400">
                            Ders ve Rapor Yönetimi
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-3xl font-bold text-white">{courses.length}</p>
                    <p className="text-sm text-slate-400">Ders</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4">
                    <p className="text-3xl font-bold text-white">{reports.length}</p>
                    <p className="text-sm text-slate-400">Toplam Rapor</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
                    <p className="text-3xl font-bold text-white">{pendingCount}</p>
                    <p className="text-sm text-slate-400">Bekliyor</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4">
                    <p className="text-3xl font-bold text-white">{approvedCount}</p>
                    <p className="text-sm text-slate-400">Onaylı</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    href="/lecturer/upload"
                    className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 hover:from-blue-500/30 hover:to-purple-500/30 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Excel Yükle</h2>
                            <p className="text-slate-400 text-sm">Sınav sonuçlarını yükleyin ve analiz edin</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/lecturer/my-courses"
                    className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 hover:from-green-500/30 hover:to-emerald-500/30 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Derslerim</h2>
                            <p className="text-slate-400 text-sm">Derslerinizi ve raporlarınızı yönetin</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* How It Works */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Nasıl Çalışır?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Step number={1} title="Excel Hazırlayın" description="Öğrenci numaraları ve notlarını içeren Excel dosyası oluşturun." />
                    <Step number={2} title="Yükleyin" description="Sistem otomatik olarak min, max ve ortalama hesaplar." />
                    <Step number={3} title="Onay Bekleyin" description="Müdür Yardımcısı raporunuzu inceleyip onaylayacak." />
                </div>
            </div>

            {/* Recent Reports */}
            {reports.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Son Raporlarım
                    </h3>
                    <div className="space-y-3">
                        {reports.slice(0, 5).map((report) => {
                            const course = courses.find(c => c.id === report.courseId);
                            return (
                                <div key={report.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded font-mono">
                                            {course?.code || "???"}
                                        </span>
                                        <span className="text-white">{course?.name || "Bilinmeyen Ders"}</span>
                                        <span className="text-slate-400 text-sm">- {report.term}</span>
                                    </div>
                                    <span className={`px-3 py-1 text-xs rounded-full ${report.status === "APPROVED"
                                            ? "bg-green-500/20 text-green-400"
                                            : report.status === "REJECTED"
                                                ? "bg-red-500/20 text-red-400"
                                                : "bg-yellow-500/20 text-yellow-400"
                                        }`}>
                                        {report.status === "APPROVED" ? "Onaylı" : report.status === "REJECTED" ? "Reddedildi" : "Bekliyor"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-bold">
                {number}
            </div>
            <div>
                <p className="text-white font-medium">{title}</p>
                <p className="text-slate-400 text-sm">{description}</p>
            </div>
        </div>
    );
}
