import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import type { IconComponent } from '../icons/types'
import styles from './Input.module.scss'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label shown above the field ("عنوان" in Figma). */
  label?: string
  /** Helper text shown below the field ("متن راهنما" in Figma). Hidden when `error` is set. */
  hint?: string
  /** Error message. When set, the field switches to the error state and shows this instead of `hint`. */
  error?: string
  /** Icon rendered at the start of the field. */
  leadingIcon?: IconComponent
  /** Icon rendered at the end of the field (e.g. a clear/dropdown button). */
  trailingIcon?: IconComponent
  /** Click handler for the trailing icon — renders it as a button instead of a static glyph. */
  onTrailingIconClick?: () => void
  /** Puts the leading icon on the right and the trailing icon on the left, for RTL fields. */
  reverseIcons?: boolean
  /** Keeps space below the field for hint/error text so surrounding layouts don't shift. */
  reserveHintSpace?: boolean
}

/**
 * Base text Input — matches Figma "Text field" (node 151:831 / 151:906).
 *
 * Hover and focus are real CSS states (:hover / :focus-within). `error` and
 * `disabled` are explicit props since they're not something the user triggers
 * by interacting with the field.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    leadingIcon: LeadingIcon,
    trailingIcon: TrailingIcon,
    onTrailingIconClick,
    reverseIcons,
    reserveHintSpace,
    disabled,
    className,
    id,
    ...rest
  },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const message = error ?? hint

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <div
        className={[styles.container, error && styles.error, disabled && styles.disabled, reverseIcons && styles.reverse]
          .filter(Boolean)
          .join(' ')}
      >
        {LeadingIcon && <LeadingIcon className={styles.icon} width={24} height={24} aria-hidden />}
        <input id={inputId} ref={ref} disabled={disabled} className={styles.input} {...rest} />
        {TrailingIcon &&
          (onTrailingIconClick ? (
            <button
              type="button"
              className={styles.iconButton}
              onClick={onTrailingIconClick}
              disabled={disabled}
              aria-label="clear"
            >
              <TrailingIcon className={styles.icon} width={24} height={24} />
            </button>
          ) : (
            <TrailingIcon className={styles.icon} width={24} height={24} aria-hidden />
          ))}
      </div>

      {reserveHintSpace || message ? (
        <p
          className={[
            styles.hint,
            error && styles.hintError,
            reserveHintSpace && styles.hintReserved,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {message || '\u00a0'}
        </p>
      ) : null}
    </div>
  )
})
