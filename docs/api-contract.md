# Hotelpedia public site — API contract

This document is the contract the frontend needs from the backend. The site currently runs entirely on mock data in `src/api/`. The real fetchers (`*FromApi` in the same files) are written but unused. Field names below match those parsers, so the frontend can switch from mock to live with a small rename.

Base URL: `https://panel.hotelpedia.ir`

All JSON endpoints use `Accept: application/json`. POST bodies use `Content-Type: application/json`.

## Conventions

### Response envelope

Successful JSON responses are wrapped:

```json
{
  "data": {},
  "message": "optional human-readable message"
}
```

The calendars endpoint is the exception: it returns a raw JSON array (see that section).

### Errors

Any non-2xx response should be JSON:

```json
{ "message": "Human-readable error in Persian" }
```

The frontend shows `message` to the user. If `message` is missing, it falls back to a generic status error.

### Dates

Gregorian, zero-padded `YYYY-MM-DD` (example: `2026-08-20`).

A stay is the half-open range `[start_date, end_date)`. Checkout day is not a billed night. `end_date` must be strictly after `start_date`.

### Money

Integers, in toman. No decimals, no currency string. The UI formats the number itself.

`fee` is the room-only price. `board_price` is the price including board (for example breakfast). It is not a struck-through “was” price. A promotional discount is a separate pair of fields (`original_price` / `discount_percent`), described per endpoint.

### Scores

Two scales are in use today. Keep them until the frontend is updated:

| Surface | Field | Scale |
|---|---|---|
| Hotel listing card | `score` | `0` to `1`. The UI multiplies by 10 before display. Omit the field when the hotel is unavailable. |
| Hotel detail | `rating.*` | `0` to `10`. |

### City identifier

`city` / `city_slug` is the Persian city name, not a Latin slug. Example: `تهران`. The same value is used in listing URLs (`/hotels?city=تهران`) and in autocomplete results.

### Hotel identifier

Numeric `id` is required wherever another endpoint is keyed by hotel id (similar hotels, calendars). `slug` is the public URL key (`/hotels/{slug}`).

### Auth

Public GETs need no credentials.

`POST /api/v1/hotel-orders` and `POST /api/v1/hotel-orders/pay` require a logged-in passenger or business employee. The frontend will send `credentials: 'include'` so the session cookie set by the panel login form is attached.

That cookie must be readable on a cross-origin request from the public site (CORS with a specific `Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials: true`, and a `SameSite` value that allows the cookie on that request). If cookie auth cannot work cross-origin, return the access token from OTP verify and the frontend will send `Authorization: Bearer <token>` instead. Please confirm which of the two you will support.

---

## 1. Auth — passenger (phone OTP)

Used by the login modal, tab «ورود با شماره همراه».

### `POST /api/v1/auth/otp/send`

Request:

```json
{
  "user_type": "passenger",
  "phone": "09121234567"
}
```

`phone` is `09` followed by 9 digits.

Response `200`:

```json
{ "message": "کد تایید ارسال شد." }
```

The frontend only checks that the request succeeded. It then shows a 6-digit code step and a 60-second resend cooldown. Calling this endpoint again is the resend.

### `POST /api/v1/auth/otp/verify`

Request:

```json
{
  "user_type": "passenger",
  "phone": "09121234567",
  "code": "123456"
}
```

`code` is exactly 6 digits.

Response `200`. The frontend looks for a token in this order and uses the first one it finds:

1. `access_token`
2. `token`
3. `data.access_token`
4. `data.token`

```json
{
  "data": { "access_token": "..." },
  "message": "..."
}
```

Wrong or expired code: non-2xx with `message`.

