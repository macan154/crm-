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

Вход после сида:

- руководитель: `admin@sgups.local` / `admin1234`
- член центра: `member@sgups.local` / `member1234`
- смотрящий: `viewer@sgups.local` / `viewer1234`

Часовой пояс: `Asia/Novosibirsk`. Тема тёмная. Интерфейс — Onest (временная замена Cygre). Заголовки — Days One с fallback на Onest для кириллицы. Свои файлы Cygre кладите в `public/fonts/`.

## Облако

Neon (`DATABASE_URL`), Vercel (деплой, Blob, Cron), Google / Яндекс OAuth, Telegram BotFather, VK токен группы, Resend. Секреты только в env.

После первого деплоя укажите прод-домен в OAuth и BotFather.
