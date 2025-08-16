import { GalleryVerticalEnd } from "lucide-react";

import Typography from "@/components/ui/typography";
import ImageSliderFB from "@/components/ui/image-slider";
import { LOGIN_PAGE_IMAGES } from "../config";
export default function RegisterMessage() {
  return (
    <div className="">
      <div className="flex flex-col  pb-1 mb-4">
                <Typography variant="h3">Thank you </Typography>
                <Typography variant="p" affects="muted">
                for registering with the Uttar Pradesh State Disaster Management Authority (Easy Padhai). To complete your registration and verify your email address.
                </Typography>
              </div>

    </div>
  );
}
