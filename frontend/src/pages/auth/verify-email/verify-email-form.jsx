
// import { cn } from "@/lib/utils";
// import { useNavigate, useLocation } from 'react-router-dom';
// import { toast } from "sonner";
// import apiService from "@/lib/apiService";
// import { AUTH_APIS } from "../config";
// import { useEffect, useState } from "react";
// import Typography from "@/components/ui/typography";

// export function VerifyEmailForm({ className, sethaveEmail, setIsReset, setToken, ...props }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [queryString, setQueryString] = useState();
//   const [isVerifying, setIsVerifying] = useState(true);
//   const [isChecked, setIsChecked] = useState(false)
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const verificationData = {
//       verificationToken: params.get("token"),
//       email: params.get("email"),
//       key: params.get("key"),
//       iv: params.get("iv"),
//     };
//     const formattedQueryString = new URLSearchParams(verificationData).toString();
//     setQueryString(formattedQueryString);
//     const verifyEmail = async () => {
//       try {
//         const response = await apiService.get(`${AUTH_APIS.AUTH_VERIFY_EMAIL}?${formattedQueryString}`);
//         if (response?.code === 201 && response?.status === true) {
//           toast.success(response?.message);
//           setToken(response?.data?.verificationToken);
//           sethaveEmail(response?.data?.emailDecrypted);
//           setIsVerifying(false);
//           setIsReset(true)
//         } else {
//           toast.error(response?.message);
//         }
//       } catch (error) {
//         setIsVerifying(false);
//         setIsReset(true)
//         toast.error(error?.response?.data?.message)

//       }


//     };
//     verifyEmail();

//   }, [location, setToken, setIsReset, sethaveEmail]);

//   return (
//     <div className={cn(className, "flex justify-center items-center")}>
//       {isVerifying ? (
//         <Typography variant="h3">Email is Verifying...</Typography>

//       ) : (
//         <Typography variant="h3">Email verification complete!</Typography>

//       )}
//     </div>
//   );
// }

// export default VerifyEmailForm;




import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";
import apiService from "@/lib/apiService";
import { AUTH_APIS } from "../config";
import { useEffect, useState, useRef } from "react";
import Typography from "@/components/ui/typography";

export function VerifyEmailForm({ className, sethaveEmail, setIsReset, setToken, ...props }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const apiCallMade = useRef(false); // Add a ref to track if API call was made

  useEffect(() => {
    // Only proceed if we haven't made the API call yet
    if (!apiCallMade.current) {
      const params = new URLSearchParams(location.search);
      const verificationData = {
        verificationToken: params.get("token"),
        email: params.get("email"),
        key: params.get("key"),
        iv: params.get("iv"),
      };
      const formattedQueryString = new URLSearchParams(verificationData).toString();
      
      const verifyEmail = async () => {
        apiCallMade.current = true; // Mark that we're making the API call
        try {
          const response = await apiService.get(`${AUTH_APIS.AUTH_VERIFY_EMAIL}?${formattedQueryString}`);
          if (response?.code === 201 && response?.status === true) {
            toast.success(response?.message);
            setToken(response?.data?.verificationToken);
            sethaveEmail(response?.data?.emailDecrypted);
            setIsVerifying(false);
            setIsReset(true);
          } else {
            toast.error(response?.message);
            setIsVerifying(false);
            setIsReset(true);
          }
        } catch (error) {
          setIsVerifying(false);
          setIsReset(true);
          toast.error(error?.response?.data?.message);
        }
      };
      
      verifyEmail();
    }
  }, [location, setToken, setIsReset, sethaveEmail]); // Keep the same dependencies

  return (
    <div className={cn(className, "flex justify-center items-center")}>
      {isVerifying ? (
        <Typography variant="h3">Email is Verifying...</Typography>
      ) : (
        <Typography variant="h3">Email verification complete!</Typography>
      )}
    </div>
  );
}

export default VerifyEmailForm;