import { apiClient, unwrapResponse } from "@/lib/api/client";
import type {
  AdminAuthPayload,
  AdminDashboardSummary,
  AdminInviteAcceptPayload,
  AdminInvitePreview,
  AdminPasswordResetPreview,
  AdminPermission,
  AdminRole,
  AdminUserSummary,
  GenericRecord,
  PaginatedResponse,
} from "@/lib/types";

export interface LoginPayload {
  email: string;
  password: string;
  totpCode: string;
}

export interface InvitePayload {
  email: string;
  phone: string;
  fullName: string;
  roleId: string;
}

export interface ActivationPayload {
  token: string;
  fullName: string;
  password: string;
}

export interface ConfirmTOTPActivationPayload {
  token: string;
  code: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  totpCode?: string;
  recoveryCode?: string;
}

export interface SettingPayload {
  key: string;
  description?: string;
  value: unknown;
}

export interface PriceRequestPayload {
  productId: string;
  newPrice: number;
  newAdminFee: number;
  reason: string;
}

export interface BalanceAdjustmentPayload {
  userId: string;
  amountDelta: number;
  description: string;
  reason: string;
}

export interface VoucherStatusPayload {
  isActive: boolean;
}

const listParams = (params?: Record<string, string | number | undefined>) => ({
  params,
});

