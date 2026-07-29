"use client";

import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

type Question = { id: string; text: string; options: string[] };

export default function QuizCard({
  quizId,
  questions,
  locale,
}: {
  quizId: string;
  questions: Question[];
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ correctCount: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const orderedAnswers = questions.map((q) => answers[q.id]);
      const res = await fetch(`/api/quiz/${quizId}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: orderedAnswers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.bookOrder.genericError);
      setResult({ correctCount: data.correctCount, total: data.total });
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.bookOrder.genericError);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-black/10 p-5 text-center">
        <h3 className="font-bold text-brand-navy mb-1">{dict.kabinet.quizResultTitle}</h3>
        <p className="text-2xl font-bold text-brand-navy">
          {result.correctCount} / {result.total}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/10 p-5">
      <h3 className="font-bold text-brand-navy mb-4">{dict.kabinet.quizTitle}</h3>
      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
      <div className="space-y-5">
        {questions.map((q, qi) => (
          <div key={q.id}>
            <p className="text-sm font-medium text-brand-navy mb-2">
              {qi + 1}. {q.text}
            </p>
            <div className="grid gap-2">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${
                    answers[q.id] === oi ? "border-brand-navy bg-brand-navy/5" : "border-black/10"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === oi}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    className="accent-[color:var(--brand-navy)]"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={!allAnswered || loading}
        onClick={handleSubmit}
        className="mt-5 w-full rounded-full bg-brand-navy px-6 py-3 text-white font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-40"
      >
        {loading ? dict.kabinet.submitting : dict.kabinet.submitQuiz}
      </button>
    </div>
  );
}
