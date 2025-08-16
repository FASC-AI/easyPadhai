import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Field, Form } from "formik";
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
import { getApi, postApi, patchApi } from "@/services/method";
import { APIS } from "@/constants/api.constant";
import debounce from "lodash/debounce";
import {
  EditorState,
  ContentState,
  convertFromHTML,
  convertToRaw,
} from "draft-js";
import draftToHtml from "draftjs-to-html";
import EditorField from "@/components/Editor/Editor";

// Initial form values
const initialValues = {
  subjectId: [],
  classId: [],
  bookId: [],
  lessonId: [],
  topicId: [],
  question: "",
  solution: "",
  hint: "",
  videoTutorialLink: "",
  saveAndNew: false,
};

// Validation schema
const lessonSchema = Yup.object().shape({
  subjectId: Yup.array()
    .min(1, "Subject is required")
    .required("Subject is required"),
  classId: Yup.array()
    .min(1, "Class is required")
    .required("Class is required"),
  bookId: Yup.array().min(1, "Book is required").required("Book is required"),
  lessonId: Yup.array()
    .min(1, "Lesson is required")
    .required("Lesson is required"),
  topicId: Yup.array(),
  videoTutorialLink: Yup.string().optional(),
  question: Yup.string().trim().required("Question is required"),
  solution: Yup.string().trim(),
  hint: Yup.string().trim(),
});

// Class-based Error Boundary
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

