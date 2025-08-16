import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AUTH_APIS } from "../config";
import apiService from "@/lib/apiService";
import AutoSelectDropdown from "@/components/ui/auto-search-dropdown";
import { VALIDATIONS } from "@/components/validation-messages/validation-messages";
import { useLoader } from "@/components/ui/loader/screen-loader";
const hindiNames = {
  agra: "आगरा",
  aligarh: "अलीगढ़",
  prayagraj: "प्रयागराज",
  ambedkar_nagar: "अम्बेडकर नगर",
  amethi: "अमेठी",
  amroha: "अमरोहा",
  auraiya: "औरैया",
  azamgarh: "आज़मगढ़",
  baghpat: "बागपत",
  bahraich: "बहराइच",
  ballia: "बलिया",
  balrampur: "बलरामपुर",
  banda: "बांदा",
  barabanki: "बाराबंकी",
  bareilly: "बरेली",
  basti: "बस्ती",
  bijnor: "बिजनौर",
  bhadohi: "भदोही",
  bulandshahr: "बुलंदशहर",
  chandauli: "चंदौली",
  chitrakoot: "चित्रकूट",
  deoria: "देवरिया",
  etah: "एटा",
  etawah: "इटावा",
  ayodhya: "अयोध्या",
  farrukhabad: "फर्रुखाबाद",
  fatehpur: "फतेहपुर",
  firozabad: "फिरोजाबाद",
  gautam_buddha_nagar: "गौतम बुद्ध नगर",
  ghaziabad: "गाज़ियाबाद",
  ghazipur: "गाज़ीपुर",
  gonda: "गोंडा",
  gorakhpur: "गोरखपुर",
  hamirpur: "हमीरपुर",
  hapur: "हापुड़",
  hardoi: "हरदोई",
  hathras: "हाथरस",
  jalaun: "जालौन",
  jaunpur: "जौनपुर",
  jhansi: "झांसी",
  kannauj: "कन्नौज",
  kanpur_dehat: "कानपुर देहात",
  kanpur_nagar: "कानपुर नगर",
  kasganj: "कासगंज",
  kaushambi: "कौशाम्बी",
  kushinagar: "कुशीनगर",
  lakhimpur_kheri: "लखीमपुर खीरी",
  lalitpur: "ललितपुर",
  lucknow: "लखनऊ",
  maharajganj: "महाराजगंज",
  mahoba: "महोबा",
  mainpuri: "मैनपुरी",
  mathura: "मथुरा",
  mau: "मऊ",
  meerut: "मेरठ",
  mirzapur: "मिर्ज़ापुर",
  moradabad: "मुरादाबाद",
  muzaffarnagar: "मुज़फ्फरनगर",
  pilibhit: "पीलीभीत",
  pratapgarh: "प्रतापगढ़",
  rae_bareli: "रायबरेली",
  rampur: "रामपुर",
  saharanpur: "सहारनपुर",
  sant_kabir_nagar: "संत कबीर नगर",
  sant_ravidas_nagar: "संत रविदास नगर",
  shahjahanpur: "शाहजहांपुर",
  shamli: "शामली",
  shrawasti: "श्रावस्ती",
  siddharthnagar: "सिद्धार्थनगर",
  sitapur: "सीतापुर",
  sonbhadra: "सोनभद्र",
  sultanpur: "सुल्तानपुर",
  unnao: "उन्नाव",
  varanasi: "वाराणसी",
};

