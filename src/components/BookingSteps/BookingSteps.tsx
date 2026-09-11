import { Fragment } from 'react'
import { IconCancel, IconCheckCircle, IconConfirmationNumber, IconCreditCard } from '../icons'
import type { IconComponent } from '../icons/types'
import styles from './BookingSteps.module.scss'

export type BookingStepKey = 'hotel' | 'passengers' | 'confirm' | 'payment' | 'voucher'

const STEPS: { key: BookingStepKey; label: string; icon: IconComponent }[] = [
  { key: 'hotel', label: 'انتخاب اتاق', icon: IconCheckCircle },
  { key: 'passengers', label: 'مشخصات مسافران', icon: IconConfirmationNumber },
  { key: 'confirm', label: 'تایید اطلاعات', icon: IconCreditCard },
  { key: 'payment', label: 'پرداخت', icon: IconCheckCircle },
  { key: 'voucher', label: 'صدور واچر', icon: IconCheckCircle },
]

export interface BookingStepsProps {
  currentStep: BookingStepKey
  /** Renders the last two steps (payment + voucher) with the failed/cancelled style. */
  failed?: boolean
}

/**
 * Progress bar at the top of every booking-flow page — matches Figma "Hotel
 * detail" step-indicator (node 692:14107 family; see docs/hotel-booking-plan.md §1).
 * Five steps, RTL (right → left). Each step is a column (icon + label) so the
 * label stays centered under its icon at any width. Done steps swap to
 * `check_circle`; failed payment/voucher steps swap to `cancel`.
 */
export function BookingSteps({ currentStep, failed }: BookingStepsProps) {
  const currentIndex = STEPS.findIndex((step) => step.key === currentStep)
  const allComplete = !failed && currentStep === 'voucher'

  return (
    <div className={styles.steps} role="list" aria-label="مراحل رزرو">
      {STEPS.map((step, index) => {
        const isFailedStep = Boolean(failed && index >= STEPS.length - 2)
        const isPast = index < currentIndex
        const isCurrent = index === currentIndex
        const isDone = isFailedStep ? false : allComplete || isPast || (failed && index < STEPS.length - 2)
        const isReached = isDone || isCurrent || isFailedStep

        const Icon = isFailedStep ? IconCancel : isDone ? IconCheckCircle : step.icon
        const connectorDone = isDone || (failed && index < STEPS.length - 2)
        const connectorFailed = Boolean(failed && index >= STEPS.length - 3 && index < STEPS.length - 1)

        return (
          <Fragment key={step.key}>
            <div className={styles.step} role="listitem">
              <span
                className={[
                  styles.dot,
                  isReached && !isFailedStep && styles.dotDone,
                  isFailedStep && styles.dotFailed,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Icon width={24} height={24} />
              </span>
              <span
                className={[styles.label, (isDone || isCurrent) && !isFailedStep && styles.labelActive]
                  .filter(Boolean)
                  .join(' ')}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span
                className={[
                  styles.connector,
                  connectorDone && styles.connectorDone,
                  connectorFailed && styles.connectorFailed,
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
