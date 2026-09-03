# فلوی موک (بدون API واقعی) — از هوم‌پیج تا نتیجه‌ی پرداخت

فرض این سند: **هیچ بخشی از اپ به `panel.hotelpedia.ir` واقعی وصل نیست** — همه‌چیز (هوم‌پیج،
جستجوی مقصد، لیست هتل‌ها، جزئیات هتل، مسافران، تایید/پرداخت، درگاه، callback، نتیجه) باید موک
باشه تا کل فلو قابل دمو باشه، بدون نیاز به بک‌اند واقعی.

این سند در دو مرحله نوشته شده — بخش «از جزئیات هتل به بعد» اول موک شد، و بعداً «هوم‌پیج/جستجو/لیست
هتل‌ها» (بخش پایین سند، «مرحله‌ی دوم») بهش اضافه شد.

## Figma — بررسی این جلسه (یک‌بار، همه‌ی لینک‌های داده‌شده چک شد)

از ۱۰ لینکی که داده شد، ۶ تاش (`683:12399`, `703:16885`, `717:9729`, `789:25118`, `718:10139`,
`720:10551`) دقیقاً همون‌هایی‌ان که قبلاً توی `docs/hotel-booking-plan.md` مستند و پیاده‌سازی
شدن — چیز جدیدی نداشتن.

۴ لینک باقی‌مونده (`681:10208`, `759:18013`, `788:20918`, `788:22962`) با `get_design_context`
چک شدن و معلوم شد **صفحه‌ی جدیدی نیستن**، بلکه منبع طراحیِ همون کامپوننت‌هایی‌ان که از قبل توی
پروژه پیاده‌سازی شدن:

| node-id | چی بود | معادل کد فعلی |
|---|---|---|
| `681:10208` | فریم کامل «Hotel detail» (۱۴۴۰×۶۰۵۶) | `src/pages/HotelDetail` |
| `759:18013` | «room detail» — تب گالری تصاویر (چندتا `Rectangle` عکس) | `RoomDetailsModal` تب `gallery` |
| `788:20918` | «room detail» — تب تقویم (شامل کامپوننت `Calendar`) | `RoomDetailsModal` تب `calendar` |
| `788:22962` | «room detail» — تب امکانات (گرید ۲ستونه‌ی ردیف‌ها) | `RoomDetailsModal` تب `amenities` |

یعنی UI جدیدی برای «صفحه‌ی درگاه» توی فیگما وجود نداره (طبیعیه — درگاه بانک واقعی طراحی ما
نیست). پس صفحه‌ی درگاه/callback رو خودمون به‌عنوان یه شبیه‌ساز داخلی (mock gateway) با استایل
هماهنگ با دیزاین‌سیستم فعلی پروژه (رنگ‌ها/فونت/`Button` موجود) ساختیم، نه از روی فیگما.

## چی موک شد

مطابق قرارداد پروژه، **امضای تابع‌ها و تایپ‌های خروجی عوض نشدن** — فقط بدنه‌ی توابع `fetch*` که
قبلاً به `panel.hotelpedia.ir` درخواست می‌زدن، با دیتای موک (با یه تأخیر مصنوعی برای حس واقعی)
جایگزین شدن. کد واقعی fetch حذف نشده، فقط دیگه صدا زده نمی‌شه — وقتی بک‌اند آماده شد برگردوندنش
یک تغییر کوچیکه.

- `src/api/hotelDetail.ts` → `fetchHotelDetail` یک هتل ثابت با ۳ نوع اتاق و تقویم ۱ساله برمی‌گردونه.
- `src/api/hotelCalendars.ts` → `fetchHotelCalendars` قیمت/موجودی هرروزه رو با یه فرمول
  شبه‌تصادفیِ deterministic (بر اساس تاریخ+roomId) می‌سازه، نه `Math.random()` خام — تا رفرش/ری‌رندر
  همون قیمت‌ها رو نشون بده و تیترهای قیمت (`priceTiers`) بی‌ثبات نپرن.
