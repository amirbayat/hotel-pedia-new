import { IconRadioButtonChecked, IconRadioButtonUnchecked } from '../icons'
import styles from './RadioButton.module.scss'

export interface RadioButtonProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  'aria-label'?: string
}

/** Radio dot — matches Figma "radio_button_checked"/"radio_button_unchecked" (node 451:7250 family). */
export function RadioButton({ checked, onChange, disabled, 'aria-label': ariaLabel }: RadioButtonProps) {
  const Icon = checked ? IconRadioButtonChecked : IconRadioButtonUnchecked

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      className={[styles.radio, checked && styles.checked].filter(Boolean).join(' ')}
      onClick={onChange}
    >
      <Icon width={24} height={24} />
    </button>
  )
}
