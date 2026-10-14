import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Users, Sparkles, Pin, CheckCircle2, User, Smile } from 'lucide-react';
import { Teacher, ChatMessage, AuthUser } from '../types';
import { getStoredChatMessages, addChatMessage } from '../utils/storage';

interface Props {
  teacher: Teacher;
  currentUser: AuthUser | null;
}

export const TeacherGroupChat: React.FC<Props> = ({ teacher, currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(getStoredChatMessages(teacher.id));
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const reloadMessages = () => {
    setMessages(getStoredChatMessages(teacher.id));
  };

  useEffect(() => {
    reloadMessages();
  }, [teacher.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const senderRole = currentUser?.role === 'teacher' ? 'teacher' : 'student';
    const senderName = currentUser?.name || (senderRole === 'teacher' ? teacher.name : 'طالب مجتهد');

    const newMsg = addChatMessage(
      teacher.id,
      senderName,
      senderRole,
      inputMessage.trim(),
      senderRole === 'teacher'
    );

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
  };

  const handleQuickQuestion = (text: string) => {
    setInputMessage(text);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[520px] text-right">
      {/* Group Chat Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={teacher.avatar}
              alt={teacher.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-amber-400"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black">{teacher.name}</h3>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-1.5 py-0.2 rounded">
                مجموعة النقاش الرسمية
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-2">
              <span>{teacher.subject}</span>
              <span>·</span>
              <span>👥 {teacher.studentsCount.toLocaleString()} طالب منضم</span>
            </p>
          </div>
        </div>

        <div className="text-left text-xs text-slate-300 hidden sm:block">
          <span className="text-emerald-400 font-bold">● متصل الآن</span>
        </div>
      </div>

      {/* Pinned Teacher Announcement */}
      <div className="bg-amber-50/80 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-950">
        <div className="flex items-center gap-2">
          <Pin className="w-3.5 h-3.5 text-amber-600 shrink-0 rotate-45" />
          <span className="font-bold">تنبيه المعلم:</span>
          <span className="truncate">
            {teacher.welcomeMessage || 'أهلاً بكم في غرفة المناقشات! اطرحوا أسئلتكم حول المسائل المعقدة وسأجيبكم دورياً.'}
          </span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
        {messages.map((msg) => {
          const isMe = currentUser?.name === msg.senderName;
          const isTeacher = msg.senderRole === 'teacher';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 px-1">
                <span className="font-bold text-slate-800">{msg.senderName}</span>
                {isTeacher && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                    المعلم المعتمد
                  </span>
                )}
                <span>·</span>
                <span className="font-mono text-[10px] text-slate-400">{msg.time}</span>
              </div>

              <div
                className={`p-3 rounded-2xl max-w-sm sm:max-w-md text-xs leading-relaxed shadow-2xs ${
                  isTeacher
                    ? 'bg-amber-50 border-2 border-amber-300 text-slate-900 font-medium'
                    : isMe
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs text-slate-500">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">اقتراحات سريعة:</span>
        {[
          'يا مستر ممكن شرح مبسط لقانون كيرشوف؟',
          'متى موعد رفع درجات الامتحان القادم؟',
          'أين أجد مذكرة الشرح وملف الـ PDF؟',
        ].map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickQuestion(q)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-full whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`اكتب سؤالك أو استفسارك هنا في مجموعة ${teacher.name}...`}
          className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 text-right"
        />
        <button
          type="submit"
          className="p-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center shrink-0"
          title="إرسال"
        >
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </form>
    </div>
  );
};
