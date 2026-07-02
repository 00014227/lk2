# План: подключение i18next (RU / UZ / EN)

> Документ-план для интернационализации портала. Хранится в репозитории, чтобы продолжить работу позже.

## Контекст

Портал сейчас полностью на русском — весь UI-текст захардкожен (~300–350 строк в ~65 файлах). Нужна интернационализация: три языка — **русский (по умолчанию)**, **узбекский**, **английский** — с переключателем языка **слева от иконки уведомлений** в шапке дашборда. Выбор языка сохраняется между сессиями.

Согласованные решения:

- **Переводы UZ/EN — генерируем черновые** (best-effort, логистическая тематика; RU уже есть в коде и служит источником + fallback). Вычитка позже.
- **Мигрируем весь текст сразу** — не поэтапно.

Технический подход: **клиентский i18next без locale-routing** (нет `/en`, `/ru` в URL) — соответствует запросу (переключатель-контрол в шапке) и минимально инвазивно. Сервер всегда рендерит `ru`, выбранный язык применяется после монтирования — так исключаются hydration-mismatch.

## Ключевые ограничения архитектуры

- **Data-value строки** — часть русских строк это не только подписи, но и **значения данных** с бэкенда, участвующие в логике. Их НЕЛЬЗЯ заменять — только переводить отображение через lookup по русскому значению как ключу:
  - `ShipmentStatus` (union русских строк) в [status.ts](../src/widgets/shipment-table/lib/status.ts) — используется в `getStatusVariant()`, фильтрах, сравнениях.
  - Типы транспорта (`Авто`, `Железнодорожная`, `Авиа`, `Море`, `Мультимодальная`) — в `TRANSPORT_TO_TARIFF` и substring-матчинге.
  - Топики чата (`Перевозка`, `Документы`, …) — драйвят `TOPIC_COLORS` в [notification-bell.tsx](../src/features/notifications/ui/notification-bell.tsx).
- **НЕ переводим**: [city-coords.ts](../src/shared/lib/geo/city-coords.ts) (данные-справочник, не UI), коды-идентификаторы (INCOTERMS `EXW`, типы контейнеров `40'HC` и т.п.).
- **FSD**: новый сегмент `src/shared/i18n/` — валидный shared-сегмент (все слои могут импортировать shared). `src/features/language-switcher/` — валидный feature-слайс (импортирует shared, импортируется views через `index.ts`). Всё соответствует boundaries в [eslint.config.mjs](../eslint.config.mjs).

## Подход

### 1. Зависимости

```
npm install i18next@^26 react-i18next@^17
```

Только два runtime-пакета. **Без** `i18next-browser-languagedetector` — детектор читает `navigator.language` и провоцирует hydration-mismatch; персистентность делаем сами через один `localStorage`-ключ.

### 2. Новый сегмент `src/shared/i18n/`

```
src/shared/i18n/
├── config.ts              # singleton-инициализация i18next + константы языков + resources
├── i18n-provider.tsx      # "use client" провайдер: I18nextProvider + применение языка после монтирования
├── use-app-language.ts    # "use client" хук: language + setLanguage (changeLanguage + persist + <html lang>)
├── react-i18next.d.ts     # аугментация типов CustomTypeOptions → типобезопасные ключи t()
├── index.ts               # публичный API-барьер
└── locales/
    ├── ru/translation.json   # источник истины (текущие строки)
    ├── uz/translation.json   # черновой перевод
    └── en/translation.json   # черновой перевод
```

**`config.ts`** — инициализация с жёстким `lng: "ru"` (совпадает с SSR `<html lang="ru">`), `fallbackLng: "ru"`, `supportedLngs: ["ru","uz","en"]`, `defaultNS: "translation"`, `interpolation.escapeValue: false`, `react.useSuspense: false`, `returnNull: false`. Ресурсы **статически импортируются** и бандлятся (для ~300 ключей ленивая загрузка не нужна — `changeLanguage` синхронный, без flash). Идемпотентность через `if (!i18n.isInitialized)` (защита от HMR/двойного импорта). Экспорт: `SUPPORTED_LANGUAGES`, `DEFAULT_LANGUAGE`, `AppLanguage`, `default i18n`.

**`i18n-provider.tsx`** (`"use client"`) — оборачивает `<I18nextProvider i18n={i18n}>`; в `useEffect` (после гидратации) читает язык из `localStorage`, валидирует против `SUPPORTED_LANGUAGES`, при необходимости `i18n.changeLanguage(lang)` и `document.documentElement.lang = lang`. Импорт `./config` в этом клиентском модуле и запускает инициализацию на клиенте.

