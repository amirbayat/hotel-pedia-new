# پلن پیاده‌سازی صفحه لیستینگ هتل‌ها

منبع طراحی: Figma → `Hotelpedia`, node `221-4117` ("Listing")، به‌علاوه اسکرین‌شات منوی پروفایل.
منبع داده: `GET https://panel.hotelpedia.ir/api/v1/hotel-search`

این سند فقط **پلن** است، هنوز چیزی پیاده‌سازی نشده.

---

## ۱. وضعیت فعلی کدبیس (قبل از شروع)

- **React Query / هیچ data-fetching library‌ای نصب نیست.** `src/api/destinations.ts` و `src/api/home.ts` و `src/api/auth.ts` همه با `fetch` خام + `useEffect`/`AbortController` دستی نوشته شده‌اند (الگو: async fn می‌گیره `AbortSignal`، در صورت `!response.ok` throw می‌کنه، snake_case سرور رو دستی به camelCase مپ می‌کنه).
- **روتر نصب نیست.** `App.tsx` فقط `<Home />` رو رندر می‌کنه؛ هیچ `react-router` یا مسیر `/hotels` وجود نداره.
- کامپوننت‌های آماده‌ی قابل استفاده مجدد: `SearchCard`, `HotelCard` (نسخه‌ی عمودی، برای Home)، `DestinationSearchField`, `PassengersField`, `DateRangeCalendar`, `Header`, `Footer`, `HotelListSection`.
- هیچ کامپوننت pagination / filter / sort آماده‌ای در `src/components` وجود نداره.
- هیچ `ProfileMenu`/`AccountMenu`ای وجود نداره؛ `Header` فعلاً فقط دکمه‌ی «ورود - ثبت‌نام» داره.

نتیجه: این کار هم یک صفحه‌ی جدید می‌سازه، هم دو زیرساخت جدید (react-query, router) به پروژه اضافه می‌کنه.

---

## ۲. زیرساخت داده

### ۲.۱ نصب و ست‌آپ React Query
- `yarn add @tanstack/react-query`
- یک `QueryClientProvider` در `main.tsx` دور `<App />` اضافه بشه.

### ۲.۲ `src/api/hotelSearch.ts` (جدید)
مطابق الگوی `destinations.ts`/`home.ts`:
```ts
searchHotels(params: HotelSearchParams, signal?: AbortSignal): Promise<HotelSearchResult>
```
- پارامترها: `city` (city_slug), `check_in`, `check_out`, `sort_by` (`default | lowest_price | highest_price | highest_rating | highest_discount`), `page`.
- پاسخ سرور snake_case → مپ به camelCase (`room_fee` → `roomFee`, `min_sell_price` → `minSellPrice`, ...) طبق کانوانسیون فعلی.
- مدیریت هتل‌های `is_available: false` (بدون قیمت، یعنی «تکمیل ظرفیت» — دقیقاً چهارمین کارت در اسکرین‌شات).

### ۲.۳ هوک `useHotelSearch`
- `useQuery` با `queryKey: ['hotel-search', params]`.
- `placeholderData: keepPreviousData` برای اینکه هنگام تعویض صفحه/سورت/فیلتر، لیست قبلی محو نشه (فقط overlay لودینگ).

### ۲.۴ مهاجرت API‌های موجود به React Query
کاربر صریحاً خواسته: اگه جای دیگه‌ای هم fetch دستی داریم و از react-query استفاده نکردیم، عوض بشه. کاندیدها:
- `Home.tsx` (بخش‌های `useEffect`/`AbortController` برای هتل‌های هر شهر)
- `DestinationSearchField.tsx` (autocomplete debounce شده روی `searchDestinations`)
- `AuthModal.tsx` (login/register/otp روی `src/api/auth.ts`) → این‌ها بیشتر mutation هستن، پس `useMutation` مناسب‌تره تا `useQuery`.

این مهاجرت رو می‌شه به‌عنوان یک فاز جدا (بعد از تکمیل لیستینگ) هم انجام داد؛ پایین در فازبندی مشخص شده.

### ۲.۵ روتینگ + سینک با URL
- چون روتر نصب نیست، باید تصمیم گرفته بشه: `react-router-dom` اضافه بشه یا صفحه‌ی لیستینگ به‌صورت state-based (بدون URL واقعی) پیاده بشه.
- پیشنهاد: `react-router-dom` + مسیر `/hotels`، و پارامترهای جستجو/فیلتر/سورت/صفحه در query string (`?city=...&check_in=...&sort_by=...&page=...`) نگه داشته بشن تا back/forward مرورگر و اشتراک‌گذاری لینک درست کار کنه.

---

## ۳. بخش‌های UI

### ۳.۱ هدر چسبان جستجو (Sticky Search Header)
از طراحی: یک ردیف ۸۰px شامل لوگو/دکمه‌ی برگشت، نسخه‌ی فشرده‌ی `SearchCard` (مقصد + تاریخ + مسافر به‌صورت سه dropdown/pill کنار هم به‌جای فرم بزرگ روی صفحه‌ی اصلی)، و آیکون پروفایل سمت دیگر.
- به‌جای ساخت از صفر، `DestinationSearchField` / `DateRangeCalendar` / `PassengersField` رو در یک variant فشرده‌تر (کامپکت، داخل هدر) استفاده کنیم — نه یک پیاده‌سازی موازی.
- نیاز به state جدید: تغییر هر کدوم از این سه فیلد باید هم‌زمان با تغییر URL query یک refetch لیست هتل بزنه.

