import { useRef } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import styles from './OtpInput.module.scss'

export interface OtpInputProps {
  /** Number of digit boxes. Defaults to 6, matching Figma's "Password segment field". */
  length?: number
  /** Current value (digits only, e.g. "1234"). Shorter than `length` is fine — remaining boxes render empty. */
  value?: string
  onChange?: (value: string) => void
  /** Label shown above the field ("عنوان" in Figma). */
  label?: string
  /** Helper text shown below the field. Hidden when `error` is set. */
  hint?: string
  /** Error message. When set, all boxes switch to the error state and this replaces `hint`. */
  error?: string
  disabled?: boolean
  className?: string
  /** Base `name` for the hidden inputs (name-0, name-1, ...) — useful for form libraries. */
  name?: string
}

const DIGIT_RE = /[^0-9۰-۹]/g // keep ASCII 0-9 and Persian ۰-۹

/**
 * OTP / password-segment input — matches Figma "Password segment field"
 * (node 151:831, states at 151:937). One box per digit, auto-advances on
 * type, steps back on backspace, and splits a pasted code across boxes.
 */
export function OtpInput({
  length = 6,
  value = '',
  onChange,
  label,
  hint,
  error,
  disabled,
  className,
  name = 'otp',
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')
  const message = error ?? hint

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus()
  }

  const setDigit = (index: number, char: string) => {
    const next = digits.slice()
    next[index] = char
    onChange?.(next.join(''))
  }

  const handleChange = (index: number, raw: string) => {
    const char = raw.replace(DIGIT_RE, '').slice(-1)
    setDigit(index, char)
    if (char && index < length - 1) focusInput(index + 1)
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return
    if (digits[index]) {
      setDigit(index, '')
    } else if (index > 0) {
      setDigit(index - 1, '')
      focusInput(index - 1)
    }
  }

  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(DIGIT_RE, '')
    if (!pasted) return
    e.preventDefault()

    const next = digits.slice()
    for (let i = 0; i < pasted.length && index + i < length; i++) {
      next[index + i] = pasted[i]
    }
    onChange?.(next.join(''))
    focusInput(Math.min(index + pasted.length, length) - 1)
  }

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && <span className={styles.label}>{label}</span>}

      <div className={styles.boxes}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            name={`${name}-${index}`}
            className={[styles.box, error && styles.error, disabled && styles.disabled]
              .filter(Boolean)
              .join(' ')}
            value={digit}
            disabled={disabled}
            inputMode="numeric"
            maxLength={1}
            aria-label={`رقم ${index + 1}`}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={(e) => handlePaste(index, e)}
          />
        ))}
      </div>

      {message && <p className={[styles.hint, error && styles.hintError].filter(Boolean).join(' ')}>{message}</p>}
    </div>
  )
}
