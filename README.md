# 🚀 CloudPlay Learning OS v4.5 — Hệ Thống Quản Trị Giảng Dạy & Học Tập Tin Học GDPT 2018

> **Tác giả & Quản trị hệ thống:** Thầy Đỗ Mạnh Trường (`manhtruongdo1984@gmail.com`)  
> **Chương trình GDPT 2018:** Môn Tin Học THCS & THPT (Khối 6, 7, 8, 9, 10, 11, 12)  
> **Database Engine:** Supabase / Cloud SQL PostgreSQL (`asia-southeast1`) & Drizzle ORM  
> **AI Engine:** Google Gemini 3.8 Flash Multimodal Vision API  

---

## 🌟 Tính Năng Nổi Bật

### 1. Cơ Chế 2 Trạng Thái Rõ Ràng (Dual-Mode Engine)
- 🔴 **Chế độ Trên lớp (In-Class Live):** Kích hoạt khi Giáo viên bấm "Bắt đầu phát Live". Màn hình học sinh tự động đồng bộ theo thời gian thực, khóa các hoạt động chưa giảng, nhận lệnh quay thưởng/gọi tên ngẫu nhiên và nhận câu đố thử thách Fast-finisher từ Trợ lý AI Cú Vàng.
- 🏠 **Chế độ Ở nhà (Self-Paced Practice):** Tự động mở khóa các tiết học sinh đã hoàn thành hoặc đánh dấu "Đã học", cho phép luyện phản xạ trắc nghiệm 25s, làm lại bài tập và nộp bài vận dụng thực tế.

### 2. Tự Động Lưu Bài & Phục Hồi Trạng Thái (Auto-Save & Cross-Device Resume)
- Tự động đồng bộ từng giây mọi thao tác điền khuyết, kéo thả, ghép nối, tự luận lên Supabase / PostgreSQL.
- Học sinh làm bài dở dang ở phòng máy tính của trường, khi về nhà sử dụng điện thoại hay laptop cá nhân chỉ cần đăng nhập là màn hình phục hồi nguyên vẹn.

### 3. Tiện Ích Data Ingestion Service & Scanner Component (Gemini 3.8 Flash Vision OCR)
- **Teacher Data Ingestion Service:** Nhận tệp PDF / Ảnh phiếu học tập (hỗ trợ kéo thả hoặc `Ctrl + V`), sử dụng Gemini Vision AI phân tích cấu trúc sư phạm và tự động đẩy dữ liệu câu hỏi vào CSDL.
- **Student Worksheet Scanner:** Cho phép học sinh chụp hoặc tải ảnh phiếu bài tập giấy, AI trích xuất chữ viết tay và tự động điền câu trả lời vào các ô bài tập điện tử kèm phản hồi sư phạm (+30 XP).

### 4. Master Question Inspector (ListView) & Diagnostic CRUD Utility
- **Master Question ListView:** Liệt kê toàn bộ câu hỏi trên tất cả 29 tiết x 4 khối, hiển thị nhãn đối chiếu trường dữ liệu phiếu (`dragDrop`, `fillBlank`, `matching`, `shortAnswer`, `quiz`, `stage4`), hỗ trợ tìm kiếm, chỉnh sửa trực tiếp và xóa câu hỏi.
- **Diagnostic CRUD Utility:** Công cụ chẩn đoán thực thi quy trình Tạo (Create), Đọc (Read), Sửa (Update) trên CSDL Supabase để kiểm tra độ trễ (latency) và xác nhận layer đồng bộ lớp học đang hoạt động 100%.

### 5. Tự Động Giữ Cho Supabase Không Bao Giờ Bị Ngủ Đông (Anti-Hibernation 24/7)
- Hệ thống tích hợp sẵn endpoint `/api/cron/keep-alive` thực thi truy vấn đọc/ghi tự động mỗi 6 giờ, giúp cơ sở dữ liệu Supabase Free Tier không bao giờ rơi vào trạng thái ngủ đông (hibernation).

---

## 🛠️ Hướng Dẫn Cấu Hình & Deploy Lên GitHub (Public Deployment)

### 1. Chuẩn bị Môi Trường (.env)
Tạo tệp `.env` dựa trên `.env.example`:

```bash
cp .env.example .env
```

Điền thông tin kết nối Supabase / PostgreSQL của bạn vào `.env`:

```env
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
DATABASE_URL="postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
CRON_SECRET="your_custom_cron_secret"
```

### 2. Cài Đặt Dependencies & Chạy Local
```bash
# Cài đặt thư viện
npm install

# Chạy server phát triển (Dev Mode trên Port 3000)
npm run dev
```

Mở trình duyệt truy cập: `http://localhost:3000`

### 3. Đóng Gói (Build) & Vận Hành Production
```bash
# Đóng gói ứng dụng sang Vite & TypeScript Dist
npm run build

# Khởi chạy server production
npm run start
```

### 4. Deploy Lên Render / Vercel / Railway / Docker
1. **Push source code lên GitHub Repository (Public hoặc Private):**
   ```bash
   git add .
   git commit -m "Deploy CloudPlay Learning OS v4.5 Supabase Edition"
   git push origin main
   ```
2. **Cấu hình Environment Variables trên Render/Vercel/Railway:**
   - `GEMINI_API_KEY`: API Key từ Google AI Studio.
   - `DATABASE_URL` hoặc `SUPABASE_DATABASE_URL`: Connection string PostgreSQL của Supabase.
   - `NODE_ENV`: `production`.
3. **Build & Start Commands:**
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`

---

## 📜 Cấu Trúc Thư Mục Dự Án

```
├── server.ts                             # Express Server + Vite Middleware + API Endpoints
├── src/
│   ├── components/
│   │   ├── TeacherPortal.tsx             # Cổng Giáo Viên & Quản trị giảng dạy
│   │   ├── StudentPortal.tsx             # Cổng Học Sinh & Lộ trình 29 tiết
│   │   ├── TeacherDataIngestionService.tsx# Nạp dữ liệu PDF/Ảnh qua Gemini Vision
│   │   ├── StudentWorksheetScanner.tsx   # Scanner Component (OCR phiếu bài tập)
│   │   ├── QuestionMasterInspectorModal.tsx# ListView kiểm thử toàn bộ câu hỏi
│   │   ├── DatabaseDiagnosticModal.tsx   # Công cụ chẩn đoán CRUD Supabase
│   │   └── InteractiveActivities.tsx     # 4 Hoạt động tương tác (Kéo thả, Điền khuyết, Nối cột, 25s)
│   ├── db/
│   │   ├── schema.ts                     # Schema CSDL Drizzle PostgreSQL
│   │   ├── repository.ts                 # Các hàm truy vấn CSDL
│   │   └── index.ts                      # Cấu hình Pool kết nối Supabase
│   └── data/
│       └── mockCurriculumData.ts         # Khung chương trình chuẩn GDPT 2018
├── .env.example                          # Tệp mẫu biến môi trường
├── drizzle.config.ts                     # Cấu hình Drizzle ORM
├── package.json                          # Dependencies & NPM Scripts
└── README.md                             # Tài liệu hướng dẫn sử dụng & Deploy
```

---

## 📧 Liên Hệ & Hỗ Trợ Kỹ Thuật
- **Giáo viên chủ trì:** Thầy Đỗ Mạnh Trường
- **Email:** `manhtruongdo1984@gmail.com`
- **Đơn vị:** Phòng Lab AI & Cloud Computing THCS / THPT