export const adminApi = {
  login(payload: LoginPayload) {
    return unwrapResponse<AdminAuthPayload>(apiClient.post("/auth/login", payload));
  },
  refresh(refreshToken: string) {
    return unwrapResponse<AdminAuthPayload>(
      apiClient.post("/auth/refresh", { refreshToken }),
    );
  },
  forgotPassword(payload: ForgotPasswordPayload) {
    return unwrapResponse<{ message: string }>(
      apiClient.post("/auth/forgot-password", payload),
    );
  },
  getPasswordResetPreview(token: string) {
    return unwrapResponse<AdminPasswordResetPreview>(
      apiClient.get(`/auth/password-resets/${token}`),
    );
  },
  resetPassword(payload: ResetPasswordPayload) {
    return unwrapResponse<{ message: string }>(
      apiClient.post("/auth/password-resets/confirm", payload),
    );
  },
  logout() {
    return unwrapResponse<{ message: string }>(apiClient.post("/auth/logout"));
  },
  me() {
    return unwrapResponse<{ user: AdminUserSummary; permissions: string[] }>(
      apiClient.get("/me"),
    );
  },
  getInvitePreview(token: string) {
    return unwrapResponse<AdminInvitePreview>(apiClient.get(`/auth/invites/${token}`));
  },
  acceptInvite(payload: ActivationPayload) {
    return unwrapResponse<AdminInviteAcceptPayload>(
      apiClient.post("/auth/invites/accept", payload),
    );
  },
  confirmInviteTOTP(payload: ConfirmTOTPActivationPayload) {
    return unwrapResponse<AdminAuthPayload>(
      apiClient.post("/auth/invites/confirm-totp", payload),
    );
  },
  listRoles() {
    return unwrapResponse<AdminRole[]>(apiClient.get("/roles"));
  },
  listPermissions() {
    return unwrapResponse<AdminPermission[]>(apiClient.get("/permissions"));
  },
  getDashboardSummary() {
    return unwrapResponse<AdminDashboardSummary>(apiClient.get("/dashboard/summary"));
  },
  listAdmins(search = "", page = 1, perPage = 20) {
    return unwrapResponse<PaginatedResponse<GenericRecord>>(
      apiClient.get("/admins", listParams({ search, page, perPage })),
    );
  },
  getAdminDetail(id: string) {
    return unwrapResponse<GenericRecord>(apiClient.get(`/admins/${id}`));
  },
  createInvite(payload: InvitePayload) {
    return unwrapResponse<{ inviteId: string; inviteLink: string; emailSent: boolean; expiresAt: string }>(
      apiClient.post("/admins/invite", payload),
    );
  },
  setAdminStatus(id: string, payload: { status: string; isActive: boolean }) {
    return unwrapResponse<{ message: string }>(
      apiClient.patch(`/admins/${id}/status`, payload),
    );
  },
  listCustomers(search = "", page = 1, perPage = 20) {
    return unwrapResponse<PaginatedResponse<GenericRecord>>(
      apiClient.get("/customers", listParams({ search, page, perPage })),
    );
  },
  getCustomerDetail(id: string) {
    return unwrapResponse<GenericRecord>(apiClient.get(`/customers/${id}`));
  },
  listTransactions(search = "", status = "all", page = 1, perPage = 20) {
    return unwrapResponse<PaginatedResponse<GenericRecord>>(
      apiClient.get("/transactions", listParams({ search, status, page, perPage })),
    );
  },
  getTransactionDetail(id: string) {
    return unwrapResponse<GenericRecord>(apiClient.get(`/transactions/${id}`));
  },
  listDeposits(search = "", status = "all", page = 1, perPage = 20) {
    return unwrapResponse<PaginatedResponse<GenericRecord>>(
      apiClient.get("/deposits", listParams({ search, status, page, perPage })),
    );
  },
  getDepositDetail(id: string) {
    return unwrapResponse<GenericRecord>(apiClient.get(`/deposits/${id}`));
  },
  approveDeposit(id: string) {
    return unwrapResponse<{ message: string }>(
      apiClient.post(`/deposits/${id}/approve`),
    );
  },
  rejectDeposit(id: string) {
    return unwrapResponse<{ message: string }>(apiClient.post(`/deposits/${id}/reject`));
  },
  listQris(search = "", page = 1, perPage = 20) {
    return unwrapResponse<PaginatedResponse<GenericRecord>>(
      apiClient.get("/qris", listParams({ search, page, perPage })),
    );
  },
  getQrisDetail(id: string) {
    return unwrapResponse<GenericRecord>(apiClient.get(`/qris/${id}`));
  },
  listVouchers(search = "", page = 1, perPage = 20) {
    return unwrapResponse<PaginatedResponse<GenericRecord>>(
      apiClient.get("/vouchers", listParams({ search, page, perPage })),
    );
  },
  getVoucherDetail(id: string) {
    return unwrapResponse<GenericRecord>(apiClient.get(`/vouchers/${id}`));
  },
  createVoucher(payload: GenericRecord) {
    return unwrapResponse<{ message: string }>(apiClient.post("/vouchers", payload));
  },
  updateVoucher(id: string, payload: GenericRecord) {
    return unwrapResponse<{ message: string }>(apiClient.patch(`/vouchers/${id}`, payload));
  },
  updateVoucherStatus(id: string, payload: VoucherStatusPayload) {
    return unwrapResponse<{ message: string }>(
      apiClient.patch(`/vouchers/${id}/status`, payload),
    );
  },
  getCatalog(search = "", page = 1, perPage = 20) {
    return unwrapResponse<{ services: GenericRecord[]; products: PaginatedResponse<GenericRecord> }>(
      apiClient.get("/catalog", listParams({ search, page, perPage })),
    );
  },
  createPricingRequest(payload: PriceRequestPayload) {
    return unwrapResponse<{ message: string }>(
      apiClient.post("/pricing/requests", payload),
    );
  },
  createBalanceAdjustmentRequest(payload: BalanceAdjustmentPayload) {
    return unwrapResponse<{ message: string }>(
      apiClient.post("/finance/balance-adjustments", payload),
    );
  },
  listKyc(search = "", status = "all", page = 1, perPage = 20) {
    return unwrapResponse<PaginatedResponse<GenericRecord>>(
      apiClient.get("/kyc", listParams({ search, status, page, perPage })),
    );
  },
  getKycDetail(userId: string) {
    return unwrapResponse<GenericRecord>(apiClient.get(`/kyc/${userId}`));
  },
  approveKyc(userId: string) {
    return unwrapResponse<{ message: string }>(
      apiClient.post(`/kyc/${userId}/approve`),
    );
  },
  rejectKyc(userId: string) {
    return unwrapResponse<{ message: string }>(apiClient.post(`/kyc/${userId}/reject`));
  },
  listBanners() {
    return unwrapResponse<GenericRecord[]>(apiClient.get("/banners"));
  },
  createBanner(payload: GenericRecord) {
    return unwrapResponse<{ message: string }>(apiClient.post("/banners", payload));
  },
  updateBanner(id: string, payload: GenericRecord) {
    return unwrapResponse<{ message: string }>(apiClient.patch(`/banners/${id}`, payload));
  },
  deleteBanner(id: string) {
    return unwrapResponse<{ message: string }>(apiClient.delete(`/banners/${id}`));
  },
  listNotifications(search = "", page = 1, perPage = 20) {
    return unwrapResponse<PaginatedResponse<GenericRecord>>(
      apiClient.get("/notifications", listParams({ search, page, perPage })),
    );
  },
  broadcastNotification(payload: GenericRecord) {
    return unwrapResponse<{ message: string }>(
      apiClient.post("/notifications/broadcast", payload),
    );
  },
  listApprovals(status = "all", page = 1, perPage = 20) {
    return unwrapResponse<PaginatedResponse<GenericRecord>>(
      apiClient.get("/approvals", listParams({ status, page, perPage })),
    );
  },
  approveApproval(id: string) {
    return unwrapResponse<{ message: string }>(apiClient.post(`/approvals/${id}/approve`));
  },
  rejectApproval(id: string, reason: string) {
    return unwrapResponse<{ message: string }>(
      apiClient.post(`/approvals/${id}/reject`, { reason }),
    );
  },
  listAuditLogs(page = 1, perPage = 20) {
    return unwrapResponse<PaginatedResponse<GenericRecord>>(
      apiClient.get("/audit-logs", listParams({ page, perPage })),
    );
  },
  listSettings() {
    return unwrapResponse<GenericRecord[]>(apiClient.get("/settings"));
  },
  upsertSetting(payload: SettingPayload) {
    return unwrapResponse<{ message: string }>(apiClient.put("/settings", payload));
  },
  listReferenceData() {
    return unwrapResponse<Record<string, GenericRecord[]>>(
      apiClient.get("/reference-data"),
    );
  },
};
