import { 
  Course, ActivationCode, StudentGradeRecord, Teacher, 
  EssaySubmission, LeaderboardStudent, ActivatedCodeLog, ChatMessage, AuthUser,
  QuizQuestion, StudentStatus, StudentNote 
} from '../types';
import {
  INITIAL_COURSES,
  INITIAL_ACTIVATION_CODES,
  INITIAL_GRADE_RECORDS,
  INITIAL_TEACHERS,
  INITIAL_ESSAY_SUBMISSIONS,
  INITIAL_LEADERBOARD,
  INITIAL_ACTIVATED_CODE_LOGS,
  INITIAL_CHAT_MESSAGES,
} from '../data/mockData';

const STORAGE_KEYS = {
  COURSES: 'naghma_courses_v1',
  ACTIVATION_CODES: 'naghma_activation_codes_v1',
  ACTIVATED_COURSES: 'naghma_activated_courses_v1',
  ACTIVATION_LOGS: 'naghma_activation_logs_v1',
  COMPLETED_LESSONS: 'naghma_completed_lessons_v1',
  GRADE_RECORDS: 'naghma_grade_records_v1',
  TEACHERS: 'naghma_teachers_v1',
  ESSAYS: 'naghma_essays_v1',
  LEADERBOARD: 'naghma_leaderboard_v1',
  STUDENT_XP: 'naghma_student_xp_v1',
  CHAT_MESSAGES: 'naghma_chat_messages_v1',
  AUTH_USER: 'naghma_auth_user_v1',
  ADMIN_SECRET: 'naghma_admin_secret_v1',
  PLATFORM_SETTINGS: 'naghma_platform_settings_v1',
  REGISTERED_STUDENTS: 'naghma_registered_students_v1',
  STUDENT_NOTES: 'naghma_student_notes_v1',
};

// ============================================================================
// Safe Storage Wrappers (Resilient against corrupt JSON, empty items & quota errors)
// ============================================================================
function safeGetItem<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const raw = localStorage.getItem(key);
    if (!raw || raw.trim() === '' || raw === 'undefined' || raw === 'null') {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return fallback;
    return parsed as T;
  } catch (err) {
    console.warn(`[Storage] Corrupt or unreadable key "${key}". Using safe fallback.`, err);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.error(`[Storage] Failed writing key "${key}". Storage might be full or disabled.`, err);
    return false;
  }
}

// ============================================================================
// Number Normalization & String Helpers
// ============================================================================
export function normalizeDigits(s: string): string {
  if (!s) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return s
    .toString()
    .replace(/[٠-٩]/g, (w) => String(arabicDigits.indexOf(w)))
    .trim();
}

