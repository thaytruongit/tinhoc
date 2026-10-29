// Thuật toán chấm điểm tự động Câu trả lời ngắn (Dạng 4) & Vận dụng (Hoạt động 4)
// Tính điểm dựa trên mức độ khớp với Đáp án gợi ý theo tỷ lệ phần trăm (0% -> 100%)

const VIETNAMESE_STOP_WORDS = new Set([
  'là',
  'và',
  'của',
  'trong',
  'để',
  'cho',
  'các',
  'một',
  'những',
  'có',
  'được',
  'với',
  'khi',
  'như',
  'hoặc',
  'thì',
  'mà',
  'bị',
  'do',
  'từ',
  'vào',
  'ra',
  'lên',
  'xuống',
  'về',
  'theo',
  'trên',
  'dưới',
  'này',
  'đó',
  'ấy',
  'rất',
  'cần',
  'phải',
  'sẽ',
  'đã',
  'đang',
  'vẫn',
  'cùng',
  'nhau',
  'việc',
  'cách',
  'bằng',
  'qua',
  'tại',
  'nên',
  'vì',
  'nếu',
  'nhưng',
  'hay',
  'em',
  'hãy',
  'bạn',
  'chúng',
  'ta',
  'ví',
  'dụ',
  'câu',
  'trả',
  'lời',
  'nhận',
  'xét',
  'kết',
  'quả',
]);

export interface PercentageGradeResult {
  matchPercentage: number; // 0 -> 100
  earnedPoints: number;
  maxPoints: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  totalKeywordsCount: number;
}

function normalizeVietnameseText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,;:!?()"'“”‘’[\]{}<>/\\|•\-–—_+=*&^%$#@~`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Trích xuất danh sách các từ khóa / cụm từ ý nghĩa từ đáp án gợi ý
 */
export function extractSuggestedKeywords(suggestedAnswer: string): string[] {
  if (!suggestedAnswer || !suggestedAnswer.trim()) return [];

  // 1. Tách theo các dấu phẩy, chấm phẩy, dấu chấm, dấu gạch đầu dòng để lấy cụm ý chính
  const clean = normalizeVietnameseText(suggestedAnswer);
  const rawTokens = clean.split(' ').filter((w) => w.length >= 2 && !VIETNAMESE_STOP_WORDS.has(w));

  const uniqueTokens: string[] = [];
  const seen = new Set<string>();
  for (const token of rawTokens) {
    if (!seen.has(token)) {
      seen.add(token);
      uniqueTokens.push(token);
    }
  }

  return uniqueTokens;
}

/**
 * Chấm điểm câu trả lời của học sinh dựa trên tỷ lệ % khớp với đáp án gợi ý
 */
export function evaluateAnswerBySuggestedPercentage(
  studentAnswer: string,
  suggestedAnswer: string,
  maxPoints: number = 1.0
): PercentageGradeResult {
  const cleanStudent = normalizeVietnameseText(studentAnswer || '');
  if (!cleanStudent) {
    const allKw = extractSuggestedKeywords(suggestedAnswer).slice(0, 10);
    return {
      matchPercentage: 0,
      earnedPoints: 0,
      maxPoints,
      matchedKeywords: [],
      missingKeywords: allKw,
      totalKeywordsCount: allKw.length,
    };
  }

  const keywords = extractSuggestedKeywords(suggestedAnswer);
  if (keywords.length === 0) {
    // Fallback nếu đáp án gợi ý trống
    const wordCount = cleanStudent.split(' ').filter(Boolean).length;
    const pct = Math.min(100, Math.round((wordCount / 10) * 100));
    return {
      matchPercentage: pct,
      earnedPoints: Math.round((pct / 100) * maxPoints * 100) / 100,
      maxPoints,
      matchedKeywords: [],
      missingKeywords: [],
      totalKeywordsCount: 0,
    };
  }

  const studentWords = new Set(cleanStudent.split(' '));
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of keywords) {
    if (studentWords.has(kw) || cleanStudent.includes(kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  // Tính tỷ lệ phần trăm khớp từ khóa cốt lõi từ đáp án gợi ý
  const rawRatio = matchedKeywords.length / keywords.length;
  // Chuẩn hóa tỷ lệ % hợp lý: nếu học sinh khớp >= 75% từ khóa cốt lõi trong câu văn tự nhiên -> đạt 100%
  const scaledPercentage = Math.min(100, Math.round((rawRatio / 0.75) * 100));
  const matchPercentage = matchedKeywords.length === keywords.length ? 100 : scaledPercentage;
  const earnedPoints = Math.round((matchPercentage / 100) * maxPoints * 100) / 100;

  return {
    matchPercentage,
    earnedPoints,
    maxPoints,
    matchedKeywords: matchedKeywords.slice(0, 12),
    missingKeywords: missingKeywords.slice(0, 8),
    totalKeywordsCount: keywords.length,
  };
}
