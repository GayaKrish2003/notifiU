import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, Calendar, MessageCircleQuestion,
  User as UserIcon, Search, Edit3, ArrowLeft, Paperclip, Download
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Logo from '../components/Logo';
import ProfileModal from '../components/ProfileModal';
import { getAnnouncements } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'home' | 'module' | 'announcement' | 'events' | 'faqs' | 'profile';

interface UserData {
  _id?: string;
  name: string;
  email?: string;
  role?: string;
  profileImage?: string;
  nic?: string;
  studentId?: string;
  lecturerId?: string;
  university?: string;
  department?: string;
  [key: string]: unknown;
}

interface HeaderUser {
  name: string;
  displayId: string;
  initials: string;
  profileImage?: string;
}

interface AcademicMetric {
  label1: string;
  val1: string;
  label2: string;
  val2: string;
}

interface ExamItem {
  name: string;
  code: string;
  status: string;
}

interface ExamSection {
  title: string;
  exams: ExamItem[];
}

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  tab: TabKey;
  active?: boolean;
  onClick: (tab: TabKey) => void;
}

interface ProfileViewProps {
  userData: UserData | null;
  onEditClick: () => void;
}

interface Attachment {
  _id: string;
  file_path: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  publish_date: string;
  expiry_date?: string;
  status: 'draft' | 'published' | 'archived';
  attachments: Attachment[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, tab, active = false, onClick }) => (
  <div
    onClick={() => onClick(tab)}
    className="flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-300 px-6 group"
  >
    <Icon size={22} className={active ? 'text-[#FBB017]' : 'text-white/60 group-hover:text-white'} />
    <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${active ? 'text-[#FBB017]' : 'text-white/40 group-hover:text-white/80'}`}>
      {label}
    </span>
  </div>
);

const ProfileView: React.FC<ProfileViewProps> = ({ userData, onEditClick }) => {
  const academicMetrics: AcademicMetric[] = [
    { label1: 'CGP', val1: '135', label2: 'Specialization', val2: 'Information Technology' },
    { label1: 'CGPA', val1: '3.5', label2: 'Repeat/IC Counts', val2: '0' },
    { label1: 'WGPA', val1: '3.67', label2: 'Batch', val2: 'Weekend' },
  ];

  const examData: ExamSection[] = [
    {
      title: 'Mid Term Exam',
      exams: [
        { name: 'Software Engineering', code: 'SE2020', status: 'REGULAR' },
        { name: 'Database Design and Development', code: 'IT1102', status: 'REGULAR' },
        { name: 'Probability and Statistics', code: 'IT3120', status: 'REGULAR' },
        { name: 'Artificial Intelligence and Machine Learning', code: 'IT2011', status: 'REGULAR' },
      ]
    },
    {
      title: 'Final Exam',
      exams: [
        { name: 'Software Engineering', code: 'SE2020', status: 'REGULAR' },
        { name: 'Database Design and Development', code: 'IT1102', status: 'REGULAR' },
        { name: 'Probability and Statistics', code: 'IT3120', status: 'REGULAR' },
        { name: 'Artificial Intelligence and Machine Learning', code: 'IT2011', status: 'REGULAR' },
      ]
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-20 p-4 max-w-[1500px] mx-auto animate-in fade-in duration-700">
      {/* Left Column: Profile Identification & Academic Stats */}
      <div className="flex-1 space-y-12">
        <div className="space-y-6">
          <h2 className="text-gray-400 font-medium text-lg tracking-[0.2em] uppercase">PROFILE</h2>
          <div className="space-y-1">
            <h1 className="text-[#FBB017] text-2xl font-black uppercase tracking-tight">
              {userData?.studentId || userData?.lecturerId || userData?._id?.substring(0, 8).toUpperCase() || 'ID12345678'} {userData?.name || 'USER NAME'}
            </h1>
            <p className="text-[#2D3A5D]/50 text-sm font-semibold italic">
              {userData?.email || 'user@email.com'}
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <div className="space-y-1">
            <p className="text-[#2D3A5D] font-black text-[11px] tracking-widest uppercase">NIC</p>
            <p className="text-[#2D3A5D]/60 font-bold text-xs">{userData?.nic || '1998********'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[#2D3A5D] font-black text-[11px] tracking-widest uppercase">GENDER</p>
            <p className="text-[#2D3A5D]/60 font-bold text-xs">MALE</p>
          </div>
          <div className="pt-4">
            <button
              onClick={onEditClick}
              className="flex items-center gap-2 bg-[#1A1C2C] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-[#2D3A5D] transition-all hover:scale-105 active:scale-95"
            >
              <Edit3 size={14} className="text-[#FBB017]" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Academic/Professional Stats Box */}
        <div className="border-2 border-[#FBB017] rounded-[2.5rem] p-10 bg-white/50 relative overflow-hidden">
          {userData?.role === 'student' ? (
            <div className="grid grid-cols-2 gap-x-12 gap-y-10 font-[Outfit]">
              {academicMetrics.map((item, idx) => (
                <React.Fragment key={idx}>
                  <div>
                    <p className="text-[#2D3A5D] font-black text-[11px] tracking-widest uppercase mb-1">{item.label1}</p>
                    <p className="text-[#2D3A5D]/40 font-bold text-xs">{item.val1}</p>
                  </div>
                  <div>
                    <p className="text-[#2D3A5D] font-black text-[11px] tracking-widest uppercase mb-1">{item.label2}</p>
                    <p className="text-[#2D3A5D]/40 font-bold text-xs">{item.val2}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-y-10 font-[Outfit]">
              <div>
                <p className="text-[#2D3A5D] font-black text-[11px] tracking-widest uppercase mb-1">University</p>
                <p className="text-[#2D3A5D]/40 font-bold text-xs">{userData?.university || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[#2D3A5D] font-black text-[11px] tracking-widest uppercase mb-1">Department</p>
                <p className="text-[#2D3A5D]/40 font-bold text-xs">{userData?.department || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Exam Details (Only for Students) */}
      {userData?.role === 'student' && (
        <div className="flex-[1.2] space-y-16">
          {examData.map((section, sIdx) => (
            <div key={sIdx} className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-[#FBB017] font-black">◆</span>
                <h2 className="text-[#FBB017] font-black text-xl tracking-wide">{section.title}</h2>
              </div>

              <div className="bg-[#EBECEF]/40 rounded-[2.5rem] p-8 space-y-4 shadow-inner">
                {section.exams.map((exam, eIdx) => (
                  <div key={eIdx} className="bg-white/40 hover:bg-white border border-transparent rounded-2xl p-4 flex items-center justify-between transition-all group">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-[#2D3A5D] font-bold text-[10px] leading-relaxed uppercase truncate">
                        {exam.name} - <span className="opacity-40">{exam.code}</span> - <span className="opacity-40 italic">{exam.status}</span>
                      </p>
                    </div>
                    <button className="bg-[#FBB017] hover:bg-[#e9a215] text-[#2D3A5D] text-[9px] font-black px-5 py-2.5 rounded-xl shadow-lg shadow-[#FBB017]/10 transition-all uppercase tracking-[0.1em] shrink-0">
                      CLICK HERE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [fullUserData, setFullUserData] = useState<UserData | null>(null);
  const [user, setUser] = useState<HeaderUser>({
    name: 'User Name',
    displayId: 'ID12345678',
    initials: 'UN',
  });

  const updateHeader = (userData: UserData | null): void => {
    if (!userData) return;
    const displayId = userData.studentId || userData.lecturerId || userData._id?.substring(0, 8).toUpperCase() || 'ID12345678';
    const names = userData.name.trim().split(' ');

    let formattedName = userData.name;
    let initials = 'UN';

    if (names.length >= 2) {
      const firstNameInitial = names[0].charAt(0).toUpperCase();
      const lastName = names[names.length - 1];
      formattedName = `${firstNameInitial}.${lastName}`;
      initials = (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    } else if (names.length === 1) {
      initials = names[0].substring(0, 2).toUpperCase();
    }

    setUser({
      name: formattedName,
      displayId,
      initials,
      profileImage: userData.profileImage as string | undefined,
    });
    setFullUserData(userData);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      updateHeader(JSON.parse(savedUser) as UserData);
    }
  }, []);

  const handleLogout = (): void => {
    localStorage.clear();
    navigate('/login');
  };

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annLoading, setAnnLoading] = useState<boolean>(false);
  const [annError, setAnnError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setAnnLoading(true);
    getAnnouncements({ status: 'published' })
      .then((res) => setAnnouncements(res.data as Announcement[]))
      .catch(() => setAnnError('Failed to load announcements.'))
      .finally(() => setAnnLoading(false));
  }, []);

  const filteredAnnouncements = announcements.filter((a: Announcement) =>
    a.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
    new Date(a.publish_date).toLocaleDateString().includes(searchQuery) ||
    a.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const underConstructionTabs: TabKey[] = ['module', 'announcement', 'events', 'faqs'];

  return (
    <div className="min-h-screen bg-white relative font-[Outfit]">
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLogout={handleLogout}
        onUpdate={updateHeader}
      />

      {/* Header */}
      <header className="px-10 py-5 flex justify-between items-center border-b border-gray-100 bg-white sticky top-0 z-[50]">
        <Logo className="scale-[0.85] origin-left" />
        <div
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-4 cursor-pointer"
        >
          <div className="text-right">
            <p className="text-[#2D3A5D] font-black text-xs tracking-[0.2em] mb-0.5 uppercase">{user.displayId}</p>
            <p className="text-[#2D3A5D]/60 font-bold text-[11px] truncate max-w-[150px]">{user.name}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-[#FBB017] to-[#e9a215] rounded-full flex items-center justify-center text-[#2D3A5D] font-black text-sm shadow-[0_8px_20px_-4px_rgba(251,176,23,0.3)] overflow-hidden">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user.initials
            )}
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-[#1A1C2C] px-10 py-4 flex items-center justify-between shadow-lg sticky top-[89px] z-[40]">
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <NavItem icon={Home} label="Home" tab="home" active={activeTab === 'home'} onClick={setActiveTab} />
          <NavItem icon={BookOpen} label="Module" tab="module" active={activeTab === 'module'} onClick={setActiveTab} />
          <NavItem icon={Briefcase} label="Announcement" tab="announcement" active={activeTab === 'announcement'} onClick={setActiveTab} />
          <NavItem icon={Calendar} label="Events" tab="events" active={activeTab === 'events'} onClick={setActiveTab} />
          <NavItem icon={MessageCircleQuestion} label="FAQs" tab="faqs" active={activeTab === 'faqs'} onClick={setActiveTab} />
        </div>
        <div className="flex-1 flex justify-end">
          <NavItem icon={UserIcon} label="Profile" tab="profile" active={activeTab === 'profile'} onClick={setActiveTab} />
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-16 py-16">
        {activeTab === 'home' && !selectedAnnouncement && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-16">
              <h1 className="text-3xl font-black text-[#2D3A5D]/10 tracking-[0.3em] uppercase">ANNOUNCEMENTS</h1>
              <div className="relative w-96 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FBB017] transition-colors" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Category or Date"
                  className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-4 pl-16 pr-6 text-sm outline-none focus:bg-white focus:border-[#FBB017]/30 focus:shadow-xl text-[#2D3A5D] font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-6">
              {annLoading && (
                <p className="text-center text-[#2D3A5D]/30 font-bold tracking-widest py-20">Loading...</p>
              )}
              {annError && (
                <p className="text-center text-red-400 font-bold py-20">{annError}</p>
              )}
              {!annLoading && !annError && filteredAnnouncements.map((ann: Announcement) => (
                <div
                  key={ann._id}
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="bg-[#EBECEF]/40 hover:bg-white border border-transparent hover:border-[#FBB017]/10 rounded-2xl px-8 py-6 transition-all duration-300 hover:shadow-lg group relative overflow-hidden cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#FBB017] text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm">
                      {formatDate(ann.publish_date)}
                    </div>
                    <div className="border border-[#FBB017] text-[#FBB017] text-[11px] font-bold px-4 py-1 rounded-full bg-white capitalize">
                      {ann.priority}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[#2D3A5D] font-bold text-sm">{ann.title}</p>
                    <p className="text-[#2D3A5D]/60 text-sm">{ann.content}</p>
                  </div>

                  <div className="absolute right-8 bottom-5 text-[#2D3A5D]/30 font-bold text-xs tracking-widest">
                    {formatTime(ann.publish_date)}
                  </div>
                </div>
              ))}

              {!annLoading && !annError && filteredAnnouncements.length === 0 && (
                <p className="text-center text-[#2D3A5D]/30 font-bold tracking-widest py-20">No announcements found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'home' && selectedAnnouncement && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-6 mb-10">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="flex items-center gap-2 text-[#2D3A5D]/40 hover:text-[#FBB017] transition-colors font-bold text-sm"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <h1 className="text-3xl font-black text-[#2D3A5D]/10 tracking-[0.3em] uppercase">ANNOUNCEMENTS</h1>
            </div>

            {/* Detail Card */}
            <div className="bg-[#EBECEF]/40 rounded-2xl px-8 py-6 relative mb-3">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-[#FBB017] text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm">
                  {formatDate(selectedAnnouncement.publish_date)}
                </div>
                <div className="border border-[#FBB017] text-[#FBB017] text-[11px] font-bold px-4 py-1 rounded-full bg-white capitalize">
                  {selectedAnnouncement.priority}
                </div>
              </div>

              <div className="space-y-1 mb-8">
                <p className="text-[#2D3A5D] font-bold text-sm">{selectedAnnouncement.title}</p>
                <p className="text-[#2D3A5D]/60 text-sm">{selectedAnnouncement.content}</p>
              </div>

              <div className="absolute right-8 bottom-5 text-[#2D3A5D]/30 font-bold text-xs tracking-widest">
                {formatTime(selectedAnnouncement.publish_date)}
              </div>
            </div>

            {/* Attachments */}
            {selectedAnnouncement.attachments.map((att: Attachment) => (
              <div
                key={att._id}
                className="bg-[#EBECEF]/60 rounded-2xl px-8 py-4 flex items-center justify-between mt-2"
              >
                <div className="flex items-center gap-3 text-[#2D3A5D]/50">
                  <Paperclip size={16} />
                  <span className="text-sm font-medium">{att.original_name}</span>
                </div>
                <a
                  href={`http://localhost:5005${att.file_path}`}
                  download={att.original_name}
                  onClick={(e) => e.stopPropagation()}
                  className="border border-[#2D3A5D]/20 text-[#2D3A5D]/60 hover:border-[#FBB017] hover:text-[#FBB017] text-[11px] font-bold px-5 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <Download size={12} />
                  Download
                </a>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileView
            userData={fullUserData}
            onEditClick={() => {
              setShowProfileModal(true);
              setTimeout(() => window.dispatchEvent(new CustomEvent('open-profile-edit')), 100);
            }}
          />
        )}

        {underConstructionTabs.includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-52 text-center animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-black text-[#2D3A5D]/10 tracking-[0.4em] uppercase">{activeTab} SECTION</h2>
            <p className="text-[#2D3A5D]/20 font-bold mt-4 tracking-widest">This part is currently under construction</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
