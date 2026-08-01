import styles from './Switch.module.scss'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  className?: string
}

/** Base toggle switch — matches Figma "State=Off/On" (node 451:7275). */
export function Switch({ checked, onChange, disabled, label, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={[styles.switch, checked && styles.checked, className].filter(Boolean).join(' ')}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.track} />
      <span className={styles.thumb} />
    </button>
  )
}
