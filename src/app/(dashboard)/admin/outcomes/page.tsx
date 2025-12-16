"use client";

import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface User {
    id: string;
    fullName: string;
}

interface Course {
    id: string;
    code: string;
    name: string;
    lecturer: User;
}

interface LearningOutcome {
    id: string;
    code: string;
    description: string;
    weight: number;
    achievementPct: number | null;
}

interface Question {
    id: string;
    questionNo: number;
    points: number;
    avgStudentPoints: number | null;
    learningOutcomeId: string | null;
    learningOutcome: LearningOutcome | null;
}

interface Exam {
    id: string;
    type: string;
    academicYear: string;
    semester: string;
    totalPoints: number;
    questions: Question[];
}

export default function AdminOutcomesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [outcomes, setOutcomes] = useState<LearningOutcome[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(false);

    // DÖÇ form
    const [newOutcomeCode, setNewOutcomeCode] = useState("");
    const [newOutcomeDesc, setNewOutcomeDesc] = useState("");

    // Exam form
    const [showExamForm, setShowExamForm] = useState(false);
    const [examType, setExamType] = useState("Vize");
    const [examYear, setExamYear] = useState("2024-2025");
    const [examSemester, setExamSemester] = useState("Güz");
    const [questionCount, setQuestionCount] = useState(5);
    const [questions, setQuestions] = useState<{ questionNo: number; points: number; learningOutcomeId: string }[]>([]);

    // Edit mode
    const [editingExam, setEditingExam] = useState<Exam | null>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchOutcomes();
            fetchExams();
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        // Admin tüm dersleri görür
        const res = await fetch("/api/courses");
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
    };

    const fetchOutcomes = async () => {
        const res = await fetch(`/api/learning-outcomes?courseId=${selectedCourse}`);
        const data = await res.json();
        setOutcomes(Array.isArray(data) ? data : []);
    };

    const fetchExams = async () => {
        const res = await fetch(`/api/exams?courseId=${selectedCourse}`);
        const data = await res.json();
        setExams(Array.isArray(data) ? data : []);
    };

    const addOutcome = async () => {
        if (!newOutcomeCode || !newOutcomeDesc) return;
        setLoading(true);
        await fetch("/api/learning-outcomes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                courseId: selectedCourse,
                code: newOutcomeCode,
                description: newOutcomeDesc,
            }),
        });
        setNewOutcomeCode("");
        setNewOutcomeDesc("");
        fetchOutcomes();
        setLoading(false);
    };

    const deleteOutcome = async (id: string) => {
        await fetch(`/api/learning-outcomes?id=${id}`, { method: "DELETE" });
        fetchOutcomes();
    };

    const initQuestions = () => {
        const qs = [];
        const pointsPerQ = Math.floor(100 / questionCount);
        for (let i = 1; i <= questionCount; i++) {
            qs.push({ questionNo: i, points: pointsPerQ, learningOutcomeId: "" });
        }
        setQuestions(qs);
    };

    const createExam = async () => {
        setLoading(true);
        await fetch("/api/exams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                courseId: selectedCourse,
                type: examType,
                academicYear: examYear,
                semester: examSemester,
                totalPoints: 100,
                questions: questions.map(q => ({
                    ...q,
                    learningOutcomeId: q.learningOutcomeId || null,
                })),
            }),
        });
        setShowExamForm(false);
        setQuestions([]);
        fetchExams();
        setLoading(false);
    };

    const updateExamQuestions = async () => {
        if (!editingExam) return;
        setLoading(true);
        await fetch("/api/exams", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                examId: editingExam.id,
                questions: editingExam.questions,
            }),
        });
        setEditingExam(null);
        fetchExams();
        fetchOutcomes();
        setLoading(false);
    };

    const deleteExam = async (id: string) => {
        await fetch(`/api/exams?id=${id}`, { method: "DELETE" });
        fetchExams();
    };

    const generatePDF = () => {
        const course = courses.find(c => c.id === selectedCourse);
        if (!course) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFontSize(16);
        doc.text("YÖKAK Ders Öğrenme Çıktıları Raporu", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(12);
        doc.text(`${course.code} - ${course.name}`, pageWidth / 2, 30, { align: "center" });
        doc.text(`Öğretim Görevlisi: ${course.lecturer?.fullName || "-"}`, pageWidth / 2, 38, { align: "center" });
        doc.text(`Tarih: ${new Date().toLocaleDateString("tr-TR")}`, pageWidth / 2, 46, { align: "center" });

        // DÖÇ Tablosu
        doc.setFontSize(14);
        doc.text("Ders Öğrenme Çıktıları (DÖÇ)", 14, 60);

        autoTable(doc, {
            startY: 65,
            head: [["Kod", "Açıklama", "Başarı %"]],
            body: outcomes.map(o => [
                o.code,
                o.description.substring(0, 60) + (o.description.length > 60 ? "..." : ""),
                o.achievementPct ? `%${o.achievementPct.toFixed(1)}` : "-"
            ]),
            theme: "grid",
            headStyles: { fillColor: [139, 0, 0] },
        });

        // Her sınav için soru tablosu
        let yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

        for (const exam of exams) {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(12);
            doc.text(`${exam.type} - ${exam.academicYear} ${exam.semester}`, 14, yPos);
            yPos += 5;

            autoTable(doc, {
                startY: yPos,
                head: [["Soru", "Puan", "DÖÇ", "Ort. Puan", "Başarı %"]],
                body: exam.questions.map(q => [
                    `S${q.questionNo}`,
                    q.points.toString(),
                    q.learningOutcome?.code || "-",
                    q.avgStudentPoints?.toFixed(1) || "-",
                    q.avgStudentPoints ? `%${((q.avgStudentPoints / q.points) * 100).toFixed(1)}` : "-"
                ]),
                theme: "grid",
                headStyles: { fillColor: [70, 70, 70] },
            });

            yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
        }

        doc.save(`${course.code}_DOC_Raporu.pdf`);
    };

    const selectedCourseData = courses.find(c => c.id === selectedCourse);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kazanım Yönetimi (Yönetim)</h1>
                    <p className="text-slate-400">Tüm dersler için YÖKAK DÖÇ ve sınav yönetimi</p>
                </div>
                {selectedCourse && outcomes.length > 0 && (
                    <button
                        onClick={generatePDF}
                        className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF Rapor
                    </button>
                )}
            </div>

            {/* Course Selection */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <label className="block text-sm text-slate-400 mb-2">Ders Seçin (Tüm Dersler)</label>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full md:w-2/3 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                >
                    <option value="">Ders seçin...</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.code} - {c.name} ({c.lecturer?.fullName || "Atanmamış"})
                        </option>
                    ))}
                </select>

                {selectedCourseData && (
                    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg inline-block">
                        <p className="text-sm text-slate-400">Öğretim Görevlisi:</p>
                        <p className="text-white font-medium">{selectedCourseData.lecturer?.fullName || "Atanmamış"}</p>
                    </div>
                )}
            </div>

            {selectedCourse && (
                <>
                    {/* DÖÇ Section */}
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Ders Öğrenme Çıktıları (DÖÇ)</h2>

                        {/* Add DÖÇ Form */}
                        <div className="flex gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Kod (örn: DÖÇ1)"
                                value={newOutcomeCode}
                                onChange={(e) => setNewOutcomeCode(e.target.value)}
                                className="w-32 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Açıklama..."
                                value={newOutcomeDesc}
                                onChange={(e) => setNewOutcomeDesc(e.target.value)}
                                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                            />
                            <button
                                onClick={addOutcome}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                            >
                                Ekle
                            </button>
                        </div>

                        {/* DÖÇ List */}
                        <div className="space-y-2">
                            {outcomes.map(o => (
                                <div key={o.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm font-mono">{o.code}</span>
                                        <span className="text-white text-sm">{o.description}</span>
                                        {o.achievementPct !== null && (
                                            <span className={`px-2 py-1 rounded text-xs ${o.achievementPct >= 50 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                                %{o.achievementPct.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                    <button onClick={() => deleteOutcome(o.id)} className="text-red-400 hover:text-red-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {outcomes.length === 0 && (
                                <p className="text-slate-500 text-sm text-center py-4">Henüz DÖÇ eklenmemiş.</p>
                            )}
                        </div>
                    </div>

                    {/* Exams Section */}
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Sınavlar ve Sorular</h2>
                            <button
                                onClick={() => { setShowExamForm(true); initQuestions(); }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Yeni Sınav
                            </button>
                        </div>

                        {/* Exam Form Modal */}
                        {showExamForm && (
                            <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
                                <h3 className="text-white font-medium mb-4">Yeni Sınav Oluştur</h3>
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    <select value={examType} onChange={(e) => setExamType(e.target.value)} className="bg-slate-600 border border-slate-500 rounded p-2 text-white text-sm">
                                        <option>Vize</option>
                                        <option>Final</option>
                                        <option>Bütünleme</option>
                                    </select>
                                    <input value={examYear} onChange={(e) => setExamYear(e.target.value)} className="bg-slate-600 border border-slate-500 rounded p-2 text-white text-sm" />
                                    <select value={examSemester} onChange={(e) => setExamSemester(e.target.value)} className="bg-slate-600 border border-slate-500 rounded p-2 text-white text-sm">
                                        <option>Güz</option>
                                        <option>Bahar</option>
                                    </select>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 text-sm">Soru:</span>
                                        <input type="number" value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} min={1} max={20} className="w-16 bg-slate-600 border border-slate-500 rounded p-2 text-white text-sm" />
                                        <button onClick={initQuestions} className="px-2 py-1 bg-slate-500 rounded text-xs">Oluştur</button>
                                    </div>
                                </div>

                                {questions.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {questions.map((q, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-slate-400 text-sm w-12">S{q.questionNo}</span>
                                                <input
                                                    type="number"
                                                    value={q.points}
                                                    onChange={(e) => {
                                                        const newQ = [...questions];
                                                        newQ[i].points = Number(e.target.value);
                                                        setQuestions(newQ);
                                                    }}
                                                    className="w-20 bg-slate-600 border border-slate-500 rounded p-2 text-white text-sm"
                                                    placeholder="Puan"
                                                />
                                                <select
                                                    value={q.learningOutcomeId}
                                                    onChange={(e) => {
                                                        const newQ = [...questions];
                                                        newQ[i].learningOutcomeId = e.target.value;
                                                        setQuestions(newQ);
                                                    }}
                                                    className="flex-1 bg-slate-600 border border-slate-500 rounded p-2 text-white text-sm"
                                                >
                                                    <option value="">DÖÇ seçin...</option>
                                                    {outcomes.map(o => (
                                                        <option key={o.id} value={o.id}>{o.code} - {o.description.substring(0, 30)}...</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button onClick={createExam} disabled={loading} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                                        {loading ? "Kaydediliyor..." : "Sınavı Kaydet"}
                                    </button>
                                    <button onClick={() => setShowExamForm(false)} className="px-4 py-2 bg-slate-600 text-white rounded text-sm">İptal</button>
                                </div>
                            </div>
                        )}

                        {/* Exam List */}
                        <div className="space-y-4">
                            {exams.map(exam => (
                                <div key={exam.id} className="border border-slate-600 rounded-lg overflow-hidden">
                                    <div className="flex items-center justify-between p-3 bg-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">{exam.type}</span>
                                            <span className="text-white">{exam.academicYear} {exam.semester}</span>
                                            <span className="text-slate-400 text-sm">{exam.questions.length} soru</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingExam(exam)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Düzenle</button>
                                            <button onClick={() => deleteExam(exam.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Sil</button>
                                        </div>
                                    </div>

                                    {editingExam?.id === exam.id && (
                                        <div className="p-4 bg-slate-800/50 space-y-2">
                                            <p className="text-sm text-slate-400 mb-2">Öğrenci puan ortalamalarını girin:</p>
                                            {editingExam.questions.map((q, i) => (
                                                <div key={q.id} className="flex items-center gap-3">
                                                    <span className="text-slate-400 text-sm w-12">S{q.questionNo}</span>
                                                    <span className="text-slate-400 text-sm w-20">{q.points} puan</span>
                                                    <span className="text-slate-500 text-sm w-24">{q.learningOutcome?.code || "-"}</span>
                                                    <input
                                                        type="number"
                                                        value={q.avgStudentPoints || ""}
                                                        onChange={(e) => {
                                                            const newQ = [...editingExam.questions];
                                                            newQ[i] = { ...newQ[i], avgStudentPoints: Number(e.target.value) || null };
                                                            setEditingExam({ ...editingExam, questions: newQ });
                                                        }}
                                                        placeholder="Ort. puan"
                                                        className="w-24 bg-slate-600 border border-slate-500 rounded p-2 text-white text-sm"
                                                    />
                                                    <select
                                                        value={q.learningOutcomeId || ""}
                                                        onChange={(e) => {
                                                            const newQ = [...editingExam.questions];
                                                            newQ[i] = { ...newQ[i], learningOutcomeId: e.target.value || null };
                                                            setEditingExam({ ...editingExam, questions: newQ });
                                                        }}
                                                        className="flex-1 bg-slate-600 border border-slate-500 rounded p-2 text-white text-sm"
                                                    >
                                                        <option value="">DÖÇ seçin...</option>
                                                        {outcomes.map(o => (
                                                            <option key={o.id} value={o.id}>{o.code}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                            <div className="flex gap-2 mt-3">
                                                <button onClick={updateExamQuestions} className="px-4 py-2 bg-green-600 text-white rounded text-sm">Kaydet & Hesapla</button>
                                                <button onClick={() => setEditingExam(null)} className="px-4 py-2 bg-slate-600 text-white rounded text-sm">İptal</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {exams.length === 0 && (
                                <p className="text-slate-500 text-sm text-center py-4">Henüz sınav eklenmemiş.</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
