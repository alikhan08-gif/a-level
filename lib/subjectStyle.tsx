import type { ReactNode } from "react";

export const SUBJECT_STYLE: Record<string, { accent: string; icon: ReactNode; emoji: string }> = {
  KIMYO: {
    accent: "#3fb6a8",
    icon: <path d="M9 2v6.5L4.5 17a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L15 8.5V2M9 2h6M7 14h10" />,
    emoji: "🧪",
  },
  BIOLOGIYA: {
    accent: "#5cb85c",
    icon: <path d="M12 22c-6-2-9-7-9-12a9 9 0 0 1 9-9 9 9 0 0 1 9 9c0 5-3 10-9 12ZM12 22V6" />,
    emoji: "🧬",
  },
  MATH: {
    accent: "#c9a227",
    icon: <path d="M4 19 10 5M6 5h5M13 19h7M13 12l4-4M13 8l4 4" />,
    emoji: "📐",
  },
};

export function getSubjectStyle(subject: string) {
  return SUBJECT_STYLE[subject] ?? SUBJECT_STYLE.MATH;
}
