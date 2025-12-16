"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
    id: string;
    code: string;
    name: string;
    createdAt: string;
}

interface Report {
    id: string;
    courseId: string;
    term: string;
    avgScore: number;
    status: string;
    uploadedAt: string;
}

export default function MyCoursesPage() {
    const { data: session } = useSession();
    const [courses, setCourses] = useState<Course[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCourse, setNewCourse] = useState({ code: "", name: "" });
    const [submitting, setSubmitting] = useState(false);

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

    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCourse),
            });

            if (res.ok) {
                const course = await res.json();
                setCourses([course, ...courses]);
                setShowAddModal(false);
                setNewCourse({ code: "", name: "" });
            } else {
                const err = await res.json();
                alert(err.error || "Ders eklenemedi");
            }
        } catch (error) {
            console.error("Ders eklenemedi:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const getReportsForCourse = (courseId: string): Report[] => {
        return reports.filter((r) => r.courseId === courseId);
    };

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
                    <h1 className="text-2xl font-bold text-white">Derslerim</h1>
                    <p className="text-slate-400">
                        Merhaba, {session?.user?.fullName || session?.user?.name}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Ders Ekle
                    </button>
                    <Link
                        href="/lecturer/upload"
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Excel Yükle
                    </Link>
                </div>
            </div>

            {/* Courses */}
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {courses.map((course) => {
                        const courseReports = getReportsForCourse(course.id);
                        return (
                            <div key={course.id} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded font-mono">
                                            {course.code}
                                        </span>
                                        <h3 className="text-lg font-semibold text-white mt-2">{course.name}</h3>
                                    </div>
                                    <Link
                                        href={`/lecturer/upload?courseId=${course.id}`}
                                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm transition-colors"
                                    >
                                        Rapor Yükle
                                    </Link>
                                </div>

                                {/* Course Reports */}
                                {courseReports.length > 0 ? (
                                    <div className="space-y-2">
                                        <p className="text-sm text-slate-400 mb-2">Yüklenen Raporlar:</p>
                                        {courseReports.map((report) => (
                                            <div key={report.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded">
                                                        {report.term}
                                                    </span>
                                                    <span className="text-white">Ort: {report.avgScore}</span>
                                                </div>
                                                <span className={`px-2 py-1 text-xs rounded-full ${statusColors[report.status] || statusColors.PENDING}`}>
                                                    {statusLabels[report.status] || statusLabels.PENDING}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm">Henüz rapor yüklenmemiş.</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-12 text-center">
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white mb-2">Henüz Ders Yok</h3>
                    <p className="text-slate-400 mb-4">
                        Henüz ders eklememişsiniz. Hemen ilk dersinizi ekleyin!
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg inline-flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        İlk Dersini Ekle
                    </button>
                </div>
            )}

            {/* Add Course Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold text-white mb-4">Yeni Ders Ekle</h2>
                        <form onSubmit={handleAddCourse} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Ders Kodu</label>
                                <input
                                    type="text"
                                    value={newCourse.code}
                                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white font-mono"
                                    placeholder="MAT101"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Ders Adı</label>
                                <input
                                    type="text"
                                    value={newCourse.name}
                                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                                    placeholder="Matematik I"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {submitting ? "Ekleniyor..." : "Ekle"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
