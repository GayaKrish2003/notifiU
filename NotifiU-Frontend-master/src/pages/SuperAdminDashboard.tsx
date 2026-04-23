import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  Briefcase,
  Calendar,
  MessageCircleQuestion,
  User as UserIcon,
  Search,
  ChevronDown,
  Trash2,
  FileText,
  Download,
  X as XIcon,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AnnouncementNotificationBell from "../components/AnnouncementNotificationBell";
import Logo from "../components/Logo";
import ProfileModal from "../components/ProfileModal";
import AdminUserEditModal from "../components/AdminUserEditModal";
import ActivityModal from "../components/ActivityModal";
import api, {
  getUsersByRole,
  updateAccountStatus,
  exportUsersCSV,
  exportUsersExcel,
  deleteUser,
  getUserActivity,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  addTicketResponse,
  getAllJobPostsAdmin,
  approveJobPost,
  rejectJobPost,
  getAllClubPresidents,
} from "../services/api";
import type { JobPost } from "../types/auth";
import AdminEventsPanel from "../components/AdminEventsPanel";
import EventsDashboard from "../components/EventsDashboard";
import ModuleDashboard from "./ModuleDashboard";
import CreateModule from "./CreateModule";
import EditModule from "./EditModule";
import AssignLecturer from "./AssignLecturer";
import EnrollmentManagement from "./EnrollmentManagement";
import ReportsPage from "./ReportsPage";
import { showSuccess, showError, showConfirm } from "../utils/premiumAlert";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "home" | "module" | "career" | "events" | "faqs" | "profile";
type TicketView = "list" | "detail";
type ExportFormat = "excel" | "csv";
type AccountStatus = "active" | "pending" | "suspended" | "deactivated";

type ApiError = {
  response?: { data?: { message?: string } };
};

interface UserData {
  _id?: string;
  name: string;
  email?: string;
  role?: string;
  profileImage?: string;
  studentId?: string;
  lecturerId?: string;
  accountStatus?: string;
  paymentStatus?: string;
  faculty?: string;
  department?: string;
  companyName?: string;
  [key: string]: unknown;
}

interface HeaderUser {
  name: string;
  displayId: string;
  initials: string;
  profileImage?: string;
}

interface RoleOption {
  value: string;
  label: string;
}

interface ColumnDef {
  key: string;
  label: string;
}

interface TicketData {
  _id: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  user_id: { _id?: string; username?: string; role?: string };
}

interface TicketResponseData {
  _id: string;
  response_message: string;
  createdAt: string;
  responded_by: { username?: string; role?: string };
}

// ─── ExportModal ──────────────────────────────────────────────────────────────

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (format: ExportFormat) => Promise<void>;
  selectedRole: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  selectedRole,
}) => {
  const [format, setFormat] = useState<ExportFormat>("excel");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1A1C2C]/50 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300">
        <div className="bg-[#1A1C2C] p-6 text-white relative flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FBB017] rounded-xl flex items-center justify-center text-[#2D3A5D]">
              <Download size={20} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">
              Export Data
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <XIcon size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-[#2D3A5D]/60 font-bold text-xs uppercase tracking-widest text-center">
            Select format for{" "}
            <span className="text-[#FBB017]">{selectedRole}s</span> list
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFormat("excel")}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                format === "excel"
                  ? "border-[#FBB017] bg-[#FFF9EE]"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div
                className={`p-3 rounded-xl ${format === "excel" ? "bg-[#FBB017] text-white" : "bg-gray-100 text-gray-400"}`}
              >
                <FileText size={24} />
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-[0.2em] ${format === "excel" ? "text-[#FBB017]" : "text-gray-400"}`}
              >
                Excel
              </span>
            </button>

            <button
              onClick={() => setFormat("csv")}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                format === "csv"
                  ? "border-[#FBB017] bg-[#FFF9EE]"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div
                className={`p-3 rounded-xl ${format === "csv" ? "bg-[#FBB017] text-white" : "bg-gray-100 text-gray-400"}`}
              >
                <FileText size={24} />
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-[0.2em] ${format === "csv" ? "text-[#FBB017]" : "text-gray-400"}`}
              >
                CSV
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              setIsDownloading(true);
              onDownload(format).finally(() => setIsDownloading(false));
            }}
            disabled={isDownloading}
            className="w-full bg-[#1A1C2C] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#2D3A5D] transition-all active:scale-[0.98] mt-4"
          >
            {isDownloading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Download size={18} />
            )}
            <span className="text-xs uppercase tracking-widest">
              {isDownloading
                ? "Downloading..."
                : `Download ${format.toUpperCase()}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  onChange,
  disabled,
}) => {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    suspended: "bg-red-100 text-red-700",
    deactivated: "bg-gray-100 text-gray-500",
  };

  const currentClass = colors[status] || colors["pending"];

  return (
    <select
      value={status}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      disabled={disabled}
      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest outline-none border-none cursor-pointer appearance-none text-center ${currentClass} disabled:opacity-70 disabled:cursor-not-allowed transition-all focus:ring-2 focus:ring-[#FBB017]`}
      style={
        {
          WebkitAppearance: "none",
          MozAppearance: "none",
        } as React.CSSProperties
      }
    >
      <option value="active" className="bg-white text-gray-800 font-bold">
        ACTIVE
      </option>
      <option value="pending" className="bg-white text-gray-800 font-bold">
        PENDING
      </option>
      <option value="suspended" className="bg-white text-gray-800 font-bold">
        SUSPENDED
      </option>
      <option value="deactivated" className="bg-white text-gray-800 font-bold">
        DEACTIVATED
      </option>
    </select>
  );
};

