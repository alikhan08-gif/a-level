import { prisma } from "@/lib/db";
import type { SmsProvider } from "./types";

// Swap for a real provider (e.g. Eskiz.uz) once an API key is available —
// only this file needs to change, call sites stay the same.
export const mockSmsProvider: SmsProvider = {
  async send(phone, message) {
    await prisma.smsLog.create({ data: { phone, message } });
  },
};
