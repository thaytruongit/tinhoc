/**
 * Google Drive Service & Utilities for Dạy học số
 * Quản lý liên kết thư mục Google Drive của Giáo viên và xử lý tệp nộp bài thực hành của Học sinh
 */

export const TEACHER_DRIVE_STORAGE_KEY = 'DAYHOCSO_TEACHER_GOOGLE_DRIVE_URL';

/**
 * Thư mục Google Drive mặc định của Thầy Đỗ Mạnh Trường theo khối và lớp
 */
export function getDefaultTeacherDriveFolderUrl(grade: number = 6, classId: string = '6A10'): string {
  const cleanClass = classId.trim().toUpperCase() || '6A10';
  return `https://drive.google.com/drive/folders/thaytruongit_tinhoc_k${grade}_${cleanClass.toLowerCase()}`;
}

/**
 * Lấy URL thư mục Google Drive đã cấu hình của Giáo viên (từ localStorage hoặc fallback)
 */
export function getTeacherGoogleDriveFolderUrl(grade: number = 6, classId: string = '6A10'): string {
  try {
    const custom = localStorage.getItem(TEACHER_DRIVE_STORAGE_KEY);
    if (custom && custom.trim().startsWith('http')) {
      return custom.trim();
    }
  } catch {}
  return getDefaultTeacherDriveFolderUrl(grade, classId);
}

/**
 * Lưu URL thư mục Google Drive của Giáo viên vào bộ nhớ trình duyệt
 */
export function saveTeacherGoogleDriveFolderUrl(url: string): void {
  try {
    localStorage.setItem(TEACHER_DRIVE_STORAGE_KEY, url.trim());
  } catch (err) {
    console.warn('[GoogleDriveService] Không thể lưu Google Drive URL vào localStorage:', err);
  }
}

/**
 * Định dạng dung lượng byte thành chuỗi người đọc (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Đọc file máy tính của học sinh thành Data URL (Base64) để lưu trữ và mở xem trực tiếp
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Không thể đọc dữ liệu tệp'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Tải tệp bài nộp của học sinh về máy tính (Download with original name)
 */
export function triggerDownloadSubmissionFile(fileName: string, dataUrl: string): void {
  if (!dataUrl) return;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName || 'BaiThucHanh.docx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Xác định loại tệp dựa trên phần mở rộng hoặc MIME type
 */
export function detectSubmissionFileType(fileName: string, mimeType?: string): {
  typeCategory: 'image' | 'pdf' | 'word' | 'excel' | 'powerpoint' | 'scratch' | 'code' | 'other';
  label: string;
  icon: string;
  colorClass: string;
} {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'].includes(ext) || mimeType?.startsWith('image/')) {
    return {
      typeCategory: 'image',
      label: 'Ảnh chụp bài làm (.png/.jpg)',
      icon: 'image',
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    };
  }
  if (ext === 'pdf' || mimeType === 'application/pdf') {
    return {
      typeCategory: 'pdf',
      label: 'Tài liệu PDF (.pdf)',
      icon: 'picture_as_pdf',
      colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
    };
  }
  if (['docx', 'doc'].includes(ext)) {
    return {
      typeCategory: 'word',
      label: 'Tài liệu Word (.docx)',
      icon: 'description',
      colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
    };
  }
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return {
      typeCategory: 'excel',
      label: 'Bảng tính Excel (.xlsx)',
      icon: 'table_view',
      colorClass: 'text-teal-600 bg-teal-50 border-teal-200',
    };
  }
  if (['pptx', 'ppt'].includes(ext)) {
    return {
      typeCategory: 'powerpoint',
      label: 'Bài trình chiếu (.pptx)',
      icon: 'slideshow',
      colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
    };
  }
  if (ext === 'sb3' || ext === 'sb2') {
    return {
      typeCategory: 'scratch',
      label: 'Dự án Scratch (.sb3)',
      icon: 'extension',
      colorClass: 'text-orange-600 bg-orange-50 border-orange-200',
    };
  }
  if (['py', 'html', 'css', 'js', 'ts', 'json', 'txt'].includes(ext)) {
    return {
      typeCategory: 'code',
      label: `Mã nguồn / Text (.${ext})`,
      icon: 'code',
      colorClass: 'text-purple-600 bg-purple-50 border-purple-200',
    };
  }
  return {
    typeCategory: 'other',
    label: `Tệp thực hành (.${ext || 'dat'})`,
    icon: 'draft',
    colorClass: 'text-slate-600 bg-slate-50 border-slate-200',
  };
}
