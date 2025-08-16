import RegistrationForm from "./registration-form";
import Typography from "@/components/ui/typography";
import { useState } from "react";
import IndicatoreSlider from "@/components/ui/Sliders/Sliders";
import logo from "../../../assets/images/logo.svg";

export default function RegistrationPage() {
  const [isRegister, setIsRegister] = useState(false)
  return (
    <div className="grid lg:grid-cols-[3fr_2fr] min-h-screen">
      <div className="relative hidden bg-muted lg:block">
        <div className="fixed inset-0 w-3/5">
          <IndicatoreSlider />
        </div>
      </div>
      {isRegister === false ?
        <div className="overflow-y-auto flex items-center justify-center h-auto">
          <div className="flex flex-col gap-3 py-6 md:p-10">
            <div className="flex items-center mb-5 justify-center gap-2">
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
              <div className="w-full max-w-xs">
                <div className="flex flex-col  pb-1 mb-4">
                  <Typography variant="h3">Join Easy Padhai Today!</Typography>
                  <Typography variant="p" affects="muted">
                    Start your journey towards disaster preparedness and safety.
                  </Typography>
                </div>
                <RegistrationForm setIsRegister={setIsRegister} />

              </div>
            </div>
          </div>
        </div> :

        <div className="overflow-y-auto flex items-center justify-center h-auto">

          <div className="flex flex-col gap-4 py-6 md:p-10">
            <div className="flex items-center mb-5 justify-center gap-2 ">
              <a href="#" className="flex items-center gap-2 font-medium">
                <div className="flex h-8 w-8 items-center justify-center rounded-md text-primary-foreground">
                  <img
                    className="w-100"
                    src={logo}
                    alt="logo.svg"
                  />
                </div>
                <Typography variant="h3">Easy Padhai</Typography>

              </a>
            </div>
            <div className="flex flex-1  items-center justify-center">
              <div className="w-full max-w-xs">
                <div className="flex flex-col items-center justify-center  pb-1 mb-4">
                  <Typography variant="h3">Thank you for signing up!</Typography>
                  <Typography variant="p" affects="muted"
                  >
                    <div className="text-justify
">
                    We've sent a verification link to your registered email address. Please verify your account and set your password to complete the process.
                    </div>
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>}
    </div>
  );
}
