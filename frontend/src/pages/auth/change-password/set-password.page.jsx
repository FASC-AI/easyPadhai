import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiService from "@/lib/apiService";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { XIcon, CheckIcon } from "lucide-react";
import { USERS } from "../../dashboard/users/config";
import { APIS } from "@/constants/api.constant";

export function SetPassForm({ className, setIsChangePassword, ...props }) {
  const navigate = useNavigate();
  const { updateBreadcrumb } = useBreadcrumb();
  const location = useLocation();
  const { email } = location.state || {};
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validation schema for new password and confirm password
  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "At least 8 characters")
      .matches(/[0-9]/, "Include at least 1 number")
      .matches(/[a-z]/, "Include at least 1 lowercase letter")
      .matches(/[A-Z]/, "Include at least 1 uppercase letter")
      .matches(/[^A-Za-z0-9]/, "Include at least 1 special character")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm your new password"),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!email) {
        toast.error("No email provided");
        return;
      }

      try {
        const payload = {
          email,
          password: values.password,
        };

        const response = await apiService.post(APIS.PASSWORD_SET, payload);

        if (response?.status === true && response?.code === 200) {
          toast.success("Password reset successfully");
          formik.resetForm();
          if (setIsChangePassword) {
            setIsChangePassword(false);
          } else {
            navigate(USERS.USERS);
          }
        } else {
          toast.error(response?.message || "Failed to reset password");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Server error");
      }
    },
  });

  // Password strength validation
  const strength = useMemo(() => {
    const pass = formik.values.password;
    return [
      { met: /.{8,}/.test(pass), label: "Min 8 characters" },
      { met: /[0-9]/.test(pass), label: "Number" },
      { met: /[a-z]/.test(pass), label: "Lowercase letter" },
      { met: /[A-Z]/.test(pass), label: "Uppercase letter" },
      { met: /[^A-Za-z0-9]/.test(pass), label: "Special character" },
    ];
  }, [formik.values.password]);

  // Update breadcrumb
  useEffect(() => {
    updateBreadcrumb([
      { label: "Users", href: USERS.USER_LIST },
      { label: "Set Password", href: "" },
    ]);
  }, [updateBreadcrumb]);

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex flex-col gap-6"
      {...props}
    >
      <div className="grid gap-4">
        {/* New Password Field */}
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showNew ? "text" : "password"}
            placeholder="Enter new password"
            label="New Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground focus:outline-none"
            onClick={() => setShowNew(!showNew)}
          >
            {showNew ? (
              <EyeIcon className="h-4 w-4 text-blue-primary-200" />
            ) : (
              <EyeOffIcon className="h-4 w-4 text-blue-primary-200" />
            )}
          </button>
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-sm">{formik.errors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            label="Confirm Password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground focus:outline-none mt-2"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? (
              <EyeIcon className="h-4 w-4 text-blue-primary-200" />
            ) : (
              <EyeOffIcon className="h-4 w-4 text-blue-primary-200" />
            )}
          </button>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-red-500 text-sm">
              {formik.errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Password Strength Indicator */}
        <div className="flex flex-col gap-1">
          {strength.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {item.met ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <XIcon className="h-4 w-4 text-red-500" />
              )}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        Set Password
      </Button>
      <Button
        type="button"
        onClick={() => navigate(-1)}
        className="w-full bg-gray-100 text-gray-700 border mt-2"
      >
        Cancel
      </Button>
    </form>
  );
}
