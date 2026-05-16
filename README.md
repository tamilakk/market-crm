# Базар CRM

> Система управления продажами для магазина стройматериалов на рынке в Қарағанды

**Live demo →** https://market-crm-khaki.vercel.app &nbsp;·&nbsp; login: `admin` / `market2024`

---

## О проекте

Портфолио-проект: CRM для семейного бизнеса, торгующего обоями, ламинатом и стройматериалами на рынке. Написан с нуля как настоящее, полностью рабочее приложение — не туториал и не шаблон.

Основная задача: менеджер приходит на точку, открывает телефон/планшет, оформляет продажу за 30 секунд, видит остатки и выручку за день.

## Возможности

| Раздел | Что умеет |
|---|---|
| **Дашборд** | Выручка за 14 дней (график), топ-5 товаров за месяц, последние продажи, предупреждения о низком остатке |
| **Продажи** | Оформление с несколькими позициями, автоматическое списание со склада, заметки |
| **Клиенты** | База покупателей, поиск по имени/телефону, фильтр по типу (розница / опт / подрядчики) |
| **Товары** | Складской учёт с категориями, артикулами и единицами измерения, поиск и фильтр по категории |
| **Авторизация** | Вход по логину и паролю, защита всех маршрутов, сессия на JWT |

## Стек

**Frontend**
- [Next.js 16](https://nextjs.org) (App Router, Server Components)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com) + CSS Variables, OKLCH-цвета
- [shadcn/ui](https://ui.shadcn.com) на базе @base-ui/react
- [Recharts](https://recharts.org) — графики выручки и топ-товаров
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) — валидация форм

**Backend**
- [Prisma 7](https://www.prisma.io) с WASM engine + LibSQL Driver Adapter
- [Turso](https://turso.tech) (LibSQL / SQLite) — база данных
- [Auth.js v5](https://authjs.dev) (NextAuth) — аутентификация, Credentials provider

**Deploy**
- [Vercel](https://vercel.com) — хостинг
- [Turso](https://turso.tech) — serverless SQLite в облаке

## Скриншоты

> Тёмная тема с оранжевыми акцентами, адаптирована под планшет и десктоп

![Dashboard](https://github.com/user-attachments/assets/placeholder-dashboard)

## Архитектурные решения

**Server Components по умолчанию** — все страницы-списки и дашборд рендерятся на сервере, данные приходят уже готовые. `"use client"` только там, где нужна интерактивность (таблицы с фильтрами, формы).

**Prisma 7 + LibSQL** — Prisma 7 перешла на WASM-движок и требует Driver Adapter. Вместо postgres выбран LibSQL (Turso): это SQLite-совместимый движок с репликацией, идеально для небольших приложений. Локально — файл `dev.db`, в продакшне — Turso.

**Транзакции при продаже** — создание продажи и списание товара со склада завёрнуты в `prisma.$transaction()`, чтобы не было рассинхрона при ошибке.

**Zod + react-hook-form** — числовые поля используют `z.number()` + `valueAsNumber: true` (не `z.coerce.number()`), иначе zodResolver теряет типы.

## Быстрый старт

```bash
git clone https://github.com/tamilakk/market-crm
cd market-crm
npm install

cp .env.example .env
# Открыть .env и задать AUTH_USERNAME, AUTH_PASSWORD

npx prisma migrate dev      # создаёт dev.db и применяет схему
npm run db:seed             # 12 товаров, 7 клиентов, 21 продажа
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000)

## Переменные окружения

```bash
# .env
DATABASE_URL="file:./dev.db"        # локально — SQLite файл
# DATABASE_URL="libsql://..."       # продакшн — Turso URL

TURSO_AUTH_TOKEN=""                 # только для Turso

AUTH_SECRET=""                      # openssl rand -hex 32
AUTH_USERNAME="admin"
AUTH_PASSWORD="your-password"
```

## Деплой (Vercel + Turso)

<details>
<summary>Пошаговая инструкция</summary>

### 1. База данных — Turso

```bash
npm install -g @tursodatabase/turso-cli
turso auth login
turso db create market-crm
turso db show market-crm --url       # → libsql://market-crm-xxx.turso.io
turso db tokens create market-crm   # → eyJ...
```

### 2. Схема и данные

Временно прописать Turso в `.env`, затем:

```bash
# Применить SQL-миграцию напрямую через Turso shell
cat prisma/migrations/*/migration.sql | turso db shell market-crm

# Заполнить демо-данными
DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="eyJ..." npm run db:seed
```

### 3. Vercel

```bash
npm install -g vercel
vercel --prod
```

Добавить в **Vercel → Project → Settings → Environment Variables**:

| Переменная | Значение |
|---|---|
| `DATABASE_URL` | `libsql://market-crm-xxx.turso.io` |
| `TURSO_AUTH_TOKEN` | токен из шага 1 |
| `AUTH_SECRET` | `openssl rand -hex 32` |
| `AUTH_USERNAME` | логин |
| `AUTH_PASSWORD` | пароль |

Передеплоить: `vercel --prod`

</details>

## Скрипты

```bash
npm run dev          # режим разработки
npm run build        # production-сборка
npm run db:seed      # заполнить базу демо-данными
npm run db:migrate   # применить миграции Prisma
npm run db:studio    # открыть Prisma Studio
```

## Структура проекта

```
src/
├── app/
│   ├── api/           # Route Handlers (REST)
│   │   ├── clients/
│   │   ├── products/
│   │   └── sales/
│   ├── clients/       # Страницы клиентов
│   ├── products/      # Страницы товаров
│   ├── sales/         # Страницы продаж
│   ├── login/         # Страница входа
│   └── page.tsx       # Дашборд
├── components/
│   ├── dashboard/     # Графики и карточки дашборда
│   ├── clients/
│   ├── products/
│   ├── sales/
│   └── ui/            # Базовые UI-компоненты (shadcn)
├── lib/
│   ├── prisma.ts      # Singleton Prisma клиента
│   ├── format.ts      # Форматирование валюты и дат
│   └── validations/   # Zod-схемы
├── auth.ts            # Auth.js конфиг
└── proxy.ts           # Защита маршрутов (Next.js 16 middleware)
```

---

Сделано с [Next.js](https://nextjs.org) · задеплоено на [Vercel](https://vercel.com)
