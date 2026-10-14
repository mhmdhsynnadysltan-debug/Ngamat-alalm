import { 
  Course, ActivationCode, StudentGradeRecord, Teacher, 
  EssaySubmission, LeaderboardStudent, ActivatedCodeLog, ChatMessage, AuthUser 
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
};

// Admin Secret Passcode (Default 2035, fully customizable and kept private)
export function getAdminSecretCode(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_SECRET);
    return raw ? raw.trim() : '2035';
  } catch {
    return '2035';
  }
}

export function setAdminSecretCode(newCode: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SECRET, newCode.trim());
  } catch {
    // ignore
  }
}

export function verifyAdminSecretCode(input: string): boolean {
  const current = getAdminSecretCode();
  return input.trim() === current;
}

// Courses
export function getStoredCourses(): Course[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
      return INITIAL_COURSES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COURSES;
  }
}

export function saveStoredCourses(courses: Course[]) {
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
}

// Activation Codes
export function getStoredActivationCodes(): ActivationCode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVATION_CODES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVATION_CODES, JSON.stringify(INITIAL_ACTIVATION_CODES));
      return INITIAL_ACTIVATION_CODES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVATION_CODES;
  }
}

export function saveStoredActivationCodes(codes: ActivationCode[]) {
  localStorage.setItem(STORAGE_KEYS.ACTIVATION_CODES, JSON.stringify(codes));
}

// Activated Courses IDs for current student
export function getActivatedCourseIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVATED_COURSES);
    if (!raw) {
      // By default, activate the primary school course and one sample to give a warm start
      const defaults = ['c-sci-prim6'];
      localStorage.setItem(STORAGE_KEYS.ACTIVATED_COURSES, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return ['c-sci-prim6'];
  }
}

export function activateCourse(courseId: string) {
  const current = getActivatedCourseIds();
  if (!current.includes(courseId)) {
    const updated = [...current, courseId];
    localStorage.setItem(STORAGE_KEYS.ACTIVATED_COURSES, JSON.stringify(updated));
    return updated;
  }
  return current;
}

// Completed / Unlocked Lessons tracking
export function getCompletedLessonIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS);
    if (!raw) {
      return ['les-1-1']; // first lesson is completed/open
    }
    return JSON.parse(raw);
  } catch {
    return ['les-1-1'];
  }
}

export function markLessonCompleted(lessonId: string) {
  const current = getCompletedLessonIds();
  if (!current.includes(lessonId)) {
    const updated = [...current, lessonId];
    localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify(updated));
    return updated;
  }
  return current;
}

export function markAllLessonsCompleted(lessonIds: string[]): string[] {
  const current = getCompletedLessonIds();
  const set = new Set([...current, ...lessonIds]);
  const updated = Array.from(set);
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

// Grade Records
export function getStoredGradeRecords(): StudentGradeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GRADE_RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GRADE_RECORDS, JSON.stringify(INITIAL_GRADE_RECORDS));
      return INITIAL_GRADE_RECORDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_GRADE_RECORDS;
  }
}

export function saveStoredGradeRecords(records: StudentGradeRecord[]) {
  localStorage.setItem(STORAGE_KEYS.GRADE_RECORDS, JSON.stringify(records));
}

// Teachers
export function getStoredTeachers(): Teacher[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
      return INITIAL_TEACHERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TEACHERS;
  }
}

export function saveStoredTeachers(teachers: Teacher[]) {
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
}

// Essay Submissions
export function getStoredEssaySubmissions(): EssaySubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ESSAYS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ESSAYS, JSON.stringify(INITIAL_ESSAY_SUBMISSIONS));
      return INITIAL_ESSAY_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ESSAY_SUBMISSIONS;
  }
}

export function saveStoredEssaySubmissions(submissions: EssaySubmission[]) {
  localStorage.setItem(STORAGE_KEYS.ESSAYS, JSON.stringify(submissions));
}

// Leaderboard
export function getStoredLeaderboard(): LeaderboardStudent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(INITIAL_LEADERBOARD));
      return INITIAL_LEADERBOARD;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LEADERBOARD;
  }
}

// Student XP
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
  localStorage.setItem(STORAGE_KEYS.STUDENT_XP, next.toString());
  return next;
}

// Activation Logs (showing exact time, hour/minute, student, and teacher!)
export function getStoredActivationLogs(): ActivatedCodeLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVATION_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVATION_LOGS, JSON.stringify(INITIAL_ACTIVATED_CODE_LOGS));
      return INITIAL_ACTIVATED_CODE_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVATED_CODE_LOGS;
  }
}

export function saveActivationLog(log: Omit<ActivatedCodeLog, 'id' | 'activatedAtDate' | 'activatedAtTime' | 'fullTimestamp'>): ActivatedCodeLog {
  const current = getStoredActivationLogs();
  const now = new Date();
  
  // Format Arabic time with hour, minute and second
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
  localStorage.setItem(STORAGE_KEYS.ACTIVATION_LOGS, JSON.stringify(updated));
  return newLog;
}

