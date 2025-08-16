import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router-dom';
import { useFormik } from "formik";
import * as Yup from "yup";
import { AUTH_APIS } from "../config";
import apiService from "@/lib/apiService";
import { useLoader } from "@/components/ui/loader/screen-loader";

export function ResetPasswordForm({ className, email, setIsReset, token, ...props }) {
  const navigate = useNavigate();
  const [isReCaptcha, setIsReCaptcha] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toggleOverlay } = useLoader();
  const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_KEY;

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[^A-Za-z0-9]/, "Password must contain at least one special character")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: email || "",
      password: "",
      confirmPassword: "",
      token: token || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!isReCaptcha) {
        toast.error("Please verify you are not a robot");
        return;
      }
      toggleOverlay(true);
      try {
        const response = await apiService.post(AUTH_APIS.AUTH_CHANGE_PASS, values);
        if (response?.code === 200 && response?.status === true) {
          toast.success(response?.message || "Password reset successfully");
          formik.resetForm();
          setIsReset(false);
          navigate('/');
        } else {
          toast.error(response?.message || "Failed to reset password");
        }
      } catch (error) {
        const errorMessage = error?.response?.data?.message || "An error occurred";
        toast.error(errorMessage.includes("Invalid token") ? "Invalid or expired token" : errorMessage);
      } finally {
        toggleOverlay(false);
      }
    },
  });

  const checkStrength = (pass) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
      { regex: /[^A-Za-z0-9]/, text: "At least 1 special character" },
    ];
    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const strength = checkStrength(formik.values.password);
  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getStrengthColor = (score) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthWidth = (score) => {
    const percentage = (score / 5) * 100; // Updated to 5 requirements
    if (percentage === 0) return "w-0";
    if (percentage <= 20) return "w-1/5";
    if (percentage <= 40) return "w-2/5";
    if (percentage <= 60) return "w-3/5";
    if (percentage <= 80) return "w-4/5";
    return "w-full";
  };

  const handleCaptchaChange = (value) => {
    setIsReCaptcha(!!value);
  };

  const handleCaptchaExpire = () => {
    setIsReCaptcha(false);
    toast.warning("Captcha expired, please verify again");
  };

  return (
    <form onSubmit={formik.handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="grid gap-4">
        {/* Password Field */}
        <div className="grid gap-2">
          <Label htmlFor="password" className=" font-medium">
            Password
          </Label>
          <div className="relative mt-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-[#1A6FAB]"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeIcon className="h-4 w-4" />
              ) : (
                <EyeOffIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
          )}
          {strengthScore > 0 && (
            <>
              <div className="bg-border mt-3 h-1 w-full overflow-hidden rounded-full">
                <div className={`h-full transition-all duration-500 ${getStrengthColor(strengthScore)} ${getStrengthWidth(strengthScore)}`}></div>
              </div>
              <ul className="space-y-1.5 mt-2">
                {strength.map((req, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {req.met ? (
                      <CheckIcon size={16} className="text-emerald-500" />
                    ) : (
                      <XIcon size={16} className="text-muted-foreground/80" />
                    )}
                    <span className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {req.text}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword" className="text-[#1A6FAB] font-medium">
            Confirm Password
          </Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Enter confirm password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-[#1A6FAB] mt-2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeIcon className="h-4 w-4" />
              ) : (
                <EyeOffIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</p>
          )}
        </div>
      </div>

      {/* ReCAPTCHA */}
      <ReCAPTCHA
        sitekey={RECAPTCHA_KEY}
        onChange={handleCaptchaChange}
        onExpired={handleCaptchaExpire}
      />

      {/* Buttons */}
      <Button
        type="submit"
        className="w-full bg-[#1A6FAB] text-white hover:bg-[#1A6FAB] cursor-pointer"
        disabled={formik.isSubmitting}
      >
        {formik.isSubmitting ? "Submitting..." : "Submit"}
      </Button>
      <Button
        type="button"
        onClick={() => setIsReset(false)}
        className="w-full bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-100 focus:ring-2 focus:ring-gray-400 transition"
      >
        Cancel
      </Button>
    </form>
  );
}

export default ResetPasswordForm;