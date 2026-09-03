import styles from './Switch.module.scss'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  'aria-label'?: string
}

/** Toggle switch — matches Figma "State=On/Off/Off Disabled" (node 451:7269 family). */
export function Switch({ checked, onChange, disabled, 'aria-label': ariaLabel }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      className={[styles.switch, checked && styles.checked, disabled && styles.disabled].filter(Boolean).join(' ')}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.knob} />
    </button>
  )
}