// ─── PaymentStatusBadge ───────────────────────────────────────────────────────

interface PaymentStatusBadgeProps {
  status: string;
  onChange: (value: string) => void;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  onChange,
}) => {
  const colors: Record<string, string> = {
    paid: "bg-green-100 text-green-700 w-24",
    process: "bg-blue-100 text-blue-700 w-24",
    pending: "bg-rose-100 text-rose-700 w-24",
  };

  const currentClass = colors[status] || colors["pending"];

  return (
    <select
      value={status || "pending"}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      className={`py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest outline-none border-none cursor-pointer appearance-none text-center ${currentClass} transition-all focus:ring-2 focus:ring-[#FBB017]`}
      style={
        {
          WebkitAppearance: "none",
          MozAppearance: "none",
        } as React.CSSProperties
      }
    >
      <option value="paid" className="bg-white text-gray-800 font-bold">
        PAID
      </option>
      <option value="process" className="bg-white text-gray-800 font-bold">
        PROCESS
      </option>
      <option value="pending" className="bg-white text-gray-800 font-bold">
        PENDING
      </option>
    </select>
  );
};

// ─── UserTable ────────────────────────────────────────────────────────────────

interface UserTableProps {
  users: UserData[];
  roleType: string;
  onStatusChange: (userId: string, newStatus: string, userName: string) => void;
  onPaymentStatusChange: (
    userId: string,
    newStatus: string,
    userName: string,
  ) => void;
  onDelete: (userId: string, userName: string) => void;
  onEdit: (user: UserData) => void;
  onViewActivity: (userId: string) => void;
  currentUserId?: string;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  roleType,
  onStatusChange,
  onPaymentStatusChange,
  onDelete,
  onEdit,
  onViewActivity,
  currentUserId,
}) => {
  const columns: ColumnDef[] = [
    {
      key: "name",
      label:
        roleType === "student"
          ? "Student Name"
          : roleType === "lecturer"
            ? "Lecturer Name"
            : roleType === "jobprovider"
              ? "Provider Name"
              : "User Name",
    },
    { key: "specialization", label: "Specialization" },
    { key: "accountStatus", label: "Profile" },
    { key: "payment", label: "Payment" },
    { key: "actions", label: "Actions" },
  ];

  const getInitials = (name: string): string => {
    if (!name) return "NA";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const getId = (user: UserData): string | undefined => {
    return (
      user.studentId ||
      user.lecturerId ||
      user._id?.substring(0, 8).toUpperCase()
    );
  };

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-20 text-gray-300 font-bold tracking-widest uppercase text-sm">
        No {roleType}s found
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-gray-100">
      {/* Table Header */}
      <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] bg-[#F8F9FA] px-8 py-5 border-b border-gray-100">
        {columns.map((col) => (
          <p
            key={col.key}
            className="text-[#2D3A5D]/60 font-black text-[11px] uppercase tracking-widest"
          >
            {col.label}
          </p>
        ))}
      </div>

      {/* Table Rows */}
      {users.map((user, idx) => (
        <div
          key={user._id || idx}
          className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] items-center px-8 py-5 border-b border-gray-50 hover:bg-[#FFF9EE]/30 transition-colors group"
        >
          {/* Name + ID */}
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 ${idx % 3 === 0 ? "bg-blue-100 text-blue-600" : idx % 3 === 1 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"} rounded-full flex items-center justify-center text-xs font-black shrink-0 overflow-hidden`}
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage as string}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[#2D3A5D] font-bold text-sm truncate">
                {user.name}
              </p>
              <p className="text-[#2D3A5D]/40 font-bold text-[10px]">
                {getId(user)}
              </p>
            </div>
          </div>

          {/* Specialization */}
          <div>
            <p className="text-[#2D3A5D]/60 font-bold text-xs uppercase">
              {
                (user.faculty ||
                  user.department ||
                  user.companyName ||
                  "N/A") as string
              }
            </p>
          </div>

          {/* Status Badge */}
          <div>
            <StatusBadge
              status={user.accountStatus as string}
              onChange={(newStatus) =>
                onStatusChange(user._id!, newStatus, user.name)
              }
              disabled={user._id === currentUserId}
            />
          </div>

          {/* Payment */}
          <div>
            <PaymentStatusBadge
              status={user.paymentStatus as string}
              onChange={(newStatus) =>
                onPaymentStatusChange(user._id!, newStatus, user.name)
              }
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(user)}
              className="bg-[#1A1C2C] text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#2D3A5D] transition-all"
            >
              Edit
            </button>
            <button
              onClick={() => onViewActivity(user._id!)}
              className="bg-amber-50 text-amber-600 p-2 rounded-xl hover:bg-amber-100 transition-all active:scale-90"
              title="View Activity"
            >
              <Clock size={14} />
            </button>
            {user._id !== currentUserId && (
              <button
                onClick={() => onDelete(user._id!, user.name)}
                className="bg-rose-50 text-rose-600 p-2 rounded-xl hover:bg-rose-100 transition-all active:scale-90"
                title="Delete Account"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── NavItem ──────────────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  const [activityModalUser, setActivityModalUser] = useState<{
    name: string;
    email: string;
    role: string;
    [key: string]: unknown;
  } | null>(null);
  const [moduleView, setModuleView] = useState<
    "dashboard" | "create" | "edit" | "assign" | "enrollments" | "reports"
  >("dashboard");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  // Admin Events sub-tab: 'cp-approval' | 'upcoming' | 'history'
  const [adminEventSubTab, setAdminEventSubTab] =
    useState<string>("cp-approval");
  const [clubPresidents, setClubPresidents] = useState<UserData[]>([]);
  const [cpLoading, setCpLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState<boolean>(false);
  const [fullUserData, setFullUserData] = useState<UserData | null>(null);
  const [user, setUser] = useState<HeaderUser>({
    name: "Super Admin",
    displayId: "ADMIN",
    initials: "SA",
  });

  const roleOptions: RoleOption[] = [
    { value: "all", label: "All Users" },
    { value: "student", label: "Students" },
    { value: "lecturer", label: "Lecturers" },
    { value: "jobprovider", label: "Job Providers" },
  ];

  const statusOptions: RoleOption[] = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "suspended", label: "Suspended" },
    { value: "deactivated", label: "Deactivated" },
  ];

  const updateHeader = (userData: UserData | null): void => {
    if (!userData) return;
    const displayId = userData._id?.substring(0, 8).toUpperCase() || "ADMIN";
    const names = userData.name.trim().split(" ");

    let formattedName = userData.name;
    let initials = "SA";

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
      profileImage: userData.profileImage as string | undefined,
    });
    setFullUserData(userData);
  };

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoadingUsers(true);
      const response = await getUsersByRole(
        selectedRole,
        searchQuery,
        statusFilter,
      );
      if (response.data.success) {
        setUsers(response.data.users as UserData[]);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStatusChange = async (
    userId: string,
    newStatus: string,
    userName: string,
  ): Promise<void> => {
    const result = await showConfirm(
      "Change Status?",
      `Are you sure you want to change the status of ${userName} to ${newStatus.toUpperCase()}?`
    );
    if (result.isConfirmed) {
      try {
        const response = await updateAccountStatus(userId, newStatus);
        if (response.data.success) {
          fetchUsers();
          showSuccess("Success", `Successfully updated status to ${newStatus}`);
        }
      } catch (err: unknown) {
        showError(
          "Error",
          (err as ApiError).response?.data?.message || "Failed to update status"
        );
      }
    }
  };

  const handlePaymentStatusChange = async (
    userId: string,
    newStatus: string,
    userName: string,
  ): Promise<void> => {
    const result = await showConfirm(
      "Change Payment Status?",
      `Are you sure you want to change the payment status of ${userName} to ${newStatus.toUpperCase()}?`
    );
    if (result.isConfirmed) {
      try {
        const response = await api.patch(`/users/${userId}/payment-status`, {
          status: newStatus,
        });
        if (response.data.success) {
          fetchUsers();
        }
      } catch (err: unknown) {
        showError(
          "Error",
          (err as ApiError).response?.data?.message || "Failed to update payment status"
        );
      }
    }
  };

  const handleViewActivity = async (userId: string): Promise<void> => {
    try {
      const response = await getUserActivity(userId);
      if (response.data.success) {
        setActivityModalUser(
          response.data.user as {
            name: string;
            email: string;
            role: string;
            [key: string]: unknown;
          },
        );
      }
    } catch (err: unknown) {
      showError(
        "Activity Error",
        (err as ApiError).response?.data?.message || "Failed to load user activity"
      );
    }
  };

  const handleDeleteUser = async (
    userId: string,
    userName: string,
  ): Promise<void> => {
    const result = await showConfirm(
      "Delete Account?",
      `Are you sure you want to PERMANENTLY delete the account for ${userName}? This action cannot be undone.`,
      "Yes, delete it"
    );
    if (result.isConfirmed) {
      try {
        const response = await deleteUser(userId);
        if (response.data.success) {
          fetchUsers();
          showSuccess("Deleted", "User account deleted successfully");
        }
      } catch (err: unknown) {
        console.error("Delete failed:", err);
        showError(
          "Delete Failed",
          (err as ApiError).response?.data?.message || "Failed to delete user"
        );
      }
    }
  };

  const handleExport = async (format: ExportFormat): Promise<void> => {
    try {
      const response =
        format === "excel" ? await exportUsersExcel() : await exportUsersCSV();

      const url = window.URL.createObjectURL(
        new Blob([response.data as BlobPart]),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${selectedRole}s_export_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : "csv"}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowExportModal(false);
    } catch (err: unknown) {
      console.error("Export failed:", err);
      showError("Export Failed", "Failed to export data. Please try again.");
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      updateHeader(JSON.parse(savedUser) as UserData);
    }
  }, []);
  // Load job posts when admin opens the Career tab
  useEffect(() => {
    if (activeTab === "career") {
      fetchAdminJobs(jobStatusFilter);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "home") {
      const delayDebounceFn = setTimeout(() => {
        fetchUsers();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [activeTab, selectedRole, searchQuery, statusFilter]);

  useEffect(() => {
    if (activeTab === "faqs") {
      fetchAllTickets();
    }
  }, [activeTab]);

  const handleLogout = (): void => {
    localStorage.clear();
    navigate("/login");
  };

  // ─── Ticket state ─────────────────────────────────────────────────────────
  const [ticketView, setTicketView] = useState<TicketView>("list");
  const [allTickets, setAllTickets] = useState<TicketData[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [ticketResponses, setTicketResponses] = useState<TicketResponseData[]>(
    [],
  );
  const [adminReply, setAdminReply] = useState<string>("");
  const [adminReplySending, setAdminReplySending] = useState<boolean>(false);
  const [ticketStatusUpdating, setTicketStatusUpdating] =
    useState<boolean>(false);
  const [ticketSearchQuery, setTicketSearchQuery] = useState<string>("");

  const TICKET_STATUS_COLOR: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-500",
  };

  const fetchAllTickets = (): void => {
    setTicketsLoading(true);
    getTickets()
      .then((res) => setAllTickets(res.data as TicketData[]))
      .catch(() => setAllTickets([]))
      .finally(() => setTicketsLoading(false));
  };

  const openAdminTicketDetail = (ticket: TicketData): void => {
    getTicketById(ticket._id)
      .then((res) => {
        const data = res.data as {
          ticket: TicketData;
          responses: TicketResponseData[];
        };
        setSelectedTicket(data.ticket);
        setTicketResponses(data.responses);
        setTicketView("detail");
      })
      .catch(() => {
        setSelectedTicket(ticket);
        setTicketResponses([]);
        setTicketView("detail");
      });
  };

  const handleAdminStatusChange = (ticketId: string, status: string): void => {
    setTicketStatusUpdating(true);
    updateTicket(ticketId, { status })
      .then(() => {
        setSelectedTicket((prev) => (prev ? { ...prev, status } : prev));
        setAllTickets((prev) =>
          prev.map((t) => (t._id === ticketId ? { ...t, status } : t)),
        );
      })
      .catch(() => alert("Failed to update ticket status."))
      .finally(() => setTicketStatusUpdating(false));
  };

  const handleAdminReply = (): void => {
    if (!adminReply.trim() || !selectedTicket) return;
    setAdminReplySending(true);
    addTicketResponse(selectedTicket._id, adminReply)
      .then((res) => {
        setTicketResponses((prev) => [...prev, res.data as TicketResponseData]);
        setAdminReply("");
        // auto-move to in_progress if still open
        if (selectedTicket.status === "open") {
          handleAdminStatusChange(selectedTicket._id, "in_progress");
        }
      })
      .catch(() => alert("Failed to send reply."))
      .finally(() => setAdminReplySending(false));
  };

  const handleAdminDeleteTicket = (ticketId: string): void => {
    if (
      !window.confirm("Permanently delete this ticket and all its responses?")
    )
      return;
    deleteTicket(ticketId)
      .then(() => {
        setAllTickets((prev) => prev.filter((t) => t._id !== ticketId));
        if (ticketView === "detail") setTicketView("list");
      })
      .catch(() => alert("Failed to delete ticket."));
  };

  const filteredTickets = allTickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
      t.status.toLowerCase().includes(ticketSearchQuery.toLowerCase()),
  );

  // ─── Job Posts state ──────────────────────────────────────────────────────────
  const [adminJobs, setAdminJobs] = useState<JobPost[]>([]);
  const [adminJobsLoading, setAdminJobsLoading] = useState<boolean>(false);
  const [jobStatusFilter, setJobStatusFilter] = useState<string>("pending");
  const [rejectModalJob, setRejectModalJob] = useState<JobPost | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [rejectLoading, setRejectLoading] = useState<boolean>(false);
  const [selectedAdminJob, setSelectedAdminJob] = useState<JobPost | null>(
    null,
  );

  const fetchAdminJobs = (status?: string): void => {
    setAdminJobsLoading(true);
    const params: Record<string, string> = {};
    if (status && status !== "all") params.status = status;
    getAllJobPostsAdmin(params)
      .then((res) => setAdminJobs(res.data.data))
      .catch(() => setAdminJobs([]))
      .finally(() => setAdminJobsLoading(false));
  };

  const handleApproveJob = async (jobId: string): Promise<void> => {
    if (
      !window.confirm(
        "Approve this job post? It will be visible to all students.",
      )
    )
      return;
    try {
      await approveJobPost(jobId);
      // Update the status in the list without refetching
      setAdminJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: "approved" } : j)),
      );
      if (selectedAdminJob?._id === jobId) {
        setSelectedAdminJob((prev) =>
          prev ? { ...prev, status: "approved" } : prev,
        );
      }
    } catch {
      alert("Failed to approve job post.");
    }
  };

  const handleRejectJob = async (): Promise<void> => {
    if (!rejectModalJob || !rejectReason.trim()) return;
    setRejectLoading(true);
    try {
      await rejectJobPost(rejectModalJob._id, rejectReason);
      setAdminJobs((prev) =>
        prev.map((j) =>
          j._id === rejectModalJob._id
            ? { ...j, status: "rejected", rejectionReason: rejectReason }
            : j,
        ),
      );
      if (selectedAdminJob?._id === rejectModalJob._id) {
        setSelectedAdminJob((prev) =>
          prev
            ? { ...prev, status: "rejected", rejectionReason: rejectReason }
            : prev,
        );
      }
      setRejectModalJob(null);
      setRejectReason("");
    } catch {
      alert("Failed to reject job post.");
    } finally {
      setRejectLoading(false);
    }
  };

  const formatAdminJobDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const underConstructionTabs: TabKey[] = [];

  return (
    <div className="min-h-screen bg-white relative">
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLogout={handleLogout}
        onUpdate={updateHeader}
      />

      <AdminUserEditModal
        isOpen={!!userToEdit}
        onClose={() => setUserToEdit(null)}
        userData={userToEdit}
        onUpdate={() => fetchUsers()}
      />

      <ActivityModal
        isOpen={!!activityModalUser}
        onClose={() => setActivityModalUser(null)}
        activityData={activityModalUser}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        selectedRole={selectedRole}
        onDownload={handleExport}
      />

      {/* ── Reject Reason Modal ── */}
      {rejectModalJob && (
        <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-gray-100">
              <h3 className="text-[#2D3A5D] font-black text-lg">
                Reject Job Post
              </h3>
              <button
                onClick={() => {
                  setRejectModalJob(null);
                  setRejectReason("");
                }}
                className="text-gray-400 hover:text-[#2D3A5D] transition-colors"
              >
                <XIcon size={20} />
              </button>
            </div>
            <div className="px-8 py-6 space-y-4">
              <p className="text-[#2D3A5D]/60 text-sm">
                You are rejecting:{" "}
                <span className="font-black text-[#2D3A5D]">
                  {rejectModalJob.title}
                </span>
              </p>
              <div>
                <label className="block text-sm font-semibold text-[#2D3A5D] mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this post is being rejected so the provider can fix it..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#2D3A5D] outline-none focus:border-[#FBB017] transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setRejectModalJob(null);
                    setRejectReason("");
                  }}
                  className="flex-1 border border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectJob}
                  disabled={rejectLoading || !rejectReason.trim()}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
                >
                  {rejectLoading ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <div className="flex-1"></div>
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
              setModuleView("dashboard");
              setSelectedModuleId(null);
            }}
          />
          <NavItem
            icon={Briefcase}
            label="Career"
            tab="career"
            active={activeTab === "career"}
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

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-16 py-16">
        {activeTab === "home" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Row */}
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-2xl font-black text-[#2D3A5D] tracking-tight">
                User Profiles
              </h1>
              <button
                onClick={() => setShowExportModal(true)}
                className="bg-[#FBB017] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#e9a215] transition-all shadow-lg shadow-[#FBB017]/20 active:scale-95"
              >
                Export
              </button>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[300px]">
                <Search
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name, email, or NIC..."
                  value={searchQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full bg-white border-2 border-gray-100 pl-14 pr-6 py-3 rounded-2xl font-bold text-sm text-[#2D3A5D] focus:border-[#FBB017] outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              {/* Role Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                    setShowStatusDropdown(false);
                  }}
                  className="flex items-center gap-3 bg-white border-2 border-gray-100 px-6 py-3 rounded-2xl font-bold text-sm text-[#2D3A5D] hover:border-[#FBB017]/30 transition-all min-w-[160px]"
                >
                  <span className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest mr-1">
                    Role:
                  </span>
                  {roleOptions.find((r) => r.value === selectedRole)?.label}
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                  />
                </button>
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden min-w-[180px] animate-in slide-in-from-top-2 duration-200">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedRole(option.value);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-6 py-3 text-sm font-bold hover:bg-[#FFF9EE] transition-colors ${
                          selectedRole === option.value
                            ? "text-[#FBB017] bg-[#FFF9EE]"
                            : "text-[#2D3A5D]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowDropdown(false);
                  }}
                  className="flex items-center gap-3 bg-white border-2 border-gray-100 px-6 py-3 rounded-2xl font-bold text-sm text-[#2D3A5D] hover:border-[#FBB017]/30 transition-all min-w-[160px]"
                >
                  <span className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest mr-1">
                    Status:
                  </span>
                  {statusOptions.find((s) => s.value === statusFilter)?.label}
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${showStatusDropdown ? "rotate-180" : ""}`}
                  />
                </button>
                {showStatusDropdown && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden min-w-[180px] animate-in slide-in-from-top-2 duration-200">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setStatusFilter(option.value);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full text-left px-6 py-3 text-sm font-bold hover:bg-[#FFF9EE] transition-colors ${
                          statusFilter === option.value
                            ? "text-[#FBB017] bg-[#FFF9EE]"
                            : "text-[#2D3A5D]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Users Table */}
            {loadingUsers ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-4 border-[#FBB017]/30 border-t-[#FBB017] rounded-full animate-spin"></div>
              </div>
            ) : (
              <UserTable
                users={users}
                roleType={selectedRole}
                onStatusChange={handleStatusChange}
                onPaymentStatusChange={handlePaymentStatusChange}
                onDelete={handleDeleteUser}
                onEdit={(u) => setUserToEdit(u)}
                onViewActivity={handleViewActivity}
                currentUserId={fullUserData?._id}
              />
            )}
          </div>
        )}

        {/* ── FAQs / Tickets Tab ──────────────────────────────────────────── */}
        {activeTab === "faqs" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Ticket List ── */}
            {ticketView === "list" && (
              <div>
                <div className="flex justify-between items-center mb-10">
                  <h1 className="text-2xl font-bold text-[#2D3A5D]">
                    Support Tickets
                  </h1>
                  <button
                    onClick={fetchAllTickets}
                    className="border-2 border-[#1A1C2C] text-[#1A1C2C] px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1A1C2C] hover:text-white transition-all"
                  >
                    Refresh
                  </button>
                </div>

                <div className="relative mb-8">
                  <Search
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by subject, category or status..."
                    value={ticketSearchQuery}
                    onChange={(e) => setTicketSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-gray-100 pl-14 pr-6 py-3 rounded-2xl font-bold text-sm text-[#2D3A5D] focus:border-[#FBB017] outline-none transition-all placeholder:text-gray-300"
                  />
                </div>

                {ticketsLoading ? (
                  <div className="flex justify-center py-32">
                    <div className="w-10 h-10 border-4 border-[#FBB017]/30 border-t-[#FBB017] rounded-full animate-spin" />
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="text-center py-20 text-gray-300 font-bold tracking-widest uppercase text-sm">
                    {allTickets.length === 0
                      ? "No tickets yet. Click Refresh to load."
                      : "No tickets match your search."}
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-[2rem] border border-gray-100">
                    {/* Header */}
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] bg-[#F8F9FA] px-8 py-5 border-b border-gray-100 gap-4">
                      {["Subject", "Category", "Status", "Date", "Actions"].map(
                        (h) => (
                          <p
                            key={h}
                            className="text-[#2D3A5D]/60 font-black text-[11px] uppercase tracking-widest"
                          >
                            {h}
                          </p>
                        ),
                      )}
                    </div>

                    {filteredTickets.map((t, idx) => (
                      <div
                        key={t._id}
                        className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-8 py-5 border-b border-gray-50 hover:bg-[#FFF9EE]/30 transition-colors gap-4"
                      >
                        <div className="min-w-0">
                          <p className="text-[#2D3A5D] font-bold text-sm truncate">
                            {t.subject}
                          </p>
                          <p className="text-[#2D3A5D]/40 text-[10px] font-medium mt-0.5">
                            {t.user_id?.username || `User #${idx + 1}`}
                          </p>
                        </div>
                        <p className="text-[#2D3A5D]/60 font-bold text-xs uppercase">
                          {t.category}
                        </p>
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full w-fit ${TICKET_STATUS_COLOR[t.status] || "bg-gray-100 text-gray-500"}`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                        <p className="text-[#2D3A5D]/40 font-medium text-xs">
                          {new Date(t.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openAdminTicketDetail(t)}
                            className="bg-[#1A1C2C] text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#2D3A5D] transition-all"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleAdminDeleteTicket(t._id)}
                            className="bg-rose-50 text-rose-600 p-2 rounded-xl hover:bg-rose-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Ticket Detail ── */}
            {ticketView === "detail" && selectedTicket && (
              <div>
                <div className="flex items-center gap-6 mb-10">
                  <button
                    onClick={() => {
                      setTicketView("list");
                      fetchAllTickets();
                    }}
                    className="flex items-center gap-2 text-[#2D3A5D]/40 hover:text-[#FBB017] transition-colors font-bold text-sm"
                  >
                    <ChevronDown size={18} className="rotate-90" /> Back
                  </button>
                  <h1 className="text-2xl font-black text-[#2D3A5D] tracking-tight">
                    Ticket Detail
                  </h1>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleAdminDeleteTicket(selectedTicket._id)}
                    className="flex items-center gap-2 bg-rose-50 text-rose-600 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all"
                  >
                    <Trash2 size={14} /> Delete Ticket
                  </button>
                </div>

                {/* Ticket info card */}
                <div className="bg-[#EBECEF]/40 rounded-2xl px-8 py-6 mb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-[#2D3A5D] font-black text-base mb-1">
                        {selectedTicket.subject}
                      </p>
                      <p className="text-[#2D3A5D]/40 text-xs font-medium">
                        {selectedTicket.category} ·{" "}
                        {selectedTicket.user_id?.username || "Unknown User"} ·{" "}
                        {new Date(selectedTicket.createdAt).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <select
                        value={selectedTicket.status}
                        disabled={ticketStatusUpdating}
                        onChange={(e) =>
                          handleAdminStatusChange(
                            selectedTicket._id,
                            e.target.value,
                          )
                        }
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full outline-none border-none cursor-pointer appearance-none ${TICKET_STATUS_COLOR[selectedTicket.status] || "bg-gray-100 text-gray-500"} disabled:opacity-70`}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[#2D3A5D]/70 text-sm leading-relaxed">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Responses */}
                {ticketResponses.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <p className="text-[#2D3A5D]/30 font-black text-[10px] uppercase tracking-widest px-2">
                      Responses ({ticketResponses.length})
                    </p>
                    {ticketResponses.map((r) => {
                      const isStaff = r.responded_by?.role !== "student";
                      return (
                        <div
                          key={r._id}
                          className={`rounded-2xl px-8 py-5 ${isStaff ? "bg-[#1A1C2C]/5 border border-[#1A1C2C]/10" : "bg-white border border-gray-100"}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span
                              className={`text-[10px] font-black uppercase tracking-widest ${isStaff ? "text-[#2D3A5D]" : "text-[#FBB017]"}`}
                            >
                              {isStaff
                                ? r.responded_by?.username || "Staff"
                                : "Student"}
                            </span>
                            <span className="text-[#2D3A5D]/30 text-[10px]">
                              {new Date(r.createdAt).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-[#2D3A5D]/70 text-sm leading-relaxed">
                            {r.response_message}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Admin reply box */}
                {selectedTicket.status !== "closed" && (
                  <div className="bg-[#EBECEF]/40 rounded-2xl px-8 py-6 flex gap-4 items-end">
                    <textarea
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      placeholder="Type your response to the student..."
                      rows={3}
                      className="flex-1 bg-white border border-gray-100 rounded-2xl px-5 py-3 text-sm text-[#2D3A5D] font-medium outline-none focus:border-[#FBB017]/50 transition-all resize-none"
                    />
                    <button
                      onClick={handleAdminReply}
                      disabled={adminReplySending || !adminReply.trim()}
                      className="bg-[#FBB017] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#e9a215] transition-all disabled:opacity-50 shrink-0"
                    >
                      {adminReplySending ? "Sending..." : "Reply"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CAREER TAB — Job Post Approval Panel ────────────────── */}
        {activeTab === "career" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Job Detail Modal */}
            {selectedAdminJob && (
              <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-gray-100">
                    <h3 className="text-[#2D3A5D] font-black text-lg">
                      Job Post Details
                    </h3>
                    <button
                      onClick={() => setSelectedAdminJob(null)}
                      className="text-gray-400 hover:text-[#2D3A5D] transition-colors"
                    >
                      <XIcon size={20} />
                    </button>
                  </div>
                  <div className="px-8 py-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-[#2D3A5D] font-black text-xl">
                        {selectedAdminJob.title}
                      </h4>
                      <span
                        className={`shrink-0 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${
                          selectedAdminJob.status === "approved"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : selectedAdminJob.status === "rejected"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {selectedAdminJob.status}
                      </span>
                    </div>

                    <p className="text-[#2D3A5D]/60 text-sm font-bold capitalize">
                      {selectedAdminJob.companyName} ·{" "}
                      {selectedAdminJob.jobType} · {selectedAdminJob.location}
                    </p>

                    <p className="text-[#2D3A5D]/70 text-sm leading-relaxed">
                      {selectedAdminJob.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {
                          label: "Salary",
                          value: selectedAdminJob.salaryRange,
                        },
                        {
                          label: "Deadline",
                          value: formatAdminJobDate(selectedAdminJob.deadline),
                        },
                        {
                          label: "Posted",
                          value: formatAdminJobDate(selectedAdminJob.createdAt),
                        },
                        {
                          label: "Views",
                          value: selectedAdminJob.viewCount.toString(),
                        },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[#2D3A5D] font-black text-[10px] tracking-widest uppercase mb-1">
                            {label}
                          </p>
                          <p className="text-[#2D3A5D]/60 font-bold text-xs">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {selectedAdminJob.skills.length > 0 && (
                      <div>
                        <p className="text-[#2D3A5D] font-black text-[10px] tracking-widest uppercase mb-2">
                          Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedAdminJob.skills.map((skill) => (
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

                    <div>
                      <p className="text-[#2D3A5D] font-black text-[10px] tracking-widest uppercase mb-1">
                        Application Link
                      </p>
                      <a
                        href={
                          selectedAdminJob.applicationLink.startsWith("http")
                            ? selectedAdminJob.applicationLink
                            : `https://${selectedAdminJob.applicationLink}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FBB017] text-xs font-bold hover:underline break-all"
                      >
                        {selectedAdminJob.applicationLink}
                      </a>
                    </div>

                    {/* Rejection reason if rejected */}
                    {selectedAdminJob.status === "rejected" &&
                      selectedAdminJob.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                          <p className="text-red-600 text-xs font-black uppercase tracking-wider mb-1">
                            Rejection Reason
                          </p>
                          <p className="text-red-500 text-sm">
                            {selectedAdminJob.rejectionReason}
                          </p>
                        </div>
                      )}

                    {/* Action buttons — only show if pending */}
                    {selectedAdminJob.status === "pending" && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleApproveJob(selectedAdminJob._id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all"
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectModalJob(selectedAdminJob);
                            setSelectedAdminJob(null);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Header row */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-black text-[#2D3A5D] tracking-tight">
                Job Post Approvals
              </h1>
              <button
                onClick={() => fetchAdminJobs(jobStatusFilter)}
                className="border-2 border-[#1A1C2C] text-[#1A1C2C] px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1A1C2C] hover:text-white transition-all"
              >
                Refresh
              </button>
            </div>

            {/* Status filter tabs */}
            <div className="flex items-center gap-2 bg-[#EBECEF]/60 rounded-2xl p-1 w-fit mb-8">
              {[
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
                { value: "all", label: "All" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    setJobStatusFilter(value);
                    fetchAdminJobs(value);
                  }}
                  className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    jobStatusFilter === value
                      ? "bg-white text-[#2D3A5D] shadow-sm"
                      : "text-[#2D3A5D]/30 hover:text-[#2D3A5D]/60"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Job posts list */}
            {adminJobsLoading ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-4 border-[#FBB017]/30 border-t-[#FBB017] rounded-full animate-spin" />
              </div>
            ) : adminJobs.length === 0 ? (
              <div className="text-center py-20 text-gray-300 font-bold tracking-widest uppercase text-sm">
                No {jobStatusFilter === "all" ? "" : jobStatusFilter} job posts
                found.
              </div>
            ) : (
              <div className="overflow-hidden rounded-[2rem] border border-gray-100">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] bg-[#F8F9FA] px-8 py-5 border-b border-gray-100 gap-4">
                  {["Job Title", "Company", "Type", "Status", "Actions"].map(
                    (h) => (
                      <p
                        key={h}
                        className="text-[#2D3A5D]/60 font-black text-[11px] uppercase tracking-widest"
                      >
                        {h}
                      </p>
                    ),
                  )}
                </div>

                {/* Table rows */}
                {adminJobs.map((job) => (
                  <div
                    key={job._id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-8 py-5 border-b border-gray-50 hover:bg-[#FFF9EE]/30 transition-colors gap-4"
                  >
                    {/* Title + date */}
                    <div className="min-w-0">
                      <p className="text-[#2D3A5D] font-bold text-sm truncate">
                        {job.title}
                      </p>
                      <p className="text-[#2D3A5D]/40 font-medium text-[10px] mt-0.5">
                        Posted {formatAdminJobDate(job.createdAt)} · Deadline{" "}
                        {formatAdminJobDate(job.deadline)}
                      </p>
                      {/* Show rejection reason hint inline */}
                      {job.status === "rejected" && job.rejectionReason && (
                        <p className="text-red-400 text-[10px] font-bold mt-0.5 truncate">
                          Reason: {job.rejectionReason}
                        </p>
                      )}
                    </div>

                    {/* Company */}
                    <p className="text-[#2D3A5D]/60 font-bold text-xs truncate">
                      {job.companyName}
                    </p>

                    {/* Job type */}
                    <p className="text-[#2D3A5D]/60 font-bold text-xs capitalize">
                      {job.jobType}
                    </p>

                    {/* Status badge */}
                    <span
                      className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider w-fit border ${
                        job.status === "approved"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : job.status === "rejected"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-yellow-100 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {job.status}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedAdminJob(job)}
                        className="bg-[#1A1C2C] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#2D3A5D] transition-all flex items-center gap-1"
                      >
                        <Eye size={11} />
                        View
                      </button>
                      {job.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApproveJob(job._id)}
                            className="bg-green-50 text-green-600 p-2 rounded-xl hover:bg-green-100 transition-all"
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => setRejectModalJob(job)}
                            className="bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-100 transition-all"
                            title="Reject"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="flex flex-col items-center justify-center py-52 text-center animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-black text-[#2D3A5D]/10 tracking-[0.4em] uppercase">
              ADMIN PROFILE
            </h2>
            <p className="text-[#2D3A5D]/20 font-bold mt-4 tracking-widest">
              Click the profile icon to view or edit your profile
            </p>
          </div>
        )}

        {activeTab === "module" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {moduleView === "dashboard" && (
              <ModuleDashboard
                onCreate={() => setModuleView("create")}
                onEdit={(id: string) => {
                  setSelectedModuleId(id);
                  setModuleView("edit");
                }}
                onAssignLecturer={() => setModuleView("assign")}
                onEnrollments={() => setModuleView("enrollments")}
                onReports={() => setModuleView("reports")}
              />
            )}

            {moduleView === "create" && (
              <CreateModule onBack={() => setModuleView("dashboard")} />
            )}

            {moduleView === "edit" && selectedModuleId && (
              <EditModule
                moduleId={selectedModuleId}
                onBack={() => {
                  setSelectedModuleId(null);
                  setModuleView("dashboard");
                }}
              />
            )}

            {moduleView === "assign" && (
              <AssignLecturer onBack={() => setModuleView("dashboard")} />
            )}

            {moduleView === "enrollments" && (
              <EnrollmentManagement onBack={() => setModuleView("dashboard")} />
            )}

            {moduleView === "reports" && (
              <ReportsPage onBack={() => setModuleView("dashboard")} />
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 3 Sub-tab switcher */}
            <div className="mb-10">
              <h1 className="text-3xl font-black text-[#2D3A5D]/10 tracking-[0.3em] uppercase mb-2">
                EVENTS
              </h1>
              <div className="flex items-center bg-[#EBECEF]/40 rounded-2xl p-1.5 w-fit mt-4">
                {[
                  { key: "cp-approval", label: "🎖 CP Approvals" },
                  { key: "upcoming", label: "📅 Upcoming Events" },
                  { key: "history", label: "📁 Event History" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setAdminEventSubTab(tab.key);
                      if (tab.key === "cp-approval") {
                        setCpLoading(true);
                        getAllClubPresidents()
                          .then((r) => {
                            const data = r.data as { users?: UserData[] };
                            setClubPresidents(data.users || []);
                          })
                          .catch(() => setClubPresidents([]))
                          .finally(() => setCpLoading(false));
                      }
                    }}
                    className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      adminEventSubTab === tab.key
                        ? "bg-white text-[#FBB017] shadow-sm"
                        : "text-[#2D3A5D]/40 hover:text-[#2D3A5D]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CP Approval Sub-tab */}
            {adminEventSubTab === "cp-approval" && (
              <div>
                <p className="text-[#FBB017] font-black text-[11px] uppercase tracking-widest mb-6">
                  Club President Account Management
                </p>
                {cpLoading ? (
                  <p className="text-center text-[#2D3A5D]/30 font-bold py-16">
                    Loading...
                  </p>
                ) : clubPresidents.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-[#2D3A5D]/20 font-black text-sm tracking-widest uppercase">
                      No Club Presidents registered yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clubPresidents.map((cp) => (
                      <div
                        key={cp._id}
                        className="bg-white border border-gray-100 rounded-[2rem] px-8 py-6 flex items-center gap-6 hover:shadow-lg transition-all"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-[#FBB017] to-[#e9a215] rounded-2xl flex items-center justify-center text-white font-black text-sm overflow-hidden shrink-0">
                          {cp.profileImage ? (
                            <img
                              src={cp.profileImage as string}
                              alt={cp.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            cp.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#2D3A5D] font-black text-sm">
                            {cp.name}
                          </p>
                          <p className="text-[#2D3A5D]/40 text-xs font-bold">
                            {cp.email as string} · ID:{" "}
                            {cp.studentId || cp._id?.substring(0, 8)}
                          </p>
                          <p className="text-[#2D3A5D]/40 text-xs font-bold">
                            {cp.university as string}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              cp.accountStatus === "active"
                                ? "bg-green-100 text-green-700"
                                : cp.accountStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {cp.accountStatus}
                          </span>
                          {cp.accountStatus === "pending" && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Approve ${cp.name} as Club President?`,
                                  )
                                ) {
                                  updateAccountStatus(cp._id!, "active")
                                    .then(() => {
                                      getAllClubPresidents().then((r) => {
                                        const d = r.data as {
                                          users?: UserData[];
                                        };
                                        setClubPresidents(d.users || []);
                                      });
                                      alert(`${cp.name} has been approved!`);
                                    })
                                    .catch(() => alert("Failed to approve"));
                                }
                              }}
                              className="bg-green-50 hover:bg-green-500 text-green-600 hover:text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              Approve
                            </button>
                          )}
                          {cp.accountStatus === "active" && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Suspend ${cp.name}?`)) {
                                  updateAccountStatus(
                                    cp._id!,
                                    "suspended",
                                  ).then(() => {
                                    getAllClubPresidents().then((r) => {
                                      const d = r.data as {
                                        users?: UserData[];
                                      };
                                      setClubPresidents(d.users || []);
                                    });
                                  });
                                }
                              }}
                              className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Events Sub-tab */}
            {adminEventSubTab === "upcoming" && (
              <EventsDashboard role="superadmin" />
            )}

            {/* Event History Sub-tab */}
            {adminEventSubTab === "history" && (
              <AdminEventsPanel role="superadmin" isHistory={true} />
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

export default SuperAdminDashboard;
