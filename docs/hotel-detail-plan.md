# صفحه جزئیات هتل

منبع طراحی: Figma → `Hotelpedia`, node `610-4117` ("Hotel detail")، به‌علاوه PNG/PDF ضمیمه.
منبع داده: `GET https://panel.hotelpedia.ir/api/v1/hotel-show/{hotel:slug}` (پارامتر `start_date`/`end_date`، هر دو nullable).

این سند وضعیت پیاده‌سازی فعلی، تصمیم‌ها و گپ‌های شناخته‌شده رو مستند می‌کنه — مشابه `docs/hotel-listing-plan.md`.

---

## ۱. مسیر و صفحه

- `/hotels/:slug` → `src/pages/HotelDetail`. کوئری‌های `check_in`/`check_out`/`adults`/`rooms` از URL خونده می‌شن (پیش‌فرض امروز/فردا، مثل `HotelListing`).
- `HotelDetail` با `React.lazy` در `App.tsx` لود می‌شه چون `@neshan-maps-platform/maplibre-sdk` حجیمه (~1MB) و فقط همین صفحه بهش نیاز داره.
- `HotelListCard` (صفحه لیستینگ) دکمه‌های «مشاهده و رزرو»/«مشاهده جزئیات» رو به همین مسیر وصل می‌کنه (با حفظ `check_in`/`check_out`/`adults`/`rooms` در query).

## ۲. API

`src/api/hotelDetail.ts` — الگوی همیشگی (fetch خام + map دستی snake_case→camelCase).

- `HotelRoom` — **تأیید شده** روی پاسخ واقعی (هتل «لاله»، `hotel-show`). هیچ `name`/عکس/وضعیت-استرداد per-room ای وجود نداره؛ فقط `room_kind`, `count` (تعداد اتاق موجود), `person_count`, `extra_person_count`, `food_services[]`, `amenities[]`, و `room_calendars[]` (تقریباً یک سال جلوتر، هر روز یک `{pick_date, board_price, fee, extra_person_fee}`). قیمت یک اقامت با تابع `getRoomPriceForStay(room, startDate, endDate)` از جمع زدن `fee`/`board_price` روزهای داخل بازه محاسبه می‌شه — دقیقاً همون تفکیک room-only/با-صبحانه که `hotelSearch.ts` با `roomFee`/`roomBoardPrice` داره. کارت اتاق (`HotelRooms`) دیگه ردیف «تخت»/«قابل استرداد» ساختگی نداره (داده‌ای براشون نبود)؛ به‌جاش ظرفیت + تعداد اتاق موجود + (اگه `food_services` پر بود) لیستش رو نشون می‌ده، و چون عکس per-room نیست از اولین عکس گالری هتل به‌عنوان fallback استفاده می‌کنه.
  - ⚠️ shape داخلی `food_services`/`amenities` (هر دو همیشه `[]` بودن توی نمونه‌های تست‌شده) حدسی‌ه — فرض شده مثل `amenities` سطح هتل، یه `{name}` هستن.
- `HotelRule` ({id,title,content}, برای `general_rules`/`cancellation_rules`) — هنوز **حدسی**‌ه (توی هر هتلی که تست شد `[]` بود)، مطابق الگوی `order_column/title/content` که توی `home.ts` (`faqs`/`seoTexts`) استفاده شده.
- امتیاز (`rating.total`) توی نمونه‌ها صفر بود؛ مقیاسش (۰-۵ یا ۰-۱۰) و برچسب متنی («عالی»/«خیلی خوب») هم مثل `hotelSearch.ts` توسط API داده نمی‌شه — `HotelSummary` یه heuristic ساده (`ratingLabel()`) برای این ساخته، قابل تنظیم بعداً.

### ⚠️ گپ‌های داده (بخش‌هایی که در پاسخ hotel-show اصلاً فیلد ندارن)

سه بخش از طراحی، داده‌ای توی API فعلی ندارن؛ کامپوننت‌هاشون کامل ساخته شده و آماده‌ی دیتای واقعی‌ان، ولی صفحه فعلاً آرایه‌ی خالی بهشون پاس می‌ده (به‌جای ساختن داده‌ی ساختگی):

