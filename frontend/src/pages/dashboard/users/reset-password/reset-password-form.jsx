import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useEffect } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { useFormik } from "formik";
import * as Yup from "yup";
import apiService from "@/lib/apiService";
import useStore from "@/store";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { AUTH_APIS } from "@/pages/auth/config";

export function ResetPasswordFormAdmin({ className, setIsChangePassword, ...props }) {
  const navigate = useNavigate();
  const { updateBreadcrumb } = useBreadcrumb();
  const { user, setUser, setIsAuthenticated } = useStore();
  const validationSchema = Yup.object({
    oldPassword: Yup.string()
      .required("Current password is required"),
    newPassword: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .required("This field is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], "The passwords you entered don't match, try again")
      .required("This field is required")
  });

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
    validationSchema,
    onSubmit: async (values) => {
      // try {
      //   const requestData = {
      //     email: user?.email,
      //     oldPassword: values.oldPassword,
      //     newPassword: values.newPassword
      //   };

      //   const response = await apiService.post(AUTH_APIS.AUTH_CHANGE_PASSWORD, requestData);

      //   if (response?.code === 200 && response?.status === true) {
      //     toast.success(response?.message || "Password changed successfully");
      //     formik.resetForm();
      //     setUser(null);
      //     setIsAuthenticated(false);
      //     await apiService.post(AUTH_APIS.AUTH_LOGOUT, { _id: user?.id }, {
      //       withCredentials: true
      //     });

      //     if (setIsChangePassword) {
      //       setIsChangePassword(false);
      //     } else {
      //       navigate('/');
      //     }
      //   } else {
      //     toast.error(response?.message);
      //   }
      // } catch (error) {
      //   toast.error(error?.response?.data?.message);
      // }
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

  const strength = checkStrength(formik.values.newPassword);
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
    const percentage = (score / 4) * 100;
    if (percentage === 0) return "w-0";
    if (percentage <= 25) return "w-1/4";
    if (percentage <= 50) return "w-1/2";
    if (percentage <= 75) return "w-3/4";
    return "w-full";
  };


  useEffect(() => {
    const breadcrumbData = [
      { label: "Change Password", href: "" }
    ];
    updateBreadcrumb(breadcrumbData);
  }, []);

  return (
    <form onSubmit={formik.handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="grid gap-4">

        {/* <div className="grid gap-2">
          <Input
            id="oldPassword"
            name="oldPassword"
            placeholder="Enter current password"
            label="Old Password"
            required={true}
            formik={formik}
            {...formik.getFieldProps('oldPassword')}
            type="password"
          />
        </div> */}
        <div className="grid gap-2">
          <Input id="email" type="email"
            placeholder="Enter email"
            label="Email"
            required={true}
            formik={formik}
            name="email"
            {...formik.getFieldProps("email")} />
        </div>

        <div className="grid gap-2">
          <div className="relative grid gap-2">
            <Input
              id="newPassword"
              name="newPassword"
              placeholder="Enter new password"
              label="New Password"
              required={true}
              formik={formik}
              {...formik.getFieldProps('newPassword')}
              type="password"
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
          <Input
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm new password"
            label="Confirm New Password"
            required={true}
            formik={formik}
            type="password"
            {...formik.getFieldProps('confirmPassword')}
          />
        </div>
      </div>
      <Button type="submit" className="w-full cursor-pointer">
        Change Password
      </Button>
      {setIsChangePassword && (
        <Button
          type="button"
          onClick={() => setIsChangePassword(false)}
          className="w-full cursor-pointer bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 transition"
        >
          Cancel
        </Button>
      )}
    </form>
  );
}

export default ResetPasswordFormAdmin;