// Group Chat Messages per Teacher
export function getStoredChatMessages(teacherId?: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const list: ChatMessage[] = raw ? JSON.parse(raw) : INITIAL_CHAT_MESSAGES;
    if (teacherId) {
      return list.filter((m) => m.teacherId === teacherId);
    }
    return list;
  } catch {
    return INITIAL_CHAT_MESSAGES;
  }
}

export function addChatMessage(teacherId: string, senderName: string, senderRole: 'student' | 'teacher', message: string, isTeacherAnnouncement = false): ChatMessage {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const list: ChatMessage[] = raw ? JSON.parse(raw) : INITIAL_CHAT_MESSAGES;
    
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
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(updated));
    return newMsg;
  } catch {
    const fallback: ChatMessage = {
      id: `msg-${Date.now()}`,
      teacherId,
      senderName,
      senderRole,
      message,
      time: 'الآن',
    };
    return fallback;
  }
}

// Auth User Session
export function getStoredAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredAuthUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  }
}

// Leaderboard Saver
export function saveStoredLeaderboard(students: LeaderboardStudent[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(students));
  } catch {
    // ignore
  }
}

// Activation Logs Saver & Clearer
export function saveStoredActivationLogs(logs: ActivatedCodeLog[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVATION_LOGS, JSON.stringify(logs));
  } catch {
    // ignore
  }
}

// Platform Global Settings (Customizable by Creator / المنشئ)
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
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: 'نغمة العلم',
  platformBadge: 'المنظومة الذكية',
  platformSlogan: 'نضبط إيقاع تفوقك الدراسي وتميزك الأكاديمي',
  welcomeTitle: 'بوابتك المباشرة نحو التفوق والدرجات النهائية',
  welcomeDescription: 'يسعدنا انضمامكم إلى صرحنا التعليمي المتكامل! سجّل بياناتك وبيانات ولي أمرك في دقائق معدودة للربط الفوري مع كبار الأساتذة، واستلام شروحات الحصص، وأداء الامتحانات، وتحميل شهادات التقدير الرقمية المعتمدة فوراً.',
  supportPhone: '+201012345678',
  announcementText: '🔥 خصم خاص 20% لفترة محدودة على جميع باقات الثانوية العامة وكروت التفعيل المطبوعة لجميع الصفوف!',
  showAnnouncement: true,
  enableDigitalCertificates: true,
  forceFirstScreenRegistration: true,
};

export function getPlatformSettings(): PlatformSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLATFORM_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(DEFAULT_PLATFORM_SETTINGS));
      return DEFAULT_PLATFORM_SETTINGS;
    }
    return { ...DEFAULT_PLATFORM_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PLATFORM_SETTINGS;
  }
}

export function savePlatformSettings(settings: PlatformSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

// Registered Students Registry (Managed by Creator / المنشئ)
export const INITIAL_REGISTERED_STUDENTS: AuthUser[] = [
  {
    role: 'student',
    name: 'عمر خالد المنشاوي',
    phone: '+201099887766',
    password: '123456',
    parentName: 'خالد المنشاوي',
    parentPhone: '+201012345678',
    studentCode: 'ST-101',
  },
  {
    role: 'student',
    name: 'سارة إبراهيم القاضي',
    phone: '+201055443322',
    password: '654321',
    parentName: 'إبراهيم القاضي',
    parentPhone: '+201088776655',
    studentCode: 'ST-102',
  },
  {
    role: 'student',
    name: 'أحمد محمود رضوان',
    phone: '+201022334455',
    password: '112233',
    parentName: 'محمود رضوان',
    parentPhone: '+201099112233',
    studentCode: 'ST-103',
  },
  {
    role: 'student',
    name: 'مريم شريف عبد الرحمن',
    phone: '+201077665544',
    password: '778899',
    parentName: 'شريف عبد الرحمن',
    parentPhone: '+201033445566',
    studentCode: 'ST-104',
  },
];

export function getRegisteredStudents(): AuthUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_STUDENTS, JSON.stringify(INITIAL_REGISTERED_STUDENTS));
      return INITIAL_REGISTERED_STUDENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REGISTERED_STUDENTS;
  }
}

export function saveRegisteredStudents(students: AuthUser[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_STUDENTS, JSON.stringify(students));
  } catch {
    // ignore
  }
}

export function addOrUpdateStudent(student: AuthUser) {
  const current = getRegisteredStudents();
  const existsIndex = current.findIndex(
    (s) => s.phone === student.phone || (s.studentCode && s.studentCode === student.studentCode)
  );
  let updated: AuthUser[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = { ...updated[existsIndex], ...student };
  } else {
    updated = [student, ...current];
  }
  saveRegisteredStudents(updated);
}

export function deleteRegisteredStudent(identifier: string) {
  const current = getRegisteredStudents();
  const updated = current.filter((s) => s.phone !== identifier && s.studentCode !== identifier);
  saveRegisteredStudents(updated);
}