- **اطراف هتل / مکان‌های مهم شهر** (`NearbyPlaces`) — هیچ فیلدی برای این توی پاسخ نیست.
- **هتل‌های مشابه** (بازاستفاده از `HotelListSection` با پراپ جدید `title`) — همینطور.
- **پاسخ به برخی سوالات** (`HotelFaq`) — `home.ts` یه `faqs` سراسری داره ولی مخصوص هتل نیست؛ `HotelFaq` وقتی `faqs=[]` باشه چیزی رندر نمی‌کنه.

وقتی بک‌اند این‌ها رو اضافه کرد، فقط کافیه توی `HotelDetail.tsx` دیتای واقعی رو جای آرایه‌های خالی پاس بدی.

## ۳. آیکون‌ها

`src/lib/amenityIcons.ts` — یه lookup مبتنی بر کلیدواژه (نه enum دقیق، چون `amenities` از API متن آزاده) که اسم امکانات رو به `IconXxx` مپ می‌کنه، با fallback به `IconHotel`.

### آیکون‌های placeholder (نیاز به اکسپورت واقعی از فیگما)

~۲۷ تا آیکون که توی این صفحه لازم بودن ولی توی `src/assets/hotel-pedia-icons` نبودن، به‌صورت یه دایره‌ی نقطه‌چین موقت (`src/assets/icons-raw/*.svg`) ساخته شدن تا کار روی UI بلاک نشه:

`headset-mic, dehaze, share, chair, toilet-iranian, toilet-western, android-wifi-3-bar, shower, air, elevator, fork-spoon, encrypted, tv-gen, mosque, beer-meal, ac-unit, kitchen, local-taxi, pool, nature, medical-services, shopping-cart, local-cafe, question-mark, local-parking, fitness-center, atm, local-laundry-service`

اسم فایل‌ها دقیقاً همون kebab-case ای هستن که از لایه‌ی فیگما (مثل `android_wifi_3_bar`, `fork_spoon`) درمیاد — یعنی وقتی نسخه‌ی واقعی رو با همون اسم توی `src/assets/hotel-pedia-icons` بذاری و `npm run icons` رو دوباره بزنی، خودکار جایگزین placeholder می‌شه (چون هر دو پوشه اسکن می‌شن و اولین match از `hotel-pedia-icons` برنده‌ست).

دو تا از اینا (`toilet-iranian`, `toilet-western`) توی فیگما اسم لایه‌ی مشخصی نداشتن (فقط "Union")، پس این دو تا رو باید حین اکسپورت با همین دو اسم ذخیره کنی وگرنه auto-replace کار نمی‌کنه.

## ۴. نقشه (Neshan)

- پکیج: `@neshan-maps-platform/maplibre-sdk` (رَپر رسمی maplibre-gl؛ `maplibre-gl` رو خودش به‌عنوان dependency میاره).
- کلید API و استایل پیش‌فرض توی `src/lib/neshan.ts`.
- `src/components/NeshanMap` — یه wrapper ساده‌ی React دور `maplibregl.Map` + یه Marker.
- `HotelSummary` یه نسخه‌ی کوچیک/غیرتعاملی از نقشه رو نشون می‌ده؛ کلیک روی «نمایش روی نقشه» یه مودال با نسخه‌ی تعاملی/بزرگ‌تر باز می‌کنه.

## ۵. کامپوننت‌های جدید

`HotelDetailHeader`, `HotelGallery` (گرید ۶+۱ + لایت‌باکس کامل)، `HotelSummary`, `HotelTabs`, `HotelAmenities`, `HotelRooms`, `NearbyPlaces`, `HotelRules`, `HotelFaq`. برای «هتل‌های مشابه» کامپوننت جدید نساختیم — `HotelListSection` موجود یه پراپ اختیاری `title` گرفت تا بازاستفاده بشه.

## ۶. سوالات باز

- Shape دقیق `general_rules`/`cancellation_rules` (هنوز توی هر هتل تست‌شده‌ای `[]` بود).
- Shape دقیق آیتم‌های `food_services`/`amenities` سطح اتاق (همیشه `[]` بودن).
- منبع داده‌ی «اطراف هتل»، «هتل‌های مشابه»، «سوالات متداول مخصوص این هتل».
- مقیاس و برچسب متنی امتیاز کاربران (`rating.total`).