**Неймспейсы** — один `translation` namespace на язык, с **вложенными ключами по доменам** (`dashboard.title`, `nav.logout`, `shipment.status.*`, `shipment.transport.*`, `shipment.columns.*`, `chat.topic.*`, `chat.quick.*`, `auth.*`, `tracking.*`, `language.*`). Для data-value групп **ключ = русское значение**, значение = перевод:

```json
"shipment": {
  "status": { "В пути": "В пути" },          // ru: ключ==значение; uz/en: перевод
  "transport": { "Авто": "Авто", "Железнодорожная": "ЖД" }
}
```

**`react-i18next.d.ts`** — `declare module "react-i18next"` с `CustomTypeOptions` (`defaultNS: "translation"`, `resources: { translation: typeof ru }`), тип берётся из **ru** (гарантированно полный). Даёт автокомплит и ошибки компиляции на опечатках в ключах.

### 3. Ключ хранилища

В [storage-keys.ts](../src/shared/config/storage-keys.ts) добавить `export const APP_LANGUAGE_KEY = "transasia.portal.language.v1";` и реэкспортировать из [config/index.ts](../src/shared/config/index.ts) (по образцу существующих ключей).

### 4. Подключение провайдера

В [app-provider.tsx](../src/app/providers/app-provider.tsx) вложить `<I18nProvider>` **внутрь** существующего `<Provider store={store}>` (единая клиентская точка входа сохраняется). [layout.tsx](../app/layout.tsx) **не трогаем** — `<html lang="ru">` остаётся для SSR, язык обновляется в рантайме через `document.documentElement.lang`.

### 5. Переключатель языка

Новый слайс `src/features/language-switcher/ui/language-switcher.tsx` (`"use client"`) + `index.ts`. **Повторяет паттерн [notification-bell.tsx](../src/features/notifications/ui/notification-bell.tsx)**: `useState(open)` + `useRef` + click-outside на `mousedown`. Кнопка-триггер с иконкой `Globe` (lucide-react), теми же классами что у колокольчика (`h-9 w-9 rounded-full hover:bg-white/16`); поповер со списком `SUPPORTED_LANGUAGES` → `t("language.<lng>")`, `aria-current` на активном. Запись через хук `useAppLanguage` из `@shared/i18n` (`changeLanguage` + `localStorage.setItem(APP_LANGUAGE_KEY)` + `document.documentElement.lang`).

