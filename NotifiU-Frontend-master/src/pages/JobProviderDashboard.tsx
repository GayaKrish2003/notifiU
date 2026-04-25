import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Briefcase,
  Plus,
  User as UserIcon,
  Trash2,
  X,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AnnouncementNotificationBell from "../components/AnnouncementNotificationBell";
import Logo from "../components/Logo";
import ProfileModal from "../components/ProfileModal";
import { createJobPost, getMyJobPosts, deleteJobPost } from "../services/api";
import type { JobPost } from "../types/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "home" | "my-posts" | "post-job" | "profile";

interface UserData {
  _id?: string;
  name: string;
  email?: string;
  role?: string;
  profileImage?: string;
  companyName?: string;
  designation?: string;
  companyWebsite?: string;
  [key: string]: unknown;
}

interface HeaderUser {
  name: string;
  displayId: string;
  initials: string;
  profileImage?: string;
}

// The shape of our create job form
interface JobFormData {
  title: string;
  description: string;
  companyName: string;
  jobType: string;
  location: string;
  skills: string; // comma-separated string in the form, we split it before sending
  salaryRange: string;
  applicationLink: string;
  deadline: string;
}

type ApiError = {
  response?: { data?: { message?: string } };
};

// ─── NavItem Component ────────────────────────────────────────────────────────

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  tab: TabKey;
  active?: boolean;
  onClick: (tab: TabKey) => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  tab,
  active,
  onClick,
}) => (
  <button
    onClick={() => onClick(tab)}
    className={`flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all ${
      active ? "text-[#FBB017]" : "text-white/40 hover:text-white/70"
    }`}
  >
    <Icon size={18} />
    <span className="text-[9px] font-black tracking-widest uppercase">
      {label}
    </span>
  </button>
);

// ─── Status Badge Component ───────────────────────────────────────────────────
// Shows a coloured pill based on the job post status

interface StatusBadgeProps {
  status: "pending" | "approved" | "rejected";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };
  const icons = {
    pending: <Clock size={11} />,
    approved: <CheckCircle size={11} />,
    rejected: <XCircle size={11} />,
  };
  return (
    <span
      className={`flex items-center gap-1 border text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${styles[status]}`}
    >
      {icons[status]}
      {status}
    </span>
  );
};

// ─── Profile View ─────────────────────────────────────────────────────────────