- `src/api/hotelSimilar.ts` → `fetchSimilarHotels` ۴ هتل مشابه‌ی ثابت برمی‌گردونه.
- `src/api/hotelOrders.ts` → `initHotelOrder`/`payHotelOrder` واقعی صدا زده نمی‌شن؛ `payHotelOrder`
  به‌جای آدرس بانک واقعی، به مسیر داخلی `/payment/gateway` اشاره می‌کنه (بخش بعد).

## صفحه‌ی درگاه (mock) + callback

- **`src/pages/PaymentGateway`** (روت `/payment/gateway`) — یه صفحه‌ی ساده که خودش رو به‌وضوح
  «نسخه‌ی آزمایشی درگاه پرداخت» معرفی می‌کنه (چون واقعی نیست و نباید کاربر رو گمراه کنه)، مبلغ و
  شناسه‌ی سفارش رو از query params (`order_id`, `amount`, `return_url`) می‌خونه، و دو دکمه داره:
  «پرداخت موفق» و «پرداخت ناموفق». هرکدوم کاربر رو با `navigate()` به همون `return_url` (که
  `payHotelOrder` ساخته: `/hotels/{slug}/book/result`) به‌همراه `status`/`order_id`/`tracking_id`
  در query می‌فرسته — دقیقاً همون قراردادی که `BookingResult` از قبل پیاده‌سازی کرده بود
  (چون از اول قرار بود این صفحه از query param بخونه، نه route state، برای شبیه‌سازی ریدایرکت
  واقعی بانک).
- چون درگاه الان داخل همین اپه (نه یه دامنه‌ی خارجی)، به‌جای تکنیک فرم مخفی+`form.submit()`
  (`redirectToPaymentGateway`، که برای ریدایرکت واقعی به یه دامنه‌ی دیگه لازمه) از `navigate()`ی
  خود react-router استفاده شده — ساده‌تره و روی هاست استاتیک بدون تنظیم SPA-fallback هم به مشکل
  نمی‌خوره. تابع `redirectToPaymentGateway` دست‌نخورده توی `hotelOrders.ts` باقی مونده برای وقتی
  بک‌اند/بانک واقعی وصل شد.

## مرحله‌ی دوم — هوم‌پیج، جستجوی مقصد، لیست هتل‌ها

همون قرارداد بالا (امضای تابع‌ها ثابت، بدنه‌ی `fetch*` با موک جایگزین شده، fetch واقعی به‌عنوان
`...FromApi` کنار همون تابع نگه داشته شده) برای سه فایل زیر هم تکرار شد:

- **`src/api/mockCityData.ts`** (جدید) — دیتاست مشترک ۶ شهر (تهران، مشهد، شیراز، اصفهان، کیش،
  تبریز) و ۶ هتل به ازای هر شهر (۳۶ هتل جمعاً، هرکدوم با `slug`/آدرس/قیمت پایه‌ی ثابت)، به‌علاوه
  یک `seededRandom` مشترک — تا هتل/شهری که در جستجوی مقصد انتخاب می‌شه، دقیقاً همون چیزیه که در
  صفحه‌ی لیست هتل‌ها یا سکشن‌های هوم‌پیج نشون داده می‌شه.
- **`src/api/home.ts`** → `fetchHome` (شهرهای محبوب + FAQ + متن‌های SEO)، `fetchCarousel`
  (اسلایدهای پروموشن)، `fetchCitiesHotels` (سکشن «محبوب‌ترین هتل‌های X») — هرسه از
  `mockCityData.ts` می‌خونن؛ قیمت/تخفیف هرکدوم با `seededRandom` (نه `Math.random()` خام) ساخته
  می‌شه تا رفرش/ری‌رندر قیمت رو عوض نکنه.