function createDistrictJsonWithHindi() {
  const districts = [
    { value: "agra", label: "Agra" },
    { value: "aligarh", label: "Aligarh" },
    { value: "prayagraj", label: "Prayagraj" },
    { value: "ambedkar_nagar", label: "Ambedkar Nagar" },
    { value: "amethi", label: "Amethi" },
    { value: "amroha", label: "Amroha" },
    { value: "auraiya", label: "Auraiya" },
    { value: "azamgarh", label: "Azamgarh" },
    { value: "baghpat", label: "Baghpat" },
    { value: "bahraich", label: "Bahraich" },
    { value: "ballia", label: "Ballia" },
    { value: "balrampur", label: "Balrampur" },
    { value: "banda", label: "Banda" },
    { value: "barabanki", label: "Barabanki" },
    { value: "bareilly", label: "Bareilly" },
    { value: "basti", label: "Basti" },
    { value: "bijnor", label: "Bijnor" },
    { value: "bhadohi", label: "Bhadohi" },
    { value: "bulandshahr", label: "Bulandshahr" },
    { value: "chandauli", label: "Chandauli" },
    { value: "chitrakoot", label: "Chitrakoot" },
    { value: "deoria", label: "Deoria" },
    { value: "etah", label: "Etah" },
    { value: "etawah", label: "Etawah" },
    { value: "ayodhya", label: "Ayodhya (Faizabad)" },
    { value: "farrukhabad", label: "Farrukhabad" },
    { value: "fatehpur", label: "Fatehpur" },
    { value: "firozabad", label: "Firozabad" },
    { value: "gautam_buddha_nagar", label: "Gautam Buddha Nagar" },
    { value: "ghaziabad", label: "Ghaziabad" },
    { value: "ghazipur", label: "Ghazipur" },
    { value: "gonda", label: "Gonda" },
    { value: "gorakhpur", label: "Gorakhpur" },
    { value: "hamirpur", label: "Hamirpur" },
    { value: "hapur", label: "Hapur" },
    { value: "hardoi", label: "Hardoi" },
    { value: "hathras", label: "Hathras" },
    { value: "jalaun", label: "Jalaun" },
    { value: "jaunpur", label: "Jaunpur" },
    { value: "jhansi", label: "Jhansi" },
    { value: "kannauj", label: "Kannauj" },
    { value: "kanpur_dehat", label: "Kanpur Dehat" },
    { value: "kanpur_nagar", label: "Kanpur Nagar" },
    { value: "kasganj", label: "Kasganj" },
    { value: "kaushambi", label: "Kaushambi" },
    { value: "kushinagar", label: "Kushinagar" },
    { value: "lakhimpur_kheri", label: "Lakhimpur Kheri" },
    { value: "lalitpur", label: "Lalitpur" },
    { value: "lucknow", label: "Lucknow" },
    { value: "maharajganj", label: "Maharajganj" },
    { value: "mahoba", label: "Mahoba" },
    { value: "mainpuri", label: "Mainpuri" },
    { value: "mathura", label: "Mathura" },
    { value: "mau", label: "Mau" },
    { value: "meerut", label: "Meerut" },
    { value: "mirzapur", label: "Mirzapur" },
    { value: "moradabad", label: "Moradabad" },
    { value: "muzaffarnagar", label: "Muzaffarnagar" },
    { value: "pilibhit", label: "Pilibhit" },
    { value: "pratapgarh", label: "Pratapgarh" },
    { value: "rae_bareli", label: "Rae Bareli" },
    { value: "rampur", label: "Rampur" },
    { value: "saharanpur", label: "Saharanpur" },
    { value: "sant_kabir_nagar", label: "Sant Kabir Nagar" },
    { value: "sant_ravidas_nagar", label: "Sant Ravidas Nagar (Bhadohi)" },
    { value: "shahjahanpur", label: "Shahjahanpur" },
    { value: "shamli", label: "Shamli" },
    { value: "shrawasti", label: "Shrawasti" },
    { value: "siddharthnagar", label: "Siddharthnagar" },
    { value: "sitapur", label: "Sitapur" },
    { value: "sonbhadra", label: "Sonbhadra" },
    { value: "sultanpur", label: "Sultanpur" },
    { value: "unnao", label: "Unnao" },
    { value: "varanasi", label: "Varanasi" },
  ];

  return districts.map((district) => {
    const hindiName = hindiNames[district.value] || "";

    if (hindiName) {
      return {
        value: district.value,
        label: `${district.label} (${hindiName})`,
      };
    }

    return district;
  });
}
export function RegistrationForm({ className, setIsRegister, ...props }) {
  const [isReCaptcha, setIsReCaptcha] = useState(false);
  const { toggleOverlay } = useLoader();
  const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_KEY;
  const navigate = useNavigate();
  const frameworks = createDistrictJsonWithHindi();
  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .matches(/^[A-Za-z\s]+$/, "Name contains alphabet only")
      .min(2, "Name must be valid")
      .required("This field is required"),
    email: VALIDATIONS.customEmailValidation,
    mobile: Yup.string()
      .matches(/^\d{10}$/, "Invalid mobile number")
      .required("This field is required"),
    // district: Yup.string().required("This field is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      mobile: "",
      district: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!isReCaptcha) {
        toast.error("Verify the captcha that you are not a robot");
        return;
      }

      toggleOverlay(true);
      try {
        const userData = {
          name: { english: values.name },
          email: values.email,
          mobile: values.mobile,
          district: values.district,
        };
        const response = await apiService.post(
          AUTH_APIS.AUTH_REGISTRATION_PAGE,
          userData
        );

        if (response?.code === 201 && response?.status === true) {
          toast.success(response?.message);
          formik.resetForm();
          setIsReCaptcha(false);
          setIsRegister(true);
          toggleOverlay(false);
        } else {
          toast.error(response?.message);
          toggleOverlay(false);
        }
      } catch (error) {
        toggleOverlay(false);
        toast.error(error?.response?.data?.message);
      }
    },
  });

  const handleCaptchaChange = (token) => {
    setIsReCaptcha(!!token);
  };

  const handleCaptchaExpire = () => {
    setIsReCaptcha(false);
    toast.warning("Captcha expired, please verify again.");
  };

  return (
    <form
      onSubmit={formik.handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          {/* <AutoSelectDropdown
            required={true}
            options={frameworks}
            label="Select District"
            name="district"
            formik={formik}
            placeholder="Select"
          /> */}

          <Input
            id="name"
            name="name"
            label="Name"
            required={true}
            caseType="title"
            type="text"
            formik={formik}
            placeholder="Enter name"
            {...formik.getFieldProps("name")}
          />
        </div>

        <div className="grid gap-2">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            formik={formik}
            required={true}
            placeholder="Enter email"
            {...formik.getFieldProps("email")}
          />
        </div>

        <div className="grid gap-2">
          <Input
            id="mobile"
            name="mobile"
            placeholder="Enter mobile number"
            type="tel"
            label="Mobile Number"
            inputMode="numeric"
            required={true}
            pattern="[0-9]*"
            formik={formik}
            onInput={(e) =>
              (e.target.value = e.target.value.replace(/\D/g, ""))
            }
            {...formik.getFieldProps("mobile")}
          />
        </div>
      </div>

      <ReCAPTCHA
        sitekey={RECAPTCHA_KEY}
        onChange={handleCaptchaChange}
        onExpired={handleCaptchaExpire}
      />

      <Button
        type="submit"
        className="w-full cursor-pointer"
        disabled={formik.isSubmitting}
      >
        {formik.isSubmitting ? " Sign Up" : "Sign Up"}
      </Button>

      <div className="text-gray-600 text-center text-sm">
        Already have an account?{" "}
        <Link
          to={`/`}
          className="text-black hover:text-black-600 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300"
        >
          Login
        </Link>
      </div>
    </form>
  );
}

export default RegistrationForm;
