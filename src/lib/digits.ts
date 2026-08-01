const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

/** Converts Persian/Arabic-Indic digits in a string to plain ASCII digits (e.g. for a phone number field before validation/submission). */
export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(digit)
    return String(persianIndex !== -1 ? persianIndex : ARABIC_INDIC_DIGITS.indexOf(digit))
  })
}
