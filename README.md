# Базар CRM

CRM-система для магазина стройматериалов на рынке Қарағанды. Управление товарами, клиентами и продажами.

**Стек:** Next.js 16 (App Router) · TypeScript · Prisma 7 · SQLite/Turso · shadcn/ui · Tailwind v4 · Recharts

## Что умеет

- **Дашборд** — выручка за 14 дней, топ-5 товаров, последние продажи, склад
- **Продажи** — оформление с несколькими позициями, автосписание со склада
- **Клиенты** — база покупателей с поиском и фильтром по типу (розница / опт / подрядчики)
- **Товары** — склад с категориями и поиском, предупреждения о низком остатке
- **Авторизация** — защита паролем (один пользователь, без регистрации)

## Запуск локально

```bash
git clone https://github.com/tamilakk/market-crm
cd market-crm
npm install

cp .env.example .env
# Задать AUTH_USERNAME и AUTH_PASSWORD в .env

npx prisma migrate dev
npm run db:seed   # демо-данные (12 товаров, 7 клиентов, 21 продажа)
npm run dev
```

Открыть http://localhost:3000 · логин из `.env`

## Деплой на Vercel + Turso

### 1. Создать базу в Turso (бесплатно)

```bash
npm install -g @tursodatabase/turso-cli
turso auth login
turso db create market-crm
turso db show market-crm          # скопировать URL (libsql://...)
turso db tokens create market-crm # скопировать токен
```

### 2. Применить миграции к Turso

Временно изменить `.env`:
```
DATABASE_URL="libsql://your-db.turso.io"
TURSO_AUTH_TOKEN="your-token"
```
```bash
npx prisma migrate deploy
npm run db:seed
```

### 3. Деплой на Vercel

```bash
npm install -g vercel
vercel --prod
```

Добавить переменные в Vercel → Project → Settings → Environment Variables:

| Переменная | Значение |
|---|---|
| `DATABASE_URL` | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | токен из шага 1 |
| `AUTH_SECRET` | результат `openssl rand -hex 32` |
| `AUTH_USERNAME` | логин |
| `AUTH_PASSWORD` | пароль |

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | Запуск в режиме разработки |
| `npm run build` | Сборка для продакшн |
| `npm run db:seed` | Заполнить базу демо-данными |
| `npm run db:migrate` | Применить миграции Prisma |
| `npm run db:studio` | Открыть Prisma Studio |
