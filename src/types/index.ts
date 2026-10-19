export type Role = 'student' | 'teacher' | 'parent' | 'admin';

export type EducationalStage = 'primary' | 'preparatory' | 'secondary';

export interface StageInfo {
  id: EducationalStage;
  name: string;
  subtitle: string;
  description: string;
  grades: string[];
  icon: string;
  color: string;
}

export interface Teacher {
  id: string;
  name: string;
  title: string;
  subject: string;
  stage: EducationalStage;
  avatar: string;
  experienceYears: number;
  rating: number;
  studentsCount: number;
  phone: string;
  bio: string;
  welcomeMessage?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface EssayQuestion {
  id: string;
  question: string;
  modelAnswer: string;
  maxScore: number;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  summary: string;
  hasPdf: boolean;
  pdfUrl?: string;
  order: number;
  isLocked?: boolean;
  quiz?: {
    passingScore: number;
    durationMinutes?: number;
    title?: string;
    questions: QuizQuestion[];
  };
  essayQuestion?: EssayQuestion;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  stage: EducationalStage;
  gradeLevel: string; // e.g. "الصف الثالث الثانوي"
  subject: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  thumbnail: string;
  description: string;
  price: number;
  isFree?: boolean;
  requiresActivationCode: boolean;
  activationCodeSample?: string;
  chapters: Chapter[];
  features: string[];
  enrolledStudentsCount: number;
}

export interface ActivationCode {
  id: string;
  code: string;
  courseId: string;
  courseTitle: string;
  teacherId?: string;
  teacherName?: string;
  studentName?: string;
  isUsed: boolean;
  createdAt: string;
  usedAt?: string;
  maxUses: number;
  usedCount: number;
}

export interface ActivatedCodeLog {
  id: string;
  code: string;
  studentName: string;
  studentPhone?: string;
  courseTitle: string;
  teacherName: string;
  teacherId: string;
  activatedAtDate: string;
  activatedAtTime: string; // e.g., "03:45 مساءً"
  fullTimestamp: string;
}

export interface ChatMessage {
  id: string;
  teacherId: string;
  senderName: string;
  senderRole: 'student' | 'teacher';
  message: string;
  time: string;
  isTeacherAnnouncement?: boolean;
}

export interface StudentGradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  parentPhone: string;
  stage: EducationalStage;
  gradeLevel: string;
  courseTitle: string;
  teacherId?: string;
  teacherName?: string;
  examTitle: string;
  examDate: string;
  score: number;
  maxScore: number;
  attendancePercentage: number;
  status: 'ممتاز' | 'جيد جداً' | 'جيد' | 'يحتاج متابعة';
  teacherNotes: string;
  sentToParent: boolean;
  sentAt?: string;
}

export interface LeaderboardStudent {
  id: string;
  name: string;
  stage: EducationalStage;
  gradeLevel: string;
  points: number;
  quizzesCompleted: number;
  rank: number;
  badge: string;
  avatar: string;
}

export interface EssaySubmission {
  id: string;
  studentName: string;
  courseTitle: string;
  lessonTitle: string;
  question: string;
  studentAnswer: string;
  maxScore: number;
  score?: number;
  teacherFeedback?: string;
  status: 'pending' | 'graded';
  submittedAt: string;
}

export type StudentStatus = 'active' | 'suspended' | 'pending';

export interface StudentNote {
  id: string;
  studentId?: string;
  studentName?: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  noteText: string;
  isSharedWithTeacher: boolean;
  createdAt: string;
}

export interface AuthUser {
  role: Role;
  name: string;
  phone: string;
  password?: string;
  parentName?: string;
  parentPhone?: string;
  studentCode?: string;
  selectedTeacherId?: string;
  isAdmin?: boolean;
  status?: StudentStatus; // 'active' (نشط) | 'suspended' (موقوف) | 'pending' (قيد المراجعة)
  statusUpdatedAt?: string;
  statusReason?: string;
}
