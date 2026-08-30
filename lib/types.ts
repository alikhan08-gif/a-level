export const DIRECTIONS = ["A_LEVEL", "MILLIY_SERTIFIKAT", "ATTESTATSIYA"] as const;
export type Direction = (typeof DIRECTIONS)[number];

export const DIRECTION_LABELS: Record<Direction, string> = {
  A_LEVEL: "A-Level",
  MILLIY_SERTIFIKAT: "Milliy sertifikat",
  ATTESTATSIYA: "Attestatsiya",
};

export const SUBJECTS = ["KIMYO", "BIOLOGIYA", "MATH"] as const;
export type Subject = (typeof SUBJECTS)[number];

export const SUBJECT_LABELS: Record<Subject, string> = {
  KIMYO: "Kimyo",
  BIOLOGIYA: "Biologiya",
  MATH: "Math",
};

export const ENROLLMENT_STATUSES = ["ACTIVE", "EXPELLED"] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const COHORT_STATUSES = ["OPEN", "CLOSED"] as const;
export type CohortStatus = (typeof COHORT_STATUSES)[number];

export const PAYMENT_PROVIDERS = ["click", "payme", "uzum", "paynet"] as const;
export type PaymentProviderId = (typeof PAYMENT_PROVIDERS)[number];

export const DELIVERY_METHODS = ["UZPOST", "BTS"] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  UZPOST: "UzPost",
  BTS: "BTS",
};

// UzPost's fee is charged upfront, added to the order total at checkout.
// BTS collects its fee as cash on delivery instead, so no upfront charge.
export const DELIVERY_FEES: Record<DeliveryMethod, number> = {
  UZPOST: 15000,
  BTS: 0,
};

export const ORDER_STATUSES = ["PENDING", "AWAITING_ADMIN", "CONFIRMED", "REJECTED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Boshlangan",
  AWAITING_ADMIN: "Admin tasdig'ini kutmoqda",
  CONFIRMED: "Tasdiqlangan",
  REJECTED: "Rad etilgan",
};
