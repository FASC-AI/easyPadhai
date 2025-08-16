import {
  ButtonContainer,
  Container,
  Header,
  Heading,
} from "@/components/AddFormLayout/AddFormLayout";

import {
  uploadIcon,
  imageThumbnail,
  pdfThumbnail,
  spreadSheetThumbnail,
  deleteIcon,
  fileThumbnail,
} from "@/assets/Icons";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/common/CustomSelect";
import { postFileApi } from "@/services/method";
import FormikDocumentUploder from "@/components/inputs/formik/FormikDocumentUploader/FormikDocumentUploader";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { validateMobileNumber, validatePincode } from "@/utils/common.helper";

import { Checkbox } from "@/components/ui/checkbox";
import BreadCrumbs from "@/components/common/BreadCrumbs/BreadCrumbs";
import Button from "@/components/common/Button/Button";
import { BUTTON_TYPES } from "@/constants/common.constant";
import * as Yup from "yup";
import { Field, Formik } from "formik";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getApi, postApi, patchApi } from "@/services/method";
import { APIS } from "@/constants/api.constant";
import "./banner.css";
import { CounterContext } from "@/components/Layout/commonLayout/TitleOfPageProvider";
import ROUTES from "@/constants/route.constant";
import FormikTextField from "@/components/inputs/formik/FormikTextField";
import { SidePanel } from "@/components/AddFormLayout/AddFormLayout";
import { generateRandomString } from "@/lib/utils";
import { DatePickerInput } from "@/components/common/DateTimeInputs/index";
import { CustomSelectById } from "@/components/common/CustomSelect";
import { startSpcaeRemover, validateNumbers } from "@/utils/common.helper";
import { validateAlphabetsfortitle } from "@/utils/common.helper";
import { Phone } from "lucide-react";
import { TextFieldArea } from "@/components/ui/textFieldArea";
import { XIcon } from "lucide-react";

const initialValues = {
  codee: "",
  description: "",
  bannersName: "",
  redirectPath: "", // new field
  imageFile: null,
  previewUrl: "",
  status: "",
  imageUrl: "",
  images: [],
};

