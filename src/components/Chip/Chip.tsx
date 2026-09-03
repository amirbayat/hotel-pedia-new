import styles from './Chip.module.scss'

export interface ChipProps {
  children: string
  active?: boolean
  onClick?: () => void
}

/** Pill toggle button — matches Figma "Chip button" (node 789:25050). */
export function Chip({ children, active, onClick }: ChipProps) {
  return (
    <button type="button" className={[styles.chip, active && styles.active].filter(Boolean).join(' ')} onClick={onClick}>
      {children}
    </button>
  )
}
