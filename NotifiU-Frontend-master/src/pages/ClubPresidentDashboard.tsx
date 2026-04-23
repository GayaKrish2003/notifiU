import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  History,
  Settings,
  User as UserIcon,
  Crown,
} from "lucide-react";
import Logo from "../components/Logo";
import ProfileModal from "../components/ProfileModal";
import AnnouncementNotificationBell from "../components/AnnouncementNotificationBell";
import EventsDashboard from "../components/EventsDashboard";
import AdminEventsPanel from "../components/AdminEventsPanel";

type TabKey = "home" | "events" | "manage-events" | "event-history" | "profile";

interface UserData {
  _id?: string;
  name: string;
  email?: string;
  studentId?: string;
  university?: string;
  phonenumber?: string;
  profileImage?: string;
  [key: string]: unknown;
}

interface HeaderUser {
  name: string;
  displayId: string;
  initials: string;
  profileImage?: string;
}

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  tab: TabKey;
  active?: boolean;
  onClick: (tab: TabKey) => void;
}> = ({ icon: Icon, label, tab, active = false, onClick }) => (
  <div
    onClick={() => onClick(tab)}
    className="flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-300 px-5 group"
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

const ClubPresidentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [user, setUser] = useState<HeaderUser>({
    name: "Club President",
    displayId: "CP00000",
    initials: "CP",
  });

  const updateHeader = (data: UserData | null) => {
    if (!data) return;
    const displayId =
      data.studentId || data._id?.substring(0, 8).toUpperCase() || "CP00000";
    const names = data.name.trim().split(" ");
    let formattedName = data.name;
    let initials = "CP";
    if (names.length >= 2) {
      formattedName = `${names[0].charAt(0).toUpperCase()}.${names[names.length - 1]}`;
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
      profileImage: data.profileImage,
    });
    setUserData(data);
  };

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) updateHeader(JSON.parse(saved) as UserData);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const tabs: { key: TabKey; icon: React.ElementType; label: string }[] = [
    { key: "home", icon: Home, label: "Home" },
    { key: "events", icon: Calendar, label: "Events" },
    { key: "manage-events", icon: Settings, label: "Manage" },
    { key: "event-history", icon: History, label: "History" },
    { key: "profile", icon: UserIcon, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-white font-['Outfit',_sans-serif]">
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLogout={handleLogout}
        onUpdate={updateHeader}
      />

      {/* Header */}
      <header className="px-10 py-5 flex justify-between items-center border-b border-gray-100 bg-white sticky top-0 z-[50]">
        <div className="flex items-center gap-3">
          <Logo className="scale-[0.85] origin-left" />
          <div className="flex items-center gap-2 bg-[#FFF9EE] border border-[#FBB017]/30 rounded-full px-4 py-1.5">
            <Crown size={12} className="text-[#FBB017]" />
            <span className="text-[#FBB017] font-black text-[10px] uppercase tracking-widest">
              Club President
            </span>
          </div>
        </div>
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

      {/* Navigation */}
      <nav className="bg-[#1A1C2C] px-10 py-4 flex items-center justify-between shadow-lg sticky top-[89px] z-[40]">
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {tabs
            .filter((t) => t.key !== "profile")
            .map((t) => (
              <NavItem
                key={t.key}
                icon={t.icon}
                label={t.label}
                tab={t.key}
                active={activeTab === t.key}
                onClick={setActiveTab}
              />
            ))}
        </div>
        <div className="flex-1 flex justify-end items-center gap-2">
          <AnnouncementNotificationBell />
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
        {/* HOME - Welcome + Quick Stats */}
        {activeTab === "home" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12">
              <h1 className="text-4xl font-black text-[#2D3A5D]/10 tracking-[0.3em] uppercase mb-2">
                DASHBOARD
              </h1>
              <p className="text-[#FBB017] font-black text-sm uppercase tracking-widest">
                Welcome back, {user.name}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  label: "My Events",
                  description: "Create and manage your upcoming events",
                  tab: "manage-events" as TabKey,
                  icon: Settings,
                  color: "from-[#FBB017] to-[#e9a215]",
                },
                {
                  label: "Upcoming Events",
                  description: "View all upcoming events in the university",
                  tab: "events" as TabKey,
                  icon: Calendar,
                  color: "from-[#2D3A5D] to-[#1A1C2C]",
                },
                {
                  label: "Event History",
                  description: "View past events and export reports",
                  tab: "event-history" as TabKey,
                  icon: History,
                  color: "from-purple-500 to-purple-700",
                },
              ].map((card) => (
                <button
                  key={card.tab}
                  onClick={() => setActiveTab(card.tab)}
                  className="bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:border-[#FBB017]/30 hover:shadow-2xl transition-all duration-300 text-left group hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <card.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-[#2D3A5D] font-black text-lg uppercase tracking-tight mb-2 group-hover:text-[#FBB017] transition-colors">
                    {card.label}
                  </h3>
                  <p className="text-[#2D3A5D]/40 text-sm font-medium leading-relaxed">
                    {card.description}
                  </p>
                </button>
              ))}
            </div>
            <div className="bg-[#FFF9EE] border border-[#FBB017]/20 rounded-[2.5rem] p-10">
              <div className="flex items-center gap-4 mb-4">
                <Crown size={20} className="text-[#FBB017]" />
                <h2 className="text-[#2D3A5D] font-black text-sm uppercase tracking-widest">
                  Club President Profile
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: "Name", value: userData?.name },
                  { label: "Email", value: userData?.email as string },
                  { label: "Student ID", value: userData?.studentId },
                  {
                    label: "University",
                    value: userData?.university as string,
                  },
                  { label: "Phone", value: userData?.phonenumber as string },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[#2D3A5D] font-black text-[10px] uppercase tracking-widest mb-1">
                      {label}
                    </p>
                    <p className="text-[#2D3A5D]/60 font-bold text-xs">
                      {value || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EVENTS - View upcoming */}
        {activeTab === "events" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <EventsDashboard
              role="clubpresident"
              setActiveTab={(tab) => setActiveTab(tab as TabKey)}
            />
          </div>
        )}

        {/* MANAGE EVENTS - Create/Edit/Delete */}
        {activeTab === "manage-events" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AdminEventsPanel
              role="clubpresident"
              isHistory={false}
              setActiveTab={(tab) => setActiveTab(tab as TabKey)}
            />
          </div>
        )}

        {/* EVENT HISTORY - Past events + export */}
        {activeTab === "event-history" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AdminEventsPanel
              role="clubpresident"
              isHistory={true}
              setActiveTab={(tab) => setActiveTab(tab as TabKey)}
            />
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-black text-[#2D3A5D]/10 tracking-[0.3em] uppercase mb-10">
                PROFILE
              </h1>
              <div className="bg-white border-2 border-[#FBB017] rounded-[2.5rem] p-10">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#FBB017] to-[#e9a215] rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl overflow-hidden">
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
                  <div>
                    <h2 className="text-[#FBB017] font-black text-xl uppercase tracking-tight">
                      {userData?.name || "Club President"}
                    </h2>
                    <p className="text-[#2D3A5D]/40 text-sm font-bold">
                      {(userData?.email as string) || "email@example.com"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Crown size={12} className="text-[#FBB017]" />
                      <span className="text-[#FBB017] text-[10px] font-black uppercase tracking-widest">
                        Club President
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2 bg-[#1A1C2C] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-[#2D3A5D] transition-all hover:scale-105 active:scale-95"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClubPresidentDashboard;
