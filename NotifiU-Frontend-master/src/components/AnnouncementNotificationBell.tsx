import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  BellRing,
  CheckCheck,
  Megaphone,
  Paperclip,
  X,
} from "lucide-react";
import NotificationModal from "./NotificationModal";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/api";

interface AnnouncementAttachment {
  _id: string;
}

interface AnnouncementSummary {
  _id: string;
  title: string;
  content: string;
  attachments?: AnnouncementAttachment[];
}

interface AnnouncementNotification {
  _id: string;
  type: "announcement";
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  announcement?: AnnouncementSummary | null;
}

const formatRelativeTime = (iso: string) => {
  const createdAt = new Date(iso).getTime();
  const diffMinutes = Math.max(1, Math.floor((Date.now() - createdAt) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

type AnnouncementNotificationBellProps = {
  className?: string;
};

const AnnouncementNotificationBell: React.FC<
  AnnouncementNotificationBellProps
> = ({ className = "" }) => {
  const [notifications, setNotifications] = useState<
    AnnouncementNotification[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [popup, setPopup] = useState({ isOpen: false, message: "" });
  const hasLoadedOnceRef = useRef(false);
  const unreadIdsRef = useRef<string[]>([]);

  const rawUser = localStorage.getItem("user");
  const shouldHide = !rawUser;

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      const incoming = response.data as AnnouncementNotification[];
      const unreadIds = incoming
        .filter((item) => !item.isRead)
        .map((item) => item._id);

      if (hasLoadedOnceRef.current) {
        const newUnread = unreadIds.find(
          (id) => !unreadIdsRef.current.includes(id),
        );
        if (newUnread) {
          const freshNotification = incoming.find(
            (item) => item._id === newUnread,
          );
          if (freshNotification) {
            setPopup({
              isOpen: true,
              message: `New announcement: ${freshNotification.title}`,
            });
          }
        }
      }

      unreadIdsRef.current = unreadIds;
      hasLoadedOnceRef.current = true;
      setNotifications(incoming);
    } catch (error) {
      console.error("Failed to fetch announcement notifications", error);
    }
  };

  useEffect(() => {
    if (shouldHide) {
      setNotifications([]);
      setIsOpen(false);
      return;
    }

    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 30000);

    return () => window.clearInterval(interval);
  }, [shouldHide]);

  if (shouldHide) {
    return null;
  }

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const handleOpen = async () => {
    setIsOpen((prev) => !prev);

    if (unreadCount > 0) {
      try {
        await markAllNotificationsRead();
        setNotifications((prev) =>
          prev.map((item) => ({ ...item, isRead: true })),
        );
        unreadIdsRef.current = [];
      } catch (error) {
        console.error("Failed to mark notifications as read", error);
      }
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item,
        ),
      );
      unreadIdsRef.current = unreadIdsRef.current.filter(
        (notificationId) => notificationId !== id,
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const bellColorClass = unreadCount > 0 ? "text-[#FBB017]" : "text-white/60";
  const bellLabelClass = unreadCount > 0 ? "text-[#FBB017]" : "text-white/40";

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Open announcement notifications"
          className="group flex flex-col items-center gap-1.5 px-3 transition-all duration-300"
        >
          <span className="relative flex items-center justify-center">
            {unreadCount > 0 ? (
              <BellRing size={22} className={bellColorClass} />
            ) : (
              <Bell
                size={22}
                className={`${bellColorClass} group-hover:text-white`}
              />
            )}
            {unreadCount > 0 && (
              <span className="absolute -right-3 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#FBB017] px-1 text-[10px] font-black text-[#1A1C2C] shadow-lg">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${bellLabelClass} group-hover:text-white/80`}
          >
            Alerts
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full z-1200 mt-4 w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-4xl border border-white/70 bg-white/95 shadow-[0_30px_80px_-28px_rgba(26,28,44,0.45)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-[#1A1C2C]/8 px-6 py-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#FBB017]">
                  Notifications
                </p>
                <h3 className="text-lg font-black text-[#1A1C2C]">
                  Announcement Updates
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await markAllNotificationsRead();
                      setNotifications((prev) =>
                        prev.map((item) => ({ ...item, isRead: true })),
                      );
                      unreadIdsRef.current = [];
                    } catch (error) {
                      console.error(
                        "Failed to mark all notifications as read",
                        error,
                      );
                    }
                  }}
                  className="rounded-full bg-[#F4F5F8] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#1A1C2C] transition hover:bg-[#FBB017]"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCheck size={12} />
                    Read All
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F5F8] text-[#1A1C2C] transition hover:bg-[#E7EAF0]"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-112 overflow-y-auto px-4 py-4">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF6DE] text-[#FBB017]">
                    <Bell size={24} />
                  </div>
                  <p className="text-sm font-bold text-[#1A1C2C]">
                    No notifications yet
                  </p>
                  <p className="text-sm text-[#1A1C2C]/55">
                    New published announcements will appear here for every role.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification._id}
                      onClick={() => {
                        if (!notification.isRead) {
                          handleMarkOneRead(notification._id);
                        }
                      }}
                      className={`w-full rounded-[1.6rem] border px-4 py-4 text-left transition ${notification.isRead ? "border-[#1A1C2C]/6 bg-[#F7F8FA]" : "border-[#FBB017]/40 bg-[#FFF8E8] shadow-[0_10px_30px_-22px_rgba(251,176,23,0.9)]"}`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${notification.isRead ? "bg-white text-[#1A1C2C]/60" : "bg-[#FBB017] text-[#1A1C2C]"}`}
                          >
                            <Megaphone size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#1A1C2C]">
                              {notification.title}
                            </p>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-[#1A1C2C]/45">
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                        {!notification.isRead && (
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#FBB017]" />
                        )}
                      </div>
                      <p className="line-clamp-2 text-sm leading-6 text-[#1A1C2C]/68">
                        {notification.message}
                      </p>
                      {!!notification.announcement?.attachments?.length && (
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#1A1C2C]/70">
                          <Paperclip size={12} />
                          {notification.announcement.attachments.length}{" "}
                          Attachment
                          {notification.announcement.attachments.length > 1
                            ? "s"
                            : ""}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <NotificationModal
        isOpen={popup.isOpen}
        message={popup.message}
        type="info"
        onClose={() => setPopup({ isOpen: false, message: "" })}
      />
    </>
  );
};

export default AnnouncementNotificationBell;