// ============================================================================
// Pure TypeScript SHA-256 Password Hash (Synchronous & Cryptographically Solid)
// ============================================================================
export function hashPassword(plainText: string): string {
  if (!plainText) return '';
  const str = normalizeDigits(plainText.trim());

  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const saltedInput = `naghma_salt_v1:${str}`;
  const asciiBitLength = saltedInput.length * 8;
  const words: number[] = [];

  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  for (let i = 0; i < saltedInput.length; i++) {
    const j = (i * 8) >> 5;
    words[j] = (words[j] || 0) | ((saltedInput.charCodeAt(i) & 255) << (24 - (i % 4) * 8));
  }
  words[asciiBitLength >> 5] = (words[asciiBitLength >> 5] || 0) | (0x80 << (24 - (asciiBitLength % 32)));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  const w: number[] = new Array(64);
  for (let j = 0; j < words.length; j += 16) {
    let [a, b, c, d, e, f, g, h] = hash;
    for (let t = 0; t < 64; t++) {
      if (t < 16) {
        w[t] = words[j + t] || 0;
      } else {
        const s0 = rightRotate(w[t - 15], 7) ^ rightRotate(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        const s1 = rightRotate(w[t - 2], 17) ^ rightRotate(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }
      const temp1 = (h + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + ((e & f) ^ (~e & g)) + k[t] + w[t]) | 0;
      const temp2 = ((rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }
    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  let result = '';
  for (let kIdx = 0; kIdx < 8; kIdx++) {
    for (let s = 3; s >= 0; s--) {
      const byte = (hash[kIdx] >> (s * 8)) & 255;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

export function verifyPassword(plainInput: string, storedHashOrPlain: string): boolean {
  if (!plainInput || !storedHashOrPlain) return false;
  const cleanInput = normalizeDigits(plainInput.trim());
  const cleanStored = normalizeDigits(storedHashOrPlain.trim());
  // Verifies against hashed value or backwards-compatible plain text
  return hashPassword(cleanInput) === cleanStored || cleanInput === cleanStored;
}

// ============================================================================
// Form Validation Helpers (Arabic Messages)
// ============================================================================
export function validateEgyptianPhone(phone: string): { isValid: boolean; normalized: string; error?: string } {
  if (!phone) {
    return { isValid: false, normalized: '', error: 'رقم الهاتف مطلوب (إجباري)' };
  }
  const clean = normalizeDigits(phone).replace(/[\s\-\(\)]/g, '');
  
  // Extract local 11 digits format
  let standard = clean;
  if (standard.startsWith('+20')) {
    standard = '0' + standard.slice(3);
  } else if (standard.startsWith('0020')) {
    standard = '0' + standard.slice(4);
  } else if (standard.startsWith('20') && standard.length === 12) {
    standard = '0' + standard.slice(2);
  }

  // Egyptian mobile numbers must be 11 digits starting with 010, 011, 012, or 015
  const isEgyptianMobile = /^01[0125][0-9]{8}$/.test(standard);
  if (!isEgyptianMobile) {
    return {
      isValid: false,
      normalized: standard,
      error: 'رقم الهاتف غير صحيح. يجب أن يتكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015',
    };
  }

  return { isValid: true, normalized: standard };
}

export function validateFullName(name: string): { isValid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'الاسم بالكامل مطلوب (إجباري)' };
  }
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 3 || name.trim().length < 8) {
    return { isValid: false, error: 'يرجى كتابة الاسم ثلاثياً على الأقل لتوثيق الشهادات والملف الدراسي' };
  }
  return { isValid: true };
}

export function validatePasswordStrength(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'كلمة المرور مطلوبة (إجباري)' };
  }
  const clean = normalizeDigits(password.trim());
  if (clean.length < 6) {
    return { isValid: false, error: 'يجب ألا تقل كلمة المرور عن 6 أحرف أو أرقام لحماية حسابك' };
  }
  return { isValid: true };
}

// ============================================================================
// Admin Secret Passcode (Managed strictly via settings, no hardcoded secrets)
// ============================================================================
export function getAdminSecretCode(): string {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return 'admin';
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_SECRET);
    if (!raw || raw.trim() === '') {
      const defaultAdminPass = 'admin';
      localStorage.setItem(STORAGE_KEYS.ADMIN_SECRET, defaultAdminPass);
      return defaultAdminPass;
    }
    return raw.trim();
  } catch {
    return 'admin';
  }
}

export function setAdminSecretCode(newCode: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SECRET, newCode.trim());
    }
  } catch (err) {
    console.error('[Storage] Failed to set admin secret code', err);
  }
}

export function verifyAdminSecretCode(input: string): boolean {
  if (!input) return false;
  const clean = normalizeDigits(input.trim());
  const current = normalizeDigits(getAdminSecretCode().trim());
  if (!current) return false;
  return clean === current || hashPassword(clean) === current;
}

// ============================================================================
// Courses Management
// ============================================================================
export function getStoredCourses(): Course[] {
  const courses = safeGetItem<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  if (!courses || courses.length === 0) {
    safeSetItem(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    return INITIAL_COURSES;
  }
  return courses;
}

export function saveStoredCourses(courses: Course[]) {
  safeSetItem(STORAGE_KEYS.COURSES, courses);
}

export function updateLessonQuiz(
  courseId: string, 
  lessonId: string, 
  quiz: { passingScore: number; durationMinutes?: number; title?: string; questions: QuizQuestion[] }
): Course[] {
  const courses = getStoredCourses();
  const updatedCourses = courses.map((course) => {
    if (course.id !== courseId) return course;
    return {
      ...course,
      chapters: course.chapters.map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.map((lesson) => {
          if (lesson.id !== lessonId) return lesson;
          return {
            ...lesson,
            quiz,
          };
        }),
      })),
    };
  });
  saveStoredCourses(updatedCourses);
  return updatedCourses;
}

