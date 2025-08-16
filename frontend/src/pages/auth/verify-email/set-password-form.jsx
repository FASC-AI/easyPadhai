
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import ReCAPTCHA from 'react-google-recaptcha';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from "formik";
import * as Yup from "yup";
import { AUTH, AUTH_APIS } from "../config";
import apiService from "@/lib/apiService";
import { useLoader } from "@/components/ui/loader/screen-loader";

export function SetPasswordForm({ className, email, token, ...props }) {
  const [isReCaptcha, setIsReCaptcha] = useState(false);
  const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_KEY;
  const { toggleOverlay } = useLoader();
  const navigate = useNavigate()
  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .required("This field is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], "Passwords do not match")
      .required("This field is required")
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      token: ""
    },
    validationSchema,
    onSubmit: async (values) => {
      const formValues = {
        password: values.password,
        token: token,
        email: email

      }
      if (!isReCaptcha) {
        toast.error('Verify the captcha that you are not a robot');
        return;
      }
      try {
        toggleOverlay(true)
        const response = await apiService.post(AUTH_APIS.AUTH_CHANGE_PASS, formValues);
        if (response?.code === 200 && response?.status === true) {
          toast.success(response?.message);
          formik.resetForm();
          setIsReCaptcha(false);
          toggleOverlay(false)
          navigate(AUTH.AUTH_LOGIN_PAGE)
        } else {
          toggleOverlay(false)
          toast.error(response?.message);
        }

      } catch (error) {
        toggleOverlay(false)
        toast.error(response?.message);
      }
    }
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
    if (score <= 3) return "bg-orange-500";
    if (score === 4) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthWidth = (score) => {
    const percentage = (score / 4) * 100;
    if (percentage === 0) return "w-0";
    if (percentage <= 20) return "w-1/5";
    if (percentage <= 40) return "w-2/5";
    if (percentage <= 70) return "w-3/5";
    if (percentage <= 85) return "w-4/5";
    return "w-full";
  };

  const handleCaptchaChange = (token) => {
    setIsReCaptcha(!!token);
  };

  const handleCaptchaExpire = () => {
    setIsReCaptcha(false);
    toast.warning('Captcha expired, please verify again.');
  };

  return (
    <form onSubmit={formik.handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="grid gap-4">

        <div className="grid gap-2">
          <div className="relative grid gap-2">
            <Input
              id="password"
              name="password"
              label="Password"
              required={true}
              formik={formik}
              type="password"
              {...formik.getFieldProps('password')}
            />
          </div>

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

        <div className="grid gap-2">
          <div className="relative grid gap-2">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              required={true}
              formik={formik}
              type="password"
              {...formik.getFieldProps('confirmPassword')}
            />
          </div>
        </div>
      </div>

      <ReCAPTCHA
        sitekey={RECAPTCHA_KEY}
        onChange={handleCaptchaChange}
        onExpired={handleCaptchaExpire}
      />

      <Button type="submit" className="w-full cursor-pointer">
        Submit
      </Button>

    </form>
  );
}

export default SetPasswordForm;