import React, { useState } from 'react';
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  type ClassroomItem,
  type StudentRosterItem,
} from '../data/mockCurriculumData';
import { DataBoundary } from './DataBoundary';

interface LoginPortalProps {
  onLoginStudent: (student: StudentRosterItem) => void;
  onLoginTeacher: (username: string) => void;
  onGoogleLogin: (role: 'student' | 'teacher') => Promise<void>;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onShowToast: (msg: string) => void;
  students?: StudentRosterItem[];
  classes?: ClassroomItem[];
  isLoading?: boolean;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  onLoginStudent,
  onLoginTeacher,
  onGoogleLogin,
  darkMode,
  onToggleDarkMode,
  onShowToast,
  students = INITIAL_STUDENTS,
  classes = INITIAL_CLASSES,
  isLoading = false,
}) => {
  const [activeRole, setActiveRole] = useState<'student' | 'teacher'>('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'ALL'>('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [studentIdInput, setStudentIdInput] = useState('61008');
  const [studentPassInput, setStudentPassInput] = useState('12345');
  const [teacherUsername, setTeacherUsername] = useState('admin');
  const [teacherPassword, setTeacherPassword] = useState('12345');
  const [showStudentPass, setShowStudentPass] = useState(false);
  const [showTeacherPass, setShowTeacherPass] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredStudents = students.filter((s) => {
    const stGrade = s.grade || Number(s.classId?.charAt(0)) || 6;
    const matchesGrade = selectedGrade === 'ALL' || stGrade === selectedGrade;
    const matchesClass = selectedClass === 'ALL' || s.classId === selectedClass;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      (s.username && s.username.toLowerCase().includes(q));
    return matchesGrade && matchesClass && matchesSearch;
  });

  const handleSelectStudent = (student: StudentRosterItem) => {
    setActiveRole('student');
    setStudentIdInput(student.username || student.id);
    setStudentPassInput('12345');
    setErrorMsg('');
    onShowToast(
      `Đã chọn học sinh: ${student.name} (TK: ${student.username || student.id} • MK: 12345)`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (activeRole === 'student') {
      const cleanId = studentIdInput.trim();
      const cleanPass = studentPassInput.trim();
      if (!cleanId || !cleanPass) {
        setErrorMsg('Vui lòng nhập đầy đủ Tài khoản / Mã học sinh và Mật khẩu.');
        return;
      }
      const matched =
        students.find(
          (s) =>
            s.id.toLowerCase() === cleanId.toLowerCase() ||
            (s.username && s.username.toLowerCase() === cleanId.toLowerCase()) ||
            s.name.toLowerCase().includes(cleanId.toLowerCase())
        ) || students[0];
      if (!matched) {
        setErrorMsg('Chưa có tài khoản học sinh nào trong hệ thống.');
        return;
      }
      onShowToast(
        `Học sinh ${matched.name} (${matched.classId}) kết nối trực tuyến thành công!`
      );
      onLoginStudent(matched);
    } else {
      const cleanUser = teacherUsername.trim();
      const cleanPass = teacherPassword.trim();
      if (!cleanUser || !cleanPass) {
        setErrorMsg('Vui lòng nhập Tài khoản Giáo viên và Mật khẩu.');
        return;
      }
      onShowToast('Xác thực Giáo viên thành công! Đang mở Bàn Điều Khiển Giảng Dạy...');
      onLoginTeacher(cleanUser);
    }
  };

  const handleMockQRScan = () => {
    setShowQRModal(false);
    const nam = students[0];
    if (!nam) return;
    setActiveRole('student');
    setStudentIdInput(nam.username || nam.id);
    setStudentPassInput('12345');
    onShowToast(`Đã nhận diện thẻ QR: ${nam.name} - Lớp ${nam.classId}`);
  };

  return (
    <main className="w-full min-h-screen bg-background text-on-surface">
      <div className="flex flex-col w-full">
        <div className="relative w-full overflow-hidden bg-gradient-to-b from-primary-fixed/20 via-surface-container-low to-secondary-fixed/20 py-8 px-4 sm:px-6 lg:px-12 min-h-screen">
          {/* Decorative Floating Blur Spheres */}
          <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-primary-container/20 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-secondary-container/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-1/4 w-88 h-88 rounded-full bg-tertiary-fixed/30 blur-3xl pointer-events-none" />

          <div className="relative max-w-6xl mx-auto flex flex-col gap-8">
            {/* Top Micro Bar / School Header (100% Online) */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2.5 bg-surface-container-lowest/85 backdrop-blur-md rounded-full shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline-md text-headline-md shadow-md">
                  <span className="material-symbols-outlined text-[22px]">cloud_done</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-headline-sm text-headline-sm text-on-surface">
                      CloudPlay Learning OS
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm uppercase tracking-wide">
                      Tin Học THCS &amp; THPT
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant hidden sm:block">
                    Hệ Thống Học Tập &amp; Quản Trị Trực Tuyến 100% Cloud • Chuẩn GDPT 2018
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={onToggleDarkMode}
                  aria-label="Chuyển đổi Chế độ tối"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    {darkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                  <span>{darkMode ? 'Chế độ sáng' : 'Chế độ tối'}</span>
                </button>
                <div className="flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-full shadow-inner">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-tertiary" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary" />
                  </span>
                  <span className="font-label-md text-label-md text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
                    Cloud DB Trực Tuyến 24/7
                  </span>
                  <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm">
                    Đồng bộ tức thì
                  </span>
                </div>
              </div>
            </div>

            {/* Main Stage Split Bento: Student Roster + Auth Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Online Student Roster (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-surface-container-lowest rounded-lg shadow-xl p-5 flex flex-col gap-4 border border-outline-variant/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined text-[24px]">badge</span>
                      </div>
                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface">
                          Danh Sách Học Sinh Trực Tuyến
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Hiển thị theo Khối / Lớp • Mật khẩu mặc định: <strong>12345</strong>
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm flex items-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-[14px]">cloud</span>{' '}
                      {filteredStudents.length}/{students.length} HS
                    </span>
                  </div>

                  {/* Khối (Grade) Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGrade('ALL');
                        setSelectedClass('ALL');
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                        selectedGrade === 'ALL'
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      Tất cả Khối ({students.length})
                    </button>
                    {[6, 7, 8, 9].map((g) => {
                      const gCount = students.filter(
                        (s) => (s.grade || Number(s.classId?.charAt(0)) || 6) === g
                      ).length;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setSelectedGrade(g);
                            setSelectedClass('ALL');
                          }}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                            selectedGrade === g
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                          }`}
                        >
                          Khối {g} ({gCount})
                        </button>
                      );
                    })}
                  </div>

                  {/* Search & Class Filter */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                        search
                      </span>
                      <input
                        id="search-student-input"
                        type="text"
                        aria-label="Tìm họ tên hoặc tài khoản học sinh"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm họ tên, tài khoản hoặc mã HS..."
                        className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-full py-2 pl-9 pr-3 focus:outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all"
                      />
                    </div>
                    <div className="relative">
                      <select
                        id="filter-class-select"
                        aria-label="Chọn lớp học"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="bg-surface-container-low text-on-surface font-label-md text-label-md rounded-full py-2 px-3 pr-8 appearance-none focus:outline-none cursor-pointer"
                      >
                        <option value="ALL">Tất cả lớp ({classes.length})</option>
                        {classes
                          .filter((cls) => selectedGrade === 'ALL' || cls.grade === selectedGrade)
                          .map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name} (Khối {cls.grade})
                            </option>
                          ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Student Cards List wrapped in DataBoundary */}
                  <DataBoundary
                    data={filteredStudents}
                    isLoading={isLoading}
                    loadingMessage="Đang tải danh sách học sinh từ Cloud DB..."
                    emptyTitle="Không tìm thấy học sinh nào"
                    emptyDescription="Chưa có tài khoản học sinh trong lớp/khối này hoặc chưa nạp danh sách."
                  >
                    {(studentList) => (
                      <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[380px] pr-1">
                        {studentList.map((st, idx) => {
                          const isSelected =
                            (studentIdInput === st.id || studentIdInput === st.username) &&
                            activeRole === 'student';
                          const stGrade = st.grade || Number(st.classId?.charAt(0)) || 6;
                          return (
                            <div
                              key={st.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                isSelected || idx === 0
                                  ? 'bg-primary-fixed/20 border-primary-container/40 hover:bg-primary-fixed/30'
                                  : 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-container'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-9 h-9 rounded-full font-headline-sm text-headline-sm flex items-center justify-center flex-shrink-0 ${
                                    isSelected || idx === 0
                                      ? 'bg-primary-container text-on-primary'
                                      : 'bg-secondary-fixed text-secondary'
                                  }`}
                                >
                                  {st.stationNumber}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                                      {st.name}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold">
                                      Khối {stGrade} • {st.classId}
                                    </span>
                                  </div>
                                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                                    TK: <span className="font-label-md text-primary">{st.username || st.id}</span> •
                                    NS: {st.dob || '15/05/2013'} • MK: <strong>12345</strong>
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSelectStudent(st)}
                                className={`px-3 py-1.5 rounded-full font-label-md text-label-md flex-shrink-0 flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                                  isSelected || idx === 0
                                    ? 'bg-primary text-on-primary shadow-sm hover:opacity-90'
                                    : 'bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-on-primary'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {isSelected || idx === 0 ? 'check' : 'touch_app'}
                                </span>
                                <span>{isSelected || idx === 0 ? 'Điền nhanh' : 'Chọn'}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </DataBoundary>

                  <div className="p-3 bg-surface-container-low rounded-xl text-on-surface-variant font-body-sm text-body-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-tertiary flex-shrink-0">
                      cloud_done
                    </span>
                    <span>
                      Tài khoản học sinh được sinh tự động từ danh sách Excel lớp học trên Cloud
                      Database — Mật khẩu chung mặc định: <strong>12345</strong>.
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Role Login Card (7 cols) */}
              <div className="lg:col-span-7 bg-surface-container-lowest rounded-lg shadow-xl p-6 sm:p-8 relative">
                {/* Role Tabs */}
                <div className="flex p-1.5 bg-surface-container-high rounded-full gap-2 mb-5">
                  <button
                    id="tab-student-btn"
                    type="button"
                    onClick={() => {
                      setActiveRole('student');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-3 px-4 rounded-full font-headline-sm text-headline-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeRole === 'student'
                        ? 'bg-primary-container text-on-primary-container shadow-md'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">backpack</span>
                    <span>Cổng Học Sinh</span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-surface-container-lowest/70 text-on-primary-container font-label-sm text-label-sm">
                      Trực tuyến
                    </span>
                  </button>

                  <button
                    id="tab-teacher-btn"
                    type="button"
                    onClick={() => {
                      setActiveRole('teacher');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-3 px-4 rounded-full font-headline-sm text-headline-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeRole === 'teacher'
                        ? 'bg-secondary text-on-secondary shadow-md'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      admin_panel_settings
                    </span>
                    <span>Giáo Viên &amp; Quản Trị</span>
                  </button>
                </div>

                {/* Info Banner */}
                <div className="p-3.5 bg-primary-fixed/20 border border-primary-container/30 rounded-xl flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[18px]">cloud_queue</span>
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm text-primary">
                        Đăng nhập trực tuyến CloudPlay Learning OS
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Mật khẩu khởi tạo mặc định toàn trường:{' '}
                        <strong className="text-primary">12345</strong>
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
                    Online 100%
                  </span>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container font-label-md text-label-md flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form id="login-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {activeRole === 'student' ? (
                    <div id="student-panel" className="flex flex-col gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="student-id-input"
                            className="font-label-lg text-label-lg text-on-surface"
                          >
                            Tài Khoản Tự Động Hoặc Mã Học Sinh <span className="text-error">*</span>
                          </label>
                          <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              arrow_back
                            </span>{' '}
                            Chọn từ danh sách bên trái
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            id="student-id-input"
                            type="text"
                            required
                            value={studentIdInput}
                            onChange={(e) => setStudentIdInput(e.target.value)}
                            placeholder="Ví dụ: namnh.6a10_08 hoặc 61008"
                            className="w-full bg-surface-container-low text-on-surface font-body-lg text-body-lg rounded-xl py-3 px-4 pr-12 focus:outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-on-surface-variant">
                            <span className="material-symbols-outlined">account_circle</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="student-pass-input"
                            className="font-label-lg text-label-lg text-on-surface"
                          >
                            Mật Khẩu Chung <span className="text-error">*</span>
                          </label>
                          <span className="font-label-sm text-label-sm text-primary">
                            Mặc định: <strong>12345</strong>
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            id="student-pass-input"
                            type={showStudentPass ? 'text' : 'password'}
                            required
                            value={studentPassInput}
                            onChange={(e) => setStudentPassInput(e.target.value)}
                            placeholder="Nhập mật khẩu (mặc định 12345)"
                            className="w-full bg-surface-container-low text-on-surface font-body-lg text-body-lg rounded-xl py-3 px-4 pr-12 focus:outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all"
                          />
                          <button
                            type="button"
                            aria-label="Hiện hoặc ẩn mật khẩu học sinh"
                            onClick={() => setShowStudentPass((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-on-surface-variant hover:text-on-surface"
                          >
                            <span className="material-symbols-outlined">
                              {showStudentPass ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-tertiary">
                            verified
                          </span>
                          <span>
                            Học sinh sử dụng mật khẩu chung <strong>12345</strong> được cấp tự động
                            khi giáo viên nạp danh sách lớp Excel.
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div id="teacher-panel" className="flex flex-col gap-4">
                      <div>
                        <label
                          htmlFor="teacher-username"
                          className="block font-label-lg text-label-lg text-on-surface mb-1.5"
                        >
                          Tài Khoản Giáo Viên / Quản Trị Viên <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="teacher-username"
                            type="text"
                            required
                            value={teacherUsername}
                            onChange={(e) => setTeacherUsername(e.target.value)}
                            placeholder="admin hoặc email trường (@edu.vn)"
                            className="w-full bg-surface-container-low text-on-surface font-body-lg text-body-lg rounded-xl py-3 px-4 pr-12 focus:outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-on-surface-variant pointer-events-none">
                            <span className="material-symbols-outlined">admin_panel_settings</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="teacher-password"
                            className="font-label-lg text-label-lg text-on-surface"
                          >
                            Mật Khẩu Đăng Nhập <span className="text-error">*</span>
                          </label>
                          <span className="text-secondary font-label-sm text-label-sm">
                            Bảo mật Quản trị viên
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            id="teacher-password"
                            type={showTeacherPass ? 'text' : 'password'}
                            required
                            value={teacherPassword}
                            onChange={(e) => setTeacherPassword(e.target.value)}
                            placeholder="Mật khẩu của thầy/cô"
                            className="w-full bg-surface-container-low text-on-surface font-body-lg text-body-lg rounded-xl py-3 px-4 pr-12 focus:outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all"
                          />
                          <button
                            type="button"
                            aria-label="Hiện hoặc ẩn mật khẩu giáo viên"
                            onClick={() => setShowTeacherPass((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-on-surface-variant hover:text-on-surface"
                          >
                            <span className="material-symbols-outlined">
                              {showTeacherPass ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-body-sm text-body-sm text-on-surface">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span>Ghi nhớ phiên đăng nhập trực tuyến</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQRModal(true)}
                      className="text-secondary font-label-md text-label-md flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                      <span>Quét mã QR thẻ</span>
                    </button>
                  </div>

                  <button
                    id="submit-btn"
                    type="submit"
                    className={`w-full py-4 px-6 rounded-full font-headline-md text-headline-md shadow-lg hover:shadow-xl hover:scale-[1.01] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-1 cursor-pointer ${
                      activeRole === 'student'
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-secondary text-on-secondary'
                    }`}
                  >
                    <span>
                      {activeRole === 'student'
                        ? 'Đăng Nhập Học Trực Tuyến'
                        : 'Vào Bàn Điều Khiển Giảng Dạy'}
                    </span>
                    <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
                  </button>
                </form>
              </div>
            </div>

            {/* QR Scan Modal */}
            {showQRModal && (
              <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-surface-container-lowest max-w-sm w-full p-6 rounded-lg shadow-2xl flex flex-col items-center gap-4 text-center border border-outline-variant/30">
                  <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[36px]">qr_code_scanner</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Quét Thẻ Mã QR Học Sinh
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      Đưa mã QR trên thẻ học sinh trước camera máy trạm
                    </p>
                  </div>
                  <div className="w-48 h-48 rounded-xl bg-surface-container-high flex flex-col items-center justify-center border-4 border-dashed border-primary-container relative overflow-hidden">
                    <div className="absolute inset-x-0 h-1 bg-primary animate-bounce top-1/2" />
                    <span className="material-symbols-outlined text-primary text-[48px]">
                      camera_alt
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant mt-2">
                      Đang tìm tín hiệu Camera...
                    </span>
                  </div>
                  <div className="flex gap-2 w-full">
                    <button
                      type="button"
                      onClick={handleMockQRScan}
                      className="flex-1 py-2.5 px-4 bg-tertiary text-on-tertiary rounded-full font-label-lg text-label-lg cursor-pointer"
                    >
                      Quét Thẻ Mẫu
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQRModal(false)}
                      className="py-2.5 px-4 bg-surface-container-high text-on-surface rounded-full font-label-lg text-label-lg cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Help & Curriculum Standards */}
            <div className="mt-2 p-4 rounded-xl bg-surface-container-lowest/75 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  support_agent
                </span>
                <span>
                  Hệ thống học tập trực tuyến 100% Cloud DB • Đồng bộ thời gian thực • GV Quản trị:{' '}
                  <strong>Thầy Đỗ Mạnh Trường</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
                  Chuẩn GDPT 2018 Tin học
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Phiên bản CloudPlay v4.5 Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