interface ProfileViewProps {
  userData: UserData | null;
  onEditClick: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ userData, onEditClick }) => (
  <div className="flex flex-col lg:flex-row gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex flex-col items-center gap-6 lg:w-64 shrink-0">
      <div className="w-28 h-28 bg-gradient-to-br from-[#FBB017] to-[#e9a215] rounded-full flex items-center justify-center text-[#2D3A5D] font-black text-3xl shadow-[0_8px_30px_-4px_rgba(251,176,23,0.4)] overflow-hidden">
        {userData?.profileImage ? (
          <img
            src={userData.profileImage}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          userData?.name?.substring(0, 2).toUpperCase() || "JP"
        )}
      </div>
      <div className="text-center">
        <h1 className="text-[#2D3A5D] font-black text-lg tracking-wide">
          {userData?.name || "Job Provider"}
        </h1>
        <p className="text-[#2D3A5D]/50 text-sm font-semibold italic">
          {userData?.email || ""}
        </p>
      </div>
      <button
        onClick={onEditClick}
        className="flex items-center gap-2 bg-[#1A1C2C] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-[#2D3A5D] transition-all hover:scale-105 active:scale-95"
      >
        Edit Profile
      </button>
    </div>

    <div className="flex-1 border-2 border-[#FBB017] rounded-[2.5rem] p-10 bg-white/50">
      <div className="grid grid-cols-2 gap-x-12 gap-y-8">
        {[
          { label: "Company Name", value: userData?.companyName },
          { label: "Designation", value: userData?.designation },
          { label: "Company Website", value: userData?.companyWebsite },
          { label: "Email", value: userData?.email },
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
);

// ─── Main Component ───────────────────────────────────────────────────────────

const JobProviderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [fullUserData, setFullUserData] = useState<UserData | null>(null);
  const [user, setUser] = useState<HeaderUser>({
    name: "Job Provider",
    displayId: "JP00000",
    initials: "JP",
  });

  // ── My Posts state ──
  const [myPosts, setMyPosts] = useState<JobPost[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [postsError, setPostsError] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<JobPost | null>(null);

  // ── Create post form state ──
  const emptyForm: JobFormData = {
    title: "",
    description: "",
    companyName: fullUserData?.companyName || "",
    jobType: "",
    location: "",
    skills: "",
    salaryRange: "",
    applicationLink: "",
    deadline: "",
  };
  const [formData, setFormData] = useState<JobFormData>(emptyForm);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [formSuccess, setFormSuccess] = useState<string>("");

  // ── Fetch posts ──
  const fetchMyPosts = () => {
    setPostsLoading(true);
    setPostsError("");
    getMyJobPosts()
      .then((res) => setMyPosts(res.data.data))
      .catch(() => setPostsError("Failed to load your job posts."))
      .finally(() => setPostsLoading(false));
  };

  useEffect(() => {
    // Load user from localStorage (same way teammates did it)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser) as UserData;
      updateHeader(parsed);
    }
    fetchMyPosts();
  }, []);

  const updateHeader = (userData: UserData | null): void => {
    if (!userData) return;
    const displayId = userData._id?.substring(0, 8).toUpperCase() || "JP00000";
    const names = userData.name.trim().split(" ");
    let formattedName = userData.name;
    let initials = "JP";
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

  // ── Form handlers ──
  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");
    try {
      // Convert the comma-separated skills string into an array
      // e.g. "React, Node.js, MongoDB" → ["React", "Node.js", "MongoDB"]
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await createJobPost({
        ...formData,
        skills: skillsArray,
      });

      setFormSuccess("Job post submitted! Waiting for admin approval.");
      setFormData(emptyForm);
      fetchMyPosts(); // refresh the my-posts list
    } catch (err: unknown) {
      const error = err as ApiError;
      setFormError(
        error.response?.data?.message || "Failed to create job post.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJobPost(id);
      setMyPosts((prev) => prev.filter((p) => p._id !== id));
      setDeleteConfirmId(null);
      if (selectedPost?._id === id) setSelectedPost(null);
    } catch {
      alert("Failed to delete post. Please try again.");
    }
  };

  // ── Stats for Home tab ──
  const stats = {
    total: myPosts.length,
    approved: myPosts.filter((p) => p.status === "approved").length,
    pending: myPosts.filter((p) => p.status === "pending").length,
    rejected: myPosts.filter((p) => p.status === "rejected").length,
  };

  // ── Helpers ──
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white relative">
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLogout={handleLogout}
        onUpdate={updateHeader}
      />

      {/* ── Delete Confirm Dialog ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-[#2D3A5D] font-black text-lg mb-2">
              Delete Job Post?
            </h3>
            <p className="text-[#2D3A5D]/50 text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 border border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Post Detail Modal ── */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-gray-100">
              <h3 className="text-[#2D3A5D] font-black text-lg">
                Job Post Details
              </h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-400 hover:text-[#2D3A5D] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-8 py-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[#2D3A5D] font-black text-xl">
                  {selectedPost.title}
                </h4>
                <StatusBadge status={selectedPost.status} />
              </div>
              <p className="text-[#2D3A5D]/60 text-sm leading-relaxed">
                {selectedPost.description}
              </p>

              {/* Rejection reason — only shows if rejected */}
              {selectedPost.status === "rejected" &&
                selectedPost.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <p className="text-red-600 text-xs font-black uppercase tracking-wider mb-1">
                      Rejection Reason
                    </p>
                    <p className="text-red-500 text-sm">
                      {selectedPost.rejectionReason}
                    </p>
                  </div>
                )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { label: "Job Type", value: selectedPost.jobType },
                  { label: "Location", value: selectedPost.location },
                  { label: "Salary", value: selectedPost.salaryRange },
                  {
                    label: "Deadline",
                    value: formatDate(selectedPost.deadline),
                  },
                  { label: "Views", value: selectedPost.viewCount.toString() },
                  {
                    label: "Posted",
                    value: formatDate(selectedPost.createdAt),
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[#2D3A5D] font-black text-[10px] tracking-widest uppercase mb-1">
                      {label}
                    </p>
                    <p className="text-[#2D3A5D]/60 font-bold text-xs capitalize">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {selectedPost.skills.length > 0 && (
                <div>
                  <p className="text-[#2D3A5D] font-black text-[10px] tracking-widest uppercase mb-2">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-[#FBB017]/10 text-[#2D3A5D] text-[10px] font-black px-3 py-1 rounded-full border border-[#FBB017]/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <p className="text-[#2D3A5D] font-black text-[10px] tracking-widest uppercase mb-1">
                  Application Link
                </p>
                href={selectedPost.applicationLink}
                target="_blank" rel="noopener noreferrer"
                className="text-[#FBB017] text-xs font-bold hover:underline
                break-all"
                <a>{selectedPost.applicationLink}</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
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

      {/* ── Navigation Bar ── */}
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
            icon={Briefcase}
            label="My Posts"
            tab="my-posts"
            active={activeTab === "my-posts"}
            onClick={setActiveTab}
          />
          <NavItem
            icon={Plus}
            label="Post a Job"
            tab="post-job"
            active={activeTab === "post-job"}
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

      {/* ── Main Content ── */}
      <main className="px-10 py-10 max-w-5xl mx-auto">
        {/* ════ HOME TAB ════ */}
        {activeTab === "home" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div>
              <h1 className="text-3xl font-black text-[#2D3A5D]/10 tracking-[0.3em] uppercase mb-1">
                WELCOME BACK
              </h1>
              <p className="text-[#2D3A5D]/40 font-bold text-sm tracking-widest">
                {fullUserData?.companyName || "Your Company"} · Job Provider
                Portal
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Posts",
                  value: stats.total,
                  color: "bg-[#1A1C2C]",
                  text: "text-white",
                },
                {
                  label: "Approved",
                  value: stats.approved,
                  color: "bg-green-500",
                  text: "text-white",
                },
                {
                  label: "Pending",
                  value: stats.pending,
                  color: "bg-[#FBB017]",
                  text: "text-[#2D3A5D]",
                },
                {
                  label: "Rejected",
                  value: stats.rejected,
                  color: "bg-red-500",
                  text: "text-white",
                },
              ].map(({ label, value, color, text }) => (
                <div
                  key={label}
                  className={`${color} rounded-2xl p-6 shadow-lg`}
                >
                  <p className={`${text} font-black text-3xl`}>{value}</p>
                  <p
                    className={`${text} opacity-70 font-bold text-[10px] tracking-widest uppercase mt-1`}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent posts preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[#FBB017] font-black">◆</span>
                <h2 className="text-[#FBB017] font-black text-xl tracking-wide">
                  Recent Posts
                </h2>
              </div>
              <div className="bg-[#EBECEF]/40 rounded-[2.5rem] p-8 space-y-4 shadow-inner">
                {myPosts.length === 0 ? (
                  <p className="text-[#2D3A5D]/30 font-bold text-sm text-center py-8 tracking-widest">
                    No job posts yet. Click "Post a Job" to get started.
                  </p>
                ) : (
                  myPosts.slice(0, 3).map((post) => (
                    <div
                      key={post._id}
                      className="bg-white/40 hover:bg-white border border-transparent rounded-2xl p-4 flex items-center justify-between transition-all group"
                    >
                      <div className="flex-1 pr-4">
                        <p className="text-[#2D3A5D] font-bold text-xs uppercase tracking-wide">
                          {post.title}
                        </p>
                        <p className="text-[#2D3A5D]/40 font-bold text-[10px] mt-0.5">
                          {post.companyName} · {formatDate(post.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={post.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════ MY POSTS TAB ════ */}
        {activeTab === "my-posts" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <h1 className="text-3xl font-black text-[#2D3A5D]/10 tracking-[0.3em] uppercase">
              MY JOB POSTS
            </h1>

            {postsLoading && (
              <p className="text-[#2D3A5D]/30 font-bold text-sm text-center py-20 tracking-widest">
                Loading...
              </p>
            )}

            {postsError && (
              <div className="bg-red-50 text-red-500 text-sm p-4 rounded-xl text-center font-bold">
                {postsError}
              </div>
            )}

            {!postsLoading && myPosts.length === 0 && (
              <p className="text-[#2D3A5D]/30 font-bold text-sm text-center py-20 tracking-widest">
                You haven't posted any jobs yet.
              </p>
            )}

            <div className="space-y-4">
              {myPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-[#EBECEF]/40 hover:bg-[#EBECEF]/70 rounded-2xl p-6 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="text-[#2D3A5D] font-black text-sm uppercase tracking-wide">
                          {post.title}
                        </h3>
                        <StatusBadge status={post.status} />
                        {post.isExpired && (
                          <span className="bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="text-[#2D3A5D]/50 text-xs font-bold capitalize">
                        {post.jobType} · {post.location} · Deadline:{" "}
                        {formatDate(post.deadline)}
                      </p>

                      {/* Show rejection reason inline if rejected */}
                      {post.status === "rejected" && post.rejectionReason && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                          <p className="text-red-500 text-xs font-bold">
                            <span className="font-black uppercase tracking-wider">
                              Rejected:{" "}
                            </span>
                            {post.rejectionReason}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3">
                        <span className="flex items-center gap-1 text-[#2D3A5D]/30 text-[10px] font-bold">
                          <Eye size={11} />
                          {post.viewCount} views
                        </span>
                        <span className="text-[#2D3A5D]/30 text-[10px] font-bold">
                          Posted {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="bg-[#FBB017] hover:bg-[#e9a215] text-[#2D3A5D] text-[9px] font-black px-4 py-2 rounded-xl shadow-sm transition-all uppercase tracking-widest"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(post._id)}
                        className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-xl transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ POST A JOB TAB ════ */}
        {activeTab === "post-job" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-[#2D3A5D]/10 tracking-[0.3em] uppercase mb-8">
              POST A JOB
            </h1>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10">
              {formError && (
                <div className="bg-red-50 text-red-500 text-sm p-4 rounded-xl text-center font-bold mb-6">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="bg-green-50 text-green-600 text-sm p-4 rounded-xl text-center font-bold mb-6">
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleSubmitPost} className="space-y-6">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      required
                      placeholder="e.g. Frontend Developer Intern"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleFormChange}
                      required
                      placeholder="e.g. TechCorp Pvt Ltd"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                    rows={4}
                    placeholder="Describe the role, responsibilities and requirements..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors resize-none"
                  />
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                      Job Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleFormChange}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors bg-white appearance-none"
                    >
                      <option value="">Select Type</option>
                      <option value="full-time">Full-Time</option>
                      <option value="part-time">Part-Time</option>
                      <option value="internship">Internship</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                      Location
                    </label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      placeholder="e.g. Colombo, Sri Lanka"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors"
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                      Skills Required
                    </label>
                    <input
                      name="skills"
                      value={formData.skills}
                      onChange={handleFormChange}
                      placeholder="e.g. React, Node.js, MongoDB"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors"
                    />
                    <p className="text-[#2D3A5D]/30 text-[10px] font-bold mt-1">
                      Separate with commas
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                      Salary Range
                    </label>
                    <input
                      name="salaryRange"
                      value={formData.salaryRange}
                      onChange={handleFormChange}
                      placeholder="e.g. LKR 50,000 - 80,000"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors"
                    />
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                      Application Link <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="applicationLink"
                      value={formData.applicationLink}
                      onChange={handleFormChange}
                      required
                      placeholder="https://yourcompany.com/apply"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors"
                    />
                    <p className="text-[#2D3A5D]/30 text-[10px] font-bold mt-1">
                      Must start with https:// or http://
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                      Application Deadline{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleFormChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-10 py-3 rounded-xl bg-[#FBB017] hover:bg-[#e9a215] text-white font-black text-sm uppercase tracking-widest transition-colors disabled:opacity-70 shadow-lg"
                  >
                    {formLoading ? "Submitting..." : "Submit for Approval"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ════ PROFILE TAB ════ */}
        {activeTab === "profile" && (
          <ProfileView
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
      </main>
    </div>
  );
};

export default JobProviderDashboard;
