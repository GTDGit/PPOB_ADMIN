"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Mail,
  Pencil,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { PermissionFallback } from "@/components/admin/PermissionFallback";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Avatar } from "@/components/admin/Avatar";
import { formatDateTime, formatDate, prettifyStatus } from "@/lib/format";
import type {
  AdminMailbox,
  GenericRecord,
  MailboxCollectionPayload,
  MailboxThreadsPayload,
  ThreadDetailPayload,
} from "@/lib/types";

const THREAD_STATUSES = ["belum_dibalas", "dibalas", "selesai", "arsip"];

function normalizeMailbox(item: GenericRecord): AdminMailbox {
  return {
    id: String(item.id || ""),
    type: String(item.type || "shared") as AdminMailbox["type"],
    address: String(item.address || ""),
    displayName: String(item.displayName || item.display_name || ""),
    ownerAdminId: String(item.ownerAdminId || item.owner_admin_id || ""),
    ownerName: String(item.ownerName || item.owner_name || ""),
    isActive: Boolean(item.isActive ?? item.is_active),
    unreadThreads: Number(item.unreadThreads ?? item.unread_threads ?? 0),
    totalThreads: Number(item.totalThreads ?? item.total_threads ?? 0),
    latestMessageAt: String(item.latestMessageAt || item.latest_message_at || ""),
    createdAt: String(item.createdAt || item.created_at || ""),
    updatedAt: String(item.updatedAt || item.updated_at || ""),
    section: String(item.section || "shared") as AdminMailbox["section"],
    members: (item.members as GenericRecord[] | undefined) || [],
  };
}

function normalizeMailboxCollection(payload: MailboxCollectionPayload): MailboxCollectionPayload {
  return {
    items: (payload.items as unknown as GenericRecord[]).map(normalizeMailbox),
    myMailboxes: (payload.myMailboxes as unknown as GenericRecord[]).map(normalizeMailbox),
    sharedMailboxes: (payload.sharedMailboxes as unknown as GenericRecord[]).map(normalizeMailbox),
    systemMailboxes: (payload.systemMailboxes as unknown as GenericRecord[]).map(normalizeMailbox),
  };
}

function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

