import {
  ButtonContainer,
  Container,
  Header,
  Heading,
} from "@/components/AddFormLayout/AddFormLayout";
import { useEffect, useState } from "react";
import Button from "@/components/common/Button/Button";
import { BUTTON_TYPES } from "@/constants/common.constant";
import * as Yup from "yup";
import { Formik } from "formik";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApi, postApi, patchApi } from "@/services/method";
import { APIS } from "@/constants/api.constant";
import ROUTES from "@/constants/route.constant";
import FormikTextField from "@/components/inputs/formik/FormikTextField";
import { SidePanel } from "@/components/AddFormLayout/AddFormLayout";
import { Rocket } from "lucide-react";
import { useContext } from "react";
import { CounterContext } from "@/components/Layout/commonLayout/TitleOfPageProvider";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";

const validateMobileNumber = (value) => {
  if (!value || typeof value !== "string") return false;
  return /^[0-9]{10}$/.test(value.trim());
};

const initialValues = {
  teacherWhatsapp: "",
  studentWhatsapp: "",
};

const validationSchema = Yup.object().shape({
  teacherWhatsapp: Yup.string()
    .required("Teacher whatsapp number is required")
    .test("valid-mobile", "Must be exactly 10 digits", validateMobileNumber),
  studentWhatsapp: Yup.string()
    .required("Student whatsapp number is required")
    .test("valid-mobile", "Must be exactly 10 digits", validateMobileNumber),
});

const AddWhatsapp = () => {
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(true);
  const [existingId, setExistingId] = useState(null);
  const { updateBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    const breadcrumbData = [{ label: "WhatsApp" }];
    updateBreadcrumb(breadcrumbData);
  }, []);

  useEffect(() => {
    const fetchWhatsappData = async () => {
      try {
        const res = await getApi(APIS.WHATSAPP);

        // Handle both array and single object responses
        const whatsappData = Array.isArray(res?.data) ? res.data[0] : res?.data;

        if (whatsappData) {
          setInitialData({
            teacherWhatsapp: whatsappData.teacherWhatsapp || "",
            studentWhatsapp: whatsappData.studentWhatsapp || "",
          });
          // Ensure we get the ID as a string
          const id = whatsappData.id || whatsappData._id;
          if (id) setExistingId(String(id));
        }
      } catch (error) {
        console.error("Error fetching WhatsApp data:", error);
        toast.error("Failed to load WhatsApp data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWhatsappData();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        teacherWhatsapp: values.teacherWhatsapp,
        studentWhatsapp: values.studentWhatsapp,
        isActive: true,
      };

      if (existingId) {
        const id = existingId;
        patchApi(APIS.WHATSAPP, id, payload);
        toast.success("WhatsApp numbers updated successfully");
      } else {
        const createUrl = `${APIS.WHATSAPP}`;
        await postApi(createUrl, payload);
        toast.success("New WhatsApp numbers saved successfully");
        window.location.reload(true);
      }
      navigate(ROUTES.WHATSAPP_LIST);
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Failed to ${existingId ? "update" : "save"} data`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNumericInput = (e) => {
    // Allow only numbers and enforce max 10 digits
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    e.target.value = value;
  };

  const handlePaste = (e) => {
    // Prevent pasting non-numeric content
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 10);
    e.preventDefault();
    e.target.value = pastedData;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Formik
      initialValues={initialData}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, handleSubmit, values, setFieldValue }) => (
        <Container>
          <div>
            <Header>
              <Heading>WhatsApp</Heading>
              <ButtonContainer>
                <Button
                  type={BUTTON_TYPES.PRIMARY}
                  className="bg-[#1A6FAB] text-white hover:bg-[#1A6FAB] hover:text-white"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                >
                  {existingId ? "Update" : "Save"}
                </Button>
              </ButtonContainer>
            </Header>

            <div
              className="add-v-form"
              style={{ padding: "20px", justifyContent: "center" }}
            >
              <div className="width90">
                <div className="section-shadow w100">
                  <SidePanel title="WhatsApp Information" />
                  <div className="add-v-form-right-section">
                    <div className="add-v-form-section">
                      <div className="group-type-3-equal mt-3">
                        <div className="flex-1 w-100">
                          <FormikTextField
                            label="Teacher WhatsApp Number"
                            placeholder="Enter teacher whatsapp number"
                            name="teacherWhatsapp"
                            isRequired
                            value={values.teacherWhatsapp}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/[^0-9]/g, "")
                                .slice(0, 10);
                              setFieldValue("teacherWhatsapp", value);
                            }}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={10}
                          />
                        </div>
                        <div className="flex-1 w-100">
                          <FormikTextField
                            label="Student WhatsApp Number"
                            placeholder="Enter student WhatsApp number"
                            name="studentWhatsapp"
                            isRequired
                            value={values.studentWhatsapp}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/[^0-9]/g, "")
                                .slice(0, 10);
                              setFieldValue("studentWhatsapp", value);
                            }}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={10}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      )}
    </Formik>
  );
};

export default AddWhatsapp;