The verify response does not include the user’s display name or wallet balance. The UI currently invents both (`کاربر هتل‌پدیا`, balance `0`). See [Profile](#14-profile--requested).

### `POST /panel/passenger/auth`

Not JSON. After verify, the frontend submits a hidden HTML form:

| Field | Value |
|---|---|
| method | `POST` |
| action | `https://panel.hotelpedia.ir/panel/passenger/auth` |
| body | `application/x-www-form-urlencoded` |
| `token` | the access token from verify |

This request must set the session cookie used by the order endpoints.

---

## 2. Auth — business employee (company code OTP)

Used by the login modal, tab «ورود پرسنلی». The identifier the user types is sent as `company_code`.

### `POST /api/v1/business-employees/auth/otp/send`

```json
{ "company_code": "12345" }
```

Response: same as passenger OTP send (`message` on success).

### `POST /api/v1/business-employees/auth/otp/verify`

```json
{ "company_code": "12345", "code": "123456" }
```

Response: same token lookup as passenger verify.

### `POST /panel/business-employees/auth`

Same hidden-form login as the passenger panel login, with action `https://panel.hotelpedia.ir/panel/business-employees/auth` and field `token`.

---

## 3. Home

### `GET /api/v1/home`

No query params. Called on the home page.

Response:

```json
{
  "data": {
    "popular_cities": [
      {
        "city": { "name": "تهران", "province": "استان تهران" },
        "image": { "path": "https://cdn.example.com/cities/tehran.jpg" }
      }
    ],
    "faqs": [
      {
        "order_column": 1,
        "title": "چطور می‌توانم هتل مورد نظرم را رزرو کنم؟",
        "content": "..."
      }
    ],
    "seo_texts": [
      { "title": "رزرو آنلاین هتل با بهترین قیمت", "content": "..." }
    ]
  }
}
```

| JSON path | UI |
|---|---|
| `popular_cities[].city.name` | City label. Also used as the listing `city` query when the card is clicked. |
| `popular_cities[].city.province` | Shown under the city name. |
| `popular_cities[].image.path` | Absolute image URL. |
| `faqs[].title` / `faqs[].content` | Home FAQ accordion. `order_column` is the item id; if omitted, the frontend uses the array index. |
| `seo_texts[].title` / `seo_texts[].content` | SEO / advantage copy blocks. |

### `GET /api/v1/home/carousel`

No query params.

Response. Keys are camelCase; the frontend does not rename them:

```json
{
  "data": {
    "carousel": [
      {
        "id": 1,
        "imageUrl": "https://cdn.example.com/banners/espinas.jpg",
        "link": "/hotels/espinas-palace"
      }
    ]
  }
}
```

`link` is a path on the public site, not an external URL. Hotel banners use `/hotels/{slug}`. City banners use `/hotels?city={persian city name}`.

### `GET /api/v1/home/cities/hotels`

No query params. One group per city shown in the “popular hotels” sections.

Response. Keys are camelCase; the frontend does not rename them:

```json
{
  "data": {
    "cities": [
      {
        "id": 1,
        "city": "تهران",
        "hotels": [
          {
            "id": 101,
            "name": "هتل اسپیناس پالاس",
            "imageUrl": "https://cdn.example.com/hotels/espinas.jpg",
            "stars": 5,
            "tags": ["لوکس", "بهترین منطقه"],
            "address": "تهران، سعادت‌آباد",
            "price": 4500000,
            "discountPrice": 5400000,
            "detailsUrl": "/hotels/espinas-palace"
          }
        ]
      }
    ]
  }
}
```

`price` is the current per-night sell price. `discountPrice` is the pre-discount price. When `discountPrice` is greater than `price`, the UI strikes it through and shows a percent badge. When there is no discount, set `discountPrice` equal to `price`.

`detailsUrl` is `/hotels/{slug}`. `id` must be the same numeric hotel id used by hotel-show, similar, and calendars.

---

## 4. Destination autocomplete

### `GET /api/v1/hotel-search/autocomplete?keyword={query}`

Called while the user types in «مقصد یا هتل». Empty `keyword` is not sent; the frontend shows its own short list of popular cities in that case.

`keyword` is a raw substring (Persian). Match both cities and hotels.

Response: `data` is a flat array. City matches first, then hotel matches. Cap hotel matches (the mock returns at most 5).

```json
{
  "data": [
    {
      "type": "city",
      "id": 1,
      "label": "تهران",
      "slug": "تهران",
      "province": "استان تهران",
      "hotels_count": 120
    },
    {
      "type": "hotel",
      "id": 101,
      "label": "هتل اسپیناس پالاس",
      "slug": "espinas-palace",
      "city_name": "تهران",
      "city_slug": "تهران"
    }
  ]
}
```

Selecting a city navigates to `/hotels?city={slug}`. Selecting a hotel navigates to `/hotels/{slug}`. `city_slug` is what the listing `city` param must accept.

---

## 5. Hotel search (listing)

### `GET /api/v1/hotel-search`

Called on `/hotels`. The listing loads the next page when the user scrolls to the bottom (`page=1`, then `2`, …).

#### Query params the frontend sends today

| Param | Required | Example | Notes |
|---|---|---|---|
| `city` | yes | `تهران` | Persian city name from autocomplete `slug` / `city_slug`. |
| `sort_by` | yes | `default` | One of `default`, `lowest_price`, `highest_price`, `highest_rating`, `highest_discount`. |
| `check_in` | no | `2026-08-20` | Omitted when the user is browsing a city with no stay. The UI usually has both dates. |
| `check_out` | no | `2026-08-22` | Same as `check_in`. |
| `page` | no | `1` | 1-based. Omitted on the first request; sent from page 2 onward. |

`sort_by` behavior:

| Value | Order |
|---|---|
| `default` | Pinned hotels first (`is_pinned`), then your default ranking. |
| `lowest_price` | Ascending `min_sell_price`. |
| `highest_price` | Descending `min_sell_price`. |
| `highest_rating` | Descending star count, then descending `score`. |
| `highest_discount` | Largest `original_price - min_sell_price` first. Hotels with no discount sort last. |

Unavailable hotels (`is_available: false`) sort after available ones, regardless of `sort_by`.

#### Query params the UI already collects and the backend should accept

These filters are on the listing sidebar. The mock applies them. The live fetcher does not send them yet; it will, as soon as the API supports them.

| Param | Example | Meaning |
|---|---|---|
| `name` | `اسپیناس` | Case-sensitive substring of the hotel name (Persian). |
| `discounted_only` | `1` | Only hotels with `has_discount: true`. |
| `stars` | `4,5` | Comma-separated star values, each `1`–`5`. Match any of them. |
| `min_price` | `2000000` | Keep hotels with `min_sell_price >= min_price`. |
| `max_price` | `8000000` | Keep hotels with `min_sell_price <= max_price`. |

`adults`, `rooms`, and `children` (comma-separated ages `0`–`17`) are in the page URL but are not sent to search today. They are display-only (occupancy summary and the passenger step). Do not require them on this endpoint unless you want availability to depend on occupancy. If you do, tell us the param names and we will send them.

#### Response

```json
{
  "data": {
    "hotels": [
      {
        "id": 101,
        "name": "هتل اسپیناس پالاس",
        "slug": "espinas-palace",
        "stars": 5,
        "address": "تهران، سعادت‌آباد",
        "city_slug": "تهران",
        "room_fee": 4500000,
        "room_board_price": 5175000,
        "room_name": "اتاق دو تخته",
        "image": "https://cdn.example.com/hotels/espinas.jpg",
        "is_available": true,
        "is_pinned": false,
        "min_sell_price": 4500000,
        "score": 0.86,
        "tags": ["لوکس"],
        "has_discount": true,
        "original_price": 5400000,
        "discount_percent": 17
      }
    ],
    "total": 42,
    "page": 1,
    "page_size": 10,
    "total_pages": 5,
    "price_bounds": { "min": 1800000, "max": 12000000 }
  }
}
```

| Field | Notes |
|---|---|
| `room_fee` | Room-only price for the searched stay (or a representative nightly price when dates are absent). |
| `room_board_price` | Same stay, including board. Not a discount. |
| `min_sell_price` | Price the card shows and the price filter / sort uses. Equal to `room_fee` in the mock. |
| `room_name` | Cheapest (or representative) room kind name. |
| `image` | Absolute URL of the card image. |
| `is_available` | `false` hides the price and the score. |
| `score` | `0`–`1`. Omit when unavailable. |
| `tags` | Short Persian badges. Empty array when there are none. |
| `has_discount` | `true` only for a real promotion. |
| `original_price` | Struck-through price. Omit when `has_discount` is false. |
| `discount_percent` | Integer percent, e.g. `17` renders as `٪۱۷`. Omit when there is no discount. |
| `total` | Count after filters, before pagination. |
| `page`, `page_size`, `total_pages` | `total_pages` is at least `1` when `total` is `0`. |
| `price_bounds` | Min and max `min_sell_price` among available hotels that match every filter except `min_price` / `max_price`. Drives the price slider. When every hotel has the same price, `max` may equal `min`; the UI adds a small gap itself. |

`has_discount`, `original_price`, `discount_percent`, and `price_bounds` are required by the current UI. The older live parser does not read them yet; we will map them as soon as they are in the payload. Please include them.

---

## 6. Hotel detail

### `GET /api/v1/hotel-show/{slug}?start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}`

`slug` is the hotel slug. `start_date` and `end_date` are optional. When present, room calendars must cover every night of that stay so the UI can sum prices. The mock returns about a year of nightly rates from today, which is what the room calendar tab needs even when the query only asks for the stay.

Response `data`:

```json
{
  "id": 101,
  "slug": "espinas-palace",
  "name": "هتل اسپیناس پالاس",
  "hotel_kind": "هتل",
  "city_name": "تهران",
  "address": "تهران، سعادت‌آباد",
  "location": { "lat": "35.7219", "lng": "51.3347" },
  "stars": 5,
  "check_in": "14:00",
  "check_out": "12:00",
  "description": "...",
  "images": [
    { "path": "https://cdn.example.com/hotels/espinas-1.jpg", "order_column": 0 }
  ],
  "amenities": [{ "name": "اینترنت بی‌سیم رایگان" }],
  "general_rules": [
    { "order_column": 1, "title": "ورود و خروج", "content": "ساعت ورود از ۱۴:۰۰ و خروج تا ۱۲:۰۰ ظهر است." }
  ],
  "cancellation_rules": [
    { "order_column": 1, "title": "کنسلی رایگان", "content": "تا ۴۸ ساعت قبل از ورود، کنسلی بدون جریمه امکان‌پذیر است." }
  ],
  "rooms": [
    {
      "id": 217,
      "room_kind": "اتاق دو تخته",
      "count": 5,
      "person_count": 2,
      "extra_person_count": 1,
      "food_services": [{ "name": "صبحانه بوفه" }],
      "amenities": [{ "name": "تلویزیون" }],
      "room_calendars": [
        {
          "id": 9001,
          "pick_date": "2026-08-20",
          "fee": 4500000,
          "board_price": 5175000,
          "extra_person_fee": 1350000
        }
      ]
    }
  ],
  "rating": {
    "total": 8.6,
    "total_count": 128,
    "cleanliness": 8.8,
    "location": 9.0,
    "service": 8.4,
    "staff": 8.6,
    "value_of_money": 8.2
  }
}
```

Notes:

- `id` must be present. Similar hotels and calendars are called with this number. Older samples omitted it; the listing currently forwards `hotel_id` as a workaround.
- `location.lat` / `location.lng` may be strings or numbers. The map reads both.
- `check_in` / `check_out` are `HH:mm` strings.
- `images` are ordered by `order_column` ascending. `path` is an absolute URL.
- Amenity `name` is free Persian text. The UI picks an icon by keyword.
- `general_rules` and `cancellation_rules` use `{ order_column, title, content }`. Empty array when there are none.
- `rooms[].id` is the `room_id` sent to hotel-orders and calendars.
- `rooms[].count` is how many rooms of that kind can be booked.
- `food_services` and `amenities` are arrays of `{ "name": "..." }`. Empty array when there are none.
- `room_calendars[].pick_date` is `YYYY-MM-DD`. One object per night. The UI sums `fee` and `board_price` over `[start_date, end_date)`.
- `rating.total` and the sub-scores are `0`–`10`. `total_count` is the review count. `0` / `0` means “no score”; the UI hides the badge.

#### Fields the detail page still has no source for

Please add these on `data` (empty array when unknown). The UI already has components and currently passes `[]`.

`faqs` — hotel-specific questions, same shape as home FAQs:

```json
"faqs": [{ "order_column": 1, "title": "...", "content": "..." }]
```

`nearby_groups` — two groups in the design (“اطراف هتل” and “مکان‌های مهم شهر”):

```json
"nearby_groups": [
  {
    "title": "اطراف هتل",
    "places": [
      { "name": "میدان ونک", "distance": "۴۰۷ متر", "icon": "local-cafe" }
    ]
  }
]
```

`distance` is a pre-formatted Persian label. `icon` is one of: `local-cafe`, `local-taxi`, `mosque`, `nature`, `medical-services`, `shopping-cart`, `atm`, `local-parking`. Unknown icons fall back to a generic hotel icon.

Optional per room, if you have them (the UI does not render them yet, but the design asked for them): `images` (same shape as hotel images) and a refund label. Do not block the rest of the payload on these.

---

## 7. Room calendars

### `GET /api/v1/hotels/{hotel_id}/calendars?start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}&wallet_id={id}`

Called when the room-details modal opens the calendar tab. `start_date` and `end_date` are required and bound the visible month range (inclusive of both ends for this endpoint — unlike stay pricing, the calendar shows the checkout day as a cell).

`wallet_id` is optional. When the user is paying with wallet and you support wallet-adjusted rates, return prices with that discount already applied. The frontend does not send it yet.

Response is a **raw array**, not wrapped in `{ data }`:

```json
[
  {
    "id": 9001,
    "hotel_id": 101,
    "room_id": 217,
    "date": "2026-08-20",
    "remained_count": 3,
    "locked_count": 0,
    "buy_price": 3600000,
    "sell_price": 4500000,
    "board_price": 5175000,
    "fee": 4500000
  }
]
```

One row per room per date in the range, for every room of the hotel. The UI filters by `room_id`. `remained_count: 0` means that night is sold out. `fee` is the room-only nightly price shown on the calendar.

---

## 8. Similar hotels

### `GET /api/v1/hotels/{hotel_id}/similar`

No query params.

```json
{
  "data": {
    "hotels": [
      {
        "id": 102,
        "name": "هتل پارسیان آزادی",
        "slug": "parsian-azadi",
        "stars": 5,
        "address": "تهران، خیابان آزادی",
        "city_slug": "تهران",
        "image": "https://cdn.example.com/hotels/parsian.jpg"
      }
    ]
  }
}
```

The detail page titles this block `هتل‌های مشابه {hotel name}`. An empty `hotels` array hides nothing by itself; the section renders empty. Four to eight hotels is what the layout expects.

---

## 9. Create order (init)

### `POST /api/v1/hotel-orders`

Auth required. Called when the user clicks «رزرو اتاق» on the hotel page, before the passenger form. This locks the room and the price and returns `order_id`. Passenger names are not known yet.

Request (minimum, which is what the frontend sends today):

```json
{
  "start_date": "2026-08-20",
  "end_date": "2026-08-22",
  "room_passengers": [
    { "room_id": 217, "room_count": 1 }
  ]
}
```

Full body:

| Field | Required | Notes |
|---|---|---|
| `start_date` | yes | `>= today`, `YYYY-MM-DD`. |
| `end_date` | yes | `> start_date`. |
| `room_passengers` | yes | At least one item. The UI books a single room kind per order. |
| `room_passengers[].room_id` | yes | Must exist. |
| `room_passengers[].room_count` | yes | Integer `>= 1`, and `<= rooms[].count` for that room on those nights. |
| `room_passengers[].passengers` | no | Omit on init. |
| `is_wallet_active` | no | Boolean. Omitted on init. |
| `bank_gateway` | no | Omitted on init. |
| `reserved_by` | no | Omitted on init. |

Response:

```json
{
  "data": { "order_id": 123456789 },
  "message": "سفارش با موفقیت ثبت شد"
}
```

The frontend keeps `order_id` in memory and sends it to pay. A sold-out or price-mismatch error must be non-2xx with `message`.

---

## 10. Pay order

### `POST /api/v1/hotel-orders/pay`

Auth required. Called when the user clicks «تایید و پرداخت».

Request:

```json
{
  "order_id": 123456789,
  "is_wallet_active": false,
  "bank_gateway": "zarinpal",
  "start_date": "2026-08-20",
  "end_date": "2026-08-22",
  "reserved_by": {
    "first_name": "علی",
    "last_name": "گیلان",
    "phone": "09121234567",
    "email": "ali@example.com"
  },
  "room_passengers": [
    {
      "room_id": 217,
      "room_count": 1,
      "passengers": [
        {
          "first_name": "علی",
          "last_name": "گیلان",
          "phone": "09121234567"
        }
      ]
    }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `order_id` | yes | From init. |
| `start_date`, `end_date` | yes | Same stay as init. |
| `reserved_by.first_name` | yes | |
| `reserved_by.last_name` | yes | |
| `reserved_by.phone` | yes | `09` + 9 digits. |
| `reserved_by.email` | no | Validated as an email only when non-empty. Send `""` or omit. |
| `room_passengers` | yes | Same room ids and counts as init. |
| `room_passengers[].passengers` | yes on pay | One passenger per room (`room_count` items). Each has `first_name`, `last_name`, `phone`. `email` is optional and usually omitted. |
| `is_wallet_active` | no | `true` when the user turns on «استفاده از موجودی کیف پول». |
| `bank_gateway` | no | `zarinpal` or `behpardakht`. |

Gateway mismatch: the UI shows سه درگاه (سامان، آپ، ملت). The API only accepts `zarinpal` and `behpardakht`, so the frontend currently sends `zarinpal` for سامان and آپ, and `behpardakht` for ملت. If you can accept `saman`, `up`, and `mellat`, say so and we will send those values instead.

The frontend does not send the amount. You compute it from the locked order. Wallet deduction happens on your side when `is_wallet_active` is true.

There is no discount-code field yet. See [Discount code](#12-discount-code--requested).

Response — a form the browser will submit to the bank:

```json
{
  "data": {
    "order_id": 123456789,
    "pay_action": "https://bank.example/pay",
    "method": "post",
    "inputs": { "refId": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }
  },
  "message": "عملیات پرداخت"
}
```

| Field | Notes |
|---|---|
| `pay_action` | Absolute URL of the bank page. |
| `method` | `post` or `get`. Default `post`. |
| `inputs` | Flat map of string values. The frontend builds `<input type="hidden" name="{key}" value="{value}">` for each entry and submits the form, which navigates the whole window away from the site. |

If the wallet covers the full amount and no bank redirect is needed, still return this shape and set `pay_action` to the public return URL described below (method `get`, inputs empty or with the success query). Tell us if you would rather return a flag such as `paid: true` instead; the frontend does not handle that yet.

---

## 11. Bank return URL

After payment, the bank (or you, server-side) must send the browser to:

```
https://{public-site}/hotels/{slug}/book/result?status={status}&order_id={order_id}&tracking_id={tracking_id}&amount={amount}
```

| Query | Required | Values |
|---|---|---|
| `status` | yes | `success` or `failed`. Anything other than `failed` is treated as success, but please send `success` explicitly. |
| `order_id` | yes | Same id from init / pay. |
| `tracking_id` | yes on success | Shown as «شناسه پیگیری سفارش». On failure it is «شناسه پیگیری پرداخت». If omitted, the UI repeats `order_id`. |
| `amount` | yes | Integer toman still due. The failure screen uses it to retry payment. |

`slug` is the hotel slug, so you need it when you build the return URL. The frontend can send `return_url` on pay if you add an optional field; it does not send one today. Please confirm whether you store the slug on the order at init time (you can resolve it from `room_id`) or want `return_url` / `slug` on the pay body.

The «دریافت واچر» button on the success screen has no endpoint yet. See [Voucher](#13-voucher--requested).

---

## 12. Discount code — requested

The confirm page has a discount-code field. The apply button is disabled because no endpoint exists. Proposed:

### `POST /api/v1/hotel-orders/{order_id}/discount`

Auth required.

```json
{ "code": "SUMMER" }
```

Response:

```json
{
  "data": {
    "code": "SUMMER",
    "discount_amount": 500000,
    "amount_due": 4000000
  }
}
```

`discount_amount` and `amount_due` are toman. Invalid code: non-2xx with `message`. Removing a code can be `DELETE` on the same path, returning the new `amount_due`.

---

## 13. Voucher — requested

Success screen button «دریافت واچر», and the account menu item «واچرهای من».

### `GET /api/v1/hotel-orders/{order_id}/voucher`

Auth required. Response `Content-Type: application/pdf` and `Content-Disposition: attachment`. `404` or a JSON error with `message` when the order is not paid or does not belong to the user.

### `GET /api/v1/me/vouchers`

Auth required. For the account menu. Proposed list:

```json
{
  "data": {
    "vouchers": [
      {
        "order_id": 123456789,
        "tracking_id": "987654",
        "hotel_name": "هتل اسپیناس پالاس",
        "slug": "espinas-palace",
        "start_date": "2026-08-20",
        "end_date": "2026-08-22",
        "status": "paid"
      }
    ]
  }
}
```

`status`: `paid` | `cancelled` | `failed`.

---

## 14. Profile — requested

OTP verify does not return a name or a wallet balance, and the account menu shows both. Proposed:

### `GET /api/v1/me`

Auth required. Call this immediately after a successful OTP verify.

```json
{
  "data": {
    "name": "علی گیلان",
    "phone": "09121234567",
    "wallet_balance": 1500000
  }
}
```

`wallet_balance` is toman. `0` disables the wallet switch on the pay page. The switch sends `is_wallet_active: true` on pay; you deduct `min(wallet_balance, order_total)` and charge the rest through `bank_gateway`.

The account menu also lists «حساب کاربری», «لیست مسافران», and «لیست علاقه‌مندی‌ها». Those screens are not built. No request/response is defined for them until the UI exists.

---

## Endpoint index

| # | Method | Path | Auth | Status |
|---|---|---|---|---|
| 1 | POST | `/api/v1/auth/otp/send` | no | Frontend parser ready |
| 2 | POST | `/api/v1/auth/otp/verify` | no | Frontend parser ready |
| 3 | POST | `/panel/passenger/auth` | token in form | Frontend ready |
| 4 | POST | `/api/v1/business-employees/auth/otp/send` | no | Frontend parser ready |
| 5 | POST | `/api/v1/business-employees/auth/otp/verify` | no | Frontend parser ready |
| 6 | POST | `/panel/business-employees/auth` | token in form | Frontend ready |
| 7 | GET | `/api/v1/home` | no | Frontend parser ready |
| 8 | GET | `/api/v1/home/carousel` | no | Frontend parser ready |
| 9 | GET | `/api/v1/home/cities/hotels` | no | Frontend parser ready |
| 10 | GET | `/api/v1/hotel-search/autocomplete` | no | Frontend parser ready |
| 11 | GET | `/api/v1/hotel-search` | no | Parser ready; filters, discount fields, and `price_bounds` still need to be added on both sides |
| 12 | GET | `/api/v1/hotel-show/{slug}` | no | Parser ready; `faqs` and `nearby_groups` not read yet |
| 13 | GET | `/api/v1/hotels/{hotel_id}/calendars` | no | Frontend parser ready |
| 14 | GET | `/api/v1/hotels/{hotel_id}/similar` | no | Frontend parser ready |
| 15 | POST | `/api/v1/hotel-orders` | yes | Frontend parser ready |
| 16 | POST | `/api/v1/hotel-orders/pay` | yes | Frontend parser ready |
| 17 | GET | bank return URL on the public site | no | Frontend reads the query; return URL ownership needs confirmation |
| 18 | POST | `/api/v1/hotel-orders/{order_id}/discount` | yes | Not built; UI is waiting |
| 19 | GET | `/api/v1/hotel-orders/{order_id}/voucher` | yes | Not built; UI button is waiting |
| 20 | GET | `/api/v1/me/vouchers` | yes | Not built |
| 21 | GET | `/api/v1/me` | yes | Not built; UI shows a placeholder name and wallet `0` |

## Decisions we need from you

1. Cross-origin session cookie, or `Authorization: Bearer` on the order endpoints.
2. Whether hotel-search will accept `name`, `discounted_only`, `stars`, `min_price`, `max_price`, and return `has_discount`, `original_price`, `discount_percent`, and `price_bounds`.
3. Bank `return_url`: you build it from the order’s hotel slug, or we send `slug` / `return_url` on pay. Query names: `status`, `order_id`, `tracking_id`, `amount`.
4. Gateway enum: keep `zarinpal` | `behpardakht`, or add `saman` | `up` | `mellat`.
5. Full-wallet checkout with no bank redirect: form-shaped response to our result URL, or a `paid: true` flag.
6. Whether `GET /api/v1/me`, the discount endpoint, and the voucher PDF match the shapes above.
