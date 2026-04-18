import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  Briefcase,
  Calendar,
  MessageCircleQuestion,
  User as UserIcon,
  Search,
  Edit3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Logo from "../components/Logo";
import ProfileModal from "../components/ProfileModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey =
  | "home"
  | "module"
  | "announcement"
  | "events"
  | "faqs"
  | "profile";

interface UserData {
  _id?: string;
  lecturerId?: string;
  name: string;
  email?: string;
  nic?: string;
  phonenumber?: string;
  university?: string;
  department?: string;
  address?: string;
  age?: string | number;
  profileImage?: string;
}

interface HeaderUser {
  name: string;
  displayId: string;
  initials: string;
  profileImage?: string;
}

interface ModuleItem {
  name: string;
  code: string;
  semester: string;
}

interface GroupItem {
  name: string;
  students: string;
}

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  tab: TabKey;
  active?: boolean;
  onClick: (tab: TabKey) => void;
}

interface LecturerProfileViewProps {
  userData: UserData | null;
  onEditClick: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  tab,
  active = false,
  onClick,
}) => (
  <div
    onClick={() => onClick(tab)}
    className="flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-300 px-6 group"
  >
    <Icon
      size={22}
      className={
        active ? "text-[#FBB017]" : "text-white/60 group-hover:text-white"
      }
    />
    <span
      className={`text-[10px] font-black uppercase tracking-[0.1em] ${active ? "text-[#FBB017]" : "text-white/40 group-hover:text-white/80"}`}
    >
      {label}
    </span>
  </div>
);

