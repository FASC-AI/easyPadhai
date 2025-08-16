import ForgotPasswordForm from "./forgot-pass-form";
import Typography from "@/components/ui/typography";
import { useState } from "react";
import ResetPasswordForm from "./reset-password-form";
import IndicatoreSlider from "@/components/ui/Sliders/Sliders";
import logo from "../../../assets/images/blueLogo.png";

export default function ForgotPassPage() {
  const [isReset, setIsReset] = useState(false);
  const [haveEmail, sethaveEmail] = useState(false);
  const [token, setToken] = useState('');

  return (
    <div className="grid lg:grid-cols-[3fr_2fr] min-h-screen">
      <div className="relative hidden bg-muted lg:block">
        <div className="fixed inset-0 w-3/5">
          <IndicatoreSlider />
        </div>
      </div>
      <div className="overflow-y-auto h-auto flex items-center justify-center">
        <div className="flex flex-col gap-4 py-6 md:p-10">
          <div className="flex items-center justify-center mb-5 gap-2 mr-10">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="flex size-12 items-center justify-center rounded-md text-primary-foreground">
                <img
                  className="object-contain"
                  src={logo}
                  alt="Easy Padhai"
                />
              </div>
              <Typography variant="h3" className="">
                Easy Padhai
              </Typography>
            </a>
          </div>
          <div className="flex flex-1 mt-2 items-center justify-center">
            {isReset === false ? (
              <div className="w-full max-w-xs">
                <div className="flex flex-col pb-1 mb-4">
                  <Typography variant="h3" className="">
                    Forgot Your Password?
                  </Typography>
                  <Typography variant="p" affects="muted">
                    No worries! Enter your registered email to reset your password.
                  </Typography>
                </div>
                <ForgotPasswordForm
                  setIsReset={setIsReset}
                  sethaveEmail={sethaveEmail}
                  setToken={setToken}
                />
              </div>
            ) : (
              <div className="w-full max-w-xs">
                <div className="flex flex-col pb-1 mb-4">
                  <Typography variant="h3" className="text-[#1A6FAB]">
                    Reset Your Password
                  </Typography>
                  <Typography variant="p" affects="muted">
                    Set up a strong password to secure your account.
                  </Typography>
                </div>
                <ResetPasswordForm
                  email={haveEmail}
                  token={token}
                  setIsReset={setIsReset}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}