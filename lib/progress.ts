// View-count based progress: the product spec ties a lesson's shown
// percentage/color to how many times the user has opened the video, not to
// actual watch-through percentage.
//   0 views -> not started (locked state upstream)
//   1 view  -> 0%,  red
//   2 views -> 60%, yellow
//   3 views -> 90%, green
//   4+ views -> 100%, green (capped)
export type ProgressColor = "red" | "yellow" | "green";

export function progressForViewCount(viewCount: number): {
  percent: number;
  color: ProgressColor;
} {
  if (viewCount <= 1) return { percent: 0, color: "red" };
  if (viewCount === 2) return { percent: 60, color: "yellow" };
  if (viewCount === 3) return { percent: 90, color: "green" };
  return { percent: 100, color: "green" };
}

export const LESSON_COMPLETE_VIEW_COUNT = 4;

export function isLessonComplete(viewCount: number) {
  return viewCount >= LESSON_COMPLETE_VIEW_COUNT;
}

type LessonLike = { id: string; order: number; title: string };
type ModuleLike = { id: string; order: number; title: string; lessons: LessonLike[] };

export interface LessonLockState extends LessonLike {
  viewCount: number;
  percent: number;
  color: ProgressColor;
  complete: boolean;
  unlocked: boolean;
}

export interface ModuleLockState extends Omit<ModuleLike, "lessons"> {
  lessons: LessonLockState[];
  unlocked: boolean;
  complete: boolean;
  percent: number;
}

// Sequential unlock: module N+1 requires every lesson in module N to be
// complete (view count >= 4); within a module, lesson N+1 requires lesson N
// to be complete. The first module/lesson is always unlocked.
export function buildLockState(
  modules: ModuleLike[],
  viewCountByLessonId: Map<string, number>
): ModuleLockState[] {
  let previousModuleComplete = true;

  return modules.map((module) => {
    const moduleUnlocked = previousModuleComplete;
    let previousLessonComplete = true;

    const lessons: LessonLockState[] = module.lessons.map((lesson) => {
      const viewCount = viewCountByLessonId.get(lesson.id) ?? 0;
      const { percent, color } = progressForViewCount(viewCount);
      const complete = isLessonComplete(viewCount);
      const unlocked = moduleUnlocked && previousLessonComplete;
      previousLessonComplete = complete;
      return { ...lesson, viewCount, percent, color, complete, unlocked };
    });

    const moduleComplete = lessons.every((l) => l.complete);
    const modulePercent = lessons.length
      ? Math.round(lessons.reduce((sum, l) => sum + l.percent, 0) / lessons.length)
      : 0;
    previousModuleComplete = moduleComplete;

    return { ...module, lessons, unlocked: moduleUnlocked, complete: moduleComplete, percent: modulePercent };
  });
}