function timeOnly(value: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

/* ── Email Chip Input ────────────────────────────────────── */
function EmailChipInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && trimmed.includes("@") && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  return (
    <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
      {value.map((email) => (
        <span
          key={email}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
        >
          {email}
          <button
            type="button"
            onClick={() => onChange(value.filter((e) => e !== email))}
            className="ml-0.5 rounded-full p-0.5 hover:bg-slate-200"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        className="min-w-[120px] flex-1 border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        placeholder={value.length === 0 ? placeholder : ""}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function InboxPage() {
  const { hasAnyPermission } = useAuth();
  const [mailboxes, setMailboxes] = useState<MailboxCollectionPayload | null>(null);
  const [selectedMailboxId, setSelectedMailboxId] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [threads, setThreads] = useState<MailboxThreadsPayload | null>(null);
  const [threadDetail, setThreadDetail] = useState<ThreadDetailPayload | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [replyBody, setReplyBody] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Compose state
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMailboxId, setComposeMailboxId] = useState("");
  const [composeTo, setComposeTo] = useState<string[]>([]);
  const [composeCc, setComposeCc] = useState<string[]>([]);
  const [composeBcc, setComposeBcc] = useState<string[]>([]);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);

  // Quick edit display name
  const [editingMailboxId, setEditingMailboxId] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canView = hasAnyPermission(["mailboxes.view_assigned", "mailboxes.view_all"]);

  /* ── Data loading ─────────────────────────── */
  const loadMailboxes = useCallback(async () => {
    try {
      const response = normalizeMailboxCollection(await adminApi.listMailboxes());
      setMailboxes(response);
      if (!selectedMailboxId) {
        const firstMailbox =
          response.myMailboxes[0]?.id ||
          response.sharedMailboxes[0]?.id ||
          response.systemMailboxes[0]?.id ||
          response.items[0]?.id ||
          "";
        setSelectedMailboxId(firstMailbox);
      }
    } catch (err) {
      setError(extractApiError(err));
    }
  }, [selectedMailboxId]);

  const loadThreads = useCallback(async () => {
    if (!selectedMailboxId) return;
    try {
      const response = await adminApi.listMailboxThreads(selectedMailboxId, {
        search,
        status,
        page,
        perPage: 20,
      });
      setThreads(response);
      const firstThread = response.list.items[0]?.id as string | undefined;
      setSelectedThreadId((current) => current || firstThread || "");
    } catch (err) {
      setError(extractApiError(err));
    }
  }, [page, search, selectedMailboxId, status]);

  const loadThreadDetail = useCallback(async () => {
    if (!selectedThreadId) {
      setThreadDetail(null);
      return;
    }
    try {
      const response = await adminApi.getThreadDetail(selectedThreadId);
      setThreadDetail(response);
    } catch (err) {
      setError(extractApiError(err));
    }
  }, [selectedThreadId]);

  useEffect(() => {
    if (!canView) return;
    void loadMailboxes();
  }, [canView, loadMailboxes]);

  useEffect(() => {
    if (!canView || !selectedMailboxId) return;
    setSelectedThreadId("");
    void loadThreads();
  }, [canView, loadThreads, selectedMailboxId]);

  useEffect(() => {
    if (!canView) return;
    void loadThreadDetail();
  }, [canView, loadThreadDetail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadDetail?.messages]);

  /* ── Derived state ────────────────────────── */
  const mailboxGroups = useMemo(
    () =>
      [
        { title: "Mailbox Saya", items: mailboxes?.myMailboxes || [] },
        { title: "Shared Mailbox", items: mailboxes?.sharedMailboxes || [] },
        { title: "Mailbox Sistem", items: mailboxes?.systemMailboxes || [] },
      ].filter((group) => group.items.length > 0),
    [mailboxes],
  );

  const selectedMailbox = useMemo(
    () => mailboxes?.items.find((item) => item.id === selectedMailboxId) || null,
    [mailboxes, selectedMailboxId],
  );

  const allMailboxes = mailboxes?.items || [];
  const members = (threadDetail?.members || []) as GenericRecord[];

  /* ── Handlers ─────────────────────────────── */
  const handleReply = async () => {
    if (!selectedThreadId || !replyBody.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await adminApi.replyThread(selectedThreadId, { body: replyBody.trim() });
      setNotice(response.message);
      setReplyBody("");
      await Promise.all([loadThreads(), loadThreadDetail()]);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (nextStatus: string) => {
    if (!selectedThreadId) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.updateThreadStatus(selectedThreadId, nextStatus);
      setNotice(`Status thread diubah menjadi ${prettifyStatus(nextStatus)}`);
      await Promise.all([loadThreads(), loadThreadDetail()]);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async (adminUserId: string) => {
    if (!selectedThreadId) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.assignThread(selectedThreadId, adminUserId);
      setNotice("Thread berhasil di-assign");
      await Promise.all([loadThreads(), loadThreadDetail()]);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleCompose = async () => {
    if (!composeMailboxId || composeTo.length === 0 || !composeSubject.trim() || !composeBody.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await adminApi.composeEmail({
        mailboxId: composeMailboxId,
        to: composeTo,
        cc: composeCc.length > 0 ? composeCc : undefined,
        bcc: composeBcc.length > 0 ? composeBcc : undefined,
        subject: composeSubject.trim(),
        body: composeBody.trim(),
      });
      setNotice("Email berhasil dikirim");
      resetCompose();
      setSelectedThreadId(result.threadId);
      await loadThreads();
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const resetCompose = () => {
    setComposeOpen(false);
    setComposeTo([]);
    setComposeCc([]);
    setComposeBcc([]);
    setComposeSubject("");
    setComposeBody("");
    setShowCcBcc(false);
  };

  const handleQuickEditSave = async (mailboxId: string) => {
    if (!editDisplayName.trim()) return;
    setBusy(true);
    try {
      await adminApi.updateMailboxDisplayName(mailboxId, editDisplayName.trim());
      setEditingMailboxId("");
      await loadMailboxes();
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (!canView) return <PermissionFallback />;

  /* ── Render ───────────────────────────────── */
  const threadItems = threads?.list.items || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          eyebrow="Email & CS"
          title="Inbox operasional"
          description="Pantau email masuk, balas langsung, atau kirim email baru dari console."
        />
        <button
          type="button"
          className="admin-button-primary flex items-center gap-2"
          onClick={() => {
            setComposeOpen(true);
            setComposeMailboxId(selectedMailboxId || allMailboxes[0]?.id || "");
          }}
        >
          <Plus className="h-4 w-4" />
          Tulis Email
        </button>
      </div>

      {error && <div className="admin-note-error">{error}</div>}
      {notice && <div className="admin-note-success">{notice}</div>}

      {/* ── Mailbox Selector ─────────────────── */}
      <Panel title="Mailbox" description="Pilih mailbox untuk melihat percakapan yang masuk.">
        <div className="space-y-4">
          {mailboxGroups.map((group) => (
            <div key={group.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {group.title}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                {group.items.map((mailbox) => {
                  const active = selectedMailboxId === mailbox.id;
                  const isEditing = editingMailboxId === mailbox.id;
                  return (
                    <div
                      key={mailbox.id}
                      className={`group relative flex items-start gap-3 rounded-2xl px-4 py-3 transition cursor-pointer ${
                        active
                          ? "bg-blue-50 border border-blue-200 shadow-sm"
                          : "border border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                      onClick={() => {
                        if (!isEditing) {
                          setPage(1);
                          setSelectedMailboxId(mailbox.id);
                        }
                      }}
                    >
                      <Avatar name={mailbox.displayName || mailbox.address} size="md" />
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              className="admin-input !py-1 !text-sm"
                              value={editDisplayName}
                              onChange={(e) => setEditDisplayName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") void handleQuickEditSave(mailbox.id);
                                if (e.key === "Escape") setEditingMailboxId("");
                              }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              type="button"
                              className="rounded-lg p-1 text-blue-600 hover:bg-blue-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleQuickEditSave(mailbox.id);
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingMailboxId("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <p className={`text-sm font-semibold truncate ${active ? "text-blue-900" : "text-slate-900"}`}>
                            {mailbox.displayName}
                          </p>
                        )}
                        <p className={`text-xs truncate ${active ? "text-blue-600" : "text-slate-500"}`}>
                          {mailbox.address}
                        </p>
                        {(mailbox.unreadThreads || 0) > 0 && (
                          <span className="mt-1 inline-block rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            {mailbox.unreadThreads} baru
                          </span>
                        )}
                      </div>
                      {!isEditing && (
                        <button
                          type="button"
                          className="absolute right-2 top-2 rounded-lg p-1 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMailboxId(mailbox.id);
                            setEditDisplayName(mailbox.displayName);
                          }}
                          title="Edit nama pengirim"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ── Main Content: Thread List + Detail/Compose ─── */}
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Thread List */}
        <Panel
          title={selectedMailbox ? `Percakapan ${selectedMailbox.displayName}` : "Percakapan"}
          description="Klik thread untuk melihat detail dan membalas."
          action={
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="admin-input !pl-9"
                  placeholder="Cari subject atau pengirim"
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                />
              </div>
              <select
                className="admin-select !w-auto"
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
              >
                <option value="all">Semua</option>
                {THREAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {prettifyStatus(s)}
                  </option>
                ))}
              </select>
            </div>
          }
        >
          {threadItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center text-sm text-slate-500">
              <Mail className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              Belum ada percakapan pada mailbox ini.
            </div>
          ) : (
            <div className="space-y-1">
              {threadItems.map((row) => {
                const threadId = String(row.id || "");
                const isActive = threadId === selectedThreadId;
                const unread = Number(row.unread_count || 0) > 0;
                const participantName = String(row.participant_name || row.participant_email || "Tanpa Nama");
                const ts = String(row.latest_message_at || row.created_at || "");

                return (
                  <button
                    key={threadId}
                    type="button"
                    onClick={() => {
                      setSelectedThreadId(threadId);
                      setComposeOpen(false);
                    }}
                    className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3.5 text-left transition ${
                      isActive
                        ? "bg-blue-50/60 border border-blue-100"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    {unread && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                    )}
                    <Avatar name={participantName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`truncate text-sm ${unread ? "font-bold text-slate-900" : "font-medium text-slate-800"}`}>
                          {participantName}
                        </p>
                        <span className="shrink-0 text-[11px] text-slate-400">{timeOnly(ts)}</span>
                      </div>
                      <p className={`mt-0.5 truncate text-[13px] ${unread ? "font-semibold text-slate-800" : "text-slate-600"}`}>
                        {String(row.subject || "(Tanpa subjek)")}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="flex-1 truncate text-xs text-slate-400">
                          {String(row.last_message_preview || "-")}
                        </p>
                        <StatusBadge value={String(row.status || "")} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          <Pagination
            page={threads?.list.page || page}
            hasNext={Boolean(threads?.list.hasNext)}
            onPrevious={() => setPage((c) => Math.max(1, c - 1))}
            onNext={() => setPage((c) => c + 1)}
          />
        </Panel>

        {/* Right Panel: Compose or Thread Detail */}
        {composeOpen ? (
          /* ── Compose View ─────────────────── */
          <Panel
            title="Email Baru"
            description="Tulis dan kirim email baru dari salah satu mailbox."
            action={
              <button type="button" onClick={resetCompose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">From</label>
                <select
                  className="admin-select"
                  value={composeMailboxId}
                  onChange={(e) => setComposeMailboxId(e.target.value)}
                >
                  {allMailboxes.map((mb) => (
                    <option key={mb.id} value={mb.id}>
                      {mb.displayName} &lt;{mb.address}&gt;
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">To</label>
                <EmailChipInput value={composeTo} onChange={setComposeTo} placeholder="email@contoh.com — tekan Enter" />
              </div>

              {!showCcBcc && (
                <button
                  type="button"
                  className="text-xs font-medium text-blue-600 hover:underline"
                  onClick={() => setShowCcBcc(true)}
                >
                  + Cc / Bcc
                </button>
              )}

              {showCcBcc && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">Cc</label>
                    <EmailChipInput value={composeCc} onChange={setComposeCc} placeholder="Cc" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">Bcc</label>
                    <EmailChipInput value={composeBcc} onChange={setComposeBcc} placeholder="Bcc" />
                  </div>
                </>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">Subject</label>
                <input
                  className="admin-input"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subjek email"
                />
              </div>

              <div>
                <textarea
                  className="admin-textarea min-h-[200px]"
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Tulis isi email..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="admin-button-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={busy || composeTo.length === 0 || !composeSubject.trim() || !composeBody.trim()}
                  onClick={() => void handleCompose()}
                >
                  <Send className="h-4 w-4" />
                  {busy ? "Mengirim..." : "Kirim Email"}
                </button>
              </div>
            </div>
          </Panel>
        ) : threadDetail ? (
          /* ── Thread Detail ────────────────── */
          <Panel
            title={String(threadDetail.thread.subject || "Detail thread")}
            description=""
          >
            <div className="space-y-5">
              {/* Thread header */}
              <div className="flex items-start gap-4">
                <Avatar
                  name={String(threadDetail.thread.participant_name || threadDetail.thread.participant_email || "?")}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-slate-900">
                    {String(threadDetail.thread.participant_name || threadDetail.thread.participant_email || "-")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {String(threadDetail.thread.participant_email || "-")}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <StatusBadge value={String(threadDetail.thread.status || "")} />
                    <span>|</span>
                    <span>
                      PIC: {String(threadDetail.thread.assigned_admin_name || "Belum di-assign")}
                    </span>
                    <span>|</span>
                    <span>{formatDateTime(String(threadDetail.thread.latest_message_at || ""))}</span>
                  </div>
                </div>
              </div>

              {/* Actions: Assign + Status */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Assign PIC</label>
                  <select
                    className="admin-select"
                    value={String(threadDetail.thread.assigned_admin_id || "")}
                    onChange={(e) => void handleAssign(e.target.value)}
                    disabled={busy || !threadDetail.canAssign}
                  >
                    <option value="">Belum di-assign</option>
                    {members.map((member) => (
                      <option key={String(member.admin_user_id)} value={String(member.admin_user_id)}>
                        {String(member.admin_name || member.email || "-")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-slate-600">Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {THREAD_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={busy || !threadDetail.canSetStatus}
                        onClick={() => void handleStatusChange(s)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          String(threadDetail.thread.status) === s
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {prettifyStatus(s)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message timeline — chat bubble style */}
              <div className="space-y-3">
                {(threadDetail.messages || []).map((message, idx, arr) => {
                  const outbound = String(message.direction || "") === "outbound";
                  const senderName = String(message.sender_name || message.sender_address || "-");
                  const avatarUrl = String(message.sender_avatar_url || "") || undefined;
                  const ts = String(message.sent_at || message.received_at || message.created_at || "");
                  const prevTs = idx > 0 ? String(arr[idx - 1].sent_at || arr[idx - 1].received_at || arr[idx - 1].created_at || "") : "";
                  const showDateDivider = idx === 0 || !isSameDay(ts, prevTs);

                  return (
                    <div key={String(message.id)}>
                      {showDateDivider && (
                        <div className="flex items-center gap-3 py-2">
                          <div className="h-px flex-1 bg-slate-200" />
                          <span className="text-[11px] font-medium text-slate-400">{formatDate(ts)}</span>
                          <div className="h-px flex-1 bg-slate-200" />
                        </div>
                      )}

                      <div className={`flex gap-2.5 ${outbound ? "flex-row-reverse" : ""}`}>
                        <Avatar src={outbound ? avatarUrl : undefined} name={senderName} size="sm" className="mt-1" />
                        <div className={`max-w-[80%] ${outbound ? "text-right" : ""}`}>
                          <div className={`flex items-center gap-2 mb-1 ${outbound ? "justify-end" : ""}`}>
                            <span className="text-xs font-semibold text-slate-700">{senderName}</span>
                            <span className="text-[11px] text-slate-400">{timeOnly(ts)}</span>
                          </div>
                          <div
                            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                              outbound
                                ? "bg-blue-50 text-slate-800 rounded-tr-md"
                                : "bg-white border border-slate-200 text-slate-700 rounded-tl-md"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">
                              {String(message.text_body || "").trim() ||
                                String(message.html_body || "").replace(/<[^>]+>/g, " ")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachments */}
              {threadDetail.attachments.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Lampiran</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {threadDetail.attachments.map((att) => (
                      <span
                        key={String(att.id)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {String(att.file_name || att.id)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply area */}
              <div className="border-t border-slate-200 pt-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                  <Avatar name={selectedMailbox?.displayName || "Mailbox"} size="sm" />
                  <span>
                    From: <strong>{selectedMailbox?.displayName}</strong> &lt;{selectedMailbox?.address}&gt;
                  </span>
                </div>
                <textarea
                  className="admin-textarea min-h-[120px]"
                  placeholder="Tulis balasan..."
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className="admin-button-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={busy || !replyBody.trim() || !threadDetail.canReply}
                    onClick={() => void handleReply()}
                  >
                    <Send className="h-4 w-4" />
                    {busy ? "Mengirim..." : "Kirim Balasan"}
                  </button>
                </div>
              </div>
            </div>
          </Panel>
        ) : (
          <Panel title="Detail thread" description="">
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-5 py-16 text-center">
              <Mail className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500">Pilih thread untuk melihat detail, atau klik &quot;Tulis Email&quot; untuk mengirim email baru.</p>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