- **`src/api/destinations.ts`** → `searchDestinations` روی نام شهرها/هتل‌های موک، substring-match
  ساده انجام می‌ده (نه fetch به autocomplete واقعی).
- **`src/api/hotelSearch.ts`** → `searchHotels` هتل‌های همون شهر رو از `mockCityData.ts` می‌گیره،
  طبق `sortBy` مرتب و صفحه‌بندی می‌کنه (`page_size = 4`، پس هر شهر با ۶ هتل موک، ۲ صفحه داره — برای
  اینکه `Pagination` هم قابل تست باشه).

⚠️ توی همه‌ی این‌ها `city` که به‌عنوان مقصد رد و بدل می‌شه، **نام فارسی شهره** (مثلاً `"تهران"`)، نه
یه اسلاگ لاتین — همون قراردادی که از قبل توی `DEFAULT_CITY_SLUG`/`DEFAULT_CITY` (در
`SearchCard.tsx`/`HotelListing.tsx`) و کامنت `HotelSearchParams.city` بود؛ `mockCityData.ts` هم
دقیقاً همینو رعایت می‌کنه.

**`src/api/auth.ts`** هم موک شد:

- `sendPassengerOtp`/`sendBusinessOtp` — هیچ پیامکی واقعاً ارسال نمی‌شه؛ فقط یه تأخیر مصنوعی و
  پیام موفقیت برمی‌گردونن.
- `verifyPassengerOtp`/`verifyBusinessOtp` — هر کد ۶رقمی (که `AuthModal` از قبل اعتبارسنجی
  می‌کنه) پذیرفته می‌شه و یه توکن ساختگی (`mock-passenger-token-{phone}` / `mock-business-token-{code}`) برمی‌گردونه؛ سرور واقعی‌ای پشتش نیست.
- `panelLoginPassenger`/`panelLoginBusiness` — به یه no-op تبدیل شدن. نسخه‌ی واقعی‌شون (که با یه
  iframe مخفی یه فرم به `panel.hotelpedia.ir` POST می‌کنه تا کوکی سشن ست بشه) نگه داشته شده ولی
  دیگه صدا زده نمی‌شه، چون الان بدون بک‌اند واقعی، سشنی هم برای ست‌کردن وجود نداره. وضعیت لاگین‌بودن
  کاربر توی اپ کاملاً از `AuthContext`/`localStorage` میاد (کلید `hotelpedia:auth-user`)، نه این
  کوکی.

## چیزهایی که موقع اتصال API واقعی باید برگردن

1. بدنه‌ی `fetchHome`/`fetchCarousel`/`fetchCitiesHotels`/`searchDestinations`/`searchHotels`/
   `fetchHotelDetail`/`fetchHotelCalendars`/`fetchSimilarHotels`/`initHotelOrder`/`payHotelOrder`/
   `sendPassengerOtp`/`verifyPassengerOtp`/`sendBusinessOtp`/`verifyBusinessOtp`/`panelLoginPassenger`/
   `panelLoginBusiness` به همون fetch واقعی (که کامنت‌شون توی همین فایل‌ها مستنده، به اسم
   `...FromApi`) برگردن؛ در اون نقطه `src/api/mockCityData.ts` هم دیگه لازم نیست.
2. `payHotelOrder` باید دوباره `pay_action` واقعی بانک رو برگردونه و `BookingConfirmPay` باید
   `redirectToPaymentGateway` رو صدا بزنه، نه `navigate` مستقیم به `/payment/gateway`.
3. صفحه‌ی `/payment/gateway` و روتش از `App.tsx` حذف بشه (دیگه لازم نیست).
4. بقیه‌ی گپ‌های باز (اعتبارسنجی کد تخفیف، موجودی واقعی کیف‌پول، صدور واچر PDF واقعی، تأیید Auth) —
   همونایی‌ان که در `docs/hotel-booking-plan.md` بخش ۹ قبلاً مستند شده، عوض نشدن.