const LecturerProfileView: React.FC<LecturerProfileViewProps> = ({
  userData,
  onEditClick,
}) => {
  const modules: ModuleItem[] = [
    { name: "Software Engineering", code: "SE2020", semester: "Year 2 Sem 1" },
    { name: "Database Systems", code: "IT1102", semester: "Year 1 Sem 2" },
    { name: "Data Structures", code: "IT2010", semester: "Year 2 Sem 1" },
  ];

  const groups: GroupItem[] = [
    { name: "SE2020 - Group A", students: "32 Students" },
    { name: "IT1102 - Group B", students: "28 Students" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-20 p-4 max-w-[1500px] mx-auto animate-in fade-in duration-700">
      {/* Left Column */}
      <div className="flex-1 space-y-12">
        <div className="space-y-6">
          <h2 className="text-gray-400 font-medium text-lg tracking-[0.2em] uppercase">
            PROFILE
          </h2>
          <div className="space-y-1">
            <h1 className="text-[#FBB017] text-2xl font-black uppercase tracking-tight">
              {userData?.lecturerId ||
                userData?._id?.substring(0, 8).toUpperCase() ||
                "LEC12345"}{" "}
              {userData?.name || "LECTURER NAME"}
            </h1>
            <p className="text-[#2D3A5D]/50 text-sm font-semibold italic">
              {userData?.email || "lecturer@email.com"}
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <div className="space-y-1">
            <p className="text-[#2D3A5D] font-black text-[11px] tracking-widest uppercase">
              NIC
            </p>
            <p className="text-[#2D3A5D]/60 font-bold text-xs">
              {userData?.nic || "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[#2D3A5D] font-black text-[11px] tracking-widest uppercase">
              PHONE
            </p>
            <p className="text-[#2D3A5D]/60 font-bold text-xs">
              {userData?.phonenumber || "N/A"}
            </p>
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

        {/* Professional Info Box */}
        <div className="border-2 border-[#FBB017] rounded-[2.5rem] p-10 bg-white/50 relative overflow-hidden">
          <div className="grid grid-cols-2 gap-x-12 gap-y-10 font-[Outfit]">
            {[
              { label: "University", value: userData?.university },
              { label: "Department", value: userData?.department },
              { label: "Address", value: userData?.address },
              { label: "Age", value: userData?.age?.toString() },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[#2D3A5D] font-black text-[11px] tracking-widest uppercase mb-1">
                  {label}
                </p>
                <p className="text-[#2D3A5D]/40 font-bold text-xs">
                  {value || "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-[1.2] space-y-16">
        {/* Assigned Modules */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-[#FBB017] font-black">◆</span>
            <h2 className="text-[#FBB017] font-black text-xl tracking-wide">
              Assigned Modules
            </h2>
          </div>
          <div className="bg-[#EBECEF]/40 rounded-[2.5rem] p-8 space-y-4 shadow-inner">
            {modules.map((module, idx) => (
              <div
                key={idx}
                className="bg-white/40 hover:bg-white border border-transparent rounded-2xl p-4 flex items-center justify-between transition-all group"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-[#2D3A5D] font-bold text-[10px] leading-relaxed uppercase truncate">
                    {module.name} -{" "}
                    <span className="opacity-40">{module.code}</span> -{" "}
                    <span className="opacity-40 italic">{module.semester}</span>
                  </p>
                </div>
                <button className="bg-[#FBB017] hover:bg-[#e9a215] text-[#2D3A5D] text-[9px] font-black px-5 py-2.5 rounded-xl shadow-lg shadow-[#FBB017]/10 transition-all uppercase tracking-[0.1em] shrink-0">
                  VIEW
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Student Groups */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-[#FBB017] font-black">◆</span>
            <h2 className="text-[#FBB017] font-black text-xl tracking-wide">
              Student Groups
            </h2>
          </div>
          <div className="bg-[#EBECEF]/40 rounded-[2.5rem] p-8 space-y-4 shadow-inner">
            {groups.map((group, idx) => (
              <div
                key={idx}
                className="bg-white/40 hover:bg-white border border-transparent rounded-2xl p-4 flex items-center justify-between transition-all group"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-[#2D3A5D] font-bold text-[10px] leading-relaxed uppercase truncate">
                    {group.name} -{" "}
                    <span className="opacity-40">{group.students}</span>
                  </p>
                </div>
                <button className="bg-[#FBB017] hover:bg-[#e9a215] text-[#2D3A5D] text-[9px] font-black px-5 py-2.5 rounded-xl shadow-lg shadow-[#FBB017]/10 transition-all uppercase tracking-[0.1em] shrink-0">
                  MANAGE
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const LecturerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [fullUserData, setFullUserData] = useState<UserData | null>(null);
  const [user, setUser] = useState<HeaderUser>({
    name: "Lecturer",
    displayId: "LEC00000",
    initials: "LC",
  });

  const updateHeader = (userData: UserData | null): void => {
    if (!userData) return;
    const displayId =
      userData.lecturerId ||
      userData._id?.substring(0, 8).toUpperCase() ||
      "LEC00000";
    const names = userData.name.trim().split(" ");

    let formattedName = userData.name;
    let initials = "LC";

    if (names.length >= 2) {
      const firstNameInitial = names[0].charAt(0).toUpperCase();
      const lastName = names[names.length - 1];
      formattedName = `${firstNameInitial}.${lastName}`;
      initials = (
        names[0].charAt(0) + names[names.length - 1].charAt(0)
      ).toUpperCase();
    } else if (names.length === 1) {
      initials = names[0].substring(0, 2).toUpperCase();
    }

    setUser({
      name: formattedName,
      displayId,
      initials,
      profileImage: userData.profileImage,
    });
    setFullUserData(userData);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      updateHeader(JSON.parse(savedUser) as UserData);
    }
  }, []);

  const handleLogout = (): void => {
    localStorage.clear();
    navigate("/login");
  };

  const underConstructionTabs: TabKey[] = [
    "module",
    "announcement",
    "events",
    "faqs",
  ];

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
            <p className="text-[#2D3A5D] font-black text-xs tracking-[0.2em] mb-0.5 uppercase">
              {user.displayId}
            </p>
            <p className="text-[#2D3A5D]/60 font-bold text-[11px] truncate max-w-[150px]">
              {user.name}
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-[#FBB017] to-[#e9a215] rounded-full flex items-center justify-center text-[#2D3A5D] font-black text-sm shadow-[0_8px_20px_-4px_rgba(251,176,23,0.3)] overflow-hidden">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              user.initials
            )}
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-[#1A1C2C] px-10 py-4 flex items-center justify-between shadow-lg sticky top-[89px] z-[40]">
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <NavItem
            icon={Home}
            label="Home"
            tab="home"
            active={activeTab === "home"}
            onClick={setActiveTab}
          />
          <NavItem
            icon={BookOpen}
            label="Module"
            tab="module"
            active={activeTab === "module"}
            onClick={setActiveTab}
          />
          <NavItem
            icon={Briefcase}
            label="Announcement"
            tab="announcement"
            active={activeTab === "announcement"}
            onClick={setActiveTab}
          />
          <NavItem
            icon={Calendar}
            label="Events"
            tab="events"
            active={activeTab === "events"}
            onClick={setActiveTab}
          />
          <NavItem
            icon={MessageCircleQuestion}
            label="FAQs"
            tab="faqs"
            active={activeTab === "faqs"}
            onClick={setActiveTab}
          />
        </div>
        <div className="flex-1 flex justify-end">
          <NavItem
            icon={UserIcon}
            label="Profile"
            tab="profile"
            active={activeTab === "profile"}
            onClick={setActiveTab}
          />
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-16 py-16">
        {activeTab === "home" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-16">
              <h1 className="text-3xl font-black text-[#2D3A5D]/10 tracking-[0.3em] uppercase">
                ANNOUNCEMENTS
              </h1>
              <div className="relative w-96 group">
                <Search
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FBB017] transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by Category or Date"
                  className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-4 pl-16 pr-6 text-sm outline-none focus:bg-white focus:border-[#FBB017]/30 focus:shadow-xl text-[#2D3A5D] font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-8">
              {[1, 2, 3].map((id) => (
                <div
                  key={id}
                  className="bg-[#EBECEF]/40 hover:bg-white border border-transparent hover:border-[#FBB017]/10 rounded-[3rem] p-12 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="bg-[#FBB017] text-white text-[11px] font-black px-8 py-3 rounded-full inline-block shadow-lg shadow-[#FBB017]/20 uppercase tracking-[0.2em]">
                      12 Sep 2025
                    </div>
                    <div className="border border-[#FBB017] text-[#FBB017] text-[11px] font-black px-8 py-2.5 rounded-full bg-white group-hover:bg-[#FBB017]/5 transition-colors uppercase tracking-[0.2em]">
                      Faculty Notice
                    </div>
                  </div>
                  <div className="space-y-3 relative z-10">
                    <h3 className="text-[#2D3A5D] font-black text-xl uppercase tracking-tight leading-tight group-hover:text-[#FBB017] transition-colors">
                      Faculty Meeting: Curriculum Review
                    </h3>
                    <p className="text-[#2D3A5D]/50 text-base font-bold leading-relaxed max-w-4xl">
                      All lecturers are required to attend the upcoming
                      curriculum review meeting.
                    </p>
                  </div>
                  <div className="absolute right-12 bottom-12 text-[#2D3A5D]/20 font-black text-sm tracking-[0.3em]">
                    10:30
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <LecturerProfileView
            userData={fullUserData}
            onEditClick={() => {
              setShowProfileModal(true);
              setTimeout(
                () =>
                  window.dispatchEvent(new CustomEvent("open-profile-edit")),
                100,
              );
            }}
          />
        )}

        {underConstructionTabs.includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-52 text-center animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-black text-[#2D3A5D]/10 tracking-[0.4em] uppercase">
              {activeTab} SECTION
            </h2>
            <p className="text-[#2D3A5D]/20 font-bold mt-4 tracking-widest">
              This part is currently under construction
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LecturerDashboard;
