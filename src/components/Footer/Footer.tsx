import { IconAparat, IconInstagram, IconLinkedin, IconTelegram } from '../icons'
import styles from './Footer.module.scss'

export interface FooterColumn {
  title: string
  links: string[]
}

export interface FooterProps {
  aboutTitle?: string
  aboutText?: string
  address?: string
  phone?: string
  columns?: FooterColumn[]
}

const defaultColumns: FooterColumn[] = [
  {
    title: 'پشتیبانی',
    links: ['راهنمای رزرو', 'سوالات متداول', 'تماس با ما', 'گزارش مشکل', 'مرکز کمک'],
  },
  {
    title: 'پشتیبانی',
    links: ['راهنمای رزرو', 'سوالات متداول', 'تماس با ما', 'گزارش مشکل', 'مرکز کمک'],
  },
  {
    title: 'دسترسی سریع',
    links: ['رزرو هتل', 'پرواز داخلی', 'پرواز خارجی', 'تور مسافرتی', 'رزرو خودرو'],
  },
]

/** Site footer — matches the homepage PDF export. Two "پشتیبانی" columns are duplicated in the source design as-is. */
export function Footer({
  aboutTitle = 'هتل‌پدیا چیست؟',
  aboutText = 'هتل پدیا، سامانه رزرو آنلاین هتل ها و اقامتگاه های ایران است که با توجه به توسعه اینترنت و دسترسی آسان به بسیاری از امکانات و خدمات از جمله رزرواسیون هتل با ایجاد سامانه اینترنتی خود مورد نیاز برای رزرو اقامتگاه‌ها در شهرهای مختلف کشور را در کمترین زمان و بالاترین کیفیت فراهم نموده و در اختیار شما عزیزان قرار داده است. هتل پدیا به شما کمک می‌کند تا فهرست کاملی از هتل‌ها و اقامتگاه‌های هر شهر را مشاهده نمایید و بر اساس فیلترهای خاص مانند نوع، کلاس و قیمت، بهترین گزینه مورد نظرتان برسید. انتخاب خود را بدون نیاز به پیگیری‌های خسته کننده، علاوه بر آن با سفارش از طریق هتل پدیا می‌توانید از تخفیف‌های ویژه و پیشنهادات قیمتی آن استفاده نمایید.',
  address = 'شما می‌توانید آدرس دفتر شرکت را در اینجا وارد کنید.',
  phone = '۰۲۱۸۷۶۵۴۳۲۱',
  columns = defaultColumns,
}: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.about}>
        <h2 className={styles.aboutTitle}>{aboutTitle}</h2>
        <p className={styles.aboutText}>{aboutText}</p>
      </div>

      <div className={styles.bottom}>
        <div className={styles.brand}>
          {/* TODO: swap for the real Hotelpedia logo SVG once provided */}
          <div className={styles.logo}>
            <span>Hotel</span>
            <span className={styles.logoAccent}>Pedia</span>
          </div>
          <p className={styles.address}>آدرس: {address}</p>
          <p className={styles.phone}>تلفن: {phone}</p>

          <div className={styles.social}>
            <a href="#" className={styles.socialIcon} aria-label="تلگرام">
              <IconTelegram width={20} height={20} />
            </a>
            <a href="#" className={styles.socialIcon} aria-label="اینستاگرام">
              <IconInstagram width={20} height={20} />
            </a>
            <a href="#" className={styles.socialIcon} aria-label="لینکدین">
              <IconLinkedin width={20} height={20} />
            </a>
            <a href="#" className={styles.socialIcon} aria-label="آپارات">
              <IconAparat width={20} height={20} />
            </a>
            {/* TODO: YouTube icon isn't exported from Figma yet */}
          </div>

          <div className={styles.badges}>
            {/* TODO: swap for the real eNamad / Samandehi / union badge images once provided */}
            <div className={styles.badgePlaceholder}>eNamad</div>
            <div className={styles.badgePlaceholder}>Samandehi</div>
            <div className={styles.badgePlaceholder}>اتحادیه</div>
          </div>
        </div>

        {columns.map((column, i) => (
          <div className={styles.column} key={`${column.title}-${i}`}>
            <h3 className={styles.columnTitle}>{column.title}</h3>
            <ul className={styles.columnList}>
              {column.links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  )
}
