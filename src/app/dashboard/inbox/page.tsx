"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { extractApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { AdminTable, type TableColumn } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { PermissionFallback } from "@/components/admin/PermissionFallback";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDateTime, prettifyStatus } from "@/lib/format";
import type {
  AdminMailbox,
  GenericRecord,
  MailboxCollectionPayload,
  MailboxThreadsPayload,
  ThreadDetailPayload,
} from "@/lib/types";

const THREAD_STATUSES = [
  "belum_dibalas",
  "dibalas",
  "selesai",
  "arsip",
];

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

  const canView = hasAnyPermission(["mailboxes.view_assigned", "mailboxes.view_all"]);

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

  const mailboxGroups = useMemo(
    () => [
      { title: "Mailbox Saya", items: mailboxes?.myMailboxes || [] },
      { title: "Shared Mailbox", items: mailboxes?.sharedMailboxes || [] },
      { title: "Mailbox Sistem", items: mailboxes?.systemMailboxes || [] },
    ].filter((group) => group.items.length > 0),
    [mailboxes],
  );

  const threadColumns = useMemo<TableColumn<GenericRecord>[]>(
    () => [
      {
        key: "subject",
        header: "Percakapan",
        render: (row) => (
          <button
            type="button"
            onClick={() => setSelectedThreadId(String(row.id || ""))}
            className="text-left"
          >
            <p className="font-semibold text-slate-900">{String(row.subject || "(Tanpa subjek)")}</p>
            <p className="mt-1 text-xs text-slate-500">
              {String(row.participant_name || row.participant_email || "-")}
            </p>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
              {String(row.last_message_preview || "-")}
            </p>
          </button>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <div className="space-y-2">
            <StatusBadge value={String(row.status || "")} />
            {Number(row.unread_count || 0) > 0 ? (
              <p className="text-xs font-semibold text-blue-600">
                {String(row.unread_count)} belum dibaca
              </p>
            ) : null}
          </div>
        ),
      },
      {
        key: "assigned",
        header: "PIC",
        render: (row) => (
          <div>
            <p className="font-medium text-slate-800">
              {String(row.assigned_admin_name || "Belum di-assign")}
            </p>
            <p className="mt-1 text-xs text-slate-500">{String(row.last_direction || "-")}</p>
          </div>
        ),
      },
      {
        key: "latest",
        header: "Aktivitas",
        render: (row) => formatDateTime(String(row.latest_message_at || row.created_at || "")),
      },
    ],
    [],
  );

  const selectedMailbox = useMemo(
    () => mailboxes?.items.find((item) => item.id === selectedMailboxId) || null,
    [mailboxes, selectedMailboxId],
  );

  const members = (threadDetail?.members || []) as GenericRecord[];

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

  if (!canView) return <PermissionFallback />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Email & CS"
        title="Inbox operasional"
        description="Pantau email masuk dari mailbox personal dan shared mailbox, balas langsung dari console, lalu ubah status thread sesuai progres penanganan."
      />

      {error ? <div className="admin-note-error">{error}</div> : null}
      {notice ? <div className="admin-note-success">{notice}</div> : null}

      <Panel
        title="Pilih mailbox"
        description="Section inbox dipisah antara mailbox personal dan shared mailbox agar tim bisa fokus pada percakapan yang relevan."
      >
        <div className="space-y-4">
          {mailboxGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {group.title}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {group.items.map((mailbox) => (
                  <button
                    key={mailbox.id}
                    type="button"
                    onClick={() => {
                      setPage(1);
                      setSelectedMailboxId(mailbox.id);
                    }}
                    className={
                      selectedMailboxId === mailbox.id
                        ? "rounded-2xl bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] px-4 py-3 text-left text-white shadow-[0_18px_34px_rgba(37,99,235,0.2)]"
                        : "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-700 shadow-sm"
                    }
                  >
                    <p className="text-sm font-semibold">{mailbox.displayName}</p>
                    <p className="mt-1 text-xs opacity-80">{mailbox.address}</p>
                    <p className="mt-2 text-xs opacity-80">
                      {mailbox.unreadThreads || 0} thread belum dibaca
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel
          title={selectedMailbox ? `Percakapan ${selectedMailbox.displayName}` : "Percakapan inbox"}
          description="Klik salah satu thread untuk melihat detail, mengubah status, assign PIC, dan membalas email."
          action={
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="admin-input"
                placeholder="Cari subject atau pengirim"
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
              />
              <select
                className="admin-select"
                value={status}
                onChange={(event) => {
                  setPage(1);
                  setStatus(event.target.value);
                }}
              >
                <option value="all">Semua status</option>
                {THREAD_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {prettifyStatus(option)}
                  </option>
                ))}
              </select>
            </div>
          }
        >
          <AdminTable columns={threadColumns} rows={threads?.list.items || []} emptyLabel="Belum ada thread pada mailbox ini." />
          <Pagination
            page={threads?.list.page || page}
            hasNext={Boolean(threads?.list.hasNext)}
            onPrevious={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => current + 1)}
          />
        </Panel>

        <Panel
          title={String(threadDetail?.thread.subject || "Detail thread")}
          description="Timeline pesan, assignment PIC, status, dan area balas email tersedia di panel ini."
        >
          {threadDetail ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pengirim</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {String(threadDetail.thread.participant_name || threadDetail.thread.participant_email || "-")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {String(threadDetail.thread.participant_email || "-")}
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</p>
                  <div className="mt-2">
                    <StatusBadge value={String(threadDetail.thread.status || "")} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Aktivitas terakhir {formatDateTime(String(threadDetail.thread.latest_message_at || ""))}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">Assign PIC</label>
                  <select
                    className="admin-select"
                    value={String(threadDetail.thread.assigned_admin_id || "")}
                    onChange={(event) => void handleAssign(event.target.value)}
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
                  <p className="mb-2 block text-sm font-semibold text-slate-800">Ubah status</p>
                  <div className="flex flex-wrap gap-2">
                    {THREAD_STATUSES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        disabled={busy || !threadDetail.canSetStatus}
                        onClick={() => void handleStatusChange(item)}
                        className="admin-chip-button disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {prettifyStatus(item)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {(threadDetail.messages || []).map((message) => {
                  const outbound = String(message.direction || "") === "outbound";
                  return (
                    <div
                      key={String(message.id)}
                      className={
                        outbound
                          ? "rounded-[1.4rem] border border-blue-100 bg-blue-50/70 p-4"
                          : "rounded-[1.4rem] border border-slate-200 bg-white p-4"
                      }
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-semibold text-slate-900">
                          {String(message.sender_name || message.sender_address || "-")}
                        </p>
                        <StatusBadge value={String(message.direction || "") === "outbound" ? "dibalas" : "belum_dibalas"} />
                        <p className="text-xs text-slate-500">
                          {formatDateTime(String(message.sent_at || message.received_at || message.created_at || ""))}
                        </p>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {String(message.text_body || "").trim() || String(message.html_body || "").replace(/<[^>]+>/g, " ")}
                      </p>
                    </div>
                  );
                })}
              </div>

              {threadDetail.attachments.length > 0 ? (
                <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">Lampiran</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {threadDetail.attachments.map((attachment) => (
                      <span
                        key={String(attachment.id)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        {String(attachment.file_name || attachment.id)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-800">Balas email</label>
                <textarea
                  className="admin-textarea min-h-[150px]"
                  placeholder="Tulis balasan untuk thread ini..."
                  value={replyBody}
                  onChange={(event) => setReplyBody(event.target.value)}
                />
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="admin-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={busy || !replyBody.trim() || !threadDetail.canReply}
                    onClick={() => void handleReply()}
                  >
                    {busy ? "Mengirim..." : "Kirim balasan"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">
              Pilih salah satu thread untuk melihat detail inbox.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
