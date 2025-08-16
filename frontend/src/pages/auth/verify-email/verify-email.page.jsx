import VerifyEmailForm from "./verify-email-form";
import Typography from "@/components/ui/typography";
import SetPasswordForm from "./set-password-form";
import { useState } from "react";
import IndicatoreSlider from "@/components/ui/Sliders/Sliders";
import logo from "../../../assets/images/logo.svg";

export default function VerifyEmailPage() {
  const [isReset, setIsReset] = useState(false)
  const [haveEmail, sethaveEmail] = useState(false)
  const [token, setToken] = useState('')

  return (
    <div className="grid lg:grid-cols-[3fr_2fr] min-h-screen">
      <div className="relative hidden bg-muted lg:block">
        <div className="fixed inset-0 w-3/5">
          <IndicatoreSlider />
        </div>
      </div>
      <div className="overflow-y-auto flex items-center justify-center h-auto">

        <div className="flex flex-col gap-4 py-6 md:p-10">
          <div className="flex items-center mb-5 justify-center gap-2 ">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="flex h-8 w-8 items-center justify-center rounded-md text-primary-foreground">
                <img
                  className="w-100"
                  src={logo}
                  alt="Easy Padhai"
                />
              </div>
              <Typography variant="h3">Easy Padhai</Typography>

            </a>
          </div>
          <div className="flex flex-1 mt-2 items-center justify-center">
            {isReset === false ?
              <div className="w-full max-w-xs">
                <VerifyEmailForm setIsReset={setIsReset} sethaveEmail={sethaveEmail} setToken={setToken} />
              </div> :
              <div className="w-full max-w-xs">
                <div className="flex flex-col  pb-1 mb-4">
                  <Typography variant="h3"> Set Your Password</Typography>
                  <Typography variant="p" affects="muted">
                    Set your password to access your account.
                  </Typography>
                </div>
                <SetPasswordForm email={haveEmail} token={token} />
              </div>}
          </div>
        </div>
      </div>
    </div>
  );
}
