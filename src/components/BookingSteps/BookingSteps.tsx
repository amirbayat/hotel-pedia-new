import { Fragment } from 'react'
import { IconCheckCircle, IconConfirmationNumber, IconCreditCard, IconCancel } from '../icons'
import type { IconComponent } from '../icons/types'
import styles from './BookingSteps.module.scss'

export type BookingStepKey = 'hotel' | 'passengers' | 'confirm' | 'voucher'

const STEPS: { key: BookingStepKey; label: string; icon: IconComponent }[] = [
  { key: 'hotel', label: 'انتخاب هتل', icon: IconCheckCircle },
  { key: 'passengers', label: 'مشخصات مسافران', icon: IconConfirmationNumber },
  { key: 'confirm', label: 'تایید اطلاعات و پرداخت', icon: IconCreditCard },
  { key: 'voucher', label: 'صدور واچر', icon: IconCheckCircle },
]

export interface BookingStepsProps {
  currentStep: BookingStepKey
  /** Renders every step (including ones already passed) with the failed/cancelled style. */
  failed?: boolean
}

/**
 * Progress bar at the top of every booking-flow page — matches Figma "Hotel
 * detail" step-indicator (node 692:14107 family; see docs/hotel-booking-plan.md §1).
 * A step reached-or-passed renders as done (or failed, on the payment-failure page);
 * steps still ahead render as pending.
 */
export function BookingSteps({ currentStep, failed }: BookingStepsProps) {
  const currentIndex = STEPS.findIndex((step) => step.key === currentStep)

  return (
    <div className={styles.steps}>
      <div className={styles.dots}>
        {STEPS.map((step, index) => {
          const reached = index <= currentIndex
          // On failure only the payment/voucher stages turn red — the earlier,
          // already-completed steps (hotel, passengers) stay green, matching
          // Figma node 720:10551.
          const dotFailed = failed && index >= STEPS.length - 2
          const Icon = dotFailed ? IconCancel : step.icon

          return (
            // A real Fragment (not a div) so `.dots` flexes every dot/connector as
            // one flat, evenly-spaced row — see the module's flex-direction: row-reverse.
            <Fragment key={step.key}>
              <span className={[styles.dot, reached && styles.dotDone, dotFailed && styles.dotFailed].filter(Boolean).join(' ')}>
                <Icon width={24} height={24} />
              </span>
              {index < STEPS.length - 1 && (
                <span className={[styles.connector, reached && styles.connectorDone, dotFailed && styles.connectorFailed].filter(Boolean).join(' ')} />
              )}
            </Fragment>
          )
        })}
      </div>

      <div className={styles.labels}>
        {STEPS.map((step, index) => (
          <span key={step.key} className={[styles.label, index <= currentIndex && styles.labelActive].filter(Boolean).join(' ')}>
            {step.label}
          </span>
        ))}
      </div>
    </div>
  )
}
