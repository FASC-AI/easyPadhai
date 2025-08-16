import Typography from "@/components/ui/typography";
import ResetPasswordFormAdmin from "./reset-password-form";
import { useLocation } from 'react-router-dom';

export default function ResetPasswordPage() {
  const location=useLocation()
  console.log('location',location.state)
  return (
    <div className="bg-white mx-4 mt-2 h-[calc(100vh-80px)] px-4 pt-4">

      <div className="flex flex-col gap-4 py-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex flex-col  pb-1 mb-4">
              <Typography variant="h3"> Reset Password for User</Typography>
              {/* <Typography variant="p" affects="muted">
                Enter a new password to  access to your account.
              </Typography> */}
            </div>
            <ResetPasswordFormAdmin />
          </div>
        </div>
      </div>
    </div>

  );
}
