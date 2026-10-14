/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Role, Course, Teacher, AuthUser 
} from './types';
import { 
  getStoredCourses, getStoredTeachers, getActivatedCourseIds, 
  activateCourse, getStoredAuthUser, saveStoredAuthUser,
  getPlatformSettings, PlatformSettings
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TeachersDirectory } from './components/TeachersDirectory';
import { TeacherProfileView } from './components/TeacherProfileView';
import { CourseViewer } from './components/CourseViewer';
import { ParentPortalView } from './components/ParentPortalView';
import { AdminDashboard } from './components/AdminDashboard';
import { LeaderboardView } from './components/LeaderboardView';
import { WhatsAppSupportModal } from './components/WhatsAppSupportModal';
import { TeacherGradeUploaderModal } from './components/TeacherGradeUploaderModal';
import { ActivationCodeModal } from './components/ActivationCodeModal';
import { QuickAccessModal } from './components/QuickAccessModal';
import { AuthModal } from './components/AuthModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { InteractiveBackground } from './components/InteractiveBackground';
import { WelcomeRegistrationPage } from './components/WelcomeRegistrationPage';
import { 
  MessageCircle, Search, Award, Shield, User, GraduationCap, 
  Sparkles, Phone, Lock, Eye, Megaphone
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredAuthUser());
  const [role, setRole] = useState<Role>(currentUser?.role || 'student');
  const [activeNav, setActiveNav] = useState<string>('teachers');
  const [isEyeComfortMode, setIsEyeComfortMode] = useState(false);
  const [isGuestBrowsing, setIsGuestBrowsing] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(getPlatformSettings());

  // Persistent data state
  const [courses, setCourses] = useState<Course[]>(getStoredCourses());
  const [teachers, setTeachers] = useState<Teacher[]>(getStoredTeachers());
  const [activatedCourseIds, setActivatedCourseIds] = useState<string[]>(getActivatedCourseIds());

  // Teacher Workspace State
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Course Viewer state
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  // Admin access state (requires 2035)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'student' | 'parent' | 'teacher' | 'admin'>('student');
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppTopic, setWhatsAppTopic] = useState<string | undefined>(undefined);
  const [isTeacherGradesOpen, setIsTeacherGradesOpen] = useState(false);
  const [modalActiveTeacher, setModalActiveTeacher] = useState<Teacher | null>(null);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [activationTargetCourse, setActivationTargetCourse] = useState<Course | null>(null);
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(false);

  // Refresh courses and platform data from storage when admin makes changes
  const refreshData = () => {
    setCourses(getStoredCourses());
    setTeachers(getStoredTeachers());
    setActivatedCourseIds(getActivatedCourseIds());
    setPlatformSettings(getPlatformSettings());
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    if (newRole === 'admin') {
      if (!isAdminUnlocked) {
        setIsAdminPasswordModalOpen(true);
      } else {
        setActiveNav('admin');
        setActiveCourse(null);
      }
    } else if (newRole === 'parent') {
      setActiveNav('parent');
      setActiveCourse(null);
    } else if (newRole === 'teacher') {
      // Pick first teacher if none selected
      const target = teachers[0] || null;
      setModalActiveTeacher(target);
      setIsTeacherGradesOpen(true);
    } else {
      setActiveNav('teachers');
      setActiveCourse(null);
    }
  };

  const handleNavigate = (section: string) => {
    if (section === 'admin') {
      if (!isAdminUnlocked) {
        setIsAdminPasswordModalOpen(true);
        return;
      }
    }
    if (section === 'welcome') {
      setIsGuestBrowsing(false);
    }
    setActiveNav(section);
    setActiveCourse(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminPasswordSuccess = () => {
    setIsAdminUnlocked(true);
    setIsAdminPasswordModalOpen(false);
    setRole('admin');
    setActiveNav('admin');
    setActiveCourse(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    saveStoredAuthUser(user);
    setRole(user.role);
    setIsGuestBrowsing(false);

    if (user.role === 'admin') {
      setIsAdminUnlocked(true);
      setActiveNav('admin');
    } else if (user.role === 'parent') {
      setActiveNav('parent');
    } else if (user.role === 'teacher') {
      const matchTeacher = teachers.find((t) => t.id === user.selectedTeacherId) || teachers[0];
      setSelectedTeacher(matchTeacher);
      setActiveNav('teachers');
    } else {
      setActiveNav('teachers');
    }
    setActiveCourse(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredAuthUser(null);
    setRole('student');
    setIsAdminUnlocked(false);
    setIsGuestBrowsing(false);
    setActiveNav('welcome');
    setActiveCourse(null);
    setSelectedTeacher(null);
  };

  const handleSelectCourse = (course: Course) => {
    setActiveCourse(course);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenActivation = (course: Course) => {
    setActivationTargetCourse(course);
    setIsActivationModalOpen(true);
  };

  const handleActivationSuccess = (courseId: string) => {
    setActivatedCourseIds(activateCourse(courseId));
    if (activeCourse && activeCourse.id === courseId) {
      setActiveCourse({ ...activeCourse });
    }
  };

  const handleOpenWhatsAppWithTopic = (topic?: string) => {
    setWhatsAppTopic(topic);
    setIsWhatsAppOpen(true);
  };

  const handleOpenTeacherGradesForTeacher = (targetTeacher?: Teacher | null) => {
    setModalActiveTeacher(targetTeacher || selectedTeacher || teachers[0]);
    setIsTeacherGradesOpen(true);
  };

  // Dedicated Standalone Welcome & Registration Page: "خلي التسجيل في صفحة لوحده هو والمقدمة الترحيبية"
  if ((!currentUser && !isGuestBrowsing) || activeNav === 'welcome') {
    return (
      <>
        <WelcomeRegistrationPage
          onRegisterStudent={handleLoginSuccess}
          onOpenTeacherLogin={() => {
            setAuthDefaultTab('teacher');
            setIsAuthModalOpen(true);
          }}
          onOpenParentLogin={() => {
            setAuthDefaultTab('parent');
            setIsAuthModalOpen(true);
          }}
          onOpenAdminLogin={() => {
            setIsAdminPasswordModalOpen(true);
          }}
          onSkipAsGuest={() => {
            setIsGuestBrowsing(true);
            setActiveNav('teachers');
          }}
          teachers={teachers}
        />

        {/* Global Modals accessible while on Welcome & Registration page */}
        <AdminPasswordModal
          isOpen={isAdminPasswordModalOpen}
          onClose={() => setIsAdminPasswordModalOpen(false)}
          onSuccess={handleAdminPasswordSuccess}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          defaultTab={authDefaultTab}
          teachers={teachers}
          onOpenAdminWithPassword={() => {
            setIsAuthModalOpen(false);
            setIsAdminPasswordModalOpen(true);
          }}
        />

        <WhatsAppSupportModal
          isOpen={isWhatsAppOpen}
          onClose={() => setIsWhatsAppOpen(false)}
          defaultTopic={whatsAppTopic}
        />
      </>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 relative ${isEyeComfortMode ? 'bg-[#fbf7ee] text-amber-950' : 'bg-slate-50 text-slate-900'}`}>
      {/* Interactive Background with Eye-Comfort Ambient Mode */}
      <InteractiveBackground isEyeComfortMode={isEyeComfortMode} />

      {/* Platform Announcement Ticker configured by Creator */}
      {platformSettings.showAnnouncement && platformSettings.announcementText && (
        <div className="relative z-50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs py-2 px-4 text-center flex items-center justify-center gap-2 shadow-xs">
          <Megaphone className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{platformSettings.announcementText}</span>
        </div>
      )}

      {/* Top Main Navigation */}
      <div className="relative z-40">
        <Navbar
          currentRole={role}
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          activeNav={activeNav}
          onNavigate={handleNavigate}
          onOpenQuickAccess={() => setIsQuickAccessOpen(true)}
          onOpenTeacherGrades={() => handleOpenTeacherGradesForTeacher()}
          onOpenWhatsApp={() => handleOpenWhatsAppWithTopic()}
          onOpenAuthModal={(tab) => {
            setAuthDefaultTab(tab || 'student');
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          isEyeComfortMode={isEyeComfortMode}
          onToggleEyeComfort={() => setIsEyeComfortMode(!isEyeComfortMode)}
        />

        {/* Role Notice & Login Prompt Bar */}
        <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-400">
                {currentUser ? `👤 مرحباً ${currentUser.name} (${role}):` : `🌟 تتصفح كـ (${role}):`}
              </span>
              <span className="text-slate-300 hidden sm:inline">
                {role === 'student' && 'اختر أستاذك مباشرة لدخول كورساته وغرفة الدردشة وحل الكويزات.'}
                {role === 'teacher' && 'أدواتك الخاصة: رفع درجات أولياء الأمور، طباعة كروت الأكواد، وإدارة الدردشة.'}
                {role === 'parent' && 'متابعة حية للدرجات والامتحانات الشهرية ونسبة الحضور وملاحظات المعلم.'}
                {role === 'admin' && 'لوحة التحكم الشاملة الآمنة للمنشئ مع تتبع الأكواد بالساعة واسم الأستاذ.'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!currentUser && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setAuthDefaultTab('teacher');
                      setIsAuthModalOpen(true);
                    }}
                    className="text-[11px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-0.5 rounded transition-colors shadow-2xs"
                  >
                    دخول الأساتذة 👨‍🏫
                  </button>
                  <button
                    onClick={() => {
                      setAuthDefaultTab('student');
                      setIsAuthModalOpen(true);
                    }}
                    className="text-[11px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 py-0.5 rounded transition-colors"
                  >
                    تسجيل الدخول 🔑
                  </button>
                </div>
              )}
              <span className="text-[11px] text-slate-400">تبديل فوري:</span>
              {(['student', 'teacher', 'parent', 'admin'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`text-[11px] px-2 py-0.5 rounded font-bold transition-all ${
                    role === r
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white bg-white/10'
                  }`}
                >
                  {r === 'student' ? 'طالب' : r === 'teacher' ? 'أستاذ' : r === 'parent' ? 'ولي أمر' : 'المنشئ 🔒'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {activeCourse ? (
          /* Course Viewer with Sequential Lock */
          <CourseViewer
            course={activeCourse}
            onBack={() => setActiveCourse(null)}
            onOpenActivationModal={() => handleOpenActivation(activeCourse)}
            isCourseActivated={
              activatedCourseIds.includes(activeCourse.id) || !activeCourse.requiresActivationCode
            }
            onOpenTeacherGradeModal={() => handleOpenTeacherGradesForTeacher()}
            currentUser={currentUser}
          />
        ) : (
          <>
            {/* View by active tab */}
            {activeNav === 'teachers' && (
              <div className="space-y-8">
                {!selectedTeacher && (
                  /* Hero Section when browsing teachers */
                  <HeroSection
                    onBrowseCourses={() => {
                      const el = document.getElementById('teachers-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    onOpenTeacherGrades={() => handleOpenTeacherGradesForTeacher()}
                    onOpenQuickAccess={() => setIsQuickAccessOpen(true)}
                    onOpenWhatsApp={() => handleOpenWhatsAppWithTopic()}
                    onOpenTeacherLogin={() => {
                      setAuthDefaultTab('teacher');
                      setIsAuthModalOpen(true);
                    }}
                  />
                )}

                <div id="teachers-section">
                  {selectedTeacher ? (
                    /* Specific Teacher Profile & Workspace */
                    <TeacherProfileView
                      teacher={selectedTeacher}
                      courses={courses}
                      currentUser={currentUser}
                      onBackToTeachers={() => setSelectedTeacher(null)}
                      onSelectCourse={handleSelectCourse}
                      onOpenActivationModal={handleOpenActivation}
                      onOpenTeacherGradeModal={(t) => handleOpenTeacherGradesForTeacher(t)}
                      activatedCourseIds={activatedCourseIds}
                    />
                  ) : (
                    /* Direct Teacher Selector (Stages Canceled as requested) */
                    <TeachersDirectory
                      teachers={teachers}
                      courses={courses}
                      onSelectTeacher={(t) => {
                        setSelectedTeacher(t);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onOpenTeacherGradeModal={(t) => handleOpenTeacherGradesForTeacher(t)}
                      onOpenWhatsApp={handleOpenWhatsAppWithTopic}
                    />
                  )}
                </div>
              </div>
            )}

            {activeNav === 'leaderboard' && (
              <div id="leaderboard-section">
                <LeaderboardView />
              </div>
            )}

            {activeNav === 'parent' && (
              <div id="parent-section">
                <ParentPortalView
                  onOpenTeacherGradeModal={() => handleOpenTeacherGradesForTeacher()}
                  onOpenWhatsApp={handleOpenWhatsAppWithTopic}
                />
              </div>
            )}

            {activeNav === 'admin' && (
              <div id="admin-section">
                <AdminDashboard
                  onUpdateCourses={refreshData}
                  onPreviewCourse={handleSelectCourse}
                  onOpenQuickAccess={() => setIsQuickAccessOpen(true)}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Persistent Floating WhatsApp Technical Support Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <button
          onClick={() => handleOpenWhatsAppWithTopic()}
          className="group flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-500/25 border-2 border-white transition-all transform hover:scale-105 active:scale-95"
          title="تواصل مباشر مع الدعم الفني عبر واتساب"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6 fill-white text-emerald-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
          </div>
          <span className="text-xs font-bold whitespace-nowrap pl-1">
            الدعم الفني (واتساب)
          </span>
        </button>
      </div>

      {/* Persistent Floating Quick Access Quick Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsQuickAccessOpen(true)}
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md px-4 py-2.5 rounded-full shadow-xl border border-slate-700 transition-all transform hover:scale-105"
          title="البحث والوصول السريع"
        >
          <Search className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold">الوصول السريع ⚡</span>
        </button>
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        teachers={teachers}
        defaultTab={authDefaultTab}
        onLoginSuccess={handleLoginSuccess}
        onOpenAdminWithPassword={() => {
          setIsAuthModalOpen(false);
          setIsAdminPasswordModalOpen(true);
        }}
      />

      <AdminPasswordModal
        isOpen={isAdminPasswordModalOpen}
        onClose={() => setIsAdminPasswordModalOpen(false)}
        onSuccess={handleAdminPasswordSuccess}
      />

      <WhatsAppSupportModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        defaultTopic={whatsAppTopic}
      />

      <TeacherGradeUploaderModal
        isOpen={isTeacherGradesOpen}
        onClose={() => setIsTeacherGradesOpen(false)}
        courses={courses}
        activeTeacher={modalActiveTeacher}
        onGradesUpdated={refreshData}
      />

      <ActivationCodeModal
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
        targetCourse={activationTargetCourse}
        onSuccess={handleActivationSuccess}
        onOpenWhatsAppSupport={handleOpenWhatsAppWithTopic}
      />

      <QuickAccessModal
        isOpen={isQuickAccessOpen}
        onClose={() => setIsQuickAccessOpen(false)}
        courses={courses}
        teachers={teachers}
        onSelectCourse={(course) => {
          setActiveCourse(course);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTeacherGradeModal={() => handleOpenTeacherGradesForTeacher()}
        onOpenWhatsApp={handleOpenWhatsAppWithTopic}
        onSwitchRole={handleRoleChange}
        onGoToSection={(sectionId) => {
          if (sectionId === 'admin-section') handleNavigate('admin');
          if (sectionId === 'parent-section') handleNavigate('parent');
          if (sectionId === 'leaderboard-section') handleNavigate('leaderboard');
          setActiveCourse(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 text-white border-t border-slate-800 text-right mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-amber-400" />
                <span className="text-lg font-black">{platformSettings.platformName} 🎓</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                "طلب العلم كالنقش على الحجر، وكل خطوة تخطوها اليوم هي لحن تفوقك في الغد." منظومة تعليمية ذكية تتيح للطالب اختيار أستاذه المعتمد مباشرة، مع نظام القفل المتسلسل، كروت الأكواد المطبوعة، غرف الدردشة الجماعية، وبوابة رفع درجات أولياء الأمور.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>جميع الأزرار والروابط فعالة بنسبة 100% في النظام</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">أقسام المنصة</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button 
                    onClick={() => handleNavigate('welcome')} 
                    className="text-amber-400 font-bold hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>صفحة التسجيل والترحيب 🎓</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('teachers'); setSelectedTeacher(null); setActiveCourse(null); }} className="hover:text-white">
                    الأساتذة المعتمدون
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setAuthDefaultTab('teacher'); setIsAuthModalOpen(true); }}
                    className="text-amber-400 font-bold hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>👨‍🏫</span>
                    <span>دخول الأساتذة</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('leaderboard'); setActiveCourse(null); }} className="hover:text-white">
                    لوحة شرف أوائل الطلبة
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('parent'); setActiveCourse(null); }} className="hover:text-white">
                    بوابة أولياء الأمور
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigate('admin')} 
                    className="hover:text-amber-300 flex items-center gap-1.5 transition-colors group text-slate-400"
                    title="بوابة المنشئ محمية برمز سري خاص"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400/80 group-hover:text-amber-400 shrink-0" />
                    <span>بوابة المنشئ السرية</span>
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">الدعم الفني المباشر</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="dir-ltr font-mono">{platformSettings.supportPhone}</span>
                </li>
                <li>
                  <button 
                    onClick={() => handleOpenWhatsAppWithTopic()}
                    className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    محادثة واتساب فورية
                  </button>
                </li>
                <li className="text-[11px] text-slate-500 pt-1">
                  متاح على مدار الساعة للطلاب وأولياء الأمور والمعلمين
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2026 {platformSettings.platformName}. جميع الحقوق محفوظة ومحمية.
            </div>
            <div className="flex items-center gap-4">
              <span>نظام القفل المتسلسل</span>
              <span>·</span>
              <span>أكواد التفعيل المطبوعة</span>
              <span>·</span>
              <span>رفع تقارير أولياء الأمور</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
