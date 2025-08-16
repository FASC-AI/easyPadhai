import { Formik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  ButtonContainer,
  Container,
  Header,
  Heading,
} from "@/components/AddFormLayout/AddFormLayout";
import { BUTTON_TYPES } from "@/constants/common.constant";
import Button from "@/components/common/Button/Button";
import FormikTextField from "@/components/inputs/formik/FormikTextField";
import BreadCrumbs from "@/components/common/BreadCrumbs/BreadCrumbs";
import ROUTES from "@/constants/route.constant";
import { getApi, postApi, patchApi } from "@/services/method";
import { APIS } from "@/constants/api.constant";
import { SidePanel } from "@/components/AddFormLayout/AddFormLayout";
import * as Yup from "yup";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { startSpcaeRemover } from "@/utils/common.helper";
import { TextFieldArea } from "@/components/ui/textFieldArea";
import "./subject.css";
import {
  validateNumbers,
  validateAlphabetsfortitle,
} from "@/utils/common.helper";
const initialValues = {
  description: "",

  nameEn: "",
};
const userSchema = Yup.object().shape({
  nameEn: Yup.string().required("Name is required"),
});
const AddClass = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [existingCodes, setExistingCodes] = useState([]);

  useEffect(() => {
    const breadcrumbData = [{ label: "Class" }];
    updateBreadcrumb(breadcrumbData);
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getApi(APIS.CLASS, id)
        .then((res) => {
          const editData = res?.data;

          if (editData) {
            // Update the state with fetched data

            setData({
              nameEn: editData?.nameEn || "",

              description: editData?.description || "",
            });
          } else {
            toast.error("No data found for the provided ID");
          }
        })
        .catch((error) => {
          console.error("Error fetching data for editing:", error);
          toast.error("Failed to load data");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    // Check if code already exists (only for new entries)

    console.log("Submitting Data:", values);
    const payload = {
      description: values.description,
      nameEn: values.nameEn,
      isActive: true,
    };

    if (id) {
      patchApi(APIS.CLASS, id, payload)
        .then(() => {
          toast.success("Class updated successfully");
          navigate(-1);
        })
        .catch((error) => {
          toast.error("Failed to update class. Please try again.");
          console.error(error);
        })
        .finally(() => setSubmitting(false));
    } else {
      postApi(APIS.CLASS, payload)
        .then(() => {
          toast.success("Class added successfully!");
          if (values?.saveAndNew) {
            resetForm();
            setData(initialValues);
            setTimeout(() => {
              window.location.reload();
            }, 200);
          } else {
            navigate(-1);
          }
        })
        .catch((error) => {
          if (error.response?.data?.message?.includes("duplicate")) {
            console.log(
              error.response?.data?.message,
              "error.response?.data?.message?."
            );

            toast.error(
              "This class code already exists in the system. Please use a different code.",
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              }
            );
          } else {
            toast.error("Failed to create class. Please try again.", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={data}
      validationSchema={userSchema}
      onSubmit={handleSubmit}
    >
      {({
        isSubmitting,
        values,
        errors,
        setFieldValue,
        handleSubmit: formikSubmit,
      }) => {
        console.error("Error fetching data for editing:", errors);

        return (
          <Container>
            <div className="mb-4">
              <>
                <Header>
                  <div>
                    <BreadCrumbs
                      backNavi={() => navigate("/class/list")}
                      breadCrumbs={[
                        {
                          name: "Class",
                          path: ROUTES.CLASS_LIST,
                        },
                      ]}
                      boldItem={id ? "Editclass" : "Add Class"}
                    />
                    <Heading className=" ">
                      {id ? "Edit" : "Add"} Class{" "}
                    </Heading>
                  </div>
                  <ButtonContainer>
                    <Button
                      type={BUTTON_TYPES.SECONDARY}
                      onClick={() => navigate(ROUTES.CLASS_LIST)}
                      disabled={isSubmitting}
                      className=" bg-white boder border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white mr-1"
                    >
                      Cancel
                    </Button>
                    {!id && (
                      <Button
                        type={BUTTON_TYPES.SECONDARY}
                        className=" bg-white boder border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white mr-1"
                        onClick={() => {
                          values.saveAndNew = true;
                          formikSubmit();
                        }}
                        disabled={isSubmitting && values?.saveAndNew === true}
                      >
                        Save & Add New
                      </Button>
                    )}

                    <Button
                      type={BUTTON_TYPES.PRIMARY}
                      //   onClick={formikSubmit}
                      className="bg-[#1A6FAB] text-white hover:bg-[#1A6FAB] hover:text-white"
                      onClick={() => {
                        values.saveAndNew = false;
                        formikSubmit();
                      }}
                      loading={isSubmitting && !values?.saveAndNew}
                    >
                      {id ? "Update" : "Save"}
                    </Button>
                  </ButtonContainer>{" "}
                </Header>

                <div
                  className="add-v-form"
                  style={{ padding: "20px", justifyContent: "center" }}
                >
                  <div className="width90">
                    <div className="section-shadow w100">
                      <SidePanel title={`Basic Information`} />
                      <div className="add-v-form-right-section">
                        <div className="add-v-form-section">
                          <div className="group-type-3-equal mt-2">
                            <div className="flex-1 w-100">
                              <FormikTextField
                                label="Name"
                                placeholder="Enter name"
                                name="nameEn"
                                isRequired
                                onChange={(e) => {
                                  let value = e.target.value;
                                  setFieldValue(
                                    "nameEn",
                                    startSpcaeRemover(value)
                                  );
                                  //  validateNumbers(e, setFieldValue, 'averageDate')
                                }}
                              />
                            </div>
                          </div>
                        </div>{" "}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            </div>
          </Container>
        );
      }}
    </Formik>
  );
};

export default AddClass;
