import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Field, FieldArray, Form } from "formik";
import * as Yup from "yup";
import Dropdown from "@/components/common/CustomSelect/dropdown";
import useStore from "@/store";

import {
  ButtonContainer,
  Container,
  Header,
  Heading,
  SidePanel,
} from "@/components/AddFormLayout/AddFormLayout";
import BreadCrumbs from "@/components/common/BreadCrumbs/BreadCrumbs";
import Button from "@/components/common/Button/Button";
import { BUTTON_TYPES } from "@/constants/common.constant";
import FormikTextField from "@/components/inputs/formik/FormikTextField";
import FormikTimeTextField from "@/components/inputs/durationinput";
import { getApi, postApi, patchApi } from "@/services/method";
import { APIS } from "@/constants/api.constant";
import "./lms.css";
import FormikDocumentUploder from "@/components/inputs/formik/FormikDocumentUploader/FormikDocumentUploader";
import debounce from "lodash/debounce";
import {
  EditorState,
  ContentState,
  convertFromHTML,
  convertToRaw,
} from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import EditorField from "@/components/Editor/Editor";
import FormikUrlField from "@/components/inputs/formik/FormikUrl";

// Initial form values
const initialValues = {
  subjectId: null,
  classId: null,
  bookId: null,
  lessonId: null,
  topic: "",
  lessonDescription: "",
  serial: "",
  readingDuration: "",
  lessonTextContent: "",
  images: [],
  videoTutorialLink: "",
  isTestRequired: "no",
  wordMeanings: [{ word: "", meaning: "" }],
  saveAndNew: false,
};

// Validation schema
const lessonSchema = Yup.object().shape({
  subjectId: Yup.object().nullable().required("Subject is required"),
  classId: Yup.object().nullable().required("Class is required"),
  bookId: Yup.object().nullable().required("Book is required"),
  lessonId: Yup.object().nullable().required("Lesson is required"),
  topic: Yup.string().trim(),
  lessonDescription: Yup.string().trim(),
  readingDuration: Yup.string(),
  lessonTextContent: Yup.string().trim().optional(),
  images: Yup.array()
    .of(
      Yup.object().shape({
        url: Yup.string(),
        name: Yup.string().optional(),
        file: Yup.mixed()
          .test(
            "fileSize",
            "File size must be less than 1MB",
            (value) => !value || value.size <= 1024 * 1024
          )
          .test(
            "fileType",
            "Unsupported file type",
            (value) =>
              !value ||
              [
                "image/jpeg",
                "image/png",
                "image/bmp",
                "image/gif",
                "image/svg+xml",
              ].includes(value.type)
          )
          .optional(),
      })
    )
    .optional(),
  videoTutorialLink: Yup.string().optional(),
  isTestRequired: Yup.string()
    .oneOf(["yes", "no"], "Please select an option")
    .required("Test requirement is required"),
  wordMeanings: Yup.array()
    .of(
      Yup.object().shape({
        word: Yup.string().trim(),
        meaning: Yup.string().trim(),
      })
    )
    .optional(),
});

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again later.</div>;
    }
    return this.props.children;
  }
}

