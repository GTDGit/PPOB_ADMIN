const idFormatter = new Intl.NumberFormat("id-ID");
const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const TIME_ZONE = "Asia/Jakarta";
const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});
const shortTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});

const labelMap: Record<string, string> = {
  active: "Aktif",
  inactive: "Nonaktif",
  disabled: "Nonaktif",
  success: "Sukses",
  pending: "Menunggu",
  approved: "Disetujui",
  applied: "Diterapkan",
  process: "Diproses",
  processing: "Diproses",
  review: "Review",
  verified: "Terverifikasi",
  unverified: "Belum Verifikasi",
  failed: "Gagal",
  rejected: "Ditolak",
  draft: "Draft",
  expired: "Kedaluwarsa",
  blocked: "Diblokir",
  locked: "Terkunci",
  live: "Live",
  online: "Online",
  completed: "Selesai",
  sent: "Terkirim",
  read: "Dibaca",
  delivered: "Terkirim",
};

const acronymMap: Record<string, string> = {
  id: "ID",
  ip: "IP",
  hp: "HP",
  mic: "MIC",
  kyc: "KYC",
  qris: "QRIS",
  otp: "OTP",
  totp: "TOTP",
  api: "API",
  csv: "CSV",
  url: "URL",
  ppob: "PPOB",
};

export function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${shortDateFormatter.format(date)}, ${shortTimeFormatter
    .format(date)
    .replace(/\./g, ":")} WIB`;
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

export function formatCurrency(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "-";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return currencyFormatter.format(numeric);
}

export function formatNumber(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "-";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return idFormatter.format(numeric);
}

export function titleCase(input: string) {
  return input
    .replace(/[._-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase();
      if (acronymMap[lower]) return acronymMap[lower];
      return lower[0]?.toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function prettifyStatus(value?: string | null) {
  if (!value) return "-";
  return String(value)
    .split(/[._-]+/)
    .map((part) => labelMap[part.toLowerCase()] || titleCase(part))
    .join(" ");
}

export function prettifyAuditAction(value?: string | null) {
  if (!value) return "-";
  return String(value)
    .split(/[._-]+/)
    .map((part) => titleCase(part))
    .join(" ");
}

export function prettifyResourceLabel(value?: string | null) {
  if (!value) return "-";
  return String(value)
    .split(/[._-]+/)
    .map((part) => titleCase(part))
    .join(" ");
}

export function prettifyFieldLabel(value: string) {
  return titleCase(
    value
      .replace(/created_at/i, "created at")
      .replace(/updated_at/i, "updated at")
      .replace(/last_login_at/i, "last login at")
      .replace(/resource_id/i, "resource id")
      .replace(/resource_type/i, "resource type")
      .replace(/user_agent/i, "user agent")
      .replace(/ip_address/i, "ip address"),
  );
}

export function stringifyValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
