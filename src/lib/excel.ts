import * as XLSX from "xlsx";

export interface GradeDistribution {
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

export interface ExcelAnalysisResult {
    // Temel İstatistikler
    minScore: number;
    maxScore: number;
    avgScore: number;
    studentCnt: number;

    // YÖKAK Uyumlu Metrikler
    passCount: number;      // Geçen öğrenci sayısı (>=50)
    failCount: number;      // Kalan öğrenci sayısı (<50)
    passRate: number;       // Başarı oranı (%)

    // Not Dağılımı
    gradeDistribution: GradeDistribution;

    // Ek Metrikler
    medianScore: number;    // Medyan not
    stdDev: number;         // Standart sapma
}

// Not -> Harf notu dönüşümü (100'lük sistem)
function scoreToGrade(score: number): keyof GradeDistribution {
    if (score >= 90) return "AA";
    if (score >= 85) return "BA";
    if (score >= 80) return "BB";
    if (score >= 75) return "CB";
    if (score >= 70) return "CC";
    if (score >= 65) return "DC";
    if (score >= 60) return "DD";
    if (score >= 50) return "FD";
    return "FF";
}

// Medyan hesaplama
function calculateMedian(arr: number[]): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Standart sapma hesaplama
function calculateStdDev(arr: number[], mean: number): number {
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

export function analyzeExcelFile(buffer: Buffer): ExcelAnalysisResult {
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // İlk sayfa yerine "Öğrenci Notları" sayfasını ara, yoksa ilk sayfayı kullan
    let sheetName = workbook.SheetNames.find(name =>
        name.toLowerCase().includes("not") || name.toLowerCase().includes("öğrenci")
    ) || workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];

    // Excel'i JSON'a çevir
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    // Not sütunlarını bul (Vize, Final, veya genel Not)
    const possibleColumns = [
        "Final", "final", "FINAL",
        "Vize", "vize", "VIZE",
        "Not", "not", "NOTE",
        "Puan", "puan", "PUAN",
        "Score", "score", "SCORE",
        "Ortalama", "ortalama"
    ];

    let scoreColumn: string | null = null;

    if (data.length > 0) {
        const firstRow = data[0];
        for (const col of possibleColumns) {
            if (col in firstRow) {
                scoreColumn = col;
                break;
            }
        }
    }

    // Eğer bilinen sütun bulunamazsa, ilk sayısal sütunu kullan
    if (!scoreColumn && data.length > 0) {
        const firstRow = data[0];
        for (const [key, value] of Object.entries(firstRow)) {
            if (typeof value === "number") {
                scoreColumn = key;
                break;
            }
        }
    }

    if (!scoreColumn) {
        throw new Error("Not sütunu bulunamadı. Lütfen Excel dosyasında 'Not', 'Vize', 'Final' veya 'Puan' sütunu olduğundan emin olun.");
    }

    // Notları çıkar ve filtrele
    const scores = data
        .map((row) => row[scoreColumn!])
        .filter((value): value is number => typeof value === "number" && !isNaN(value) && value >= 0 && value <= 100);

    if (scores.length === 0) {
        throw new Error("Geçerli not verisi bulunamadı. Notlar 0-100 arasında sayısal değerler olmalıdır.");
    }

    // Temel İstatistikler
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const medianScore = calculateMedian(scores);
    const stdDev = calculateStdDev(scores, avgScore);

    // Başarı Analizi (>=50 geçer)
    const passCount = scores.filter(s => s >= 50).length;
    const failCount = scores.length - passCount;
    const passRate = (passCount / scores.length) * 100;

    // Not Dağılımı
    const gradeDistribution: GradeDistribution = {
        AA: 0, BA: 0, BB: 0, CB: 0, CC: 0, DC: 0, DD: 0, FD: 0, FF: 0
    };

    for (const score of scores) {
        const grade = scoreToGrade(score);
        gradeDistribution[grade]++;
    }

    return {
        minScore: Math.round(minScore * 100) / 100,
        maxScore: Math.round(maxScore * 100) / 100,
        avgScore: Math.round(avgScore * 100) / 100,
        studentCnt: scores.length,
        passCount,
        failCount,
        passRate: Math.round(passRate * 100) / 100,
        gradeDistribution,
        medianScore: Math.round(medianScore * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
    };
}
