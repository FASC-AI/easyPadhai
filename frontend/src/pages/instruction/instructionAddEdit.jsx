import {
  ButtonContainer,
  Container,
  Header,
  Heading,
  SidePanel,
} from "@/components/AddFormLayout/AddFormLayout";
import MultipleSelector from "@/components/common/CustomSelect/multiSelector";
import { Label } from "@/components/ui/label";
import { validateAlphabetsfortitle } from "@/utils/common.helper";
import BreadCrumbs from "@/components/common/BreadCrumbs/BreadCrumbs";
import Button from "@/components/common/Button/Button";
import { BUTTON_TYPES } from "@/constants/common.constant";
import * as Yup from "yup";
import { Formik } from "formik";
import { useEffect, useState, Component } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getApi, postApi, patchApi } from "@/services/method";
import { APIS } from "@/constants/api.constant";
import ROUTES from "@/constants/route.constant";
import FormikTextField from "@/components/inputs/formik/FormikTextField";
import Select, { components } from "react-select";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import EditorField from "@/components/Editor/Editor";

// Utility to strip HTML tags and get plain text for character counting
const stripHTML = (html) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown size={18} />
    </components.DropdownIndicator>
  );
};

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className="text-red-500 text-xs mt-1">
          Something went wrong with the editor. Please try again.
        </p>
      );
    }
    return this.props.children;
  }
}

// Initial form values
const initialValues = {
  InstructionsName: "",
  type: "",
  classes: [],
  subjects: [],
  description: "",
  hindi: "",
};

// Yup validation schema
const userSchema = Yup.object().shape({
  InstructionsName: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  type: Yup.string().required("Type is required"),
  classes: Yup.array()
    .min(1, "Class is required")
    .required("Class is required"),
  subjects: Yup.array()
    .min(1, "Subject is required")
    .required("Subject is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters if provided")
    .test(
      "no-only-whitespace",
      "Description cannot contain only whitespace",
      (value) => !value || value.trim().length > 0
    ),
  hindi: Yup.string()
    .min(10, "Hindi must be at least 10 characters if provided")
    .test(
      "no-only-whitespace",
      "Hindi content cannot contain only whitespace",
      (value) => !value || value.trim().length > 0
    ),
});

// Select component styles
const customStyles = {
  menu: (provided) => ({
    ...provided,
    zIndex: 99999,
    position: "absolute",
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: "120px",
    overflowY: "auto",
    "::-webkit-scrollbar": {
      width: "4px",
    },
    "::-webkit-scrollbar-thumb": {
      background: "#1A6FAB",
      borderRadius: "4px",
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "#555",
    },
  }),
  control: (provided) => ({
    ...provided,
    padding: 0,
    minHeight: "auto",
    maxHeight: "150px",
    overflowY: "auto",
    fontSize: "12px",
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    paddingRight: "10px",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#aaa",
    padding: "4px",
  }),
  option: (provided) => ({
    ...provided,
    fontSize: "12px",
  }),
  placeholder: (provided) => ({
    ...provided,
    fontSize: "12px",
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: "12px",
  }),
};

// Options for type
const instructionTypeOptions = [
  { value: "Online Test", label: "Online Test" },
  { value: "Offline Test", label: "Offline Test" },
];