Вставка — в [dashboard-shell.tsx:90-91](../src/views/dashboard/ui/dashboard-shell.tsx#L90-L91), **слева** от `<NotificationBell />`:

```tsx
<div className="flex items-center gap-2 text-white">
  <LanguageSwitcher /> {/* ← слева от колокольчика */}
  <NotificationBell />
  <Button>…</Button>
</div>
```

Импорт: `import { LanguageSwitcher } from "@features/language-switcher";` (views → features через index — разрешено).

### 6. Паттерн перевода data-value строк

Значение ("В пути", "Авто", "Перевозка") **остаётся как есть** во всей логике (`getStatusVariant`, `TRANSPORT_TO_TARIFF`, `TOPIC_COLORS`, фильтры). Переводится только **отображение**:

- В **клиентских компонентах** — через хук: ``t(`shipment.status.${status}`, { defaultValue: status })`` (реактивно на смену языка).
- Каждый такой `t()` — с `defaultValue: <сырое значение>`, чтобы неожиданное значение с бэкенда рендерилось как есть, а не как «сломанный ключ».
- Пример: [table-cell-value.tsx](../src/widgets/shipment-table/ui/table-cell-value.tsx) — `{shipment.status}` → ``{t(`shipment.status.${shipment.status}`)}``. `getStatusVariant()` не меняется. `TRANSPORT_LABELS` (ЖД/Мультимодал) сворачивается в значения JSON.

### 7. Полная миграция текста (весь UI)

Три под-паттерна по типу файла:

- **Клиентские компоненты** (`"use client"`, большинство из ~65 файлов) — `const { t } = useTranslation();` и строки → `t("ключ")`. Компонент переподписывается на смену языка.
- **Plain `.ts` data-модули** (нет хуков): [options.ts](../src/features/create-shipment/lib/options.ts), [quick-questions.ts](../src/features/chat/lib/quick-questions.ts), [columns.ts](../src/widgets/shipment-table/lib/columns.ts) — **возвращать ключи, переводить на месте рендера** (напр. `columns.ts`: `label` → стабильный `key`, компонент-хедер рендерит ``t(`shipment.columns.${col.key}`)``). Логика на сырых значениях сохраняется. Escape-hatch `i18n.t(...)` из `@shared/i18n` — только внутри функций, вызываемых во время рендера (не на уровне модуля — иначе не реактивно).
- **Server-компоненты** — переводимых строк почти нет; при необходимости оставить дефолт `ru` или вынести лист в маленький клиентский компонент. Язык на сервере не читаем (нет routing/cookie — сервер всегда `ru`).

Покрытие по слоям (представительные файлы, паттерн одинаков): views (`dashboard`, `shipment-detail`, `track`, `login`, `rating`, `setup-password`), widgets (`shipment-table`, `fleet-map`, `shipment-info`, `shipment-route-map`), features (`chat`, `create-shipment`, `track-shipment`, `auth`, `rate-delivery`, `notifications`), а также `timeAgo`/aria-labels/плейсхолдеры/toast-сообщения. Ключи группируются в `translation.json` по доменам, RU заполняется извлечёнными строками, UZ/EN — черновой перевод тех же ключей.

## Файлы

**Создать:** `src/shared/i18n/{config.ts,i18n-provider.tsx,use-app-language.ts,react-i18next.d.ts,index.ts}`, `src/shared/i18n/locales/{ru,uz,en}/translation.json`, `src/features/language-switcher/{ui/language-switcher.tsx,index.ts}`.

**Изменить (ключевые):** [app-provider.tsx](../src/app/providers/app-provider.tsx), [storage-keys.ts](../src/shared/config/storage-keys.ts) + [config/index.ts](../src/shared/config/index.ts), [dashboard-shell.tsx](../src/views/dashboard/ui/dashboard-shell.tsx), [table-cell-value.tsx](../src/widgets/shipment-table/ui/table-cell-value.tsx), [notification-bell.tsx](../src/features/notifications/ui/notification-bell.tsx), [columns.ts](../src/widgets/shipment-table/lib/columns.ts), [options.ts](../src/features/create-shipment/lib/options.ts), [quick-questions.ts](../src/features/chat/lib/quick-questions.ts) + ~55 остальных компонентов с UI-текстом (тот же паттерн `useTranslation`). [package.json](../package.json) — новые зависимости.

**Не трогаем:** [layout.tsx](../app/layout.tsx) (`<html lang="ru">` для SSR), [city-coords.ts](../src/shared/lib/geo/city-coords.ts).

## Проверка (тест-фреймворка нет)

1. `npm run typecheck` — аугментация типов резолвится, все ключи `t("…")` валидны, strict проходит.
2. `npm run lint` (`npm run lint:fix` — авто-сортировка новых импортов) — FSD-boundaries и порядок импортов чистые.
3. `npm run dev` — вручную:
   - Пустой `localStorage` → дашборд на русском, **без hydration-warning** в консоли.
   - Переключатель → English: UI обновляется вживую, `<html lang>` становится `en`, ошибок нет.
   - Перезагрузка → язык сохранён, по-прежнему без hydration-warning (сервер `ru` → клиент переключается после монтирования — это ожидаемо и без варнинга).
   - Узбекский: статусы/типы транспорта/топики чата показывают перевод, а фильтрация/сортировка по этим колонкам продолжает работать (значения-каноны сохранены).
   - Битое значение в `localStorage` → fallback на `ru`.

## Порядок реализации

1. Установить зависимости.
2. Создать `src/shared/i18n/` (config, provider, hook, `react-i18next.d.ts`, `index.ts`) + три `translation.json` (RU — извлечённые строки; UZ/EN — черновой перевод).
3. Добавить `APP_LANGUAGE_KEY` в `shared/config`.
4. Подключить `I18nProvider` в `AppProvider`.
5. Собрать `features/language-switcher` и вставить в `dashboard-shell.tsx`.
6. Мигрировать компоненты по слайсам (клиентские — через `useTranslation`; data-модули — на ключи).
7. Добавить хелперы data-value и перевести места рендера на ``t(`shipment.status.${…}`)`` и т.п.
8. Прогнать typecheck → lint → dev-проверку.