const AddEditLms = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, userProfile } = useStore();
  const isEditor = user.userRole === "editor";
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(initialValues);
  const [lessons, setLessons] = useState([]);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [books, setBooks] = useState([]);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [dependencyValues, setDependencyValues] = useState({
    subjectId: null,
    classId: null,
    bookId: null,
  });
  const dependencyRef = useRef({
    subjectId: null,
    classId: null,
    bookId: null,
  });

  const isMountedRef = useRef(false);

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

  const fetchSubjectsApi = async ({ search, page = 1, limit = 100000 }) => {
    try {
      const query = search
        ? `search=${encodeURIComponent(search)}`
        : `page=${page}&limit=${limit}`;
      const res = await getApi(`${APIS.SUBJECT_LIST}?${query}`);
      const subjectData = res?.data?.subject || [];
      const total = res?.data?.total || subjectData.length;
      const formattedSubjects = subjectData.map((subject) => ({
        value: subject._id,
        label: subject.nameEn,
      }));
      return { options: formattedSubjects, total };
    } catch (error) {
      return { options: [], total: 0 };
    }
  };

  const fetchClassApi = async ({ search, page = 1, limit = 100000 }) => {
    try {
      const query = search
        ? `search=${encodeURIComponent(search)}`
        : `page=${page}&limit=${limit}`;
      const res = await getApi(`${APIS.CLASS_LIST}?${query}`);
      const classData = res?.data?.Classes || [];
      const total = res?.data?.total || classData.length;
      const formattedClasses = classData.map((cls) => ({
        value: cls._id,
        label: cls.nameEn,
      }));
      return { options: formattedClasses, total };
    } catch (error) {
      return { options: [], total: 0 };
    }
  };

  const fetchBookApi = async ({
    search,
    page = 1,
    limit = 100000,
    classId,
    subjectId,
  }) => {
    try {
      let query = `page=${page}&limit=${limit}`;
      if (search) {
        query += `&search=${encodeURIComponent(search)}`;
      }
      if (classId) {
        query += `&classId=${encodeURIComponent(classId)}`;
      }
      if (subjectId) {
        query += `&subjectId=${encodeURIComponent(subjectId)}`;
      }
      const res = await getApi(`${APIS.BOOK_BY_SUBJECT_CLASS}?${query}`);
      const booksData = res?.data?.Books || [];
      const total = res?.data?.count || booksData.length;
      const formattedBooks = booksData.map((book) => ({
        value: book._id,
        label: book.book || book.nameEn,
      }));
      return { options: formattedBooks, total };
    } catch (error) {
      return { options: [], total: 0 };
    }
  };

  const fetchLessons = async (subjectId, classId, bookId) => {
    if (!subjectId || !classId || !bookId) {
      return [];
    }
    try {
      setLessonLoading(true);
      const queryParams = new URLSearchParams({
        subjectId,
        classId,
        bookId,
      });
      const res = await getApi(`${APIS.LESSON_LIST}?${queryParams.toString()}`);
      const lessonData = res?.data?.lessons || [];
      const formattedLessons = lessonData.map((lesson) => ({
        value: lesson._id,
        label: lesson.nameEn,
      }));

      if (isMountedRef.current) {
        setLessons(formattedLessons);
      }
      return formattedLessons;
    } catch (error) {
      if (isMountedRef.current) {
        setLessons([]);
      }
      return [];
    } finally {
      if (isMountedRef.current) {
        setLessonLoading(false);
      }
    }
  };

  const debouncedFetchLessons = useMemo(
    () =>
      debounce((subjectId, classId, bookId, callback) => {
        fetchLessons(subjectId, classId, bookId).then((lessons) => {
          if (isMountedRef.current) {
            callback(lessons);
          }
        });
      }, 500),
    []
  );

  const debouncedFetchBooks = useMemo(
    () =>
      debounce((classId, subjectId, callback) => {
        fetchBookApi({ page: 1, limit: 10, classId, subjectId }).then(
          (result) => {
            if (isMountedRef.current) {
              callback(result.options);
            }
          }
        );
      }, 500),
    []
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      debouncedFetchLessons.cancel();
      debouncedFetchBooks.cancel();
    };
  }, [debouncedFetchLessons, debouncedFetchBooks]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [subjectsRes, classesRes] = await Promise.all([
          fetchSubjectsApi({ page: 1, limit: 100000 }),
          fetchClassApi({ page: 1, limit: 100000 }),
        ]);

        if (isMountedRef.current) {
          setSubjects(subjectsRes.options || []);
          setClasses(classesRes.options || []);
        }

        let newInitialData = { ...initialValues };

        // Pre-select first options for editor role in add mode
        if (isEditor && !id) {
          if (subjectsRes.options.length > 0) {
            newInitialData.subjectId = subjectsRes.options[0];
          }
          if (classesRes.options.length > 0) {
            newInitialData.classId = classesRes.options[0];
          }
        }

        if (!id) {
          setInitialData(newInitialData);
          setEditorState(EditorState.createEmpty());

          // Fetch books for pre-selected class and subject for editor
          if (isEditor && newInitialData.classId && newInitialData.subjectId) {
            const booksRes = await fetchBookApi({
              page: 1,
              limit: 10,
              classId: newInitialData.classId.value,
              subjectId: newInitialData.subjectId.value,
            });
            if (isMountedRef.current) {
              setBooks(booksRes.options || []);
              if (booksRes.options.length > 0) {
                newInitialData.bookId = booksRes.options.find(
                  (book) => book.value === userProfile.bookId[0]
                );
                setInitialData({ ...newInitialData });
                setDependencyValues({
                  subjectId: newInitialData.subjectId?.value,
                  classId: newInitialData.classId?.value,
                  bookId: newInitialData.bookId?.value,
                });
                dependencyRef.current = {
                  subjectId: newInitialData.subjectId?.value,
                  classId: newInitialData.classId?.value,
                  bookId: newInitialData.bookId?.value,
                };
                const initialLessons = await fetchLessons(
                  newInitialData.subjectId?.value,
                  newInitialData.classId?.value,
                  newInitialData.bookId?.value
                );
                if (initialLessons.length > 0) {
                  newInitialData.lessonId = initialLessons[0];
                  setInitialData({ ...newInitialData });
                  setLessons(initialLessons);
                }
              }
            }
          }
          return;
        }

        // Edit mode: Fetch existing lesson data
        const res = await getApi(APIS.LESSON, id);
        const editData = res?.data;
        if (editData) {
          newInitialData = {
            subjectId: editData.subjectId?.length
              ? {
                  value: editData.subjectId[0]._id,
                  label: editData.subjectId[0].nameEn || "Unknown Subject",
                }
              : null,
            classId: editData.classId?.length
              ? {
                  value: editData.classId[0]._id,
                  label: editData.classId[0].nameEn || "Unknown Class",
                }
              : null,
            bookId: editData.bookId?.length
              ? {
                  value: editData.bookId[0]._id,
                  label: editData.bookId[0].nameEn || "Unknown Book",
                }
              : null,
            lessonId: editData.lessonId?.length
              ? {
                  value: editData.lessonId[0]._id,
                  label: editData.lessonId[0].nameEn || "Unknown Lesson",
                }
              : null,
            topic: editData.topic || "",
            serial: editData.serial || "",
            lessonDescription: editData.lessonDescription || "",
            readingDuration: editData.readingDuration || "",
            lessonTextContent: editData.lessonTextContent || "",
            images:
              editData.images?.map((img) => ({
                url: img.url,
                name: img.name,
              })) || [],
            videoTutorialLink: editData.videoTutorialLink || "",
            isTestRequired: editData.isTestRequired ? "yes" : "no",
            wordMeanings: editData.wordMeanings?.length
              ? editData.wordMeanings
              : [{ word: "", meaning: "" }],
            saveAndNew: false,
          };
          setInitialData(newInitialData);

          if (newInitialData.lessonTextContent) {
            const blocksFromHTML = convertFromHTML(
              newInitialData.lessonTextContent
            );
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setEditorState(EditorState.createWithContent(contentState));
          } else {
            setEditorState(EditorState.createEmpty());
          }

          if (
            newInitialData.subjectId?.value &&
            newInitialData.classId?.value
          ) {
            const booksRes = await fetchBookApi({
              page: 1,
              limit: 100000,
              classId: newInitialData.classId.value,
              subjectId: newInitialData.subjectId.value,
            });
            if (isMountedRef.current) {
              setBooks(booksRes.options || []);
              if (newInitialData.bookId) {
                const bookExists = booksRes.options.some(
                  (book) => book.value === newInitialData.bookId.value
                );
                if (!bookExists) {
                  setBooks([...booksRes.options, newInitialData.bookId]);
                }
              }
            }

            if (newInitialData.bookId?.value) {
              setDependencyValues({
                subjectId: newInitialData.subjectId?.value,
                classId: newInitialData.classId?.value,
                bookId: newInitialData.bookId?.value,
              });
              dependencyRef.current = {
                subjectId: newInitialData.subjectId?.value,
                classId: newInitialData.classId?.value,
                bookId: newInitialData.bookId?.value,
              };
              const initialLessons = await fetchLessons(
                newInitialData.subjectId.value,
                newInitialData.classId.value,
                newInitialData.bookId.value
              );
              if (newInitialData.lessonId) {
                const lessonExists = initialLessons.some(
                  (lesson) => lesson.value === newInitialData.lessonId.value
                );
                if (!lessonExists) {
                  setLessons([...initialLessons, newInitialData.lessonId]);
                }
              }
            }
          }
        } else {
          toast.error("No data found for the provided ID", { autoClose: 7000 });
          setInitialData(initialValues);
          setEditorState(EditorState.createEmpty());
        }
      } catch (error) {
        toast.error(error.message || "Failed to fetch initial data");
        setInitialData(initialValues);
        setEditorState(EditorState.createEmpty());
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
  }, [id, isEditor]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const jsonPayload = {
        subjectId: values.subjectId?.value || "",
        classId: values.classId?.value || "",
        bookId: values.bookId?.value || "",
        lessonId: values.lessonId?.value || "",
        topic: values.topic,
        serial: values.serial,
        lessonDescription: values.lessonDescription,
        readingDuration: values.readingDuration,
        lessonTextContent: values.lessonTextContent,
        videoTutorialLink: values.videoTutorialLink,
        isTestRequired: values.isTestRequired === "yes",
        images: values.images
          .filter((image) => image.url)
          .map((image) => ({
            url: image.url,
            name:
              image.name ||
              image.file?.name ||
              image.url.split("/").pop() ||
              "",
          })),
        wordMeanings: values.wordMeanings
          .filter((wm) => wm.word.trim() || wm.meaning.trim())
          .map((wm) => ({
            word: wm.word.trim(),
            meaning: wm.meaning.trim(),
          })),
      };

      let apiCall;
      if (id) {
        apiCall = patchApi(APIS.LESSON, id, jsonPayload, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        apiCall = postApi(APIS.LESSON, jsonPayload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      const res = await apiCall;
      const successMessage = id
        ? "Lesson description updated successfully"
        : "Lesson description added successfully";
      toast.success(successMessage);
      if (values.saveAndNew) {
        resetForm({
          values: {
            ...initialValues,
            images: [],
            wordMeanings: [{ word: "", meaning: "" }],
            ...(isEditor &&
              classes.length > 0 && {
                classId: classes[0],
              }),
            ...(isEditor &&
              subjects.length > 0 && {
                subjectId: subjects[0],
              }),
            ...(isEditor &&
              books.length > 0 && {
                bookId: books[0],
              }),
          },
        });
        setInitialData({
          ...initialValues,
          images: [],
          wordMeanings: [{ word: "", meaning: "" }],
          ...(isEditor &&
            classes.length > 0 && {
              classId: classes[0],
            }),
          ...(isEditor &&
            subjects.length > 0 && {
              subjectId: subjects[0],
            }),
          ...(isEditor &&
            books.length > 0 && {
              bookId: books[0],
            }),
        });
        setEditorState(EditorState.createEmpty());
        setDependencyValues({
          subjectId: isEditor && subjects.length > 0 ? subjects[0].value : null,
          classId: isEditor && classes.length > 0 ? classes[0].value : null,
          bookId: isEditor && books.length > 0 ? books[0].value : null,
        });
        dependencyRef.current = {
          subjectId: isEditor && subjects.length > 0 ? subjects[0].value : null,
          classId: isEditor && classes.length > 0 ? classes[0].value : null,
          bookId: isEditor && books.length > 0 ? books[0].value : null,
        };
        if (isEditor && books.length > 0) {
          fetchLessons(
            subjects[0]?.value,
            classes[0]?.value,
            books[0]?.value
          ).then((newLessons) => {
            setLessons(newLessons);
            if (newLessons.length > 0) {
              setInitialData((prev) => ({
                ...prev,
                lessonId: newLessons[0],
              }));
            } else {
              setInitialData((prev) => ({ ...prev, lessonId: null }));
            }
          });
        } else {
          setLessons([]);
          setInitialData((prev) => ({ ...prev, lessonId: null }));
        }
        window.location.reload();
      } else {
        setTimeout(() => {
          navigate("/lesson");
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving the lesson");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <Formik
        enableReinitialize
        initialValues={initialData}
        validationSchema={lessonSchema}
        onSubmit={handleSubmit}
      >
        {({
          isSubmitting,
          values,
          setFieldValue,
          setFieldTouched,
          errors,
          touched,
        }) => {
          const handleEditorChange = (newEditorState) => {
            setEditorState(newEditorState);
            const contentState = newEditorState.getCurrentContent();
            const rawContent = convertToRaw(contentState);
            const htmlContent = draftToHtml(rawContent);
            setFieldValue("lessonTextContent", htmlContent);
          };

          const currentDependencies = useMemo(
            () => ({
              subjectId: values.subjectId?.value || null,
              classId: values.classId?.value || null,
              bookId: values.bookId?.value || null,
            }),
            [
              values.subjectId?.value,
              values.classId?.value,
              values.bookId?.value,
            ]
          );

          useEffect(() => {
            if (values.classId) setFieldTouched("classId", true, false);
            if (values.subjectId) setFieldTouched("subjectId", true, false);
            if (values.bookId) setFieldTouched("bookId", true, false);
            if (values.lessonId) setFieldTouched("lessonId", true, false);
          }, [
            values.classId,
            values.subjectId,
            values.bookId,
            values.lessonId,
            setFieldTouched,
          ]);

          useEffect(() => {
            const { subjectId, classId } = currentDependencies;

            if (subjectId && classId && !isEditor) {
              debouncedFetchBooks(classId, subjectId, (newBooks) => {
                setBooks(newBooks);
                const currentBookId = values.bookId?.value;
                const newBookIds = newBooks.map((book) => book.value);
                const bookStillValid =
                  !currentBookId || newBookIds.includes(currentBookId);
                if (!bookStillValid) {
                  setFieldValue("bookId", null);
                  setFieldValue("lessonId", null);
                }
              });
            }
          }, [
            currentDependencies.classId,
            currentDependencies.subjectId,
            setFieldValue,
            isEditor,
          ]);

          useEffect(() => {
            const { subjectId, classId, bookId } = currentDependencies;

            if (
              subjectId !== dependencyRef.current.subjectId ||
              classId !== dependencyRef.current.classId ||
              bookId !== dependencyRef.current.bookId
            ) {
              dependencyRef.current = { subjectId, classId, bookId };
              setDependencyValues({ subjectId, classId, bookId });

              if (subjectId && classId && bookId) {
                debouncedFetchLessons(
                  subjectId,
                  classId,
                  bookId,
                  (newLessons) => {
                    const currentLessonId = values.lessonId?.value;
                    const newLessonIds = newLessons.map(
                      (lesson) => lesson.value
                    );
                    const lessonStillValid =
                      !currentLessonId ||
                      newLessonIds.includes(currentLessonId);
                    if (!lessonStillValid) {
                      setFieldValue("lessonId", null);
                    }
                  }
                );
              } else {
                setLessons([]);
                setFieldValue("lessonId", null);
              }
            }
          }, [currentDependencies, setFieldValue]);

          return (
            <Form>
              <ToastContainer
                position="bottom-right"
                autoClose={7000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
              <Container>
                <Header>
                  <div>
                    <BreadCrumbs
                      backNavi={() => navigate("/lesson")}
                      breadCrumbs={[
                        { name: "Lesson Description", path: "/lesson" },
                      ]}
                      boldItem={
                        id
                          ? "Edit Lesson Description"
                          : "Add Lesson Description"
                      }
                    />
                    <Heading>{id ? "Edit" : "Add"} Lesson Description</Heading>
                  </div>
                  <ButtonContainer className="glowing space-x-2">
                    <Button
                      type="button" // Explicitly set to "button" to prevent form submission
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default behavior
                        e.stopPropagation(); // Stop event bubbling
                        navigate("/lesson");
                      }}
                      disabled={isSubmitting}
                      className="bg-white border border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white"
                    >
                      Cancel
                    </Button>
                    {!id && (
                      <Button
                        type={BUTTON_TYPES.SECONDARY}
                        className="bg-white border border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white"
                        onClick={() => setFieldValue("saveAndNew", true)}
                        disabled={isSubmitting}
                      >
                        Save & Add New
                      </Button>
                    )}
                    <Button
                      type={BUTTON_TYPES.PRIMARY}
                      className="bg-[#1A6FAB] text-white hover:bg-[#1A6FAB] hover:text-white"
                      onClick={() => setFieldValue("saveAndNew", false)}
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      {id ? "Update" : "Save"}
                    </Button>
                  </ButtonContainer>
                </Header>

                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <div
                    className="add-v-form"
                    style={{ padding: "20px", justifyContent: "center" }}
                  >
                    <div className="width90">
                      <div className="section-shadow w100">
                        <SidePanel title="Basic Information" />
                        <div className="add-v-form-right-section">
                          <div className="add-v-form-section">
                            <div className="group-type-3-equal">
                              <Field name="classId">
                                {({ field, form }) => (
                                  <div className="flex-1 w-100">
                                    <label className="block mb-2 font-medium c-black text-[14px]">
                                      Class{" "}
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <Dropdown
                                      fetchApi={fetchClassApi}
                                      options={classes}
                                      onChange={(value) => {
                                        if (!isEditor) {
                                          const selectedOption = value
                                            ? {
                                                value,
                                                label:
                                                  classes.find(
                                                    (opt) => opt.value === value
                                                  )?.label ||
                                                  form.values.classId?.label ||
                                                  "Unknown Class",
                                              }
                                            : null;
                                          form.setFieldValue(
                                            "classId",
                                            selectedOption
                                          );
                                        }
                                      }}
                                      value={field.value?.value || null}
                                      placeholder={
                                        classes.length > 0
                                          ? "Select class"
                                          : "No classes available"
                                      }
                                      getOptionLabel={(option) => option.label}
                                      getOptionValue={(option) => option.value}
                                      disabled={isEditor}
                                    />
                                    {form.touched.classId &&
                                      form.errors.classId &&
                                      !form.values.classId && (
                                        <p className="text-red-500 text-xs mt-1">
                                          {form.errors.classId}
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
                                      fetchApi={fetchSubjectsApi}
                                      options={subjects}
                                      onChange={(value) => {
                                        if (!isEditor) {
                                          const selectedOption = value
                                            ? {
                                                value,
                                                label:
                                                  subjects.find(
                                                    (opt) => opt.value === value
                                                  )?.label ||
                                                  form.values.subjectId
                                                    ?.label ||
                                                  "Unknown Subject",
                                              }
                                            : null;
                                          form.setFieldValue(
                                            "subjectId",
                                            selectedOption
                                          );
                                        }
                                      }}
                                      value={field.value?.value || null}
                                      placeholder={
                                        subjects.length > 0
                                          ? "Select subject"
                                          : "No subjects available"
                                      }
                                      getOptionLabel={(option) => option.label}
                                      getOptionValue={(option) => option.value}
                                      disabled={isEditor}
                                    />
                                    {form.touched.subjectId &&
                                      form.errors.subjectId &&
                                      !form.values.subjectId && (
                                        <p className="text-red-500 text-xs mt-1">
                                          {form.errors.subjectId}
                                        </p>
                                      )}
                                  </div>
                                )}
                              </Field>
                              <Field name="bookId">
                                {({ field, form }) => (
                                  <div className="flex-1 w-100">
                                    <label className="block mb-2 font-medium c-black text-[14px]">
                                      Book{" "}
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <Dropdown
                                      options={books}
                                      onChange={(value) => {
                                        if (!isEditor) {
                                          const selectedOption = value
                                            ? {
                                                value,
                                                label:
                                                  books.find(
                                                    (opt) => opt.value === value
                                                  )?.label ||
                                                  form.values.bookId?.label ||
                                                  "Unknown Book",
                                              }
                                            : null;
                                          form.setFieldValue(
                                            "bookId",
                                            selectedOption
                                          );
                                        }
                                      }}
                                      value={field.value?.value || null}
                                      placeholder={
                                        !values.classId || !values.subjectId
                                          ? "Select class and subject first"
                                          : books.length > 0
                                          ? "Select Book"
                                          : "No Books Available"
                                      }
                                      disabled={
                                        isEditor ||
                                        !values.classId ||
                                        !values.subjectId
                                      }
                                      isClearable={!isEditor}
                                      getOptionLabel={(option) => option.label}
                                      getOptionValue={(option) => option.value}
                                    />
                                    {form.touched.bookId &&
                                      form.errors.bookId &&
                                      !form.values.bookId && (
                                        <p className="text-red-500 text-xs mt-1">
                                          Book is Required
                                        </p>
                                      )}
                                  </div>
                                )}
                              </Field>
                            </div>
                            <div className="group-type-3-equal">
                              <Field name="lessonId">
                                {({ field, form }) => (
                                  <div className="flex-1 w-100">
                                    <label className="block mb-2 font-medium c-black text-[14px]">
                                      Lesson{" "}
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <Dropdown
                                      options={lessons}
                                      onChange={(value) => {
                                        const selectedOption = value
                                          ? {
                                              value,
                                              label:
                                                lessons.find(
                                                  (opt) => opt.value === value
                                                )?.label || "Unknown Lesson",
                                            }
                                          : null;
                                        form.setFieldValue(
                                          "lessonId",
                                          selectedOption
                                        );
                                      }}
                                      value={field.value?.value || null}
                                      placeholder={
                                        lessonLoading
                                          ? "Loading Lessons..."
                                          : !values.subjectId ||
                                            !values.classId ||
                                            !values.bookId
                                          ? "Select class, subject, and book first"
                                          : lessons.length > 0
                                          ? "Select Lesson"
                                          : "No Lessons Available"
                                      }
                                      disabled={
                                        !values.subjectId ||
                                        !values.classId ||
                                        !values.bookId ||
                                        lessonLoading
                                      }
                                      isClearable
                                      getOptionLabel={(option) => option.label}
                                      getOptionValue={(option) => option.value}
                                    />
                                    {form.touched.lessonId &&
                                      form.errors.lessonId &&
                                      !form.values.lessonId && (
                                        <p className="text-red-500 text-xs mt-1">
                                          {form.errors.lessonId}
                                        </p>
                                      )}
                                  </div>
                                )}
                              </Field>
                              <div className="flex-1 w-100">
                                <FormikTextField
                                  label="Topic"
                                  placeholder="Enter topic"
                                  name="topic"
                                  className="larger-input"
                                />
                              </div>
                              <div className="flex-1 w-100">
                                <Field name="serial">
                                  {({ field, form }) => (
                                    <FormikTextField
                                      {...field}
                                      label="Serial No."
                                      placeholder="Enter serial number"
                                      className="larger-input"
                                      type="text"
                                      inputMode="numeric"
                                      onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key)) {
                                          e.preventDefault();
                                        }
                                      }}
                                      onChange={(e) => {
                                        const value = e.target.value.replace(
                                          /\D/g,
                                          ""
                                        );
                                        form.setFieldValue(field.name, value);
                                      }}
                                    />
                                  )}
                                </Field>
                              </div>
                            </div>
                            <div className="group-type-3-equal">
                              <div className="flex-1 w-100">
                                <FormikUrlField
                                  label="Video Tutorial Link"
                                  placeholder="Enter video tutorial link"
                                  name="videoTutorialLink"
                                  className="larger-input"
                                />
                              </div>
                              <div className="flex-1 w-100">
                                <FormikTimeTextField
                                  label="Reading Duration"
                                  name="readingDuration"
                                  className="mt-2 flex w-full rounded-md border px-3 py-2 text-xs ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-primary-200 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#e0e0e0] disabled:text-[#999999] border-border-primary bg-white"
                                  isRequired
                                />
                              </div>
                            </div>
                            <div className="w-100 mt-4">
                              <label className="block mb-2 font-medium c-black text-[14px]">
                                Topic Description
                              </label>
                              <EditorField
                                name="lessonTextContent"
                                initialContent={values.lessonTextContent}
                                setFieldValue={setFieldValue}
                                setFieldTouched={setFieldTouched}
                                touched={touched}
                                errors={errors}
                                uploadImageCallBack={uploadImageCallBack}
                                height={600}
                              />
                              {touched.lessonTextContent &&
                                errors.lessonTextContent && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors.lessonTextContent}
                                  </p>
                                )}
                            </div>
                            {/* <div className="w-100">
                              <label className="block mb-2 font-medium c-black text-[14px]">
                                Lesson Description
                              </label>
                              <EditorField
                                name="lessonDescription"
                                initialContent={values.lessonDescription}
                                setFieldValue={setFieldValue}
                                setFieldTouched={setFieldTouched}
                                touched={touched}
                                errors={errors}
                                uploadImageCallBack={uploadImageCallBack}
                              />
                              {touched.lessonDescription &&
                                errors.lessonDescription && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors.lessonDescription}
                                  </p>
                                )}
                            </div> */}

                            <FieldArray name="wordMeanings">
                              {({ push, remove, form }) => (
                                <div className="space-y-4">
                                  <label className="block mb-2 font-medium c-black text-[14px]">
                                    Dictionary
                                  </label>
                                  {form.values.wordMeanings.map((_, index) => (
                                    <div
                                      key={index}
                                      className="group-type-3-equal flex items-center gap-4"
                                    >
                                      <div className="flex-1 w-100 max-w-xs">
                                        <FormikTextField
                                          label="Word"
                                          placeholder="Enter word"
                                          name={`wordMeanings[${index}].word`}
                                          className="larger-input"
                                        />
                                      </div>
                                      <div className="flex-1 w-100">
                                        <FormikTextField
                                          label="Meaning"
                                          placeholder="Enter meaning"
                                          name={`wordMeanings[${index}].meaning`}
                                          className="larger-input"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="p-2 text-red-600 hover:text-red-800 mt-6"
                                        aria-label="Delete word-meaning pair"
                                      >
                                        <TrashIcon className="h-6 w-6" />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      push({ word: "", meaning: "" })
                                    }
                                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 text-[12px]"
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                    Add Word
                                  </button>
                                </div>
                              )}
                            </FieldArray>
                            <div className="w-100 mt-4">
                              <label className="block mb-2 font-medium c-black text-[14px]">
                                Upload Image
                              </label>
                              <FormikDocumentUploder
                                name="images"
                                id="subject-images"
                                title="Upload Images"
                                message="or drag & drop image files here"
                                btnText="BROWSE FILE"
                                bottomMessage="Supported File Format: jpeg, png (upto 1 MB)"
                                accept="image/*"
                              />
                            </div>
                            <div className="group-type-3-equal mt-4">
                              <div className="flex-1 w-100">
                                <label className="block mb-2 font-medium c-black text-[14px]">
                                  Is a test required?
                                </label>
                                <Field name="isTestRequired">
                                  {({ field }) => (
                                    <div className="flex space-x-4">
                                      <label>
                                        <input
                                          type="radio"
                                          {...field}
                                          value="yes"
                                          checked={field.value === "yes"}
                                        />
                                        Yes
                                      </label>
                                      <label>
                                        <input
                                          type="radio"
                                          {...field}
                                          value="no"
                                          checked={field.value === "no"}
                                        />
                                        No
                                      </label>
                                    </div>
                                  )}
                                </Field>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Container>
            </Form>
          );
        }}
      </Formik>
    </ErrorBoundary>
  );
};

export default AddEditLms;