### ۳.۲ کارت افقی هتل — `HotelListCard` (کامپوننت جدید)
جدا از `HotelCard` عمودی فعلی (که برای Home هست). ساختار افقی (راست‌به‌چپ):
- عکس هتل (سمت چپ کارت در RTL)
- ستون وسط: نام هتل، ستاره + امتیاز کاربران (badge آبی + برچسب «عالی» + تعداد نفر)، سه تگ (badge خاکستری)، آدرس با آیکون location
- خط جداکننده‌ی عمودی
- ستون سمت راست: آیکون علاقه‌مندی (heart)، «۲ شب» + «۲ بزرگسال - ۱ اتاق»، بلوک قیمت (درصد تخفیف قرمز + قیمت خط‌خورده + قیمت نهایی)، دکمه‌ی «مشاهده و رزرو»
- **حالت "تکمیل ظرفیت"**: وقتی `is_available: false` — به‌جای بلوک قیمت و دکمه، متن قرمز «تکمیل ظرفیت» + دکمه‌ی outline «مشاهده جزئیات» (چهارمین کارت در اسکرین‌شات).
- props باید مستقیماً از خروجی `useHotelSearch` (بعد از map) پر بشه؛ چیزی مثل تعداد شب/تعداد نفر از پارامترهای جستجوی جاری (نه از پاسخ API) میاد.

### ۳.۳ نوار سورت + شمارش نتایج
یک ردیف بالای لیست: «۵۰ هتل و اقامتگاه در تهران»، ۴ pill سورت («پرستاره‌ترین»، «گران‌ترین»، «ارزان‌ترین»، «پیشنهادی» - پیش‌فرض انتخاب‌شده)، لیبل «مرتب‌سازی:» + آیکون، و سمت دیگه دکمه‌ی «حذف فیلتر» + دکمه‌ی «فیلترها» (برای toggle کردن سایدبار/drawer فیلتر، احتمالاً برای موبایل یا collapse).
- ⚠️ Gap: در فیگما ۴ pill سورت داریم (پرستاره‌ترین/گران‌ترین/ارزان‌ترین/پیشنهادی) ولی enum بک‌اند ۵ مقدار داره (`default, lowest_price, highest_price, highest_rating, highest_discount`). «پرستاره‌ترین» (بیشترین ستاره) روی هیچ‌کدوم از این enum ها مپ نمی‌شه — باید با بک‌اند/محصول چک بشه که آیا `highest_rating` منظورش امتیاز کاربرهاست یا تعداد ستاره‌ی هتل، و «بیشترین تخفیف» (`highest_discount`) کجای UI باید باشه (شاید توی dropdown «مرتب‌سازی» با آیکون که pill جدا نداره).

### ۳.۴ سایدبار فیلتر — `FilterSidebar` (کامپوننت جدید)
۴ باکس آکاردئونی جمع‌وجورشونده (هرکدوم collapsible با یک chevron):
1. **جستجوی نام هتل** — یک `Input` با آیکون سرچ.
2. **تخفیف‌دارها** — یک `Switch`/toggle: «فقط هتل‌های دارای تخفیف».
3. **ستاره هتل** — ۵ ردیف چک‌باکس (۱ تا ۵ ستاره)، هرکدوم با استارهای طلایی + چک‌باکس سمت دیگه (چندانتخابی).
4. **محدوده قیمت** — دو `Input` عددی («از قیمت»/«تا قیمت» به ریال) + یک دو-دستگیره range slider زیرش.

- ✅ تصمیم گرفته شد: فیلترها فعلاً فقط در **URL query params** صفحه نگه داشته بشن (مثلاً `?stars=4,5&min_price=...&max_price=...&discounted_only=1&name=...`) — یعنی UI و state-sync الان ساخته بشه، ولی چون API فعلی این پارامترها رو پشتیبانی نمی‌کنه (فقط `city, check_in, check_out, sort_by, page` رو می‌شناسه)، این پارامترها فعلاً به `searchHotels` پاس داده نمی‌شن / روی نتیجه اثر نمی‌ذارن. بعداً که پارامترهای متناظر (`stars[]`, `min_price`, `max_price`, `discounted_only`, `name`) به API اضافه بشه، فقط کافیه در `hotelSearch.ts` این‌ها رو به query string واقعی وصل کنیم — نیازی به تغییر ساختار URL یا کامپوننت‌ها نیست.
- Switch component آماده نداریم (`Input`/`OtpInput` داریم ولی toggle switch نه) — باید یک `Switch` پایه ساخته بشه یا اگه یه‌جای دیگه از پروژه (Faq/AdvantageBoxes که تغییر کردن اخیراً) توگل مشابه داره چک بشه.