const userSchema = Yup.object().shape({
  bannersName: Yup.string().required("Name is required"),
  imageUrl: Yup.string().url("Enter a valid URL"),
});
const Addbanners = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpenn, setModalIsOpenn] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showSubmittedTable, setShowSubmittedTable] = useState(false);
  const [assets, setAssets] = useState([]);
  const [data, setData] = useState(initialValues);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [firstTableFiles, setFirstTableFiles] = useState([]);
  const [secondTableFiles, setSecondTableFiles] = useState([]);
  const [firstNewFiles, setFirstNewFiles] = useState([]);
  const [secondNewFiles, setSecondNewFiles] = useState([]);
  const [bannersName, setbannersName] = useState("");
  const [firstShowSubmittedTable, setFirstShowSubmittedTable] = useState(false);
  const [secondShowSubmittedTable, setSecondShowSubmittedTable] =
    useState(false);
  const [number, setnumber] = useState("");
  const status = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];
  useEffect(() => {
    if (id) {
      setLoading(true);
      getApi(APIS.BANNER, id)
        .then((res) => {
          const editData = res?.data;

          if (editData) {
            // Update the state with fetched data
            setData({
              codee: editData?.codee || "",
              description: editData?.description || "",
              bannersName: editData?.bannersName || "",
              redirectPath: editData?.redirectPath || "",
              status: { value: editData?.status, label: editData?.status },
              imageUrl: editData?.imageUrl || "",
              imageFile: editData?.imageFile || null,
              previewUrl: editData?.previewUrl || "",
              images: editData?.images || [],
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

  const fetchStatusTypes = async (inputValue) => {
    const filteredStatus = status.filter((s) =>
      s.label.toLowerCase().includes((inputValue || "").toLowerCase())
    );

    return {
      results: filteredStatus,
      nextPage: false,
    };
  };

  const bannerTYpe = [
    { id: "Coaching", label: "Coaching" },
    { id: "School", label: "School" },
  ];
  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    console.log("Submitting Data:", values);
    const payload = {
      codee: values.codee,
      description: values.description,
      bannersName: values.bannersName,
      redirectPath: values.redirectPath, // updated
      imageFile: values.imageFile,
      status: values.status?.value || "Active",
      imageUrl: values.imageUrl,
      images: values.images || [],
      isActive: true,
    };

    if (id) {
      patchApi(APIS.BANNER, id, payload)
        .then(() => {
          toast.success("Banner updated successfully");
          navigate(-1);
        })
        .catch((error) => {
          toast.error("Failed to update data");
          console.error(error);
        })
        .finally(() => setSubmitting(false));
    } else {
      postApi(APIS.BANNER, payload)
        .then(() => {
          toast.success("Banner added successfully");
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
        .finally(() => {
          setSubmitting(false);
          setShowSubmittedTable;
        });
    }
  };

  const handleImageChange = async (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Create a preview URL for the selected file
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);

        // Create FormData for file upload
        const formData = new FormData();
        formData.append("image", file);

        // Upload the image
        const response = await postFileApi(APIS.UPLOAD_IMAGE, formData);

        if (response?.data?.url) {
          // Store both the URL and the file
          setFieldValue("imageUrl", response.data.url);
          setFieldValue("imageFile", file);

          // Also store the preview URL temporarily
          setFieldValue("previewUrl", previewUrl);
        }
      } catch (error) {
        toast.error("Failed to upload image");
        console.error("Image upload error:", error);
      }
    }
  };

  const handleRemoveImage = (setFieldValue) => {
    setFieldValue("imageFile", null);
    setFieldValue("imageUrl", "");
    setFieldValue("previewUrl", "");
    setPreviewImage(null);
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
        console.log(values, "............");
        return (
          <Container>
            <div className="">
              <>
                <Header>
                  <div>
                    <BreadCrumbs
                      backNavi={() => navigate("/banner/list")}
                      breadCrumbs={[
                        {
                          name: "Banner",
                          path: ROUTES.BANNER_LIST,
                        },
                      ]}
                      boldItem={id ? "Edit Banner" : "Add Banner"}
                    />
                    <Heading>{id ? "Edit" : "Add"} Banner </Heading>
                  </div>
                  <ButtonContainer>
                    <Button
                      type={BUTTON_TYPES.SECONDARY}
                      className=" bg-white boder border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white mr-1"
                      onClick={() => navigate(-1)}
                      disabled={isSubmitting}
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
                      <SidePanel title={`Banner Information`} />
                      <div className="add-v-form-right-section">
                        <div className="add-v-form-section">
                          <div className="group-type-3-equal mt-3">
                            {/* <div className="flex-1 w-100">
                                                           <FormikTextField
                                                            label="Code"
                                                            placeholder="Enter Code"
                                                            name="codee"
                                                            isRequired
                                                            disabled={!!id} // disable if editing
                                                            onChange={(e) => {
                                                              let value = e.target.value.toUpperCase(); // ensure uppercase
                                                              setFieldValue("codee", startSpcaeRemover(value));
                                                            }}
                                                          />
                                                        </div> */}
                            <div className="flex-1 w-100">
                              <FormikTextField
                                label="Name"
                                placeholder="Enter Name"
                                name="bannersName"
                                isRequired
                                value={values.bannersName}
                                onChange={(e) =>
                                  validateAlphabetsfortitle(
                                    e,
                                    setFieldValue,
                                    "bannersName"
                                  )
                                }
                              />
                            </div>
                            <div className="flex-1 w-100">
                              <FormikTextField
                                label="Image URL"
                                placeholder="Enter image URL"
                                name="imageUrl"
                                value={values.imageUrl}
                                onChange={(e) =>
                                  setFieldValue("imageUrl", e.target.value)
                                }
                              />
                              {values.imageUrl && !errors.imageUrl && (
                                <a
                                  className="text-[12px]"
                                  href={values.imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "block",
                                    marginTop: "8px",
                                    color: "#007bff",
                                  }}
                                >
                                  {values.imageUrl}
                                </a>
                              )}
                            </div>
                            {/* <div className="flex-1 w-100">
                              <CustomSelect
                                refetch={values?.status}
                                useFormik={true}
                                name="status"
                                label="Status"
                                fetchData={fetchStatusTypes}
                                // defaultValue={values?.status}
                                defaultValue={values?.status || status[0]}
                                onChange={(values) => setFieldValue('status', values || status[0])}

                                selectProps={{
                                  placeholder: 'Select',
                                  isClearable: true,


                                }}
                              />
                            </div> */}
                          </div>
                          {/* <div className="group-type-3-equal">
                            <div className="flex-1 w-100">
                              <FormikTextField
                                label="Path URL"
                                placeholder="Enter Path URL"
                                name="redirectPath"
                                isRequired
                                value={values.redirectPath}
                                onChange={(e) => setFieldValue('redirectPath', e.target.value)}
                              />
                            </div>
                            <div className="flex-1 w-100">
                              <div className="flex-1 w-100">
                                <FormikTextField
                                  label="Image URL"
                                  placeholder="Enter Image URL"
                                  name="imageUrl"
                                
                                  value={values.imageUrl}
                                  onChange={(e) => setFieldValue('imageUrl', e.target.value)}
                                />
                              </div>  </div>
                          </div> */}

                          <div className="group-type-1 mt-2">
                            <div>
                              <label className="upload-wrap border ">
                                <FormikDocumentUploder
                                  name="images"
                                  id="banner-images"
                                  title="Upload Banner Images"
                                  message="or drag & drop banner image files here"
                                  btnText="BROWSE FILE"
                                  bottomMessage="Supported File Format: jpeg, png (upto 1 MB)"
                                  accept="image/*"
                                />
                              </label>
                            </div>
                          </div>
                          {/* <div className="group-type-1">
                                                   <div className="flex-1 w-100">
                                                     <div className="to-input-field">
                                                       <TextFieldArea
                                                         className="to-label c-black"
                                                         as="textarea"
                                                         name="description"
                                  label="Banner Description"
                                                         charLimit={1000}
                                                         rows={5}
                                                         placeholder="Enter description"
                                                         value={values.description}
                                                         onChange={(e) =>
                                    validateAlphabetsfortitle(e, setFieldValue, 'description')
                                                         }
                                                         style={{
                                                           border: '1px solid #ccc',
                                                           borderRadius: '4px',
                                                           padding: '8px',
                                                           width: '100%',
                                                           height: '100px',
                                                           transition: 'border-color 0.2s ease-in-out',
                                                           outline: 'none',
                                                           resize: 'none',
                                                         }}
                                                       />
                                                     </div>
                                                   </div>
                                                 </div> */}
                        </div>
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

export default Addbanners;
