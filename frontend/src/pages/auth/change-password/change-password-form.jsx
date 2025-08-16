import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiService from "@/lib/apiService";
import { AUTH_APIS } from "../config";
import { CheckIcon, XIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import useStore from "@/store";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { AlertDialogBox } from "@/components/ui/dialog";

export function ChangePasswordForm({ className, setIsChangePassword, ...props }) {
  const navigate = useNavigate();
  const { updateBreadcrumb } = useBreadcrumb();
  const { user, setUser, setIsAuthenticated } = useStore();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const validationSchema = Yup.object({
    oldPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .min(8, "At least 8 characters")
      .matches(/[0-9]/, "Include at least 1 number")
      .matches(/[a-z]/, "Include at least 1 lowercase letter")
      .matches(/[A-Z]/, "Include at least 1 uppercase letter")
      .matches(/[^A-Za-z0-9]/, "Include at least 1 special character")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          email: user?.email,
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        };

        const response = await apiService.post(AUTH_APIS.AUTH_CHANGE_PASSWORD, payload);

        if (response?.status === true) {
          toast.success("Password changed successfully");
          formik.resetForm();
          setIsLogoutDialogOpen(true); // Open logout confirmation dialog
        } else {
          toast.error(response?.message || "Failed to change password");
        }
      } catch (error) {
        const errorMessage = error?.response?.data?.message || "Server error";
        if (errorMessage.includes("Invalid credentials")) {
          toast.error("Invalid credentials"); // Show only once
        } else {
          toast.error(errorMessage);
        }
      }
    },
  });

  const handleLogoutConfirm = async () => {
    try {
      await apiService.post(AUTH_APIS.AUTH_LOGOUT, { _id: user?.id });
      setUser(null);
      setIsAuthenticated(false);
      setIsLogoutDialogOpen(false);
      if (setIsChangePassword) {
        setIsChangePassword(false);
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to logout");
    }
  };

  const handleLogoutCancel = () => {
    setIsLogoutDialogOpen(false);
    if (setIsChangePassword) {
      setIsChangePassword(false);
    } else {
      navigate('/');
    }
  };

  const handleCancel = () => {
    formik.resetForm();
    if (setIsChangePassword) {
      setIsChangePassword(false);
    } else {
      navigate(-1); // Go back to the previous page
    }
  };

  const strength = useMemo(() => {
    const pass = formik.values.newPassword;
    return [
      { met: /.{8,}/.test(pass), label: "Min 8 characters" },
      { met: /[0-9]/.test(pass), label: "Number" },
      { met: /[a-z]/.test(pass), label: "Lowercase letter" },
      { met: /[A-Z]/.test(pass), label: "Uppercase letter" },
      { met: /[^A-Za-z0-9]/.test(pass), label: "Special character" },
    ];
  }, [formik.values.newPassword]);

  const strengthScore = strength.filter((s) => s.met).length;

  useEffect(() => {
    updateBreadcrumb([{ label: "Change Password", href: "" }]);
  }, []);

  return (
    <>
      <form onSubmit={formik.handleSubmit} className={`flex flex-col gap-6 ${className}`} {...props}>
        <div className="grid gap-4">
          {/* Old Password */}
          <div>











            <Label htmlFor="oldPassword" className=" font-medium">
              Current Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="oldPassword"
                name="oldPassword"
                type={showOld ? "text" : "password"}
                placeholder="Enter current password"
                value={formik.values.oldPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-[#1A6FAB]"
                onClick={() => setShowOld(!showOld)}
              >
                {showOld ? (
                  <EyeIcon className="h-4 w-4" />
                ) : (
                  <EyeOffIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {formik.touched.oldPassword && formik.errors.oldPassword && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.oldPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <Label htmlFor="newPassword" className="font-medium">
              New Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-[#1A6FAB]"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? (
                  <EyeIcon className="h-4 w-4" />
                ) : (
                  <EyeOffIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {formik.touched.newPassword && formik.errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" className="font-medium">
              Confirm Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Enter confirm password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-[#1A6FAB] mt-2"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? (
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

        {/* Password Strength Indicator */}
        <div className="flex flex-col gap-1">
          {strength.map((criterion, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {criterion.met ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <XIcon className="h-4 w-4 text-red-500" />
              )}
              <span className={criterion.met ? "text-green-500" : "text-red-500"}>
                {criterion.label}
              </span>
            </div>
          ))}
        </div>

        <Button
          type="submit"
          className="w-full bg-[#1A6FAB] text-white hover:bg-[#1A6FAB]"
        >
          Change Password
        </Button>
        <Button
          type="button"
          onClick={handleCancel}
          className="w-full bg-gray-100 text-gray-700 hover:bg-gray-100 border"
        >
          Cancel
        </Button>
      </form>

      {/* Logout Confirmation Dialog */}
      <AlertDialogBox
        isOpen={isLogoutDialogOpen}
        title="Confirm Logout"
        description="Your password has been changed. Do you want to log out now?"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        submitBtnText="Log Out"
      />
    </>
  );
}