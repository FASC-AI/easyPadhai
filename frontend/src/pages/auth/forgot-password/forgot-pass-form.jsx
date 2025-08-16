import { Link, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AUTH, AUTH_APIS } from "../config";
import apiService from "@/lib/apiService";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";
import { useLoader } from "@/components/ui/loader/screen-loader";

const OTPInput = ({
  value,
  onChange,
  label = "",
  required = true,
  onBlur,
  error,
}) => {
  const inputRefs = useRef([]);
  const length = 6;

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 1) {
      const newValue = value.split("");
      newValue[index] = val;
      onChange(newValue.join(""));
      if (val.length === 1 && index < length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (/^\d+$/.test(pastedData)) {
      onChange(pastedData.padEnd(length, ""));
      if (pastedData.length === length) {
        inputRefs.current[length - 1].focus();
      }
    }
  };

  return (
    <div className="grid gap-2">
      <Label className="text-[#1A6FAB] font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex gap-2">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onBlur={onBlur}
            onPaste={handlePaste}
            className="h-10 w-10 rounded-lg border border-input bg-background text-center text-foreground shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-[#1A6FAB]/50 focus:ring-offset-2"
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

const ForgotPasswordForm = ({
  className,
  sethaveEmail,
  setIsReset,
  setToken,
  ...props
}) => {
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [isReCaptcha, setIsReCaptcha] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_KEY;
  const { toggleOverlay } = useLoader();

  useEffect(() => {
    let timer = null;
    if (otpSent && !canResend && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, canResend, countdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const sendOTP = async (email) => {
    try {
      toggleOverlay(true);
      const response = await apiService.post(AUTH_APIS.AUTH_FORGOT_PASSWORD, { email });
      if (response?.code === 200 && response?.status === true) {
        toast.success(response?.message || "OTP sent successfully");
        setOtpSent(true);
        setCanResend(false);
        setCountdown(300);
        setRetryCount(0);
      } else {
        toast.error(response?.message || "Failed to send OTP");
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "An error occurred";
      setRetryCount((prev) => prev + 1);
      toast.error(
        errorMessage.includes("Failed to send OTP")
          ? retryCount >= 2
            ? "Email service unavailable, please contact support at support@upsdma.com"
            : "Failed to send OTP, please try again"
          : errorMessage.includes("Email not found")
          ? "Email not found"
          : errorMessage
      );
    } finally {
      toggleOverlay(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      otp: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email")
        .required("Email is required"),
      otp: Yup.string().when([], {
        is: () => otpSent,
        then: (schema) =>
          schema
            .length(6, "OTP must be 6 digits")
            .matches(/^\d+$/, "OTP must be numeric")
            .required("OTP is required"),
        otherwise: (schema) => schema,
      }),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (!isReCaptcha && !otpSent) {
          toast.error("Please verify you are not a robot");
          return;
        }
        if (!otpSent) {
          await sendOTP(values.email);
        } else {
          toggleOverlay(true);
          const response = await apiService.post(AUTH_APIS.AUTH_VERIFY_OTP, {
            email: values.email,
            otp: values.otp,
          });
          if (response?.code === 200 && response?.status === true) {
            toast.success(response?.message || "OTP verified successfully");
            setToken(response?.data?.token);
            sethaveEmail(values.email);
            setIsReset(true);
            formik.resetForm();
          } else {
            toast.error(response?.message || "Invalid OTP");
          }
        }
      } catch (error) {
        const errorMessage = error?.response?.data?.message || "An error occurred";
        toast.error(
          errorMessage.includes("Invalid OTP") ? "Invalid OTP" : errorMessage
        );
      } finally {
        toggleOverlay(false);
        setSubmitting(false);
      }
    },
  });

  const handleResendOTP = async () => {
    formik.setSubmitting(true);
    formik.setFieldTouched("otp", false, false);
    await sendOTP(formik.values.email);
    formik.setFieldValue("otp", "");
    formik.setSubmitting(false);
  };

  const handleRetry = () => {
    formik.setSubmitting(true);
    sendOTP(formik.values.email);
    formik.setSubmitting(false);
  };

  const handleCaptchaChange = (token) => {
    setIsReCaptcha(!!token);
  };

  const handleCaptchaExpire = () => {
    setIsReCaptcha(false);
    toast.warning("Captcha expired, please verify again");
  };

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex flex-col gap-6"
      {...props}
    >
      <div className="grid gap-4">
        {/* Email Input */}
        <div className="grid gap-2">
          <Label htmlFor="email" className=" font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="Enter email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={otpSent}
            className="mt-1"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
          )}
        </div>

        {/* OTP Input */}
        {otpSent && (
          <div className="grid gap-2">
            <OTPInput
              value={formik.values.otp}
              onChange={(value) => formik.setFieldValue("otp", value)}
              label="OTP"
              required={true}
              onBlur={formik.handleBlur("otp")}
              error={formik.touched.otp && formik.errors.otp}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {canResend ? "Expired" : formatTime(countdown)}
              </span>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend || formik.isSubmitting}
                className="text-[#1A6FAB] text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend OTP
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ReCAPTCHA */}
      {!otpSent && (
        <ReCAPTCHA
          sitekey={RECAPTCHA_KEY}
          onChange={handleCaptchaChange}
          onExpired={handleCaptchaExpire}
        />
      )}

      {/* Buttons */}
      <Button
        type="submit"
        className="w-full bg-[#1A6FAB] text-white hover:bg-[#1A6FAB]/90 cursor-pointer"
        disabled={formik.isSubmitting}
      >
        {formik.isSubmitting ? (otpSent ? "Verifying..." : "Sending...") : (otpSent ? "Verify OTP" : "Send OTP")}
      </Button>
      {otpSent && (
        <Button
          type="button"
          onClick={() => {
            setOtpSent(false);
            formik.resetForm();
          }}
          className="w-full bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-100 focus:ring-2 focus:ring-gray-400 transition"
        >
          Cancel
        </Button>
      )}
      {retryCount > 0 && !otpSent && (
        <Button
          type="button"
          onClick={handleRetry}
          className="w-full bg-[#1A6FAB]/10 text-[#1A6FAB] hover:bg-[#1A6FAB]/20"
        >
          Retry Sending OTP
        </Button>
      )}

      {/* Login Link */}
      <div className="text-gray-600 text-center text-sm">
        Know your password?{" "}
        <Link
          to={AUTH.AUTH_LOGIN_PAGE}
          className="text-[#1A6FAB] hover:underline"
        >
          Login
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;