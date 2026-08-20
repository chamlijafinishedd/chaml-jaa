"use client";

import { useEffect, useState } from "react";

export type AdminNotification = {
  id: string;
  kind: "booking" | "payment" | "check_in";
  title: string;
  time: string;
  bookingId: string | null;
  reference: string | null;
};

const READ_KEY = "chamlija-admin-notifications-read";

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });
}

export function AdminNotifications({ notifications }: { notifications: AdminNotification[] }) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      setReadIds(JSON.parse(sessionStorage.getItem(READ_KEY) ?? "[]"));
    } catch {
      setReadIds([]);
    }
  }, []);

  const unreadCount = notifications.filter((notification) => !readIds.includes(notification.id)).length;

  function markRead(id: string) {
    setReadIds((current) => {
      const next = current.includes(id) ? current : [...current, id];
      sessionStorage.setItem(READ_KEY, JSON.stringify(next.slice(-100)));
      return next;
    });
  }

  function markAllRead() {
    const next = notifications.map((notification) => notification.id);
    sessionStorage.setItem(READ_KEY, JSON.stringify(next));
    setReadIds(next);
  }

  return (
    <div className="relative shrink-0">
      <button type="button" onClick={() => setOpen((value) => !value)} className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm transition hover:bg-slate-50" aria-label="Open admin notifications" aria-expanded={open}>
        🔔
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      {open && <div className="absolute right-0 top-14 z-30 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div className="font-bold text-slate-900">Notifications</div><button type="button" onClick={markAllRead} className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">Mark all as read</button></div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm text-slate-500">No recent notifications.</p> : notifications.map((notification) => {
            const unread = !readIds.includes(notification.id);
            return <div key={notification.id} className={`border-b border-slate-100 px-4 py-3 ${unread ? "bg-emerald-50/60" : "bg-white"}`}>
              <div className="flex items-start gap-3"><span className="mt-1 text-sm">{notification.kind === "payment" ? "💳" : notification.kind === "check_in" ? "✅" : "📌"}</span><div className="min-w-0 flex-1"><div className="text-sm font-semibold text-slate-900">{notification.title}</div><div className="mt-1 text-xs text-slate-500">{formatTime(notification.time)}{notification.reference ? ` · ${notification.reference}` : ""}</div>{notification.bookingId && <a href={`/admin?bookingId=${encodeURIComponent(notification.bookingId)}`} onClick={() => markRead(notification.id)} className="mt-2 inline-flex text-xs font-bold text-emerald-700 hover:text-emerald-900">View booking</a>}</div>{unread && <button type="button" onClick={() => markRead(notification.id)} className="shrink-0 text-[11px] font-semibold text-slate-500 hover:text-slate-900">Mark read</button>}</div>
            </div>;
          })}
        </div>
      </div>}
    </div>
  );
}