const uploadImageCallBack = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ data: { link: reader.result } });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const AddInstructions = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState(initialValues);
  const [selected, setSelected] = useState([]);
  const [selectedd, setSelectedd] = useState([]);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [hindiLength, setHindiLength] = useState(0);

  // Fetch classes from API
  const handleSearch = async (query = "") => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/class/list`,
        {
          params: { search: query },
        }
      );
      const classes = response.data?.data?.Classes || [];
      return classes
        .filter((item) => item.isActive)
        .map((item) => ({
          value: item._id,
          label: item.nameEn,
        }));
    } catch (error) {
      console.error("Error fetching class list:", error);
      return [];
    }
  };

  // Fetch subjects from API
  const handleSearchh = async (query = "") => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/subject/list`,
        {
          params: { search: query },
        }
      );
      const subjects = response.data?.data?.subject || [];
      return subjects
        .filter((item) => item.isActive)
        .map((item) => ({
          value: item._id,
          label: item.nameEn,
        }));
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }
  };

  // Fetch data for editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      getApi(APIS.INSTRUCTION, id)
        .then((res) => {
          const editData = res?.data;
          if (editData) {
            // Prepare the data to match Formik initial values
            const formattedData = {
              InstructionsName: editData.InstructionsName || "",
              type: editData.type || "",
              classes: editData.classes || [],
              subjects: editData.subjects || [],
              description: editData.description || "",
              hindi: editData.hindi || "",
            };

            // Update initial values for Formik
            setInitialFormValues(formattedData);

            // Calculate description lengths (plain text)
            setDescriptionLength(stripHTML(editData.description || "").length);
            setHindiLength(stripHTML(editData.hindi || "").length);

            // Format classes for MultipleSelector
            const formattedClasses =
              editData.classes?.map((classItem) => ({
                value: classItem._id,
                label: classItem.nameEn,
              })) || [];
            setSelected(formattedClasses);

            // Format subjects for MultipleSelector
            const formattedSubjects =
              editData.subjects?.map((subjectItem) => ({
                value: subjectItem._id,
                label: subjectItem.nameEn,
              })) || [];
            setSelectedd(formattedSubjects);
          } else {
            toast.error("No data found for the provided ID");
          }
        })
        .catch((error) => {
          toast.error("Failed to load instruction data");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Handle form submission
  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const payload = {
      classes: selected.map((item) => ({
        _id: item.value,
        nameEn: item.label,
      })),
      subjects: selectedd.map((item) => ({
        _id: item.value,
        nameEn: item.label,
      })),
      isActive: true,
      description: values.description,
      hindi: values.hindi,

      InstructionsName: values.InstructionsName,
      type: values.type,
    };

    const apiCall = id
      ? patchApi(APIS.INSTRUCTION, id, payload)
      : postApi(APIS.INSTRUCTION, payload);

    apiCall
      .then(() => {
        toast.success(`Instruction ${id ? "updated" : "added"} successfully`);
        if (!id && values?.saveAndNew) {
          resetForm();
          setInitialFormValues(initialValues);
          setSelected([]);
          setSelectedd([]);
          setDescriptionLength(0);
          setHindiLength(0);

          setTimeout(() => window.location.reload(), 200);
        } else {
          navigate(-1);
        }
      })
      .catch((error) => {
        if (error.response?.data?.message?.includes("duplicate")) {
          toast.error(
            "This Instruction already exists in the system. Please use a different name.",
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
          toast.error(
            `Failed to ${
              id ? "update" : "create"
            } Instruction. Please try again.`,
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
        }
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Formik
      enableReinitialize
      initialValues={initialFormValues}
      validationSchema={userSchema}
      onSubmit={handleSubmit}
    >
      {({
        isSubmitting,
        values,
        errors,
        touched,
        setFieldValue,
        setFieldTouched,
        handleSubmit: formikSubmit,
      }) => {
        const fechClases = async (query = "") => {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_APP_BASE_URL}/class/list`,
              {
                params: { search: query },
              }
            );
            const classes = response.data?.data?.Classes || [];
            console.log(
              classes
                .filter((item) => item.isActive)
                .map((item) => ({
                  value: item._id,
                  label: item.nameEn,
                }))
            );
            setFieldValue(
              "classes",
              classes
                .filter((item) => item.isActive)
                .map((item) => ({
                  value: item._id,
                  label: item.nameEn,
                }))
            );
            setSelected(
              classes
                .filter((item) => item.isActive)
                .map((item) => ({
                  value: item._id,
                  label: item.nameEn,
                }))
            );
          } catch (error) {
            console.error("Error fetching class list:", error);
            return [];
          }
        };
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          fechClases();
        }, []);
        return (
          <Container>
            <div>
              <Header>
                <div>
                  <BreadCrumbs
                    backNavi={() => navigate("/Instruction/list")}
                    breadCrumbs={[
                      { name: "Instruction", path: ROUTES.INSTRUCTION_LIST },
                    ]}
                    boldItem={id ? "Edit Instruction" : "Add Instruction"}
                  />
                  <Heading>{id ? "Edit" : "Add"} Instruction</Heading>
                </div>
                <ButtonContainer>
                  <Button
                    type={BUTTON_TYPES.SECONDARY}
                    className="bg-white border border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white mr-1"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                    buttonType="button"
                  >
                    Cancel
                  </Button>
                  {!id && (
                    <Button
                      type={BUTTON_TYPES.SECONDARY}
                      className="bg-white border border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white mr-1"
                      onClick={() => {
                        values.saveAndNew = true;
                        formikSubmit();
                      }}
                      disabled={isSubmitting && values?.saveAndNew}
                      buttonType="button"
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
                    buttonType="submit"
                  >
                    {id ? "Update" : "Save"}
                  </Button>
                </ButtonContainer>
              </Header>
              <div
                className="add-v-form"
                style={{ padding: "20px", justifyContent: "center" }}
              >
                <div className="width90">
                  <div className="section-shadow w100">
                    <SidePanel title="Basic Information" />
                    <div className="add-v-form-right-section">
                      <div className="add-v-form-section">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <FormikTextField
                              label="Name"
                              placeholder="Enter name"
                              name="InstructionsName"
                              isRequired
                              onChange={(e) =>
                                validateAlphabetsfortitle(
                                  e,
                                  setFieldValue,
                                  "InstructionsName"
                                )
                              }
                            />
                          </div>
                          <div className="mt-1">
                            <Label className="mb-3 font-medium text-sm">
                              Type <span className="text-red-600">*</span>
                            </Label>
                            <Select
                              styles={customStyles}
                              options={instructionTypeOptions}
                              value={instructionTypeOptions.find(
                                (option) => option.value === values.type
                              )}
                              onChange={(option) =>
                                setFieldValue(
                                  "type",
                                  option ? option.value : ""
                                )
                              }
                              placeholder="Select"
                              isClearable
                              components={{ DropdownIndicator }}
                            />
                            {touched.type && errors.type && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.type}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <Label className="block font-medium mb-1 text-sm">
                              Class <span className="text-red-600">*</span>
                            </Label>
                            <MultipleSelector
                              value={selected}
                              onChange={(value) => {
                                setSelected(value);
                                setFieldValue("classes", value);
                              }}
                              selectAllByDefault={true}
                              onSearch={handleSearch}
                              defaultOptions={[]}
                              placeholder="All Classes Selected"
                              disabled
                              loadingIndicator={
                                <p className="text-center text-sm">
                                  Loading...
                                </p>
                              }
                              emptyIndicator={
                                <p className="text-center text-sm">
                                  No results found
                                </p>
                              }
                            />
                            {touched.classes && errors.classes && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.classes}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="block font-medium mb-1 text-sm">
                              Subject <span className="text-red-600">*</span>
                            </Label>
                            <MultipleSelector
                              value={selectedd}
                              onChange={(value) => {
                                setSelectedd(value);
                                setFieldValue("subjects", value);
                              }}
                              onSearch={handleSearchh}
                              defaultOptions={[]}
                              placeholder="Select"
                              loadingIndicator={
                                <p className="text-center text-sm">
                                  Loading...
                                </p>
                              }
                              emptyIndicator={
                                <p className="text-center text-sm">
                                  No results found
                                </p>
                              }
                            />
                            {touched.subjects && errors.subjects && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.subjects}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          <div>
                            <Label className="block font-medium mb-1 text-sm">
                              Description (English)
                            </Label>
                            <ErrorBoundary>
                              <EditorField
                                name="description"
                                initialContent={values.description}
                                setFieldValue={setFieldValue}
                                setFieldTouched={setFieldTouched}
                                touched={touched}
                                errors={errors}
                                uploadImageCallBack={uploadImageCallBack}
                                onChange={(content) => {
                                  setFieldValue("description", content);
                                  setDescriptionLength(
                                    stripHTML(content).length
                                  );
                                }}
                              />
                            </ErrorBoundary>
                            {touched.description && errors.description && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          <div>
                            <Label className="block font-medium mb-1 text-sm">
                              Description (Hindi)
                            </Label>
                            <ErrorBoundary>
                              <EditorField
                                name="hindi"
                                initialContent={values.hindi}
                                setFieldValue={setFieldValue}
                                setFieldTouched={setFieldTouched}
                                touched={touched}
                                errors={errors}
                                uploadImageCallBack={uploadImageCallBack}
                                onChange={(content) => {
                                  setFieldValue("hindi", content);
                                  setHindiLength(stripHTML(content).length);
                                }}
                              />
                            </ErrorBoundary>
                            {touched.hindi && errors.hindi && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.hindi}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* <div className="mt-2">
                        <div>
                          <Label className="block font-medium mb-1 text-sm">
                            English
                          </Label>
                          <ErrorBoundary>
                            <EditorField
                              name="english"
                              initialContent={values.english}
                              setFieldValue={setFieldValue}
                              setFieldTouched={setFieldTouched}
                              touched={touched}
                              errors={errors}
                              uploadImageCallBack={uploadImageCallBack}
                              onChange={(content) => {
                                setFieldValue("english", content);
                                setEnglishLength(stripHTML(content).length);
                              }}
                            />
                          </ErrorBoundary>
                          {touched.english && errors.english && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.english}
                            </p>
                          )}
                       
                        </div>
                      </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        );
      }}
    </Formik>
  );
};

export default AddInstructions;
