export interface ResponseMeta {
  requestId: string;
  timestamp: string;
}

export interface ApiEnvelope<T> {
  data: T;
  meta: ResponseMeta;
}

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: unknown;
  remainingAttempts?: number;
  retryAfter?: number;
}

export interface ApiErrorEnvelope {
  error: ApiErrorShape;
  meta: ResponseMeta;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  avatarUrl?: string;
  positionId?: string;
  positionName?: string;
  linkedinUrl?: string;
  mailboxEmail?: string;
  status: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  roles: string[];
  createdAt: string;
}

export interface AdminAuthPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AdminUserSummary;
  permissions: string[];
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminPermission {
  key: string;
  module: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface AdminInvitePreview {
  email: string;
  phone: string;
  roleId: string;
  roleName: string;
  fullName?: string;
  expiresAt: string;
}

export interface AdminInviteAcceptPayload {
  adminId: string;
  secret: string;
  otpauthUrl: string;
  recoveryCodes: string[];
}

export interface AdminPasswordResetPreview {
  email: string;
  expiresAt: string;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  activeAdmins: number;
  transactionsToday: number;
  depositsPending: number;
  pendingKYC: number;
  pendingApprovals: number;
  revenueToday: number;
  depositAmountToday: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  hasNext: boolean;
}

export interface AuthStateSnapshot {
  accessToken: string;
  refreshToken: string;
  permissions: string[];
  user: AdminUserSummary;
}

export interface AdminMailbox {
  id: string;
  type: "system" | "shared" | "personal";
  address: string;
  displayName: string;
  ownerAdminId?: string | null;
  ownerName?: string | null;
  isActive: boolean;
  unreadThreads?: number;
  totalThreads?: number;
  latestMessageAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  section?: "my" | "personal" | "shared" | "system";
  members?: GenericRecord[];
}

export interface MailboxCollectionPayload {
  items: AdminMailbox[];
  myMailboxes: AdminMailbox[];
  sharedMailboxes: AdminMailbox[];
  systemMailboxes: AdminMailbox[];
}

export interface MailboxThreadsPayload {
  mailbox: GenericRecord;
  list: PaginatedResponse<GenericRecord>;
  canReply: boolean;
  canAssign: boolean;
  canManageStatus: boolean;
}

export interface ThreadDetailPayload {
  thread: GenericRecord;
  mailbox: GenericRecord;
  messages: GenericRecord[];
  attachments: GenericRecord[];
  members: GenericRecord[];
  canReply: boolean;
  canAssign: boolean;
  canSetStatus: boolean;
}

export interface NavigationItem {
  label: string;
  href: string;
  permission?: string;
  permissions?: string[];
}

export type GenericRecord = Record<string, unknown>;