const AddEditHomework = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, userProfile } = useStore();
  const isEditor = user.userRole === "editor";
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(initialValues);
  const [lessons, setLessons] = useState([]);
  const [topics, setTopics] = useState([]);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [topicLoading, setTopicLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [books, setBooks] = useState([]);
  const [bookLoading, setBookLoading] = useState(false);
  const [solutionEditorState, setSolutionEditorState] = useState(
    EditorState.createEmpty()
  );
  const [questionEditorState, setQuestionEditorState] = useState(
    EditorState.createEmpty()
  );
  const [hintEditorState, setHintEditorState] = useState(
    EditorState.createEmpty()
  );
  const [dependencyValues, setDependencyValues] = useState({
    subjectId: null,
    classId: null,
    bookId: null,
    lessonId: null,
  });

  const dependencyRef = useRef({
    subjectId: null,
    classId: null,
    bookId: null,
    lessonId: null,
  });
  const isMountedRef = useRef(false);
  const bookDropdownRef = useRef(null);
  const bookInteractedRef = useRef(false);

  const uploadImageCallBack = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ data: { link: reader.result } });
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
      toast.error("Failed to load subjects", { autoClose: 7000 });
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
      toast.error("Failed to load classes", { autoClose: 7000 });
      return { options: [], total: 0 };
    }
  };

  const fetchBookApi = async ({
    search,
    page = 1,
    limit = 100000,
    subjectId,
    classId,
  }) => {
    try {
      if (!isMountedRef.current) return { options: [], total: 0 };
      setBookLoading(true);
      let query = `page=${page}&limit=${limit}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (subjectId && classId)
        query += `&subjectId=${subjectId}&classId=${classId}`;
      const res = await getApi(`${APIS.BOOK_BY_SUBJECT_CLASS}?${query}`);
      const booksData = res?.data?.Books || [];
      const total = res?.data?.count || booksData.length;
      const formattedBooks = booksData.map((book) => ({
        value: book._id,
        label: book.book || book.nameEn,
      }));
      return { options: formattedBooks, total };
    } catch (error) {
      toast.error("Failed to load books", { autoClose: 7000 });
      return { options: [], total: 0 };
    } finally {
      if (isMountedRef.current) setBookLoading(false);
    }
  };

  const fetchLessons = async (subjectId, classId, bookId) => {
    if (!subjectId || !classId || !bookId || !isMountedRef.current) return [];
    try {
      setLessonLoading(true);
      const queryParams = new URLSearchParams({ subjectId, classId, bookId });
      const res = await getApi(`${APIS.LESSON_LIST}?${queryParams.toString()}`);
      const lessonData = res?.data?.lessons || [];
      const formattedLessons = lessonData.map((lesson) => ({
        value: lesson._id,
        label: lesson.nameEn,
      }));
      if (isMountedRef.current) setLessons(formattedLessons);
      return formattedLessons;
    } catch (error) {
      toast.error(error.message || "Failed to load lessons", {
        autoClose: 7000,
      });
      if (isMountedRef.current) setLessons([]);
      return [];
    } finally {
      if (isMountedRef.current) setLessonLoading(false);
    }
  };

  const fetchTopics = async (subjectId, classId, bookId, lessonId) => {
    if (!subjectId || !classId || !bookId || !lessonId || !isMountedRef.current)
      return [];
    try {
      setTopicLoading(true);
      const queryParams = new URLSearchParams({
        subjectId,
        classId,
        bookId,
        lessonId,
      });
      const res = await getApi(`${APIS.TOPIC_LIST}?${queryParams.toString()}`);
      const topicData = res?.data?.topics || [];
      const formattedTopics = topicData.map((topic) => ({
        value: topic._id,
        label: topic.topic,
      }));
      if (isMountedRef.current) setTopics(formattedTopics);
      return formattedTopics;
    } catch (error) {
      toast.error(error.message || "Failed to load topics", {
        autoClose: 7000,
      });
      if (isMountedRef.current) setTopics([]);
      return [];
    } finally {
      if (isMountedRef.current) setTopicLoading(false);
    }
  };

  const debouncedFetchLessons = useMemo(
    () =>
      debounce((subjectId, classId, bookId, callback) => {
        if (!isMountedRef.current) return;
        fetchLessons(subjectId, classId, bookId).then((lessons) => {
          if (isMountedRef.current) callback(lessons);
        });
      }, 500),
    []
  );

  const debouncedFetchTopics = useMemo(
    () =>
      debounce((subjectId, classId, bookId, lessonId, callback) => {
        if (!isMountedRef.current) return;
        fetchTopics(subjectId, classId, bookId, lessonId).then((topics) => {
          if (isMountedRef.current) callback(topics);
        });
      }, 500),
    []
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      debouncedFetchLessons.cancel();
      debouncedFetchTopics.cancel();
    };
  }, [debouncedFetchLessons, debouncedFetchTopics]);

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
            newInitialData.subjectId = [subjectsRes.options[0].value];
          }
          if (classesRes.options.length > 0) {
            newInitialData.classId = [classesRes.options[0].value];
          }
        }

        if (!id) {
          setInitialData(newInitialData);
          setQuestionEditorState(EditorState.createEmpty());
          setSolutionEditorState(EditorState.createEmpty());
          setHintEditorState(EditorState.createEmpty());

          // Fetch books for pre-selected class and subject for editor
          if (
            isEditor &&
            newInitialData.classId.length &&
            newInitialData.subjectId.length
          ) {
            const booksRes = await fetchBookApi({
              page: 1,
              limit: 10,
              classId: newInitialData.classId[0],
              subjectId: newInitialData.subjectId[0],
            });
            if (isMountedRef.current) {
              setBooks(booksRes.options || []);
              if (booksRes.options.length > 0) {
                newInitialData.bookId = [
                  booksRes.options.find(
                    (book) => book.value === userProfile.bookId[0]
                  ).value,
                ];
                setInitialData({ ...newInitialData });
                setDependencyValues({
                  subjectId: newInitialData.subjectId[0],
                  classId: newInitialData.classId[0],
                  bookId: newInitialData.bookId[0],
                  lessonId: null,
                });
                dependencyRef.current = {
                  subjectId: newInitialData.subjectId[0],
                  classId: newInitialData.classId[0],
                  bookId: newInitialData.bookId[0],
                  lessonId: null,
                };
                const initialLessons = await fetchLessons(
                  newInitialData.subjectId[0],
                  newInitialData.classId[0],
                  newInitialData.bookId[0]
                );
                if (initialLessons.length > 0) {
                  newInitialData.lessonId = [initialLessons[0].value];
                  setInitialData({ ...newInitialData });
                  setLessons(initialLessons);
                  const initialTopics = await fetchTopics(
                    newInitialData.subjectId[0],
                    newInitialData.classId[0],
                    newInitialData.bookId[0],
                    newInitialData.lessonId[0]
                  );
                  if (initialTopics.length > 0) {
                    newInitialData.topicId = [initialTopics[0].value];
                    setInitialData({ ...newInitialData });
                    setTopics(initialTopics);
                  }
                }
              }
            }
          }
          return;
        }

        // Edit mode
        const res = await getApi(APIS.Homework, id);
        const editData = res?.data;
        if (editData) {
          newInitialData = {
            subjectId: editData.subjectId?.length
              ? [editData.subjectId[0]._id]
              : [],
            classId: editData.classId?.length ? [editData.classId[0]._id] : [],
            bookId: editData.bookId?.length ? [editData.bookId[0]._id] : [],
            lessonId: editData.lessonId?.length
              ? [editData.lessonId[0]._id]
              : [],
            topicId: editData.topicId?.length ? [editData.topicId[0]._id] : [],
            question: editData.question || "",
            solution: editData.solution || "",
            hint: editData.hint || "",
            videoTutorialLink: editData.videoTutorialLink || "",
            saveAndNew: false,
          };
          setInitialData(newInitialData);

          // Set editor states
          if (newInitialData.question) {
            const blocksFromHTML = convertFromHTML(newInitialData.question);
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setQuestionEditorState(EditorState.createWithContent(contentState));
          } else {
            setQuestionEditorState(EditorState.createEmpty());
          }

          if (newInitialData.solution) {
            const blocksFromHTML = convertFromHTML(newInitialData.solution);
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setSolutionEditorState(EditorState.createWithContent(contentState));
          } else {
            setSolutionEditorState(EditorState.createEmpty());
          }

          if (newInitialData.hint) {
            const blocksFromHTML = convertFromHTML(newInitialData.hint);
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setHintEditorState(EditorState.createWithContent(contentState));
          } else {
            setHintEditorState(EditorState.createEmpty());
          }

          // Fetch books for edit mode
          if (
            newInitialData.subjectId.length &&
            newInitialData.classId.length
          ) {
            const booksRes = await fetchBookApi({
              page: 1,
              limit: 10,
              classId: newInitialData.classId[0],
              subjectId: newInitialData.subjectId[0],
            });
            if (isMountedRef.current) {
              let updatedBooks = booksRes.options || [];
              if (
                newInitialData.bookId.length &&
                !updatedBooks.some(
                  (book) => book.value === newInitialData.bookId[0]
                )
              ) {
                updatedBooks = [
                  {
                    value: newInitialData.bookId[0],
                    label: editData.bookId[0]?.book || "Unknown Book",
                  },
                  ...updatedBooks,
                ];
              }
              setBooks(updatedBooks);
            }
          }

          // Fetch lessons and topics for edit mode
          if (
            newInitialData.subjectId.length &&
            newInitialData.classId.length &&
            newInitialData.bookId.length
          ) {
            setDependencyValues({
              subjectId: newInitialData.subjectId[0],
              classId: newInitialData.classId[0],
              bookId: newInitialData.bookId[0],
              lessonId: newInitialData.lessonId[0],
            });
            dependencyRef.current = {
              subjectId: newInitialData.subjectId[0],
              classId: newInitialData.classId[0],
              bookId: newInitialData.bookId[0],
              lessonId: newInitialData.lessonId[0],
            };

            const initialLessons = await fetchLessons(
              newInitialData.subjectId[0],
              newInitialData.classId[0],
              newInitialData.bookId[0]
            );
            if (isMountedRef.current && newInitialData.lessonId.length) {
              let updatedLessons = initialLessons;
              if (
                !initialLessons.some(
                  (lesson) => lesson.value === newInitialData.lessonId[0]
                )
              ) {
                updatedLessons = [
                  {
                    value: newInitialData.lessonId[0],
                    label: editData.lessonId[0]?.nameEn || "Unknown Lesson",
                  },
                  ...initialLessons,
                ];
              }
              setLessons(updatedLessons);
            }

            if (newInitialData.lessonId.length) {
              const initialTopics = await fetchTopics(
                newInitialData.subjectId[0],
                newInitialData.classId[0],
                newInitialData.bookId[0],
                newInitialData.lessonId[0]
              );
              if (isMountedRef.current && newInitialData.topicId.length) {
                let updatedTopics = initialTopics;
                if (
                  !initialTopics.some(
                    (topic) => topic.value === newInitialData.topicId[0]
                  )
                ) {
                  updatedTopics = [
                    {
                      value: newInitialData.topicId[0],
                      label: editData.topicId[0]?.topic || "Unknown Topic",
                    },
                    ...initialTopics,
                  ];
                }
                setTopics(updatedTopics);
              }
            }
          }
        } else {
          toast.error("No data found for the provided ID", { autoClose: 7000 });
          setInitialData(initialValues);
          setQuestionEditorState(EditorState.createEmpty());
          setSolutionEditorState(EditorState.createEmpty());
          setHintEditorState(EditorState.createEmpty());
        }
      } catch (error) {
        toast.error(error.message || "Failed to load data", {
          autoClose: 7000,
        });
        setInitialData(initialValues);
        setQuestionEditorState(EditorState.createEmpty());
        setSolutionEditorState(EditorState.createEmpty());
        setHintEditorState(EditorState.createEmpty());
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEditor]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const jsonPayload = {
        subjectId: values.subjectId.length ? [values.subjectId[0]] : [],
        classId: values.classId.length ? [values.classId[0]] : [],
        bookId: values.bookId.length ? [values.bookId[0]] : [],
        lessonId: values.lessonId.length ? [values.lessonId[0]] : [],
        topicId: values.topicId.length ? [values.topicId[0]] : [],
        question: values.question,
        solution: values.solution,
        hint: values.hint,
        videoTutorialLink: values.videoTutorialLink,
      };

      let apiCall;
      if (id) {
        apiCall = patchApi(APIS.Homework, id, jsonPayload, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        apiCall = postApi(APIS.Homework, jsonPayload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      const res = await apiCall;
      const successMessage = id
        ? "Homework updated successfully"
        : "Homework added successfully";
      toast.success(successMessage);
      if (values.saveAndNew) {
        resetForm({
          values: {
            ...initialValues,
            ...(isEditor &&
              classes.length > 0 && {
                classId: [classes[0].value],
              }),
            ...(isEditor &&
              subjects.length > 0 && {
                subjectId: [subjects[0].value],
              }),
            ...(isEditor &&
              books.length > 0 && {
                bookId: [books[0].value],
              }),
          },
        });
        setInitialData({
          ...initialValues,
          ...(isEditor &&
            classes.length > 0 && {
              classId: [classes[0].value],
            }),
          ...(isEditor &&
            subjects.length > 0 && {
              subjectId: [subjects[0].value],
            }),
          ...(isEditor &&
            books.length > 0 && {
              bookId: [books[0].value],
            }),
        });
        setQuestionEditorState(EditorState.createEmpty());
        setSolutionEditorState(EditorState.createEmpty());
        setHintEditorState(EditorState.createEmpty());
        setDependencyValues({
          subjectId: isEditor && subjects.length > 0 ? subjects[0].value : null,
          classId: isEditor && classes.length > 0 ? classes[0].value : null,
          bookId: isEditor && books.length > 0 ? books[0].value : null,
          lessonId: null,
        });
        dependencyRef.current = {
          subjectId: isEditor && subjects.length > 0 ? subjects[0].value : null,
          classId: isEditor && classes.length > 0 ? classes[0].value : null,
          bookId: isEditor && books.length > 0 ? books[0].value : null,
          lessonId: null,
        };
        setLessons([]);
        setTopics([]);
        bookInteractedRef.current = false;

        // Fetch lessons and topics for pre-selected values for editor
        if (isEditor && books.length > 0) {
          const newLessons = await fetchLessons(
            subjects[0]?.value,
            classes[0]?.value,
            books[0]?.value
          );
          if (isMountedRef.current) {
            setLessons(newLessons);
            if (newLessons.length > 0) {
              setInitialData((prev) => ({
                ...prev,
                lessonId: [newLessons[0].value],
              }));
              const newTopics = await fetchTopics(
                subjects[0]?.valueObjevalue,
                classes[0]?.value,
                books[0]?.value,
                newLessons[0]?.value
              );
              if (isMountedRef.current) {
                setTopics(newTopics);
                if (newTopics.length > 0) {
                  setInitialData((prev) => ({
                    ...prev,
                    topicId: [newTopics[0].value],
                  }));
                }
              }
            }
          }
        }
        window.location.reload();
      } else {
        setTimeout(() => {
          if (isMountedRef.current) navigate("/homework");
        }, 1000);
      }
    } catch (error) {
      console.error("Error submitting homework:", error);
      toast.error(
        id ? "Failed to update homework" : "Failed to create homework"
      );
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
          const handleSolutionEditorChange = (newEditorState) => {
            setSolutionEditorState(newEditorState);
            const contentState = newEditorState.getCurrentContent();
            const rawContent = convertToRaw(contentState);
            const htmlContent = draftToHtml(rawContent);
            setFieldValue("solution", htmlContent);
          };

          const handleQuestionEditorChange = (newEditorState) => {
            setQuestionEditorState(newEditorState);
            const contentState = newEditorState.getCurrentContent();
            const rawContent = convertToRaw(contentState);
            const htmlContent = draftToHtml(rawContent);
            setFieldValue("question", htmlContent);
          };

          const handleHintEditorChange = (newEditorState) => {
            setHintEditorState(newEditorState);
            const contentState = newEditorState.getCurrentContent();
            const rawContent = convertToRaw(contentState);
            const htmlContent = draftToHtml(rawContent);
            setFieldValue("hint", htmlContent);
          };

          const currentDependencies = useMemo(
            () => ({
              subjectId: values.subjectId[0] || null,
              classId: values.classId[0] || null,
              bookId: values.bookId[0] || null,
              lessonId: values.lessonId[0] || null,
            }),
            [values.subjectId, values.classId, values.bookId, values.lessonId]
          );

          useEffect(() => {
            if (values.classId.length) setFieldTouched("classId", true, false);
            if (values.subjectId.length)
              setFieldTouched("subjectId", true, false);
            if (values.bookId.length) setFieldTouched("bookId", true, false);
            if (values.lessonId.length)
              setFieldTouched("lessonId", true, false);
            if (values.topicId.length) setFieldTouched("topicId", true, false);
          }, [
            values.classId,
            values.subjectId,
            values.bookId,
            values.lessonId,
            values.topicId,
            setFieldTouched,
          ]);

          useEffect(() => {
            const { subjectId, classId } = currentDependencies;
            if (
              isMountedRef.current &&
              subjectId &&
              classId &&
              !isEditor &&
              (subjectId !== dependencyRef.current.subjectId ||
                classId !== dependencyRef.current.classId)
            ) {
              fetchBookApi({ page: 1, limit: 100000, subjectId, classId }).then(
                (booksRes) => {
                  if (isMountedRef.current) {
                    let updatedBooks = booksRes.options || [];
                    if (
                      id &&
                      values.bookId.length &&
                      !updatedBooks.some(
                        (book) => book.value === values.bookId[0]
                      )
                    ) {
                      updatedBooks = [
                        {
                          value: values.bookId[0],
                          label: initialData.bookId[0]?.book || "Unknown Book",
                        },
                        ...updatedBooks,
                      ];
                    }
                    setBooks(updatedBooks);
                    if (
                      bookDropdownRef.current &&
                      booksRes.options.length > 0 &&
                      !bookInteractedRef.current &&
                      !id
                    ) {
                      bookDropdownRef.current.open();
                    }
                  }
                }
              );
            }
          }, [
            currentDependencies.subjectId,
            currentDependencies.classId,
            id,
            initialData,
            isEditor,
          ]);

          useEffect(() => {
            const { subjectId, classId, bookId, lessonId } =
              currentDependencies;
            setDependencyValues({ subjectId, classId, bookId, lessonId });

            if (
              isMountedRef.current &&
              subjectId &&
              classId &&
              bookId &&
              !isEditor &&
              (subjectId !== dependencyRef.current.subjectId ||
                classId !== dependencyRef.current.classId ||
                bookId !== dependencyRef.current.bookId)
            ) {
              debouncedFetchLessons(
                subjectId,
                classId,
                bookId,
                (newLessons) => {
                  if (isMountedRef.current) {
                    let updatedLessons = newLessons;
                    if (
                      id &&
                      values.lessonId.length &&
                      !newLessons.some(
                        (lesson) => lesson.value === values.lessonId[0]
                      )
                    ) {
                      updatedLessons = [
                        {
                          value: values.lessonId[0],
                          label:
                            initialData.lessonId[0]?.nameEn || "Unknown Lesson",
                        },
                        ...newLessons,
                      ];
                    }
                    setLessons(updatedLessons);
                    if (!newLessons.length) {
                      setFieldValue("lessonId", []);
                      setFieldValue("topicId", []);
                    }
                  }
                }
              );
            }

            if (
              isMountedRef.current &&
              subjectId &&
              classId &&
              bookId &&
              lessonId &&
              (subjectId !== dependencyRef.current.subjectId ||
                classId !== dependencyRef.current.classId ||
                bookId !== dependencyRef.current.bookId ||
                lessonId !== dependencyRef.current.lessonId)
            ) {
              debouncedFetchTopics(
                subjectId,
                classId,
                bookId,
                lessonId,
                (newTopics) => {
                  if (isMountedRef.current) {
                    let updatedTopics = newTopics;
                    if (
                      id &&
                      values.topicId.length &&
                      !newTopics.some(
                        (topic) => topic.value === values.topicId[0]
                      )
                    ) {
                      updatedTopics = [
                        {
                          value: values.topicId[0],
                          label:
                            initialData.topicId[0]?.topic || "Unknown Topic",
                        },
                        ...newTopics,
                      ];
                    }
                    setTopics(updatedTopics);
                    if (!newTopics.length) {
                      setFieldValue("topicId", []);
                    }
                  }
                }
              );
            }

            dependencyRef.current = { subjectId, classId, bookId, lessonId };
          }, [
            currentDependencies.subjectId,
            currentDependencies.classId,
            currentDependencies.bookId,
            currentDependencies.lessonId,
            id,
            initialData,
            isEditor,
            setFieldValue,
          ]);

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
                      backNavi={() => navigate("/homework")}
                      breadCrumbs={[{ name: "Homework", path: "/homework" }]}
                      boldItem={id ? "Edit Homework" : "Add Homework"}
                    />
                    <Heading>{id ? "Edit" : "Add"} Homework</Heading>
                  </div>
                  <ButtonContainer className="glowing space-x-2">
                    <Button
                      type="button" // Ensure this is type="button" to prevent form submission
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/homework");
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
                        Save & New
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
                                          const newValue = value ? [value] : [];
                                          form.setFieldValue(
                                            "classId",
                                            newValue
                                          );
                                          form.setFieldValue("bookId", []);
                                          form.setFieldValue("lessonId", []);
                                          form.setFieldValue("topicId", []);
                                          setBooks([]);
                                          setLessons([]);
                                          setTopics([]);
                                          bookInteractedRef.current = false;
                                        }
                                      }}
                                      value={field.value[0] || null}
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
                                      !form.values.classId.length && (
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
                                          const newValue = value ? [value] : [];
                                          form.setFieldValue(
                                            "subjectId",
                                            newValue
                                          );
                                          form.setFieldValue("bookId", []);
                                          form.setFieldValue("lessonId", []);
                                          form.setFieldValue("topicId", []);
                                          setBooks([]);
                                          setLessons([]);
                                          setTopics([]);
                                          bookInteractedRef.current = false;
                                        }
                                      }}
                                      value={field.value[0] || null}
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
                                      !form.values.subjectId.length && (
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
                                      ref={bookDropdownRef}
                                      fetchApi={(params) =>
                                        fetchBookApi({
                                          ...params,
                                          subjectId: values.subjectId[0],
                                          classId: values.classId[0],
                                        })
                                      }
                                      options={books}
                                      onChange={(value) => {
                                        if (!isEditor) {
                                          const newValue = value ? [value] : [];
                                          form.setFieldValue(
                                            "bookId",
                                            newValue
                                          );
                                          form.setFieldValue("lessonId", []);
                                          form.setFieldValue("topicId", []);
                                          setLessons([]);
                                          setTopics([]);
                                          bookInteractedRef.current = true;
                                        }
                                      }}
                                      value={field.value[0] || null}
                                      placeholder={
                                        bookLoading
                                          ? "Loading Books..."
                                          : !values.subjectId.length ||
                                            !values.classId.length
                                          ? "Select subject and class first"
                                          : books.length > 0
                                          ? "Select Book"
                                          : "No Books Available"
                                      }
                                      disabled={
                                        isEditor ||
                                        !values.subjectId.length ||
                                        !values.classId.length ||
                                        bookLoading
                                      }
                                      isClearable={!isEditor}
                                      getOptionLabel={(option) => option.label}
                                      getOptionValue={(option) => option.value}
                                    />
                                    {form.touched.bookId &&
                                      form.errors.bookId &&
                                      !form.values.bookId.length && (
                                        <p className="text-red-500 text-xs mt-1">
                                          {form.errors.bookId}
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
                                        const newValue = value ? [value] : [];
                                        form.setFieldValue(
                                          "lessonId",
                                          newValue
                                        );
                                        form.setFieldValue("topicId", []);
                                        setTopics([]);
                                      }}
                                      value={field.value[0] || null}
                                      placeholder={
                                        lessonLoading
                                          ? "Loading Lessons..."
                                          : !values.subjectId.length ||
                                            !values.classId.length ||
                                            !values.bookId.length
                                          ? "Select subject, class, and book first"
                                          : lessons.length > 0
                                          ? "Select Lesson"
                                          : "No Lessons Available"
                                      }
                                      disabled={
                                        !values.subjectId.length ||
                                        !values.classId.length ||
                                        !values.bookId.length ||
                                        lessonLoading
                                      }
                                      isClearable
                                      getOptionLabel={(option) => option.label}
                                      getOptionValue={(option) => option.value}
                                    />
                                    {form.touched.lessonId &&
                                      form.errors.lessonId &&
                                      !form.values.lessonId.length && (
                                        <p className="text-red-500 text-xs mt-1">
                                          {form.errors.lessonId}
                                        </p>
                                      )}
                                  </div>
                                )}
                              </Field>
                              <Field name="topicId">
                                {({ field, form }) => (
                                  <div className="flex-1 w-100">
                                    <label className="block mb-2 font-medium c-black text-[14px]">
                                      Topic
                                    </label>
                                    <Dropdown
                                      options={topics}
                                      onChange={(value) => {
                                        const newValue = value ? [value] : [];
                                        form.setFieldValue("topicId", newValue);
                                      }}
                                      value={field.value[0] || null}
                                      placeholder={
                                        topicLoading
                                          ? "Loading Topics..."
                                          : !values.subjectId.length ||
                                            !values.classId.length ||
                                            !values.bookId.length ||
                                            !values.lessonId.length
                                          ? "Select subject, class, book, and lesson first"
                                          : topics.length > 0
                                          ? "Select Topic"
                                          : "No Topics Available"
                                      }
                                      disabled={
                                        !values.subjectId.length ||
                                        !values.classId.length ||
                                        !values.bookId.length ||
                                        !values.lessonId.length ||
                                        topicLoading
                                      }
                                      isClearable
                                      getOptionLabel={(option) => option.label}
                                      getOptionValue={(option) => option.value}
                                    />
                                    {form.touched.topicId &&
                                      form.errors.topicId &&
                                      !form.values.topicId.length && (
                                        <p className="text-red-500 text-xs mt-1">
                                          {form.errors.topicId}
                                        </p>
                                      )}
                                  </div>
                                )}
                              </Field>
                              <div className="flex-1 w-100">
                                <FormikTextField
                                  label="Video Tutorial Link"
                                  placeholder="Enter video tutorial link"
                                  name="videoTutorialLink"
                                  className="larger-input"
                                />
                              </div>
                            </div>
                            <div className="group-type-3-equal">
                              <div className="w-100 mt-4">
                                <label className="block mb-2 font-medium c-black text-[14px]">
                                  Question{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <EditorField
                                  name="question"
                                  initialContent={values.question}
                                  setFieldValue={setFieldValue}
                                  setFieldTouched={setFieldTouched}
                                  touched={touched}
                                  errors={errors}
                                  uploadImageCallBack={uploadImageCallBack}
                                  editorState={questionEditorState}
                                  onEditorStateChange={
                                    handleQuestionEditorChange
                                  }
                                />
                                {touched.question && errors.question && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors.question}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="w-100 mt-4">
                              <label className="block mb-2 font-medium c-black text-[14px]">
                                {/* Solution 14/07/2025 done by ishreyash */}
                                Answer
                              </label>
                              <EditorField
                                name="solution"
                                initialContent={values.solution}
                                setFieldValue={setFieldValue}
                                setFieldTouched={setFieldTouched}
                                touched={touched}
                                errors={errors}
                                uploadImageCallBack={uploadImageCallBack}
                                editorState={solutionEditorState}
                                onEditorStateChange={handleSolutionEditorChange}
                              />
                              {touched.solution && errors.solution && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.solution}
                                </p>
                              )}
                            </div>
                            <div className="w-100 mt-4">
                              <label className="block mb-2 font-medium c-black text-[14px]">
                                {/* Hint 14/07/2025 done by ishreyash */}
                                Solution
                              </label>
                              <EditorField
                                name="hint"
                                initialContent={values.hint}
                                setFieldValue={setFieldValue}
                                setFieldTouched={setFieldTouched}
                                touched={touched}
                                errors={errors}
                                uploadImageCallBack={uploadImageCallBack}
                                editorState={hintEditorState}
                                onEditorStateChange={handleHintEditorChange}
                              />
                              {touched.hint && errors.hint && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.hint}
                                </p>
                              )}
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

export default AddEditHomework;
