import { LoginForm } from "./login-form";
import "./login.css";
import Typography from "@/components/ui/typography";
import IndicatoreSlider from "@/components/ui/Sliders/Sliders";
import logo from "../../../assets/images/blueLogo.png";

export default function LoginPage() {
  return (
    <div className="grid lg:grid-cols-[3fr_2fr] min-h-screen">
      <div className="relative hidden bg-muted lg:block">
        <div className="fixed inset-0 w-3/5">
          <IndicatoreSlider />
        </div>
      </div>
      <div className="overflow-y-auto flex items-center justify-center h-auto">

        <div className="flex flex-col gap-4 py-6 md:p-10">
          <div className="flex items-center mb-5 justify-center gap-2 mr-10">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="flex h-15 w-15 items-center justify-center rounded-md text-primary-foreground">
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
                <Typography variant="h3">Welcome Back!</Typography>
                <Typography variant="p" affects="muted">
                  Login to continue to Easy Padhai
                </Typography>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
