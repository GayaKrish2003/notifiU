import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import ChatBot from "../components/ChatBot";
import { useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  Megaphone,
  Calendar,
  MessageCircleQuestion,
  User as UserIcon,
  Search,
  Edit3,
  Plus,
  Pencil,
  Eye,
  Trash2,
  ArrowLeft,
  Paperclip,
  Download,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AnnouncementNotificationBell from "../components/AnnouncementNotificationBell";
import Logo from "../components/Logo";
import ProfileModal from "../components/ProfileModal";
import EventsDashboard from "../components/EventsDashboard";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../services/api";
import LecturerModules from "./LecturerModules";
import LecturerModuleView from "./LecturerModuleView";
import LecturerEnrollments from "./LecturerEnrollments";
import { showSuccess, showError, showConfirm } from "../utils/premiumAlert";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey =
  | "home"
  | "module"
  | "announcement"
  | "events"
  | "faqs"
  | "profile";

type AnnouncementView = "list" | "create" | "detail";
type ModuleView = "list" | "detail" | "enrollments";

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

interface Attachment {
  _id: string;
  storage_key?: string | null;
  file_path: string;
  file_url?: string | null;
  original_name: string;
  mime_type: string;
  size_bytes: number;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  publish_date: string;
  expiry_date?: string;
  status: "draft" | "published" | "archived";
  attachments: Attachment[];
}

interface CreateFormData {
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent" | "";
  expiry_date: string;
  publish_date: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

const getAttachmentUrl = (attachment: Attachment) => {
  if (attachment.file_url) {
    return attachment.file_url;
  }

  if (
    attachment.file_path.startsWith("http://") ||
    attachment.file_path.startsWith("https://")
  ) {
    return attachment.file_path;
  }

  return `http://localhost:5005${attachment.file_path}`;
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "General",
  medium: "Administrative",
  high: "Academic",
  urgent: "Urgent",
};

const STATUS_LABEL: Record<string, string> = {
  published: "Active",
  draft: "Draft",
  archived: "Archived",
};

const STATUS_COLOR: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-500",
};

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
          {[
            { label: "NIC", value: userData?.nic },
            { label: "PHONE", value: userData?.phonenumber },
          ].map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <p className="text-[#2D3A5D] font-black text-[11px] tracking-widest uppercase">
                {label}
              </p>
              <p className="text-[#2D3A5D]/60 font-bold text-xs">
                {value || "N/A"}
              </p>
            </div>
          ))}
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
        <div className="border-2 border-[#FBB017] rounded-[2.5rem] p-10 bg-white/50">
          <div className="grid grid-cols-2 gap-x-12 gap-y-10">
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

      <div className="flex-[1.2] space-y-16">
        {[
          {
            title: "Assigned Modules",
            items: modules.map((m) => ({
              label: `${m.name} - ${m.code} - ${m.semester}`,
              btn: "VIEW",
            })),
          },
          {
            title: "Student Groups",
            items: groups.map((g) => ({
              label: `${g.name} - ${g.students}`,
              btn: "MANAGE",
            })),
          },
        ].map((section) => (
          <div key={section.title} className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-[#FBB017] font-black">◆</span>
              <h2 className="text-[#FBB017] font-black text-xl tracking-wide">
                {section.title}
              </h2>
            </div>
            <div className="bg-[#EBECEF]/40 rounded-[2.5rem] p-8 space-y-4 shadow-inner">
              {section.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/40 hover:bg-white border border-transparent rounded-2xl p-4 flex items-center justify-between transition-all group"
                >
                  <p className="text-[#2D3A5D] font-bold text-[10px] leading-relaxed uppercase truncate flex-1 pr-4">
                    {item.label}
                  </p>
                  <button className="bg-[#FBB017] hover:bg-[#e9a215] text-[#2D3A5D] text-[9px] font-black px-5 py-2.5 rounded-xl shadow-lg transition-all uppercase tracking-[0.1em] shrink-0">
                    {item.btn}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
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

  const [moduleView, setModuleView] = useState<ModuleView>("list");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const [annView, setAnnView] = useState<AnnouncementView>("list");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);
  const [annLoading, setAnnLoading] = useState<boolean>(false);
  const [annError, setAnnError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const emptyForm: CreateFormData = {
    title: "",
    content: "",
    priority: "",
    expiry_date: "",
    publish_date: "",
  };
  const [formData, setFormData] = useState<CreateFormData>(emptyForm);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  const [editAnn, setEditAnn] = useState<Announcement | null>(null);
  const [editForm, setEditForm] = useState<CreateFormData>(emptyForm);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [editError, setEditError] = useState<string>("");

  const fetchAnnouncements = () => {
    setAnnLoading(true);
    setAnnError("");
    getAnnouncements()
      .then((res) => setAnnouncements(res.data as Announcement[]))
      .catch(() => setAnnError("Failed to load announcements."))
      .finally(() => setAnnLoading(false));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) updateHeader(JSON.parse(savedUser) as UserData);
    fetchAnnouncements();
  }, []);

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
      profileImage: userData.profileImage,
    });
    setFullUserData(userData);
  };

  const handleLogout = (): void => {
    localStorage.clear();
    navigate("/login");
  };

  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateCreateForm = () => {
    if (!formData.title.trim()) return "Title is required.";
    if (!formData.content.trim()) return "Content is required.";
    if (!formData.priority) return "Please select a category.";
    if (!formData.publish_date) return "Published date is required.";

    const today = new Date().toISOString().split("T")[0];

    if (formData.publish_date < today) {
      return "Published date cannot be in the past.";
    }

    if (formData.expiry_date && formData.expiry_date < formData.publish_date) {
      return "Deadline must be after published date.";
    }

    return "";
  };

  const handlePublish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateCreateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append(
        "priority",
        formData.priority as "low" | "medium" | "high" | "urgent",
      );
      data.append("status", "published");

      if (formData.expiry_date) {
        data.append("expiry_date", formData.expiry_date);
      }

      if (formData.publish_date) {
        data.append("publish_date", formData.publish_date);
      }

      if (attachmentFile) {
        data.append("attachments", attachmentFile);
      }

      await createAnnouncement(data);

      setFormData(emptyForm);
      setAttachmentFile(null);
      fetchAnnouncements();
      setAnnView("list");
    } catch {
      setFormError("Failed to create announcement.");
    } finally {
      setFormLoading(false);
    }
  };

  const openEdit = (ann: Announcement) => {
    setEditAnn(ann);
    setEditForm({
      title: ann.title,
      content: ann.content,
      priority: ann.priority,
      expiry_date: ann.expiry_date ? ann.expiry_date.substring(0, 10) : "",
      publish_date: ann.publish_date.substring(0, 10),
    });
    setEditError("");
  };

  const validateEditForm = () => {
    if (!editForm.title.trim()) return "Title is required.";
    if (!editForm.content.trim()) return "Content is required.";
    if (!editForm.priority) return "Category is required.";

    if (
      editForm.expiry_date &&
      editForm.publish_date &&
      editForm.expiry_date < editForm.publish_date
    ) {
      return "Deadline must be after published date.";
    }

    return "";
  };

  const handleEditSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editAnn) return;

    const validationError = validateEditForm();
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditLoading(true);
    setEditError("");

    try {
      const updated = await updateAnnouncement(editAnn._id, {
        title: editForm.title,
        content: editForm.content,
        priority: editForm.priority as "low" | "medium" | "high" | "urgent",
        expiry_date: editForm.expiry_date || undefined,
        status: editAnn.status,
      });

      setAnnouncements((prev) =>
        prev.map((a) =>
          a._id === editAnn._id ? (updated.data as Announcement) : a,
        ),
      );

      setEditAnn(null);
    } catch {
      setEditError("Failed to update announcement.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await showConfirm(
      "Delete Announcement?",
      "This action cannot be undone. Are you sure you want to delete this announcement?",
      "Yes, delete it"
    );
    if (!result.isConfirmed) return;

    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      showSuccess("Deleted", "Announcement deleted successfully");
    } catch {
      showError("Error", "Failed to delete announcement");
    }
  };

  const filteredAnnouncements = announcements.filter(
    (a: Announcement) =>
      PRIORITY_LABELS[a.priority]
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      new Date(a.publish_date).toLocaleDateString().includes(searchQuery) ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const underConstructionTabs: TabKey[] = [];

  return (
    <div className="min-h-screen bg-white relative">
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLogout={handleLogout}
        onUpdate={updateHeader}
      />

      {editAnn && (
        <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-gray-100">
              <h3 className="text-[#2D3A5D] font-black text-lg">
                Edit Announcement
              </h3>
              <button
                onClick={() => setEditAnn(null)}
                className="text-gray-400 hover:text-[#2D3A5D] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="px-8 py-6 space-y-5">
              {editError && (
                <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl text-center">
                  {editError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, title: e.target.value }))
                  }
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                  Description / Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, content: e.target.value }))
                  }
                  required
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editForm.priority}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        priority: e.target.value as CreateFormData["priority"],
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors bg-white"
                  >
                    <option value="high">Academic</option>
                    <option value="medium">Administrative</option>
                    <option value="low">General</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                    Deadline Date
                  </label>
                  <input
                    type="date"
                    value={editForm.expiry_date}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        expiry_date: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditAnn(null)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#FBB017] hover:bg-[#e9a215] text-white font-bold text-sm transition-colors disabled:opacity-70"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



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
            onClick={(tab) => {
              setActiveTab(tab);
              setModuleView("list");
              setSelectedModuleId(null);
            }}
          />
          <NavItem
            icon={Megaphone}
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

      <main className="max-w-[1600px] mx-auto px-16 py-16">
        {activeTab === "home" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-2xl font-black text-[#2D3A5D]/20 tracking-[0.3em] uppercase">
                ANNOUNCEMENTS
              </h1>
              <div className="relative w-96 group">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FBB017] transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by Category or Date"
                  className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-3 pl-14 pr-5 text-sm outline-none focus:bg-white focus:border-[#FBB017]/30 text-[#2D3A5D] font-medium transition-all"
                />
              </div>
            </div>
            <div className="space-y-4">
              {annLoading && (
                <p className="text-center text-[#2D3A5D]/30 font-bold py-16">
                  Loading...
                </p>
              )}
              {annError && (
                <p className="text-center text-red-400 font-bold py-16">
                  {annError}
                </p>
              )}
              {!annLoading &&
                !annError &&
                announcements
                  .filter((a) => a.status === "published")
                  .map((ann) => (
                    <div
                      key={ann._id}
                      className="bg-[#EBECEF]/40 hover:bg-white border border-transparent hover:border-[#FBB017]/10 rounded-2xl px-8 py-6 transition-all duration-300 hover:shadow-lg relative cursor-pointer"
                      onClick={() => {
                        setSelectedAnn(ann);
                        setActiveTab("announcement");
                        setAnnView("detail");
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="bg-[#FBB017] text-white text-[11px] font-bold px-4 py-1.5 rounded-full">
                          {formatDate(ann.publish_date)}
                        </div>
                        <div className="border border-[#FBB017] text-[#FBB017] text-[11px] font-bold px-4 py-1 rounded-full bg-white">
                          {PRIORITY_LABELS[ann.priority]}
                        </div>
                      </div>
                      <p className="text-[#2D3A5D] font-bold text-sm">
                        {ann.title}
                      </p>
                      <p className="text-[#2D3A5D]/60 text-sm mt-1">
                        {ann.content}
                      </p>
                      <div className="absolute right-8 bottom-5 text-[#2D3A5D]/30 font-bold text-xs tracking-widest">
                        {formatTime(ann.publish_date)}
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        )}

        {activeTab === "announcement" && annView === "list" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setFormData(emptyForm);
                  setFormError("");
                  setAnnView("create");
                }}
                className="flex items-center gap-2 bg-[#FBB017] hover:bg-[#e9a215] text-white font-bold px-6 py-3 rounded-xl active:scale-95 text-sm"
              >
                <Plus size={16} />
                New Announcement
              </button>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-[#2D3A5D]">
                ANNOUNCEMENTS
              </h1>
              <div className="relative w-80 group">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FBB017] transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Category or Date"
                  className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-3 pl-12 pr-5 text-sm outline-none focus:bg-white focus:border-[#FBB017]/30 text-[#2D3A5D] font-medium transition-all"
                />
              </div>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8F9FA] text-[#2D3A5D]/60 font-bold text-xs uppercase tracking-widest">
                    <th className="text-left px-6 py-4">Title</th>
                    <th className="text-left px-6 py-4">Category</th>
                    <th className="text-left px-6 py-4">Target</th>
                    <th className="text-left px-6 py-4">Date Published</th>
                    <th className="text-left px-6 py-4">Deadline</th>
                    <th className="text-left px-6 py-4">Status</th>
                    <th className="text-left px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnnouncements.map((ann, idx) => (
                    <tr
                      key={ann._id}
                      className={`border-t border-gray-50 hover:bg-[#FAFAFA] transition-colors ${idx % 2 === 0 ? "" : "bg-gray-50/30"}`}
                    >
                      <td className="px-6 py-4 text-[#2D3A5D] font-medium">
                        {ann.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="border border-[#FBB017]/50 text-[#FBB017] text-[11px] font-bold px-3 py-1 rounded-full">
                          {PRIORITY_LABELS[ann.priority]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#2D3A5D]/60">
                        University-wide
                      </td>
                      <td className="px-6 py-4 text-[#2D3A5D]/60">
                        {formatDate(ann.publish_date)}
                      </td>
                      <td className="px-6 py-4 text-[#2D3A5D]/60">
                        {ann.expiry_date ? formatDate(ann.expiry_date) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[11px] font-bold px-3 py-1 rounded-full ${STATUS_COLOR[ann.status]}`}
                        >
                          {STATUS_LABEL[ann.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            title="Edit"
                            onClick={() => openEdit(ann)}
                            className="text-[#2D3A5D]/40 hover:text-[#FBB017] transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            title="View"
                            onClick={() => {
                              setSelectedAnn(ann);
                              setAnnView("detail");
                            }}
                            className="text-[#2D3A5D]/40 hover:text-[#FBB017] transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => setDeleteConfirmId(ann._id)}
                            className="text-[#2D3A5D]/40 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "announcement" && annView === "create" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setAnnView("list")}
                className="text-[#2D3A5D]/40 hover:text-[#FBB017] transition-colors"
              >
                <X size={22} />
              </button>
              <h1 className="text-2xl font-black text-[#2D3A5D]/20 tracking-[0.3em] uppercase">
                ANNOUNCEMENTS MANAGEMENT
              </h1>
            </div>

            <div className="max-w-2xl bg-white border border-gray-100 rounded-2xl shadow-sm p-10">
              <h2 className="text-[#2D3A5D] font-black text-xl mb-8">
                Create New Announcement
              </h2>

              {formError && (
                <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl mb-6 text-center">
                  {formError}
                </div>
              )}

              <form onSubmit={handlePublish} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="Enter Announcement Title"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                    Description / Content{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleFormChange}
                    placeholder="Enter additional comments"
                    required
                    rows={5}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleFormChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors bg-white appearance-none"
                    >
                      <option value="">Select Category</option>
                      <option value="high">Academic</option>
                      <option value="medium">Administrative</option>
                      <option value="low">General</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                      Target Type <span className="text-red-500">*</span>
                    </label>
                    <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors bg-white appearance-none">
                      <option value="">Select Type</option>
                      <option value="university">University-wide</option>
                      <option value="faculty">Faculty</option>
                      <option value="module">Module-specific</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                      Deadline Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="expiry_date"
                      value={formData.expiry_date}
                      onChange={handleFormChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                      Published Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="publish_date"
                      value={formData.publish_date}
                      onChange={handleFormChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                    Attachment (PDF / Notice)
                  </label>
                  <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
                    <Paperclip size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-400 flex-1">
                      {attachmentFile ? attachmentFile.name : "Choose File"}
                    </span>
                    <label className="cursor-pointer text-[#FBB017] text-xs font-bold hover:underline">
                      Browse
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg"
                        className="hidden"
                        onChange={(e) =>
                          setAttachmentFile(e.target.files?.[0] ?? null)
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setAnnView("list")}
                    className="px-8 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-8 py-3 rounded-xl bg-[#FBB017] hover:bg-[#e9a215] text-white font-bold text-sm transition-colors disabled:opacity-70"
                  >
                    {formLoading ? "Publishing..." : "Publish"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "announcement" &&
          annView === "detail" &&
          selectedAnn && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-6 mb-10">
                <button
                  onClick={() => setAnnView("list")}
                  className="flex items-center gap-2 text-[#2D3A5D]/40 hover:text-[#FBB017] transition-colors font-bold text-sm"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
                <h1 className="text-2xl font-black text-[#2D3A5D]/20 tracking-[0.3em] uppercase">
                  ANNOUNCEMENTS
                </h1>
              </div>

              <div className="bg-[#EBECEF]/40 rounded-2xl px-8 py-6 relative mb-3">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-[#FBB017] text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm">
                    {formatDate(selectedAnn.publish_date)}
                  </div>
                  <div className="border border-[#FBB017] text-[#FBB017] text-[11px] font-bold px-4 py-1 rounded-full bg-white">
                    {PRIORITY_LABELS[selectedAnn.priority]}
                  </div>
                </div>
                <div className="space-y-1 mb-8">
                  <p className="text-[#2D3A5D] font-bold text-sm">
                    {selectedAnn.title}
                  </p>
                  <p className="text-[#2D3A5D]/60 text-sm">
                    {selectedAnn.content}
                  </p>
                </div>
                <div className="absolute right-8 bottom-5 text-[#2D3A5D]/30 font-bold text-xs tracking-widest">
                  {formatTime(selectedAnn.publish_date)}
                </div>
              </div>

              {selectedAnn.attachments.map((att: Attachment) => (
                <div
                  key={att._id}
                  className="bg-[#EBECEF]/60 rounded-2xl px-8 py-4 flex items-center justify-between mt-2"
                >
                  <div className="flex items-center gap-3 text-[#2D3A5D]/50">
                    <Paperclip size={16} />
                    <span className="text-sm font-medium">
                      {att.original_name}
                    </span>
                  </div>
                  <a
                    href={getAttachmentUrl(att)}
                    download={att.original_name}
                    className="border border-[#2D3A5D]/20 text-[#2D3A5D]/60 hover:border-[#FBB017] hover:text-[#FBB017] text-[11px] font-bold px-5 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                  >
                    <Download size={12} />
                    Download
                  </a>
                </div>
              ))}
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

        {activeTab === "faqs" && (
          <div className="mt-10">
            <ChatBot />
          </div>
        )}

        {activeTab === "events" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <EventsDashboard role="lecturer" />
          </div>
        )}

        {activeTab === "module" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {moduleView === "list" && (
              <LecturerModules
                onOpen={(id: string) => {
                  setSelectedModuleId(id);
                  setModuleView("detail");
                }}
              />
            )}

            {moduleView === "detail" && selectedModuleId && (
              <LecturerModuleView
                moduleId={selectedModuleId}
                onBack={() => {
                  setModuleView("list");
                  setSelectedModuleId(null);
                }}
                onViewFullEnrollments={(id: string) => {
                  setSelectedModuleId(id);
                  setModuleView("enrollments");
                }}
              />
            )}

            {moduleView === "enrollments" && selectedModuleId && (
              <LecturerEnrollments
                moduleId={selectedModuleId}
                onBack={() => setModuleView("detail")}
              />
            )}
          </div>
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
