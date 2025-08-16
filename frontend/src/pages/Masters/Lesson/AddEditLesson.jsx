import { Field, Formik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import Dropdown from "@/components/common/CustomSelect/dropdown";
import "./AddEditLesson.css";
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
import EditorField from "@/components/Editor/Editor";

const initialValues = {
  bookId: [],
  subjectId: [],
  classId: [],
  description: "",
  nameEn: "",
};

const lessonSchema = Yup.object().shape({
  bookId: Yup.array().min(1, "Book is required").required("Book is required"),
  subjectId: Yup.array()
    .min(1, "Subject is required")
    .required("Subject is required"),
  classId: Yup.array()
    .min(1, "Class is required")
    .required("Class is required"),
  nameEn: Yup.string().required("Lesson name is required"),
});

const fetchBookApi = async ({
  search,
  page = 1,
  limit = 15,
  subjectId,
  classId,
}) => {
  try {
    let query = `page=${page}&limit=${limit}`;
    if (search) {
      query += `&search=${encodeURIComponent(search)}`;
    }
    if (subjectId && classId) {
      query += `&subjectId=${subjectId}&classId=${classId}`;
    }
    const res = await getApi(`${APIS.BOOK_SUBJECT_CLASS}?${query}`);
    const booksData = res?.data?.Books || [];
    const total = res?.data?.count || booksData.length;
    const formattedBooks = booksData.map((book) => ({
      value: book._id,
      label: book.book || book.nameEn || "Unknown Book",
    }));
    return { options: formattedBooks, total };
  } catch (error) {
    return { options: [], total: 0 };
  }
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
    return { options: [], total: 0 };
  }
};
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
const AddEditLessonMaster = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [existingCodes, setExistingCodes] = useState([]);
  const [bookOptions, setBookOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);

  // Fetch books when subjectId and classId change
  const fetchBooks = useCallback(async (subjectId, classId) => {
    if (subjectId && classId) {
      const bookRes = await fetchBookApi({
        page: 1,
        limit: 100,
        subjectId,
        classId,
      });
      setBookOptions(bookRes?.options || []);
    } else {
      setBookOptions([]);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch subjects, classes, and lesson codes in parallel
        const [subjectRes, classRes, lessonRes] = await Promise.all([
          fetchSubjectsApi({ page: 1, limit: 100000 }),
          fetchClassApi({ page: 1, limit: 100000 }),
          getApi(APIS.LESSON_MASTER_LIST),
        ]);

        // Set subject and class options
        setSubjectOptions(subjectRes?.options || []);
        setClassOptions(classRes?.options || []);

        // Set existing lesson codes
        const lessonData =
          lessonRes?.data?.Book || lessonRes?.data?.lessons || [];
        if (Array.isArray(lessonData)) {
          const codes = lessonData
            .map((lesson) => lesson?.codee)
            .filter(Boolean);
          setExistingCodes(codes);
        } else {
          setExistingCodes([]);
        }

        // Fetch lesson data for editing
        if (id) {
          const res = await getApi(APIS.LESSON_MASTER, id);
          const editData = res?.data;
          if (editData) {
            const selectedBookId =
              Array.isArray(editData.bookId) && editData.bookId.length > 0
                ? editData.bookId[0]
                : null;
            const selectedSubjectId =
              Array.isArray(editData.subjectId) && editData.subjectId.length > 0
                ? editData.subjectId[0]
                : null;
            const selectedClassId =
              Array.isArray(editData.classId) && editData.classId.length > 0
                ? editData.classId[0]
                : null;

            setData({
              bookId: selectedBookId ? [selectedBookId] : [],
              subjectId: selectedSubjectId ? [selectedSubjectId] : [],
              classId: selectedClassId ? [selectedClassId] : [],
              nameEn: editData?.nameEn || "",
              description: editData?.description || "",
            });

            // Fetch books for the selected subjectId and classId
            if (selectedSubjectId && selectedClassId) {
              await fetchBooks(selectedSubjectId, selectedClassId);
            }
          } else {
            toast.error("No data found for the provided ID");
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, fetchBooks]);

  // Update breadcrumb
  useEffect(() => {
    updateBreadcrumb([
      { label: "Lesson", path: ROUTES.LESSON_MASTER_LIST },
      { label: id ? "Edit Lesson" : "Add Lesson" },
    ]);
  }, [id, updateBreadcrumb]);

  const handleSubmit = useCallback(
    (values, { setSubmitting, resetForm }) => {
      if (
        existingCodes.includes(values.codee) &&
        (!id || data.codee !== values.codee)
      ) {
        toast.error(
          "This Lesson code already exists. Please use a different code."
        );
        setSubmitting(false);
        return;
      }

      const payload = {
        classId: Array.isArray(values.classId) ? values.classId : [],
        subjectId: Array.isArray(values.subjectId) ? values.subjectId : [],
        bookId: Array.isArray(values.bookId) ? values.bookId : [],
        description: values.description,
        nameEn: values.nameEn,
        isActive: true,
      };

      const apiCall = id
        ? patchApi(APIS.LESSON_MASTER, id, payload)
        : postApi(APIS.LESSON_MASTER, payload);

      apiCall
        .then(() => {
          toast.success(`Lesson ${id ? "updated" : "created"} successfully`);
          if (!id && values?.saveAndNew) {
            resetForm({ values: initialValues });
            setData(initialValues);
            getApi(APIS.LESSON_MASTER_LIST)
              .then((res) => {
                const lessonData = res?.data?.Book || res?.data?.lessons || [];
                if (Array.isArray(lessonData)) {
                  const codes = lessonData
                    .map((lesson) => lesson?.codee)
                    .filter(Boolean);
                  setExistingCodes(codes);
                } else {
                  setExistingCodes([]);
                }
              })
              .catch((error) => {
                console.error("Error fetching Lesson codes:", error);
              });
          } else {
            navigate(ROUTES.LESSON_MASTER_LIST);
          }
        })
        .catch((error) => {
          if (error.response?.data?.message?.includes("duplicate")) {
            toast.error(
              "This Lesson code already exists. Please use a different code."
            );
          } else {
            toast.error(
              `Failed to ${id ? "update" : "create"} Lesson. Please-try-again.`
            );
          }
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
      validationSchema={lessonSchema}
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
      }) => {
        // Debug the isDisabled condition
        const isBookDisabled =
          !values.subjectId.length || !values.classId.length;

        return (
          <Container>
            <Header>
              <div>
                <BreadCrumbs
                  backNavi={() => navigate(ROUTES.LESSON_MASTER_LIST)}
                  breadCrumbs={[
                    { name: "Lesson", path: ROUTES.LESSON_MASTER_LIST },
                  ]}
                  boldItem={id ? "Edit Lesson" : "Add Lesson"}
                />
                <Heading>{id ? "Edit" : "Add"} Lesson</Heading>
              </div>
              <ButtonContainer>
                <Button
                  type={BUTTON_TYPES.SECONDARY}
                  onClick={() => navigate(ROUTES.LESSON_MASTER_LIST)}
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

            <div className="add-v-form">
              <div className="width90">
                <div className="section-shadow w100">
                  <SidePanel title="Basic Information" />
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
                                  onChange={(value) => {
                                    form.setFieldValue(
                                      "classId",
                                      value ? [value] : []
                                    );
                                    form.setFieldValue("bookId", []); // Reset bookId when class changes
                                    fetchBooks(values.subjectId[0], value);
                                  }}
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
                                  Subject{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <Dropdown
                                  options={subjectOptions}
                                  onChange={(value) => {
                                    form.setFieldValue(
                                      "subjectId",
                                      value ? [value] : []
                                    );
                                    form.setFieldValue("bookId", []); // Reset bookId when subject changes
                                    fetchBooks(value, values.classId[0]);
                                  }}
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
                          <Field name="bookId">
                            {({ field, form }) => {
                              const isBookDisabled =
                                !values.subjectId.length ||
                                !values.classId.length;
                              return (
                                <div className="flex-1 w-100">
                                  <label className="block mb-2 font-medium c-black text-[14px]">
                                    Book <span className="text-red-500">*</span>
                                  </label>
                                  <Dropdown
                                    options={bookOptions}
                                    onChange={(value) => {
                                      if (isBookDisabled) {
                                        return; // Block interaction if disabled
                                      }
                                      form.setFieldValue(
                                        "bookId",
                                        value ? [value] : []
                                      );
                                    }}
                                    value={
                                      field.value && field.value.length > 0
                                        ? field.value[0]
                                        : null
                                    }
                                    placeholder={
                                      isBookDisabled
                                        ? "Select Subject and Class first"
                                        : bookOptions.length === 0
                                        ? "No Books Available"
                                        : "Select Book"
                                    }
                                    isMulti={false}
                                    getOptionLabel={getOptionLabel}
                                    getOptionValue={getOptionValue}
                                    isDisabled={isBookDisabled}
                                    // Fallback: If isDisabled isn't working, try using 'disabled' prop
                                    disabled={isBookDisabled}
                                    className={
                                      isBookDisabled ? "dropdown-disabled" : ""
                                    }
                                  />
                                  {touched.bookId && errors.bookId && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {errors.bookId}
                                    </p>
                                  )}
                                </div>
                              );
                            }}
                          </Field>
                        </div>
                        <div className="group-type-2-equal">
                          <div className="flex-1 w-100">
                            <FormikTextField
                              label="Lesson Name"
                              placeholder="Enter lesson name"
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

export default AddEditLessonMaster;
