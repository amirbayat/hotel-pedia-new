import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { IconComponent } from '../icons/types'
import styles from './Button.module.scss'

export type ButtonVariant = 'primary' | 'secondary'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Visual style. Defaults to "primary" (solid CTA orange). */
  variant?: ButtonVariant
  /** Optional leading icon (IconXxx from '../icons'). */
  icon?: IconComponent
  /** Button label. Omit (with an `icon`) to render a square icon-only button. */
  children?: ReactNode
}

/**
 * Base Button — matches Figma "Buttons Assets" (node 148:1005).
 *
 * Hover / focus / active / disabled states are handled with real CSS
 * pseudo-classes (see Button.module.scss), not separate props — only the
 * `disabled` attribute and `variant` are things a consumer sets directly.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', icon: Icon, children, className, type = 'button', ...rest },
  ref,
) {
  const iconOnly = !children

  return (
    <button
      ref={ref}
      type={type}
      className={[styles.button, styles[variant], iconOnly && styles.iconOnly, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {Icon && <Icon className={styles.icon} width={24} height={24} aria-hidden={iconOnly ? undefined : true} />}
      {children && <span className={styles.label}>{children}</span>}
    </button>
  )
})
