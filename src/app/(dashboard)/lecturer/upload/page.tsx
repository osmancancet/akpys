"use client";

import { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Course {
    id: string;
    code: string;
    name: string;
}

interface GradeDistribution {
    AA: number;
    BA: number;
    BB: number;
    CB: number;
    CC: number;
    DC: number;
    DD: number;
    FD: number;
    FF: number;
}

interface AnalysisResult {
    minScore: number;
    maxScore: number;
    avgScore: number;
    studentCnt: number;
    passCount: number;
    failCount: number;
    passRate: number;
    gradeDistribution: GradeDistribution;
    medianScore: number;
    stdDev: number;
}

export default function LecturerUpload() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [term, setTerm] = useState<string>("Vize");
    const [academicYear] = useState<string>("2024-2025");
    const [semester, setSemester] = useState<string>("Güz");
    const [file, setFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch("/api/courses/my");
            const data = await res.json();
            setCourses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Dersler alınamadı:", error);
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const uploadedFile = acceptedFiles[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        setAnalysis(null);
        setError(null);
        setSuccess(false);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", uploadedFile);

            const res = await fetch("/api/reports/analyze", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Dosya analiz edilemedi");
            }

            const data = await res.json();
            setAnalysis(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Dosya analiz edilirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
        },
        maxFiles: 1,
    });

    const handleSubmit = async () => {
        if (!selectedCourse || !file || !analysis) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: selectedCourse,
                    term,
                    academicYear,
                    semester,
                    minScore: analysis.minScore,
                    maxScore: analysis.maxScore,
                    avgScore: analysis.avgScore,
                    medianScore: analysis.medianScore,
                    stdDev: analysis.stdDev,
                    studentCnt: analysis.studentCnt,
                    passCount: analysis.passCount,
                    failCount: analysis.failCount,
                    passRate: analysis.passRate,
                    gradeDistribution: JSON.stringify(analysis.gradeDistribution),
                    fileName: file.name,
                }),
            });

            if (!res.ok) {
                throw new Error("Rapor gönderilemedi");
            }

            setSuccess(true);
            setFile(null);
            setAnalysis(null);
            setSelectedCourse("");
        } catch (err) {
            setError("Rapor gönderilirken bir hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    const getTemplateUrl = () => {
        const course = courses.find(c => c.id === selectedCourse);
        if (!course) return "/api/template";

        const type = term === "Vize" ? "vize" : term === "Final" ? "final" : "butunleme";
        return `/api/template?type=${type}&course=${course.code}&name=${encodeURIComponent(course.name)}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Not Girişi</h1>
                <p className="text-slate-400">YÖKAK uyumlu sınav sonuçları yükleme ve analiz</p>
            </div>

            {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-green-400 font-medium">Rapor başarıyla gönderildi! Yönetim onayı için bekleyiniz.</span>
                    </div>
                </div>
            )}

            {/* Step 1: Course & Exam Selection */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-700 text-white rounded-full flex items-center justify-center text-sm">1</span>
                    Ders ve Sınav Seçimi
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Course Selection */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Ders</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Ders seçin...</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Semester Selection */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Yarıyıl</label>
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="Güz">Güz Dönemi</option>
                            <option value="Bahar">Bahar Dönemi</option>
                            <option value="Yaz">Yaz Okulu</option>
                        </select>
                    </div>
                </div>

                {/* Exam Type Selection */}
                <div className="mt-4">
                    <label className="block text-sm text-slate-400 mb-2">Sınav Türü</label>
                    <div className="flex gap-2">
                        {["Vize", "Final", "Bütünleme"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTerm(t)}
                                className={`flex-1 py-3 rounded-lg transition-colors font-medium ${term === t
                                    ? "bg-red-700 text-white"
                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Template Download */}
                {selectedCourse && (
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-400 font-medium">Şablon İndir</p>
                                <p className="text-sm text-slate-400">
                                    {term} sınavı için hazır Excel şablonunu indirin
                                </p>
                            </div>
                            <a
                                href={getTemplateUrl()}
                                download
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                {term} Şablonu
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Step 2: File Upload */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-700 text-white rounded-full flex items-center justify-center text-sm">2</span>
                    Dosya Yükleme
                </h2>

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive
                        ? "border-red-500 bg-red-500/10"
                        : file
                            ? "border-green-500 bg-green-500/10"
                            : "border-slate-600 hover:border-slate-500"
                        }`}
                >
                    <input {...getInputProps()} />

                    {loading ? (
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-slate-300">YÖKAK analizi yapılıyor...</p>
                        </div>
                    ) : file ? (
                        <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-white font-medium">{file.name}</p>
                            <p className="text-slate-400 text-sm">Farklı dosya yüklemek için tıklayın</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-white font-medium mb-2">
                                {isDragActive ? "Dosyayı bırakın..." : "Excel dosyasını sürükleyin veya tıklayın"}
                            </p>
                            <p className="text-slate-400 text-sm">.xlsx veya .xls formatında</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}
            </div>

            {/* Step 3: Analysis Results */}
            {analysis && (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-red-700 text-white rounded-full flex items-center justify-center text-sm">3</span>
                        YÖKAK Analiz Sonuçları
                    </h2>

                    {/* Main Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatCard label="Öğrenci" value={analysis.studentCnt.toString()} color="blue" />
                        <StatCard label="Ortalama" value={analysis.avgScore.toFixed(1)} color="purple" />
                        <StatCard label="En Düşük" value={analysis.minScore.toString()} color="red" />
                        <StatCard label="En Yüksek" value={analysis.maxScore.toString()} color="green" />
                    </div>

                    {/* Pass Rate */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-slate-700/30 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-300">Başarı Oranı (≥50 puan)</span>
                                <span className={`text-xl font-bold ${analysis.passRate >= 50 ? "text-green-400" : "text-red-400"}`}>
                                    %{analysis.passRate.toFixed(1)}
                                </span>
                            </div>
                            <div className="h-3 bg-slate-600 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full rounded-full ${analysis.passRate >= 50 ? "bg-green-500" : "bg-red-500"}`}
                                    style={{ width: `${Math.min(analysis.passRate, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-green-400">Geçen: {analysis.passCount}</span>
                                <span className="text-red-400">Kalan: {analysis.failCount}</span>
                            </div>
                        </div>

                        <div className="bg-slate-700/30 rounded-xl p-4">
                            <h4 className="text-sm font-medium text-slate-300 mb-3">İstatistikler</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Medyan</span>
                                    <span className="text-white font-medium">{analysis.medianScore}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Standart Sapma</span>
                                    <span className="text-white font-medium">{analysis.stdDev}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Not Aralığı</span>
                                    <span className="text-white font-medium">{analysis.maxScore - analysis.minScore}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grade Distribution */}
                    <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Harf Notu Dağılımı</h4>
                        <div className="grid grid-cols-9 gap-2">
                            {Object.entries(analysis.gradeDistribution).map(([grade, count]) => (
                                <div key={grade} className="text-center p-2 bg-slate-700/30 rounded-lg">
                                    <p className="text-xs text-slate-400">{grade}</p>
                                    <p className="text-lg font-bold text-white">{count}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedCourse || submitting}
                        className="w-full mt-6 py-3.5 bg-red-700 hover:bg-red-800 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                    >
                        {submitting ? "Gönderiliyor..." : "Yönetime Gönder"}
                    </button>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
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
