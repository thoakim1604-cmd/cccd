# CCCD OCR Scanner (Powered by Gemini)

Dự án Web App giúp trích xuất thông tin từ ảnh Căn cước công dân Việt Nam và xuất ra file Excel. 
Hệ thống sử dụng **Google Gemini 1.5 Flash** để đọc và trích xuất thông tin ảnh, cho độ chính xác rất cao và có khả năng bóc tách tự động các trường phức tạp.

## Công nghệ

- **Frontend**: Next.js 15, TailwindCSS, shadcn/ui.
- **Backend**: Next.js API Routes.
- **AI Model**: Google Gemini 1.5 Flash (qua `@google/genai`).

## Tính năng

- Kéo thả để upload ảnh (hỗ trợ JPG, PNG, tối đa 10MB).
- Hỗ trợ xử lý song song nhiều ảnh CCCD cùng lúc.
- Tự động gọi API Gemini để nhận diện và bóc tách thông tin: Họ và tên, Ngày sinh, Địa chỉ, Ngày cấp, Cơ quan cấp.
- Giao diện Dashboard quản lý kết quả OCR, hỗ trợ chỉnh sửa trực tiếp.
- Thống kê tỷ lệ thành công/lỗi.
- Xuất dữ liệu ra file Excel (.xlsx) với định dạng đẹp mắt.
- Hỗ trợ Light/Dark mode.

## Hướng dẫn cài đặt và chạy Local

Yêu cầu: Node.js 18.17 trở lên.

1. Clone dự án và truy cập thư mục:
```bash
cd frontend
```

2. Cài đặt các thư viện:
```bash
npm install
```

3. Cấu hình API Key:
Mở file `.env.local` (hoặc tạo mới) và dán Google Gemini API Key của bạn vào:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Chạy ứng dụng:
```bash
npm run dev
```
Truy cập `http://localhost:3000` trên trình duyệt.

## Hướng dẫn Deploy Production

Bạn có thể dễ dàng deploy toàn bộ ứng dụng này lên **Vercel** hoàn toàn miễn phí.
- Đẩy source code lên GitHub.
- Import project vào Vercel.
- Thiết lập biến môi trường trên Vercel:
  `GEMINI_API_KEY` = (API Key của bạn).

## Lưu ý quan trọng
Ứng dụng chỉ được sử dụng để xử lý các ảnh Căn cước công dân mà người dùng có quyền hợp pháp để sử dụng. Dữ liệu hình ảnh được gửi qua API của Google để xử lý và không được lưu trữ tại server trung gian nào.