### ۳.۵ منوی پروفایل کاربر — `AccountMenu`/`ProfileMenu` (کامپوننت جدید)
از اسکرین‌شات دوم (Profile menu.pdf):
- تریگر: آیکون person در هدر (نسخه‌ی لاگین‌شده — چیزی که `Header.tsx` فعلاً نداره، چون فعلاً فقط دکمه‌ی ورود/ثبت‌نام رو می‌شناسه).
- پنل باز شده شامل: نام کاربر + شماره موبایل، موجودی کیف پول («۲۱,۰۰۰,۰۰۰ تومان»)، و لیست آیتم‌ها هرکدوم با آیکون + لیبل + chevron: «حساب کاربری»، «کیف پول»، «واچرهای من» (این یکی active/highlighted بود)، «لیست مسافران»، «لیست علاقه‌مندی‌ها»، «خروج».
- ✅ تایید شد: آیتم آخر «خروج» (logout) هست — قبلاً به‌خاطر یکسان بودن متن استخراج‌شده از PDF مبهم بود.
- همه‌ی آیکون‌های لازم (`IconPerson`/`IconWallet`/`IconFavorits`/`IconLogout`) از قبل در `src/components/icons` موجودن؛ فقط «لیست مسافران» ممکنه آیکون اختصاصی نیاز داشته باشه (شاید `IconPeople` قابل استفاده باشه).

### ۳.۶ Pagination
- در فریم فیگمای دریافت‌شده، pagination دیده نشد (ارتفاع فریم fit شده روی ۴ کارت اول). ✅ تصمیم گرفته شد: به‌جای صبر برای طراحی دقیق، یک pagination عددی معمولی («‹ ۱ ۲ ۳ ۴ ›») ته صفحه (زیر لیست کارت‌ها) ساخته بشه، متصل به `page`/`total_pages` پاسخ API (چون `total_pages: 4` رو سرور می‌فرسته) و سینک با `page` توی URL query.

### ۳.۷ Loading / Empty / Error
- Loading: skeleton برای کارت‌های افقی (یا فقط dim‌کردن لیست فعلی وقتی `isFetching` هست، به‌خصوص موقع تعویض صفحه/فیلتر/سورت با `keepPreviousData`).
- Empty: پیام «هتلی یافت نشد» وقتی `hotels.length === 0`.
- Error: پیام خطا + دکمه‌ی تلاش مجدد (react-query `refetch`).

---

## ۴. آیکون‌های جدید مورد نیاز
اکثر آیکون‌ها از قبل موجودن (`IconSearch`, `IconStar`, `IconFavorits`, `IconWallet`, `IconLogout`, `IconPerson`, `IconLocationPin`, `IconArrowDown`, `IconClose`). چیزهایی که موجود نیستن و باید از فریم Figma «Single color icon 24px» export بشن:
- آیکون فیلتر (funnel) برای دکمه‌ی «فیلترها»
- آیکون سطل زباله برای «حذف فیلتر»
- آیکون sort/مرتب‌سازی (فلش دوطرفه‌ی بالا/پایین کنار «مرتب‌سازی:»)

---

## ۵. فازبندی پیشنهادی

1. **زیرساخت**: نصب `@tanstack/react-query` + `react-router-dom`، `QueryClientProvider`، مسیر `/hotels`، `src/api/hotelSearch.ts`، `useHotelSearch`.
2. **لیست پایه**: نوار سورت (بدون منطق فیلتر پیچیده)، `HotelListCard` (هر دو حالت available/sold-out)، pagination.
3. **هدر چسبان جستجو** (کامپکت‌سازی `SearchCard` موجود برای بالای صفحه‌ی لیستینگ).
4. **فیلترها** — UI کامل + سینک state با URL query params (بخش ۳.۴)، بدون اثر واقعی روی نتیجه‌ی API فعلاً (منتظر پارامترهای بک‌اند).
5. **منوی پروفایل** (بخش ۳.۵ — آیتم آخر = خروج، تایید شد).
6. **مهاجرت API‌های قدیمی به react-query** (`Home.tsx`, `DestinationSearchField`, `AuthModal`) — فاز جدا، بعد از پایدار شدن لیستینگ.

---

## ۶. سوالات باز (نیاز به پاسخ قبل/حین پیاده‌سازی)
- مپینگ دقیق pill سورت «پرستاره‌ترین» و مقدار `highest_discount` enum به کدوم UI element می‌ره؟ — فعلاً نامشخص؛ تا مشخص شدن، `sort_by` رو فقط برای سه‌تای مسلم (`پیشنهادی→default`, `ارزان‌ترین→lowest_price`, `گران‌ترین→highest_price`) وایر می‌کنیم و «پرستاره‌ترین» رو موقتاً بدون افکت واقعی (یا مپ حدسی به `highest_rating`، قابل تغییر بعداً) پیاده می‌کنیم.

سایر سوالات این بخش قبلاً پاسخ داده شدن:
- فیلترها → فقط در URL query params صفحه (بدون اثر روی API فعلاً؛ بعداً وصل می‌شه).
- Pagination → عددی معمولی، ته صفحه.
- آیتم آخر منوی پروفایل → «خروج».
