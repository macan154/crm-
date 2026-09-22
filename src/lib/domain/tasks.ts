export type TaskStage =
  | "TERMS"
  | "MATERIALS"
  | "GIFT_COLLECTED"
  | "POST_PUBLISHED"
  | "REPORT_SENT";

export const TASK_CHAIN: { stage: TaskStage; title: string; sortOrder: number }[] = [
  { stage: "TERMS", title: "Обсуждение условий", sortOrder: 0 },
  { stage: "MATERIALS", title: "Согласование материалов", sortOrder: 1 },
  { stage: "GIFT_COLLECTED", title: "Подарок забран", sortOrder: 2 },
  { stage: "POST_PUBLISHED", title: "Пост выставлен", sortOrder: 3 },
  { stage: "REPORT_SENT", title: "Отчёт о мероприятии отправлен", sortOrder: 4 },
];

export function taskProgress(tasks: { done: boolean }[]) {
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.done).length;
  return Math.round((done / tasks.length) * 100);
}
