export function renderTemplate(body: string, vars: Record<string, string | number | null | undefined>) {
  return body.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = vars[key];
    return value == null ? "" : String(value);
  });
}

export const DEFAULT_TEMPLATES = [
  {
    name: "Первое сообщение",
    channel: "telegram",
    body: "Здравствуйте! Мы Центр по работе со спонсорами СГУПС. Хотим пригласить {brand} стать партнёром мероприятия «{event}».",
  },
  {
    name: "Напомнить о себе",
    channel: "telegram",
    body: "Здравствуйте, {brand}! Напоминаем о себе по мероприятию «{event}». Будем рады сотрудничеству.",
  },
  {
    name: "Благодарность",
    channel: "vk",
    body: "Спасибо, {brand}, за поддержку «{event}»! Вы крутые.",
  },
  {
    name: "Пост о партнёре",
    channel: "vk",
    body: "Партнёр «{event}»: {brand}. {product}",
  },
];
