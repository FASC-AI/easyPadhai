import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import * as Yup from "yup";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "sonner";
import { AUTH, AUTH_APIS } from "../config";
import apiService from "@/lib/apiService";
import { VALIDATIONS } from "@/components/validation-messages/validation-messages";
import { PPTC } from "@/pages/privacy-term-conditions/config";
import { useLoader } from "@/components/ui/loader/screen-loader";
import { useQueryClient } from '@tanstack/react-query';
import useStore from "@/store";

export function LoginForm({ className, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isReCaptcha, setIsReCaptcha] = useState(false);
  const { toggleOverlay } = useLoader();
  const { setIsAuthenticated, setUser } = useStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_KEY;

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email")
      .required("Email is required")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email format"
      ),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!isReCaptcha) {
        toast.error("Please verify you're not a robot");
        return;
      }

      toggleOverlay(true);
      try {
        const response = await apiService.post(AUTH_APIS.AUTH_LOGIN, values);

        if (response?.code === 200 && response?.status === true) {
          toast.success(response?.message || "Login successful");
          setUser(response?.data);
          setIsAuthenticated(true);
          queryClient.invalidateQueries(['verifyToken']);
          formik.resetForm();
          setIsReCaptcha(false);
          navigate('/dashboard', { state: { id: response?.data?.id } });
        } else {
          toast.error(response?.message || "Login failed");
        }
      } catch (error) {
        const errorMessage = error?.response?.data?.message || "Server error";
        toast.error(errorMessage.includes("Invalid credentials") ? "Invalid credentials" : errorMessage);
      } finally {
        toggleOverlay(false);
      }
    },
  });

  const handleCaptchaChange = (token) => {
    setIsReCaptcha(!!token);
  };

  const handleCaptchaExpire = () => {
    setIsReCaptcha(false);
    toast.warning("Captcha expired, please verify again");
  };

  return (
    <form onSubmit={formik.handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="grid gap-4">
        {/* Email Field */}
        <div className="grid gap-2">
          <Label htmlFor="email" className=" font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            name="email"
            className="mt-1"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="grid gap-2">
          <Label htmlFor="password" className=" font-medium">
            Password
          </Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="password"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-[#1A6FAB] mt-2"
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
        </div>

        {/* Forgot Password Link */}
        <div className="text-right text-sm">
          <Link
            to={AUTH.AUTH_FORGOT_PASS_PAGE}
            className="text-[#1A6FAB] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </div>

      {/* ReCAPTCHA */}
      <ReCAPTCHA
        sitekey={RECAPTCHA_KEY}
        onChange={handleCaptchaChange}
        onExpired={handleCaptchaExpire}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-[#1A6FAB] text-white hover:bg-[#1A6FAB]"
        disabled={formik.isSubmitting}
      >
        {formik.isSubmitting ? "Logging in..." : "Login"}
      </Button>

      {/* Privacy Policy & Terms Links */}
      <div className="text-gray-600 text-center text-sm">
        <Link
          to={PPTC.PPTC_PRIVACY_POLICY}
          target="_blank"
          className="text-[#1A6FAB] hover:underline"
        >
          Privacy Policy
        </Link> |{" "}
        <Link
          target="_blank"
          to={PPTC.PPTC_TERM_CONDITION}
          className="text-[#1A6FAB] hover:underline"
        >
          Terms & Conditions
        </Link>
      </div>
    </form>
  );
}

export default LoginForm;