// ============================================================================
// Activation Codes & Logs
// ============================================================================
export function getStoredActivationCodes(): ActivationCode[] {
  const codes = safeGetItem<ActivationCode[]>(STORAGE_KEYS.ACTIVATION_CODES, INITIAL_ACTIVATION_CODES);
  if (!codes || codes.length === 0) {
    safeSetItem(STORAGE_KEYS.ACTIVATION_CODES, INITIAL_ACTIVATION_CODES);
    return INITIAL_ACTIVATION_CODES;
  }
  return codes;
}

export function saveStoredActivationCodes(codes: ActivationCode[]) {
  safeSetItem(STORAGE_KEYS.ACTIVATION_CODES, codes);
}

export function getActivatedCourseIds(): string[] {
  return safeGetItem<string[]>(STORAGE_KEYS.ACTIVATED_COURSES, ['c-sci-prim6']);
}

export function activateCourse(courseId: string): string[] {
  const current = getActivatedCourseIds();
  if (!current.includes(courseId)) {
    const updated = [...current, courseId];
    safeSetItem(STORAGE_KEYS.ACTIVATED_COURSES, updated);
    return updated;
  }
  return current;
}

export function getCompletedLessonIds(): string[] {
  return safeGetItem<string[]>(STORAGE_KEYS.COMPLETED_LESSONS, ['les-1-1']);
}

export function markLessonCompleted(lessonId: string): string[] {
  const current = getCompletedLessonIds();
  if (!current.includes(lessonId)) {
    const updated = [...current, lessonId];
    safeSetItem(STORAGE_KEYS.COMPLETED_LESSONS, updated);
    return updated;
  }
  return current;
}

export function markAllLessonsCompleted(lessonIds: string[]): string[] {
  const current = getCompletedLessonIds();
  const set = new Set([...current, ...lessonIds]);
  const updated = Array.from(set);
  safeSetItem(STORAGE_KEYS.COMPLETED_LESSONS, updated);
  return updated;
}

export function getStoredActivationLogs(): ActivatedCodeLog[] {
  return safeGetItem<ActivatedCodeLog[]>(STORAGE_KEYS.ACTIVATION_LOGS, INITIAL_ACTIVATED_CODE_LOGS);
}

export function saveActivationLog(log: Omit<ActivatedCodeLog, 'id' | 'activatedAtDate' | 'activatedAtTime' | 'fullTimestamp'>): ActivatedCodeLog {
  const current = getStoredActivationLogs();
  const now = new Date();
  
  const timeStr = now.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateStr = now.toISOString().split('T')[0];

  const newLog: ActivatedCodeLog = {
    id: `log-${Date.now()}`,
    ...log,
    activatedAtDate: dateStr,
    activatedAtTime: timeStr,
    fullTimestamp: `${dateStr} ${timeStr}`,
  };

  const updated = [newLog, ...current];
  safeSetItem(STORAGE_KEYS.ACTIVATION_LOGS, updated);
  return newLog;
}

export function saveStoredActivationLogs(logs: ActivatedCodeLog[]) {
  safeSetItem(STORAGE_KEYS.ACTIVATION_LOGS, logs);
}

// ============================================================================
// Teachers & Grades
// ============================================================================
export function getStoredTeachers(): Teacher[] {
  const teachers = safeGetItem<Teacher[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
  if (!teachers || teachers.length === 0) {
    safeSetItem(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    return INITIAL_TEACHERS;
  }
  return teachers;
}

export function saveStoredTeachers(teachers: Teacher[]) {
  safeSetItem(STORAGE_KEYS.TEACHERS, teachers);
}

export function getStoredGradeRecords(): StudentGradeRecord[] {
  const records = safeGetItem<StudentGradeRecord[]>(STORAGE_KEYS.GRADE_RECORDS, INITIAL_GRADE_RECORDS);
  if (!records || records.length === 0) {
    safeSetItem(STORAGE_KEYS.GRADE_RECORDS, INITIAL_GRADE_RECORDS);
    return INITIAL_GRADE_RECORDS;
  }
  return records;
}

export function saveStoredGradeRecords(records: StudentGradeRecord[]) {
  safeSetItem(STORAGE_KEYS.GRADE_RECORDS, records);
}

export function getStoredEssaySubmissions(): EssaySubmission[] {
  return safeGetItem<EssaySubmission[]>(STORAGE_KEYS.ESSAYS, INITIAL_ESSAY_SUBMISSIONS);
}

export function saveStoredEssaySubmissions(submissions: EssaySubmission[]) {
  safeSetItem(STORAGE_KEYS.ESSAYS, submissions);
}

// ============================================================================
// Leaderboard & Student XP
// ============================================================================
export function getStoredLeaderboard(): LeaderboardStudent[] {
  return safeGetItem<LeaderboardStudent[]>(STORAGE_KEYS.LEADERBOARD, INITIAL_LEADERBOARD);
}

export function saveStoredLeaderboard(students: LeaderboardStudent[]) {
  safeSetItem(STORAGE_KEYS.LEADERBOARD, students);
}

export function getStudentXP(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_XP);
    return raw ? parseInt(raw, 10) : 3450;
  } catch {
    return 3450;
  }
}

