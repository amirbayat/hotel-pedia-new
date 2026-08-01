import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import { OtpInput } from "../OtpInput";
import { IconBack, IconClose } from "../icons";
import {
  panelLoginBusiness,
  panelLoginPassenger,
  sendBusinessOtp,
  sendPassengerOtp,
  verifyBusinessOtp,
  verifyPassengerOtp,
} from "../../api/auth";
import { toEnglishDigits } from "../../lib/digits";
import { toPersianDigits } from "../../lib/date/jalali";
import { useAuth } from "../../context/authContextValue";
import styles from "./AuthModal.module.scss";

export type AuthTab = "otp" | "personnel";
type Step = "request" | "verify";

const RESEND_COOLDOWN_SECONDS = 60;

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the access token once OTP verification succeeds. */
  onSuccess?: (token: string) => void;
}

const PHONE_RE = /^09\d{9}$/;

/**
 * Login modal — matches Figma "ورود به حساب کاربری". Two tabs, both OTP-based:
 * "otp" hits the B2C (passenger/phone) endpoints, "personnel" hits the B2B
 * (business-employees/company_code) endpoints. Each tab has two steps:
 * enter identifier -> enter the 6-digit code sent to it.
 */
export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const { login } = useAuth();
  const [tab, setTab] = useState<AuthTab>("otp");
  const [step, setStep] = useState<Step>("request");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timeout = setTimeout(
      () => setResendCooldown((seconds) => seconds - 1),
      1000,
    );
    return () => clearTimeout(timeout);
  }, [resendCooldown]);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const resetAll = () => {
    setStep("request");
    setIdentifier("");
    setCode("");
    setError("");
    setResendCooldown(0);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleTabChange = (nextTab: AuthTab) => {
    if (nextTab === tab) return;
    setTab(nextTab);
    setStep("request");
    setIdentifier("");
    setCode("");
    setError("");
    setResendCooldown(0);
  };

  const sendOtp = async () => {
    setError("");

    if (tab === "otp" && !PHONE_RE.test(identifier)) {
      setError("شماره تلفن همراه را به‌درستی وارد کنید.");
      return;
    }
    if (tab === "personnel" && !identifier.trim()) {
      setError("شماره پرسنلی را وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      if (tab === "otp") {
        await sendPassengerOtp(identifier);
      } else {
        await sendBusinessOtp(identifier);
      }
      setCode("");
      setStep("verify");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ارسال کد با خطا مواجه شد.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendOtp();
  };

  const handleVerifySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("کد ۶ رقمی ارسال‌شده را کامل وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const token =
        tab === "otp"
          ? await verifyPassengerOtp(identifier, code)
          : await verifyBusinessOtp(identifier, code);

      if (tab === "otp") {
        panelLoginPassenger(token);
      } else {
        panelLoginBusiness(token);
      }

      // Name/wallet balance aren't returned by the OTP-verify endpoints yet —
      // placeholders until a real profile/wallet API is wired in.
      login({ name: "کاربر هتل‌پدیا", phone: identifier, walletBalance: 0 });

      onSuccess?.(token);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "کد وارد شده صحیح نیست.");
    } finally {
      setLoading(false);
    }
  };

  const identifierLabel = tab === "otp" ? "شماره تلفن همراه" : "شماره پرسنلی";
  const identifierPlaceholder =
    tab === "otp"
      ? "شماره تلفن همراه خود را وارد کنید"
      : "شماره پرسنلی خود را وارد کنید";
  const changeIdentifierLabel =
    tab === "otp" ? "تغییر شماره همراه" : "تغییر شماره پرسنلی";

  return (
    <div className={styles.overlay} onMouseDown={handleClose}>
      <div className={styles.dialog} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={handleClose}
            aria-label="بستن"
          >
            <IconClose width={20} height={20} />
          </button>

          {step === "verify" ? (
            <div className={styles.titleWithBack}>
              <h2 className={styles.title}>رمز یکبار مصرف</h2>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => {
                  setStep("request");
                  setCode("");
                  setError("");
                }}
                aria-label="بازگشت"
              >
                <IconBack width={20} height={20} />
              </button>
            </div>
          ) : (
            <h2 className={styles.title}>ورود به حساب کاربری</h2>
          )}
        </div>

        {step === "request" && (
          <>
            <div className={styles.tabs}>
              <button
                type="button"
                className={[styles.tab, tab === "personnel" && styles.tabActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleTabChange("personnel")}
              >
                ورود با شماره پرسنلی
              </button>
              <button
                type="button"
                className={[styles.tab, tab === "otp" && styles.tabActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleTabChange("otp")}
              >
                ورود با رمز یکبار مصرف
              </button>
            </div>

            <p className={styles.description}>
              جهت ورود، اطلاعات خود را وارد کنید.
            </p>

            <form className={styles.form} onSubmit={handleRequestSubmit}>
              <Input
                label={identifierLabel}
                placeholder={identifierPlaceholder}
                value={identifier}
                onChange={(e) =>
                  setIdentifier(
                    tab === "otp"
                      ? toEnglishDigits(e.target.value)
                      : e.target.value,
                  )
                }
                error={error || undefined}
                disabled={loading}
                inputMode={tab === "otp" ? "tel" : undefined}
              />

              <Button
                type="submit"
                disabled={loading}
                className={styles.button}
              >
                {loading ? "در حال ارسال..." : "ورود"}
              </Button>
            </form>
          </>
        )}

        {step === "verify" && (
          <form className={styles.form} onSubmit={handleVerifySubmit}>
            <p
              className={styles.description}
            >{`رمز ارسال شده به شماره ${identifier} را در کادر زیر وارد کنید.`}</p>

            <OtpInput
              value={code}
              onChange={setCode}
              error={error || undefined}
              disabled={loading}
            />

            <div className={styles.verifyActions}>
              <button
                type="button"
                className={styles.verifyActionButton}
                disabled={loading || resendCooldown > 0}
                onClick={() => void sendOtp()}
              >
                {loading
                  ? "در حال ارسال..."
                  : resendCooldown > 0
                    ? `ارسال مجدد (${toPersianDigits(resendCooldown)})`
                    : "ارسال مجدد رمز یکبار مصرف"}
              </button>
              <button
                type="button"
                className={styles.verifyActionButton}
                disabled={loading}
                onClick={() => {
                  setStep("request");
                  setCode("");
                  setError("");
                  setResendCooldown(0);
                }}
              >
                {changeIdentifierLabel}
              </button>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "در حال بررسی..." : "ورود"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
