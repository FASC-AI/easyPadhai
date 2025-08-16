import { Formik, Field } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import {
  ButtonContainer,
  Container,
  Header,
  Heading,
  SidePanel,
} from "@/components/AddFormLayout/AddFormLayout";
import { BUTTON_TYPES } from "@/constants/common.constant";
import Button from "@/components/common/Button/Button";
import FormikTextField from "@/components/inputs/formik/FormikTextField";
import BreadCrumbs from "@/components/common/BreadCrumbs/BreadCrumbs";
import ROUTES from "@/constants/route.constant";
import { getApi, postApi, patchApi } from "@/services/method";
import { APIS } from "@/constants/api.constant";
import * as Yup from "yup";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { DatePickerInput } from "@/components/common/DateTimeInputs/index";
import MultipleSelector from "@/components/common/CustomSelect/multiSelector";
import EditorField from "@/components/Editor/Editor";
import SingleSelectorSelector from "@/components/common/CustomSelect/singleSelector";

// Utility to strip HTML tags and get plain text for character counting
const stripHTML = (html) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const initialValues = {
  title: "",
  message: "",
  type: [],
  isActive: true,
  fromm: null,
  to: null,
  date: null,
  address: {
    country: null,
  },
  institution: [],
};

const notificationTypeOptions = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
];

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  message: Yup.string()
    .required("Message is required")
    .min(1, "Message cannot be empty")
    .test(
      "no-only-whitespace",
      "Message cannot contain only whitespace",
      (value) => value && value.trim().length > 0
    ),
  type: Yup.array()
    .min(1, "At least one type is required")
    .required("Type selection is required"),
  institution: Yup.array()
    .min(1, "At least one institution is required")
    .required("Institution selection is required"),
  fromm: Yup.date()
    .nullable()
    .min(
      new Date(new Date().getFullYear(), 0, 1),
      "Valid from cannot be in the past"
    )
    .required("Valid from is required"),
  to: Yup.date()
    .nullable()
    .when("fromm", {
      is: (fromm) => fromm && fromm instanceof Date && !isNaN(fromm),
      then: (schema) =>
        schema.min(Yup.ref("fromm"), "Valid to must be after Valid From"),
      otherwise: (schema) => schema,
    })
    .required("Valid to is required"),
  date: Yup.date()
    .nullable()
    .when(["fromm", "to"], {
      is: (fromm, to) =>
        fromm &&
        to &&
        fromm instanceof Date &&
        to instanceof Date &&
        !isNaN(fromm) &&
        !isNaN(to),
      then: (schema) =>
        schema
          .min(Yup.ref("fromm"), "Date must be on or after Valid From")
          .max(Yup.ref("to"), "Date must be on or before Valid To"),
      otherwise: (schema) => schema,
    })
    .required("Date is required"),

});

const NotificationAddEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { updateBreadcrumb } = useBreadcrumb();
  const [data, setData] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [messageLength, setMessageLength] = useState(0);
  const [instituteOptions, setInstituteOptions] = useState([]);
  const [shouldReinitialize, setShouldReinitialize] = useState(true);
  const isMountedRef = useRef(true);
  const today = new Date();
  const currentYearStart = new Date(today.getFullYear(), 0, 1);
  const maxDate = new Date(today.getFullYear() + 1, 11, 31);
  const currentYearEnd = new Date(today.getFullYear(), 11, 31);

  // Update breadcrumb
  useEffect(() => {
    const breadcrumbData = [
      { label: "Notification", path: ROUTES.NOTIFICATION_LIST },
    ];
    updateBreadcrumb(breadcrumbData);
  }, [id, updateBreadcrumb]);

  // Fetch data for editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      getApi(APIS.NOTIFICATION, id)
        .then((res) => {
          const editData = res?.data;
          if (editData) {
            const formattedData = {
              title: editData.title || "",
              message: editData.message || "",
              institution: Array.isArray(editData.institution)
                ? editData.institution.map((inst) => inst._id || inst)
                : [],
              type: editData.type?.map((item) => item._id || item) || [], // Extract just the IDs
              isActive: editData.isActive ?? true,
              fromm: editData.fromm ? new Date(editData.fromm) : null,
              to: editData.to ? new Date(editData.to) : null,
              date: editData.date ? new Date(editData.date) : null,
              address: {
                country: editData.address?.country || null,
              },
              saveAndNew: false,
            };
            setData(formattedData);
            setMessageLength(stripHTML(editData.message || "").length);
          }
        })
        .catch((error) => {
          toast.error("Failed to load notification data");
        })
        .finally(() => {
          setLoading(false);
          setShouldReinitialize(false);
        });
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [id]);

  // Fetch institutes for Institution dropdown on component mount
  useEffect(() => {
    fetchInstitutesApi({}).catch((error) => {
      console.error("Error fetching institutes on mount:", error);
      toast.error("Failed to load institutes");
    });
  }, []);

  // Fetch institutes for Institution dropdown
  const fetchInstitutesApi = async ({ search, page = 1, limit = 1000000 }) => {
    try {
      const query = search
        ? `search=${encodeURIComponent(search)}`
        : `page=${page}&limit=${limit}`;
      const res = await getApi(`${APIS.INSTITUTES_LIST}?${query}`);
      const instituteData = res?.data?.institutes || [];
      const total = res?.data?.count || instituteData.length;
      const formattedInstitutes = instituteData.map((institute) => ({
        value: institute._id,
        label: institute?.institutesName || "Unknown Institute",
      }));
      setInstituteOptions(formattedInstitutes);
      return { options: formattedInstitutes, total };
    } catch (error) {
      console.error("Error fetching institutes:", error);
      return { options: [], total: 0 };
    }
  };

  const uploadImageCallBack = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ data: { link: reader.result } });
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const formattedType = values.type.map((typeValue) => ({
      _id: typeValue,
      nameEn:
        notificationTypeOptions.find((opt) => opt.value === typeValue)?.label ||
        typeValue,
    }));
    const payload = {
      title: values.title,
      message: values.message,
      institution: values.institution,
      type: formattedType,
      isActive: values.isActive,
      fromm: values.fromm,
      to: values.to,
      date: values.date,
      address: values.address,
      // user: "someUserId", // Replace with actual user ID from auth context or local storage
    };

    const apiCall = id
      ? patchApi(APIS.NOTIFICATION, id, payload)
      : postApi(APIS.NOTIFICATION, payload);

    apiCall
      .then((response) => {
        toast.success(`Notification ${id ? "updated" : "added"} successfully`);
        if (!id && values?.saveAndNew) {
          resetForm();
          setData(initialValues);
          setMessageLength(0);
          setTimeout(() => window.location.reload(), 200);
        } else {
          navigate(-1);
        }
      })
      .catch((error) => {
        console.error("API error:", error?.response?.data || error);
        toast.error(
          error?.response?.data?.message ||
            `Failed to ${id ? "update" : "create"} notification`
        );
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Formik
      enableReinitialize={shouldReinitialize}
      initialValues={data}
      validationSchema={validationSchema}
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
      }) => (
        <Container>
          <div>
            <Header>
              <div>
                <BreadCrumbs
                  backNavi={() => navigate(ROUTES.NOTIFICATION_LIST)}
                  breadCrumbs={[
                    { name: "Notification", path: ROUTES.NOTIFICATION_LIST },
                  ]}
                  boldItem={id ? "Edit Notification" : "Add Notification"}
                />
                <Heading>{id ? "Edit" : "Add"} Notification</Heading>
              </div>
              <ButtonContainer>
                <Button
                  type={BUTTON_TYPES.SECONDARY}
                  onClick={() => navigate(ROUTES.NOTIFICATION_LIST)}
                  disabled={isSubmitting}
                  className="bg-white border border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white mr-1"
                >
                  Cancel
                </Button>
                {!id && (
                  <Button
                    type={BUTTON_TYPES.SECONDARY}
                    className="bg-white border border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white mr-1"
                    onClick={() => {
                      setFieldValue("saveAndNew", true);
                      formikSubmit();
                    }}
                    disabled={isSubmitting}
                  >
                    Save & Add New
                  </Button>
                )}
                <Button
                  type={BUTTON_TYPES.PRIMARY}
                  className="bg-[#1A6FAB] text-white hover:bg-[#1A6FAB] hover:text-white"
                  onClick={() => {
                    setFieldValue("saveAndNew", false);
                    formikSubmit();
                  }}
                  disabled={isSubmitting}
                  loading={isSubmitting}
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
                      <div className="group-type-3-equal mt-2">
                        <div className="flex-1 w-100">
                          <FormikTextField
                            label="Title"
                            placeholder="Enter title"
                            name="title"
                            isRequired
                          />
                        </div>
                        <div className="flex-1 w-100 mt-1">
                          <label className="mb-4 font-medium text-[14px]">
                            Type <span className="text-red-500">*</span>
                          </label>
                          <MultipleSelector
                            value={
                              values.type
                                ? values.type.map(
                                    (val) =>
                                      notificationTypeOptions.find(
                                        (opt) => opt.value === val
                                      ) || { value: val, label: val }
                                  )
                                : []
                            }
                            onChange={(selected) =>
                              setFieldValue(
                                "type",
                                selected.map((opt) => opt.value)
                              )
                            }
                            options={notificationTypeOptions}
                            placeholder="Select"
                            className="text-sm"
                          />
                          {errors.type && touched.type && (
                            <div className="text-red-500 text-xs mt-1">
                              {errors.type}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 w-100 mt-1">
                          <label className="mb-4 font-medium text-[14px]">
                            Institution <span className="text-red-500">*</span>
                          </label>
                          <SingleSelectorSelector
                            isMulti={false}
                            value={
                              values.institution
                                ? values.institution.map(
                                    (val) =>
                                      instituteOptions.find(
                                        (opt) => opt.value === val
                                      ) || { value: val, label: val }
                                  )
                                : []
                            }
                            onChange={(selected) =>
                              setFieldValue(
                                "institution",
                                selected.map((opt) => opt.value)
                              )
                            }
                            options={instituteOptions}
                            placeholder="Select"
                            className="text-sm"
                          />
                          {errors.institution && touched.institution && (
                            <div className="text-red-500 text-xs mt-1">
                              {errors.institution}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Rest of your form fields remain the same */}
                      <div className="group-type-3-equal mt-2">
                        <div className="flex-1 w-100">
                          <DatePickerInput
                            labelName="Valid From"
                            name="fromm"
                            callback={(date) => {
                              setFieldValue(
                                "fromm",
                                date ? new Date(date) : null
                              );
                              if (
                                date &&
                                values.to &&
                                new Date(date) > new Date(values.to)
                              ) {
                                setFieldValue("to", null);
                              }
                              if (
                                date &&
                                values.date &&
                                new Date(date) > new Date(values.date)
                              ) {
                                setFieldValue("date", null);
                              }
                            }}
                            defaultValue={values.fromm}
                            placeholder="DD/MM/YYYY"
                            useFormik={true}
                            minDate={today}
                            maxDate={currentYearEnd}
                            isRequired
                            popperProps={{
                              modifiers: [
                                {
                                  name: "zIndex",
                                  enabled: true,
                                  phase: "write",
                                  fn: ({ state }) => {
                                    state.styles.popper.zIndex = 3000;
                                  },
                                },
                              ],
                            }}
                          />
                        </div>
                        <div className="flex-1 w-100">
                          <DatePickerInput
                            labelName="Valid To"
                            name="to"
                            callback={(date) => {
                              setFieldValue("to", date ? new Date(date) : null);
                              if (
                                date &&
                                values.date &&
                                new Date(date) < new Date(values.date)
                              ) {
                                setFieldValue("date", null);
                              }
                            }}
                            placeholder="DD/MM/YYYY"
                            useFormik={true}
                            defaultValue={values.to}
                            minDate={
                              values.fromm
                                ? new Date(
                                    new Date(values.fromm).setDate(
                                      new Date(values.fromm).getDate() + 1
                                    )
                                  )
                                : currentYearStart
                            }
                            maxDate={maxDate}
                            isRequired
                            popperProps={{
                              modifiers: [
                                {
                                  name: "zIndex",
                                  enabled: true,
                                  phase: "write",
                                  fn: ({ state }) => {
                                    state.styles.popper.zIndex = 3000;
                                  },
                                },
                              ],
                            }}
                          />
                        </div>
                        <div className="flex-1 w-100">
                          <DatePickerInput
                            labelName="Date"
                            name="date"
                            callback={(date) => {
                              setFieldValue(
                                "date",
                                date ? new Date(date) : null
                              );
                            }}
                            defaultValue={values.date}
                            placeholder="DD/MM/YYYY"
                            useFormik={true}
                            minDate={values.fromm || currentYearStart}
                            maxDate={values.to || maxDate}
                            isRequired
                            popperProps={{
                              modifiers: [
                                {
                                  name: "zIndex",
                                  enabled: true,
                                  phase: "write",
                                  fn: ({ state }) => {
                                    state.styles.popper.zIndex = 3000;
                                  },
                                },
                              ],
                            }}
                          />
                        </div>
                      </div>
                      <div className="group-type-1">
                        <div className="flex-1 w-100">
                          <div className="to-input-field">
                            <label className="to-label c-black font-semibold mb-2">
                              Message <span className="text-red-500">*</span>
                            </label>
                            <EditorField
                              name="message"
                              initialContent={values.message}
                              setFieldValue={setFieldValue}
                              setFieldTouched={setFieldTouched}
                              touched={touched}
                              errors={errors}
                              uploadImageCallBack={uploadImageCallBack}
                              onChange={(content) => {
                                setFieldValue("message", content);
                                setMessageLength(stripHTML(content).length);
                              }}
                            />
                            {touched.message && errors.message && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.message}
                              </p>
                            )}
                            <div className="flex mt-1">
                              <p className="text-xs text-gray-500">
                                {messageLength}/1000 characters
                              </p>
                            </div>
                          </div>
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

export default NotificationAddEdit;