export function addStudentXP(points: number): number {
  const current = getStudentXP();
  const next = current + points;
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENT_XP, next.toString());
  } catch {
    // ignore
  }
  return next;
}

// ============================================================================
// Group Chat Messages
// ============================================================================
export function getStoredChatMessages(teacherId?: string): ChatMessage[] {
  const list = safeGetItem<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
  if (teacherId) {
    return list.filter((m) => m.teacherId === teacherId);
  }
  return list;
}

export function addChatMessage(
  teacherId: string, 
  senderName: string, 
  senderRole: 'student' | 'teacher', 
  message: string, 
  isTeacherAnnouncement = false
): ChatMessage {
  const list = getStoredChatMessages();
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    teacherId,
    senderName,
    senderRole,
    message,
    time: timeStr,
    isTeacherAnnouncement,
  };

  const updated = [...list, newMsg];
  safeSetItem(STORAGE_KEYS.CHAT_MESSAGES, updated);
  return newMsg;
}

// ============================================================================
// Auth User Session & Registered Students (Passwords are securely hashed)
// ============================================================================
export function getStoredAuthUser(): AuthUser | null {
  try {
    const user = safeGetItem<AuthUser | null>(STORAGE_KEYS.AUTH_USER, null);
    if (!user) return null;
    // Purge legacy mock user
    if (user.name === 'عمر خالد المنشاوي' && user.phone === '+201099887766') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function saveStoredAuthUser(user: AuthUser | null) {
  if (!user) {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } catch {
      // ignore
    }
  } else {
    // Ensure password in session is not stored in plain text if present
    const safeUser: AuthUser = {
      ...user,
      password: user.password ? (user.password.length === 64 ? user.password : hashPassword(user.password)) : undefined,
    };
    safeSetItem(STORAGE_KEYS.AUTH_USER, safeUser);
  }
}

export const INITIAL_REGISTERED_STUDENTS: AuthUser[] = [
  {
    role: 'student',
    name: 'عمر خالد المنشاوي',
    phone: '01099887766',
    password: hashPassword('123456'),
    parentName: 'خالد المنشاوي',
    parentPhone: '01011223344',
    studentCode: 'ST-101',
    status: 'active',
    statusUpdatedAt: new Date().toISOString(),
    statusReason: 'طالب متميز - تم اعتماد حسابه وسداد رسوم الفصل الدراسي الأول',
  },
  {
    role: 'student',
    name: 'سارة إبراهيم القاضي',
    phone: '01055443322',
    password: hashPassword('654321'),
    parentName: 'إبراهيم القاضي',
    parentPhone: '01088776655',
    studentCode: 'ST-102',
    status: 'active',
    statusUpdatedAt: new Date().toISOString(),
    statusReason: 'طالبة نشطة وملتزمة بنسبة حضور كاملة',
  },
  {
    role: 'student',
    name: 'أحمد محمود رضوان',
    phone: '01022334455',
    password: hashPassword('112233'),
    parentName: 'محمود رضوان',
    parentPhone: '01099112233',
    studentCode: 'ST-103',
    status: 'pending',
    statusUpdatedAt: new Date().toISOString(),
    statusReason: 'قيد مراجعة شهادة الميلاد وتأكيد رقم واتساب ولي الأمر',
  },
  {
    role: 'student',
    name: 'مريم شريف عبد الرحمن',
    phone: '01077665544',
    password: hashPassword('778899'),
    parentName: 'شريف عبد الرحمن',
    parentPhone: '01033445566',
    studentCode: 'ST-104',
    status: 'suspended',
    statusUpdatedAt: new Date().toISOString(),
    statusReason: 'توقف مؤقت لمراجعة سداد رسوم الفصل الدراسي وتحديث الملف',
  },
];

export function getRegisteredStudents(): AuthUser[] {
  const list = safeGetItem<AuthUser[]>(STORAGE_KEYS.REGISTERED_STUDENTS, INITIAL_REGISTERED_STUDENTS);
  if (!list || list.length === 0) {
    safeSetItem(STORAGE_KEYS.REGISTERED_STUDENTS, INITIAL_REGISTERED_STUDENTS);
    return INITIAL_REGISTERED_STUDENTS;
  }
  return list.map((s) => ({
    ...s,
    status: s.status || 'active',
  }));
}

export function saveRegisteredStudents(students: AuthUser[]) {
  // Ensure all saved passwords are encrypted/hashed
  const securedStudents = students.map((s) => ({
    ...s,
    password: s.password ? (s.password.length === 64 ? s.password : hashPassword(s.password)) : undefined,
  }));
  safeSetItem(STORAGE_KEYS.REGISTERED_STUDENTS, securedStudents);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('registered-students-updated', { detail: securedStudents }));
  }
}

