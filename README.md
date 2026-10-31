# CRM Центра по работе со спонсорами СГУПС

Веб-CRM: воронка, мероприятия, задачи, документы, рейтинг, напоминания, Telegram-бот и постинг VK.

## Стек

Next.js 15, PostgreSQL, Prisma, Auth.js (email, Telegram, Google, Яндекс), Vercel.

## Локальный запуск

Нужны Node 20+ и PostgreSQL.

```bash
brew services start postgresql@16
createdb sgups_crm
cp .env.example .env.local
# заполните AUTH_SECRET и DATABASE_URL
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Обычная регистрация создаёт смотрящего. Учётную запись руководителя создаёт скрипт заполнения (`npm run db:seed`); пароль задаётся переменной `ADMIN_PASSWORD` в `.env.local`.

Часовой пояс: `Asia/Novosibirsk`. Тема тёмная. Интерфейс — Onest (временная замена Cygre). Заголовки — Days One с fallback на Onest для кириллицы. Свои файлы Cygre кладите в `public/fonts/`.

## Облако

Neon (`DATABASE_URL`), Vercel (деплой, Blob, Cron), Google / Яндекс OAuth, Telegram BotFather, VK токен группы, Resend. Секреты только в env.

После первого деплоя укажите прод-домен в OAuth и BotFather.
