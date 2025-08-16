import { Field, Formik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import Dropdown from "@/components/common/CustomSelect/dropdown";
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
import {
  validateNumbers,
  validateAlphabetsfortitle,
} from "@/utils/common.helper";
import FormikDocumentUploder from "@/components/inputs/formik/FormikDocumentUploader/FormikDocumentUploader";
import EditorField from "@/components/Editor/Editor";
const initialValues = {
  subjectId: [],
  classId: [],

  description: "",
  nameEn: "",
  images: [],
};

const userSchema = Yup.object().shape({
  subjectId: Yup.array()
    .min(1, "Subject is required")
    .required("Subject is required"),
  classId: Yup.array()
    .min(1, "Class is required")
    .required("Class is required"),
  nameEn: Yup.string().required("Name is required"),
});
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
const fetchSubjectsApi = async ({
  search,
  page = 1,
  limit = 100000,
  context,
}) => {
  try {
    const query = search
      ? `search=${encodeURIComponent(search)}`
      : `page=${page}&limit=${limit}${context ? `&context=${context}` : ""}`;
    const res = await getApi(`${APIS.SUBJECT_LIST}?${query}`);
    const subjectData = res?.data?.subject || [];
    const total = res?.data?.total || subjectData.length;
    const formattedSubjects = subjectData.map((subject) => ({
      value: subject._id,
      label: subject.nameEn || "Unknown Subject",
    }));
    return { options: formattedSubjects, total };
  } catch (error) {
    toast.error("Failed to load subjects", { autoClose: 7000 });

    return { options: [], total: 0 };
  }
};

const fetchClassApi = async ({ search, page = 1, limit = 100000, context }) => {
  try {
    const query = search
      ? `search=${encodeURIComponent(search)}`
      : `page=${page}&limit=${limit}${context ? `&context=${context}` : ""}`;
    const res = await getApi(`${APIS.CLASS_LIST}?${query}`);
    const classData = res?.data?.Classes || [];
    const total = res?.data?.total || classData.length;
    const formattedClasses = classData.map((classItem) => ({
      value: classItem._id,
      label: classItem.nameEn || "Unknown Class",
    }));
    return { options: formattedClasses, total };
  } catch (error) {
    toast.error("Failed to load classes", { autoClose: 7000 });

    return { options: [], total: 0 };
  }
};

const AddEditBook = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [existingCodes, setExistingCodes] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);

  // Fetch subjects, classes, book codes, and book data for editing
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch subjects, classes, and book codes in parallel
        const [subjectRes, classRes, bookRes] = await Promise.all([
          fetchSubjectsApi({ page: 1, limit: 100000 }),
          fetchClassApi({ page: 1, limit: 100000 }),
          getApi(APIS.BOOK_LIST),
        ]);

        // Set subject and class options
        const subjects = subjectRes?.options || [];
        const classes = classRes?.options || [];
        setSubjectOptions(subjects);
        setClassOptions(classes);

        // Set existing book codes
        const bookData = bookRes?.data?.Book || bookRes?.data?.books || [];
        if (Array.isArray(bookData)) {
          const codes = bookData.map((book) => book?.codee).filter(Boolean);
          setExistingCodes(codes);
        } else {
          setExistingCodes([]);
        }

        // Fetch book data for editing
        if (id) {
          const res = await getApi(APIS.BOOK, id);
          const editData = res?.data;
          if (editData) {
            const selectedSubjectId =
              Array.isArray(editData.subjectId) && editData.subjectId.length > 0
                ? editData.subjectId[0]
                : null;
            const selectedClassId =
              Array.isArray(editData.classId) && editData.classId.length > 0
                ? editData.classId[0]
                : null;

            setData({
              subjectId: selectedSubjectId ? [selectedSubjectId] : [],
              classId: selectedClassId ? [selectedClassId] : [],
              nameEn: editData?.nameEn || "",

              description: editData?.description || "",
              images: editData?.images || [],
            });
          } else {
            toast.error("No data found for the provided ID");
          }
        }
      } catch (error) {
        toast.error("Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  // Update breadcrumb
  useEffect(() => {
    updateBreadcrumb([
      { label: "Book", path: ROUTES.BOOK_LIST },
      { label: id ? "Edit Book" : "Add Book" },
    ]);
  }, [id, updateBreadcrumb]);

  const handleSubmit = useCallback(
    (values, { setSubmitting, resetForm }) => {
      // Validate code uniqueness
      if (
        existingCodes.includes(values.codee) &&
        (!id || data.codee !== values.codee)
      ) {
        toast.error(
          "This book code already exists. Please enter a unique code."
        );
        setSubmitting(false);
        return;
      }

      const payload = {
        classId: Array.isArray(values.classId) ? values.classId : [],
        subjectId: Array.isArray(values.subjectId) ? values.subjectId : [],
        description: values.description,
        nameEn: values.nameEn,
        isActive: true,
        images: values.images || [],
      };

      const apiCall = id
        ? patchApi(APIS.BOOK, id, payload)
        : postApi(APIS.BOOK, payload);

      apiCall
        .then(() => {
          toast.success(`Book ${id ? "updated" : "created"} successfully`);
          if (!id && values?.saveAndNew) {
            resetForm();
            setData(initialValues);
            setTimeout(() => {
              window.location.reload();
            }, 200);
          } else {
            navigate(ROUTES.BOOK_LIST);
          }
        })
        .catch((error) => {
          if (error.response?.data?.message?.includes("duplicate")) {
            toast.error(
              "This book code already exists. Please use a different code."
            );
          } else {
            toast.error(
              `Failed to ${id ? "update" : "create"} book. Please try again.`
            );
          }
          console.error(error);
        })
        .finally(() => setSubmitting(false));
    },
    [id, existingCodes, data.codee, navigate]
  );

  const getOptionLabel = (option) => option.label;
  const getOptionValue = (option) => option.value;

  if (loading) {
    return <div>Loading...</div>;
  }

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
        setFieldTouched,
        touched,
        handleSubmit: formikSubmit,
      }) => (
        <Container>
          <Header>
            <div>
              <BreadCrumbs
                backNavi={() => navigate(ROUTES.BOOK_LIST)}
                breadCrumbs={[{ name: "Book", path: ROUTES.BOOK_LIST }]}
                boldItem={id ? "Edit Book" : "Add Book"}
              />
              <Heading>{id ? "Edit" : "Add"} Book</Heading>
            </div>
            <ButtonContainer>
              <Button
                type={BUTTON_TYPES.SECONDARY}
                onClick={() => navigate(ROUTES.BOOK_LIST)}
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
                    values.saveAndNew = true;
                    formikSubmit();
                  }}
                  disabled={isSubmitting && values?.saveAndNew}
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
            </ButtonContainer>
          </Header>

          <div
            className="add-v-form"
            style={{ padding: "20px", justifyContent: "center" }}
          >
            <div className="width90">
              <div className="section-shadow w100">
                <SidePanel title="Basic  Information" />
                <div className="add-v-form-right-section">
                  <div className="add-v-form-section">
                    <div className="flex-1 w-100">
                      <div className="group-type-2-equal">
                        <Field name="classId">
                          {({ field, form }) => (
                            <div className="flex-1 w-100">
                              <label className="block mb-2 font-medium c-black text-[14px]">
                                Class <span className="text-red-500">*</span>
                              </label>
                              <Dropdown
                                options={classOptions}
                                onChange={(value) =>
                                  form.setFieldValue(
                                    "classId",
                                    value ? [value] : []
                                  )
                                }
                                value={
                                  field.value && field.value.length > 0
                                    ? field.value[0]
                                    : null
                                }
                                placeholder={
                                  classOptions.length === 0
                                    ? "Loading Classes..."
                                    : "Select Class"
                                }
                                isMulti={false}
                                getOptionLabel={getOptionLabel}
                                getOptionValue={getOptionValue}
                              />
                              {touched.classId && errors.classId && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.classId}
                                </p>
                              )}
                            </div>
                          )}
                        </Field>
                        <Field name="subjectId">
                          {({ field, form }) => (
                            <div className="flex-1 w-100">
                              <label className="block mb-2 font-medium c-black text-[14px]">
                                Subject <span className="text-red-500">*</span>
                              </label>
                              <Dropdown
                                options={subjectOptions}
                                onChange={(value) =>
                                  form.setFieldValue(
                                    "subjectId",
                                    value ? [value] : []
                                  )
                                }
                                value={
                                  field.value && field.value.length > 0
                                    ? field.value[0]
                                    : null
                                }
                                placeholder={
                                  subjectOptions.length === 0
                                    ? "Loading Subjects..."
                                    : "Select Subject"
                                }
                                isMulti={false}
                                getOptionLabel={getOptionLabel}
                                getOptionValue={getOptionValue}
                              />
                              {touched.subjectId && errors.subjectId && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.subjectId}
                                </p>
                              )}
                            </div>
                          )}
                        </Field>
                      </div>
                      <div className="group-type-2-equal">
                        <div className="flex-1 w-100">
                          <FormikTextField
                            label="Name"
                            placeholder="Enter name"
                            name="nameEn"
                            isRequired
                            onChange={(e) => {
                              const value = startSpcaeRemover(e.target.value);
                              setFieldValue("nameEn", value);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="group-type-1">
                      <label className="block mb-2 font-medium c-black text-[14px]">
                        Description
                      </label>
                      <div className="flex-1 w-100">
                        <EditorField
                          name="description"
                          initialContent={values.description}
                          setFieldValue={setFieldValue}
                          setFieldTouched={setFieldTouched}
                          touched={touched}
                          errors={errors}
                          uploadImageCallBack={uploadImageCallBack}
                        />
                      </div>
                    </div>
                    <div className="group-type-1 mt-2">
                      <div>
                        <label className="block mb-2 font-medium c-black text-[14px]">
                          Cover Image
                        </label>
                        <label className="upload-wrap border ">
                          <FormikDocumentUploder
                            name="images"
                            id="book-images"
                            title="Upload Book Cover"
                            message="or drag & drop book cover image files here"
                            btnText="BROWSE FILE"
                            bottomMessage="Supported File Format: jpg, jpeg, png (up to 1 MB)"
                            accept="image/*"
                          />
                        </label>
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

export default AddEditBook;