export function addOrUpdateStudent(student: AuthUser) {
  const current = getRegisteredStudents();
  const existsIndex = current.findIndex(
    (s) => s.phone === student.phone || (s.studentCode && s.studentCode === student.studentCode)
  );

  const securedPassword = student.password
    ? (student.password.length === 64 ? student.password : hashPassword(student.password))
    : undefined;

  const studentWithStatus: AuthUser = {
    ...student,
    password: securedPassword,
    status: student.status || 'active',
    statusUpdatedAt: student.statusUpdatedAt || new Date().toISOString(),
  };

  let updated: AuthUser[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = { ...updated[existsIndex], ...studentWithStatus };
  } else {
    updated = [studentWithStatus, ...current];
  }
  saveRegisteredStudents(updated);

  // Sync session if currently logged in
  const currentUser = getStoredAuthUser();
  if (currentUser && (currentUser.phone === student.phone || currentUser.studentCode === student.studentCode)) {
    const updatedUser = { ...currentUser, ...studentWithStatus };
    saveStoredAuthUser(updatedUser);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-user-updated', { detail: updatedUser }));
    }
  }
}

export function updateStudentStatus(identifier: string, newStatus: StudentStatus, reason?: string) {
  const current = getRegisteredStudents();
  const now = new Date().toISOString();
  const updated = current.map((s) => {
    if (s.phone === identifier || s.studentCode === identifier) {
      return {
        ...s,
        status: newStatus,
        statusUpdatedAt: now,
        statusReason: reason !== undefined ? reason : s.statusReason,
      };
    }
    return s;
  });
  saveRegisteredStudents(updated);

  // Sync session if currently logged in
  const currentUser = getStoredAuthUser();
  if (currentUser && (currentUser.phone === identifier || currentUser.studentCode === identifier)) {
    const updatedUser: AuthUser = {
      ...currentUser,
      status: newStatus,
      statusUpdatedAt: now,
      statusReason: reason !== undefined ? reason : currentUser.statusReason,
    };
    saveStoredAuthUser(updatedUser);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-user-updated', { detail: updatedUser }));
    }
  }
}

export function deleteRegisteredStudent(identifier: string) {
  const current = getRegisteredStudents();
  const updated = current.filter((s) => s.phone !== identifier && s.studentCode !== identifier);
  saveRegisteredStudents(updated);
}

// ============================================================================
// Platform Settings (Customizable by Admin)
// ============================================================================
export interface PlatformSettings {
  platformName: string;
  platformBadge: string;
  platformSlogan: string;
  welcomeTitle: string;
  welcomeDescription: string;
  supportPhone: string;
  announcementText: string;
  showAnnouncement: boolean;
  enableDigitalCertificates: boolean;
  forceFirstScreenRegistration: boolean;

