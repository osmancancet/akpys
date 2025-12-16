"use client";

import { useEffect, useState } from "react";

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
}

interface Course {
    id: string;
    code: string;
    name: string;
    lecturerId: string;
    lecturer: User;
    createdAt: string;
}

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCourse, setNewCourse] = useState({ code: "", name: "", lecturerId: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, usersRes] = await Promise.all([
                fetch("/api/courses"),
                fetch("/api/users"),
            ]);
            const coursesData = await coursesRes.json();
            const usersData = await usersRes.json();
            setCourses(Array.isArray(coursesData) ? coursesData : []);
            setUsers(Array.isArray(usersData) ? usersData : []);
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
                setNewCourse({ code: "", name: "", lecturerId: "" });
            }
        } catch (error) {
            console.error("Ders eklenemedi:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm("Bu dersi silmek istediğinize emin misiniz?")) return;

        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setCourses(courses.filter((c) => c.id !== courseId));
            }
        } catch (error) {
            console.error("Ders silinemedi:", error);
        }
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
                    <h1 className="text-2xl font-bold text-white">Ders Yönetimi</h1>
                    <p className="text-slate-400">Sistemdeki dersleri yönetin</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Ders Ekle
                </button>
            </div>

            {/* Courses Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700 bg-slate-800">
                            <th className="text-left p-4 text-sm font-medium text-slate-400">Ders Kodu</th>
                            <th className="text-left p-4 text-sm font-medium text-slate-400">Ders Adı</th>
                            <th className="text-left p-4 text-sm font-medium text-slate-400">Sorumlu Öğretim Üyesi</th>
                            <th className="text-right p-4 text-sm font-medium text-slate-400">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <tr key={course.id} className="hover:bg-slate-700/30">
                                    <td className="p-4">
                                        <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded font-mono">
                                            {course.code}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white font-medium">{course.name}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-medium">
                                                {course.lecturer?.fullName?.charAt(0) || "?"}
                                            </div>
                                            <span className="text-slate-300">{course.lecturer?.fullName || "Atanmamış"}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDeleteCourse(course.id)}
                                            className="px-3 py-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-400">
                                    Henüz ders bulunmuyor.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Sorumlu Öğretim Üyesi</label>
                                <select
                                    value={newCourse.lecturerId}
                                    onChange={(e) => setNewCourse({ ...newCourse, lecturerId: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                                    required
                                >
                                    <option value="">Seçiniz...</option>
                                    {users.filter(u => u.isActive !== false).map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.fullName} ({user.role === "ADMIN" ? "Müdür" : user.role === "MANAGER" ? "Müdür Yrd." : "Öğr. Gör."})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Müdür ve Müdür Yardımcıları da ders verebilir.</p>
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
                                    className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
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