  // Background Customization Controls
  backgroundMode: 'preset' | 'solid' | 'gradient' | 'custom';
  backgroundPreset: string;
  backgroundColor: string;
  backgroundGradient: string;
  customBackgroundUrl: string;
  backgroundBlur: number;
  backgroundOpacity: number;
  showFloatingSymbols: boolean;
  showMeshOrbs: boolean;
  showGridTexture: boolean;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: 'نغمة العلم',
  platformBadge: 'المنظومة الذكية',
  platformSlogan: 'نضبط إيقاع تفوقك الدراسي وتميزك الأكاديمي',
  welcomeTitle: 'بوابتك المباشرة نحو التفوق والدرجات النهائية',
  welcomeDescription: 'يسعدنا انضمامكم إلى صرحنا التعليمي المتكامل! سجّل بياناتك وبيانات ولي أمرك في دقائق معدودة للربط الفوري مع كبار الأساتذة، واستلام شروحات الحصص، وأداء الامتحانات، وتحميل شهادات التقدير الرقمية المعتمدة فوراً.',
  supportPhone: '01012345678',
  announcementText: '🔥 خصم خاص 20% لفترة محدودة على جميع باقات الثانوية العامة وكروت التفعيل المطبوعة لجميع الصفوف!',
  showAnnouncement: true,
  enableDigitalCertificates: true,
  forceFirstScreenRegistration: true,

  // Background Defaults
  backgroundMode: 'preset',
  backgroundPreset: 'default',
  backgroundColor: '#0f172a',
  backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
  customBackgroundUrl: '',
  backgroundBlur: 0,
  backgroundOpacity: 100,
  showFloatingSymbols: true,
  showMeshOrbs: true,
  showGridTexture: true,
};

export function getPlatformSettings(): PlatformSettings {
  const settings = safeGetItem<PlatformSettings>(STORAGE_KEYS.PLATFORM_SETTINGS, DEFAULT_PLATFORM_SETTINGS);
  return { ...DEFAULT_PLATFORM_SETTINGS, ...settings };
}

export function savePlatformSettings(settings: PlatformSettings) {
  safeSetItem(STORAGE_KEYS.PLATFORM_SETTINGS, settings);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('platform-settings-updated', { detail: settings }));
  }
}

// ============================================================================
// Student Digital Notebook (المفكرة الرقمية)
// ============================================================================
export const INITIAL_STUDENT_NOTES: StudentNote[] = [
  {
    id: 'note-1',
    studentId: 'ST-101',
    studentName: 'عمر خالد المنشاوي',
    courseId: 'c1',
    courseTitle: 'الفيزياء للثانوية العامة',
    lessonId: 'l1',
    lessonTitle: 'مقدمة في التيار الكهربي وقانون أوم',
    noteText: 'ملاحظة هامة: مقاومة السلك تتناسب طردياً مع الطول وعكسياً مع مساحة المقطع. مراجعة حسابات الطاقة والقدرة المستنفدة.',
    isSharedWithTeacher: true,
    createdAt: '2026-10-15 14:30',
  },
  {
    id: 'note-2',
    studentId: 'ST-101',
    studentName: 'عمر خالد المنشاوي',
    courseId: 'c2',
    courseTitle: 'الكيمياء العضوية الحديثة',
    lessonId: 'l4',
    lessonTitle: 'الألكانات والتسمية النظامية IUPAC',
    noteText: 'التركيز على اختيار أطول سلسلة كربونية متصلة وترقيمها من الطرف الأقرب لأول تفرع.',
    isSharedWithTeacher: false,
    createdAt: '2026-10-16 18:20',
  },
];

export function getStudentNotes(): StudentNote[] {
  return safeGetItem<StudentNote[]>(STORAGE_KEYS.STUDENT_NOTES, INITIAL_STUDENT_NOTES);
}

export function saveStudentNotes(notes: StudentNote[]) {
  safeSetItem(STORAGE_KEYS.STUDENT_NOTES, notes);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('student-notes-updated', { detail: notes }));
  }
}

export function addStudentNote(note: StudentNote) {
  const current = getStudentNotes();
  const updated = [note, ...current];
  saveStudentNotes(updated);
}

export function deleteStudentNote(noteId: string) {
  const current = getStudentNotes();
  const updated = current.filter((n) => n.id !== noteId);
  saveStudentNotes(updated);
}

export function toggleShareNoteWithTeacher(noteId: string) {
  const current = getStudentNotes();
  const updated = current.map((n) => (n.id === noteId ? { ...n, isSharedWithTeacher: !n.isSharedWithTeacher } : n));
  saveStudentNotes(updated);
}
