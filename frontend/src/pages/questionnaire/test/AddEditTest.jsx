import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import Dropdown from "@/components/common/CustomSelect/dropdown";
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
import { getApi, postApi, patchApi } from "@/services/method";
import { APIS } from "@/constants/api.constant";
import debounce from "lodash/debounce";
import Select, { components } from "react-select";
import ROUTES from "@/constants/route.constant";
import { ChevronDown } from "lucide-react";
import EditorField from "@/components/Editor/Editor";
import {
  EditorState,
  ContentState,
  convertFromHTML,
  convertToRaw,
} from "draft-js";
import draftToHtml from "draftjs-to-html";
import useStore from "@/store";

// CSS for responsiveness
const responsiveStyles = `
  .flex-1 {
    flex: 1;
    min-width: 0;
  }

  .editor-container {
    min-height: 150px; /* Ensure editor has enough height to open */
    overflow: auto;
  }

  @media (max-width: 450px) {
    .flex-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .space-x-4 {
      
    }

    .w-12 {
      width: 40px;
    }

    .h-6 {
      height: 24px;
    }

    .text-[14px] {
      font-size: 12px;
    }
  }
`;

// Inject styles into the document
const styleSheet = document.createElement("style");
styleSheet.innerText = responsiveStyles;
document.head.appendChild(styleSheet);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in Dropdown:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 text-xs">
          Error loading dropdown. Please try again.
        </div>
      );
    }
    return this.props.children;
  }
}

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown size={16} />
    </components.DropdownIndicator>
  );
};

const initialValues = {
  codee: "",
  testsName: "",
  type: "",
  testType: "online",
  questionType: "",
  description: "",
  descriptionSol: "",
  classId: "",
  subjectId: "",
  bookId: "",
  lessonId: "",
  topicId: "",
  option1: false,
  option2: false,
  option3: false,
  option4: false,
  mark1: "",
  mark2: "",
  mark3: "",
  mark4: "",
  totalTrue: "",
  desTrue: "",
  displayTrue: false,
  optionText1: "",
  optionText2: "",
  optionText3: "",
  optionText4: "",
  optionAssertionText1: "",
  optionAssertionText2: "",
  optionAssertionText3: "",
  optionAssertionText4: "",
  optionAssertion1: false,
  optionAssertion2: false,
  optionAssertion3: false,
  optionAssertion4: false,
  markAssertion1: "",
  markAssertion2: "",
  markAssertion3: "",
  markAssertion4: "",
  optionTrue: "",
  markTrue: "",
  markFalse: "",
  status: "Active",
};

const assertionOptions = [
  "Both A and B are true",
  "A is true, but B is false",
  "B is true, but A is false",
  "Neither A nor B is true",
];

const questionTypeOptions = [
  { value: "Descriptive", label: "Descriptive" },
  { value: "MCQ", label: "MCQ" },
  { value: "True/False", label: "True/False" },
  { value: "Assertion-Reason", label: "Assertion-Reason" },
];

const onlineQuestionTypeOptions = [
  { value: "MCQ", label: "MCQ" },
  { value: "True/False", label: "True/False" },
  { value: "Assertion-Reason", label: "Assertion-Reason" },
];

const validationSchema = Yup.object().shape({
  type: Yup.string().required("Question Type is required"),
  subjectId: Yup.string().required("Please select a subject"),
  classId: Yup.string().required("Please select a class"),
  bookId: Yup.string().required("Please select a book"),
  lessonId: Yup.string().required("Please select a lesson"),
  mark1: Yup.string().matches(/^\d{1,2}(\.\d{1,2})?$/, "Invalid mark format"),
  mark2: Yup.string().matches(/^\d{1,2}(\.\d{1,2})?$/, "Invalid mark format"),
  mark3: Yup.string().matches(/^\d{1,2}(\.\d{1,2})?$/, "Invalid mark format"),
  mark4: Yup.string().matches(/^\d{1,2}(\.\d{1,2})?$/, "Invalid mark format"),
  markAssertion1: Yup.string().matches(
    /^\d{1,2}(\.\d{1,2})?$/,
    "Invalid mark format"
  ),
  markAssertion2: Yup.string().matches(
    /^\d{1,2}(\.\d{1,2})?$/,
    "Invalid mark format"
  ),
  markAssertion3: Yup.string().matches(
    /^\d{1,2}(\.\d{1,2})?$/,
    "Invalid mark format"
  ),
  markAssertion4: Yup.string().matches(
    /^\d{1,2}(\.\d{1,2})?$/,
    "Invalid mark format"
  ),
  markTrue: Yup.string().matches(
    /^\d{1,2}(\.\d{1,2})?$/,
    "Invalid mark format"
  ),
  markFalse: Yup.string().matches(
    /^\d{1,2}(\.\d{1,2})?$/,
    "Invalid mark format"
  ),
  desTrue: Yup.string().matches(/^\d{1,2}(\.\d{1,2})?$/, "Invalid mark format"),
  totalTrue: Yup.string().matches(
    /^\d{1,2}(\.\d{2})$/,
    "Invalid total mark format"
  ),
  optionText1: Yup.string().test(
    "no-only-whitespace",
    "Option 1 cannot contain only whitespace",
    (value) => !value || value.trim().length > 0
  ),
  optionText2: Yup.string().test(
    "no-only-whitespace",
    "Option 2 cannot contain only whitespace",
    (value) => !value || value.trim().length > 0
  ),
  optionText3: Yup.string().test(
    "no-only-whitespace",
    "Option 3 cannot contain only whitespace",
    (value) => !value || value.trim().length > 0
  ),
  optionText4: Yup.string().test(
    "no-only-whitespace",
    "Option 4 cannot contain only whitespace",
    (value) => !value || value.trim().length > 0
  ),
  optionAssertionText1: Yup.string().test(
    "no-only-whitespace",
    "Assertion Option 1 cannot contain only whitespace",
    (value) => !value || value.trim().length > 0
  ),
  optionAssertionText2: Yup.string().test(
    "no-only-whitespace",
    "Assertion Option 2 cannot contain only whitespace",
    (value) => !value || value.trim().length > 0
  ),
  optionAssertionText3: Yup.string().test(
    "no-only-whitespace",
    "Assertion Option 3 cannot contain only whitespace",
    (value) => !value || value.trim().length > 0
  ),
  optionAssertionText4: Yup.string().test(
    "no-only-whitespace",
    "Assertion Option 4 cannot contain only whitespace",
    (value) => !value || value.trim().length > 0
  ),
});

const selectStyles = {
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
    fontSize: "clamp(12px, 3vw, 14px)",
    "&:hover": { borderColor: "#aaa" },
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    paddingRight: "8px",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#aaa",
    padding: "4px",
  }),
  option: (provided) => ({ ...provided, fontSize: "clamp(12px, 3vw, 14px)" }),
  placeholder: (provided) => ({
    ...provided,
    fontSize: "clamp(12px, 3vw, 14px)",
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: "clamp(12px, 3vw, 14px)",
  }),
};

const AddEditTest = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userProfile } = useStore();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(initialValues);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [topics, setTopics] = useState([]);
  const [bookLoading, setBookLoading] = useState(false);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [topicLoading, setTopicLoading] = useState(false);
  const isMountedRef = useRef(true);
  const bookDropdownRef = useRef(null);
  const bookInteractedRef = useRef(false);
  const [descriptionEditorState, setDescriptionEditorState] = useState(
    EditorState.createEmpty()
  );
  const [descriptionSolEditorState, setDescriptionSolEditorState] = useState(
    EditorState.createEmpty()
  );
  const [optionText1EditorState, setOptionText1EditorState] = useState(
    EditorState.createEmpty()
  );
  const [optionText2EditorState, setOptionText2EditorState] = useState(
    EditorState.createEmpty()
  );
  const [optionText3EditorState, setOptionText3EditorState] = useState(
    EditorState.createEmpty()
  );
  const [optionText4EditorState, setOptionText4EditorState] = useState(
    EditorState.createEmpty()
  );
  const [optionAssertionText1EditorState, setOptionAssertionText1EditorState] =
    useState(EditorState.createEmpty());
  const [optionAssertionText2EditorState, setOptionAssertionText2EditorState] =
    useState(EditorState.createEmpty());
  const [optionAssertionText3EditorState, setOptionAssertionText3EditorState] =
    useState(EditorState.createEmpty());
  const [optionAssertionText4EditorState, setOptionAssertionText4EditorState] =
    useState(EditorState.createEmpty());

  // Memoized fetch functions
  const fetchClasses = useCallback(
    async ({ search, page = 1, limit = 100000 }) => {
      try {
        const query = search
          ? `search=${encodeURIComponent(search)}`
          : `page=${page}&limit=${limit}`;
        const res = await getApi(`${APIS.CLASS_LIST}?${query}`);
        const classData = res?.data?.Classes || [];
        const formattedClasses = classData
          .filter((item) => item.isActive === true)
          .map((cls) => ({
            value: cls._id,
            label: cls.nameEn,
          }));
        if (isMountedRef.current) setClasses(formattedClasses);
        return {
          options: formattedClasses,
          total: res?.data?.total || classData.length,
        };
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Failed to load classes", { autoClose: 7000 });
        return { options: [], total: 0 };
      }
    },
    []
  );

  const fetchSubjects = useCallback(
    async ({ search, page = 1, limit = 100000 }) => {
      try {
        const query = search
          ? `search=${encodeURIComponent(search)}`
          : `page=${page}&limit=${limit}`;
        const res = await getApi(`${APIS.SUBJECT_LIST}?${query}`);
        const subjectData = res?.data?.subject || [];
        const formattedSubjects = subjectData
          .filter((item) => item.isActive === true)
          .map((subject) => ({
            value: subject._id,
            label: subject.nameEn,
          }));
        if (isMountedRef.current) setSubjects(formattedSubjects);
        return {
          options: formattedSubjects,
          total: res?.data?.total || subjectData.length,
        };
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error("Failed to load subjects", { autoClose: 7000 });
        return { options: [], total: 0 };
      }
    },
    []
  );

  const fetchBooks = useCallback(
    async ({ search, page = 1, limit = 100000, subjectId, classId }) => {
      if (!isMountedRef.current || !subjectId || !classId)
        return { options: [], total: 0 };
      try {
        setBookLoading(true);
        let query = search
          ? `search=${encodeURIComponent(search)}`
          : `page=${page}&limit=${limit}`;
        query += `&subjectId=${subjectId}&classId=${classId}`;
        const res = await getApi(`${APIS.BOOK_BY_SUBJECT_CLASS}?${query}`);
        const booksData = res?.data?.Books || [];
        const formattedBooks = booksData
          .filter((item) => item.isActive === true)
          .map((book) => ({
            value: book._id,
            label: book.book || book.nameEn,
          }));
        if (isMountedRef.current) setBooks(formattedBooks);
        return {
          options: formattedBooks,
          total: res?.data?.count || booksData.length,
        };
      } catch (error) {
        console.error("Error fetching books:", error);
        toast.error("Failed to load books", { autoClose: 7000 });
        return { options: [], total: 0 };
      } finally {
        if (isMountedRef.current) setBookLoading(false);
      }
    },
    []
  );

  const fetchLessons = useCallback(async (subjectId, classId, bookId) => {
    if (!subjectId || !classId || !bookId || !isMountedRef.current) return [];
    try {
      setLessonLoading(true);
      const queryParams = new URLSearchParams({ subjectId, classId, bookId });
      const res = await getApi(`${APIS.LESSON_LIST}?${queryParams.toString()}`);
      const lessonData = res?.data?.lessons || [];
      const formattedLessons = lessonData
        .filter((item) => item.isActive === true)
        .map((lesson) => ({
          value: lesson._id,
          label: lesson.nameEn,
        }));
      if (isMountedRef.current) setLessons(formattedLessons);
      return formattedLessons;
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Failed to load lessons", { autoClose: 7000 });
      if (isMountedRef.current) setLessons([]);
      return [];
    } finally {
      if (isMountedRef.current) setLessonLoading(false);
    }
  }, []);

  const fetchTopics = useCallback(
    async (subjectId, classId, bookId, lessonId) => {
      if (
        !subjectId ||
        !classId ||
        !bookId ||
        !lessonId ||
        !isMountedRef.current
      )
        return [];
      try {
        setTopicLoading(true);
        const queryParams = new URLSearchParams({
          subjectId,
          classId,
          bookId,
          lessonId,
        });
        const res = await getApi(
          `${APIS.TOPIC_LIST}?${queryParams.toString()}`
        );
        const topicData = res?.data?.topics || [];
        const formattedTopics = topicData
          .filter((topic) => topic.topic || topic.nameEn)
          .map((topic) => ({
            value: topic._id,
            label: topic.topic || topic.nameEn,
          }));
        if (isMountedRef.current) setTopics(formattedTopics);
        return formattedTopics;
      } catch (error) {
        console.error("Error fetching topics:", error);
        toast.error("Failed to load topics", { autoClose: 7000 });
        if (isMountedRef.current) setTopics([]);
        return [];
      } finally {
        if (isMountedRef.current) setTopicLoading(false);
      }
    },
    []
  );

  const debouncedFetchLessons = useMemo(
    () =>
      debounce((subjectId, classId, bookId, callback) => {
        if (!isMountedRef.current) return;
        fetchLessons(subjectId, classId, bookId).then(callback);
      }, 500),
    [fetchLessons]
  );

  const debouncedFetchTopics = useMemo(
    () =>
      debounce((subjectId, classId, bookId, lessonId, callback) => {
        if (!isMountedRef.current) return;
        fetchTopics(subjectId, classId, bookId, lessonId).then(callback);
      }, 500),
    [fetchTopics]
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
        if (!id) {
          const [classesRes, subjectsRes] = await Promise.all([
            fetchClasses({ page: 1, limit: 100000 }),
            fetchSubjects({ page: 1, limit: 100000 }),
          ]);

          if (isMountedRef.current) {
            setClasses(classesRes.options || []);
            setSubjects(subjectsRes.options || []);
          }

          let newInitialData = { ...initialValues };
          if (classesRes.options.length > 0) {
            newInitialData.classId = classesRes.options[0].value;
          }
          if (subjectsRes.options.length > 0) {
            newInitialData.subjectId = subjectsRes.options[0].value;
          }

          setInitialData(newInitialData);
          setDescriptionEditorState(EditorState.createEmpty());
          setDescriptionSolEditorState(EditorState.createEmpty());
          setOptionText1EditorState(EditorState.createEmpty());
          setOptionText2EditorState(EditorState.createEmpty());
          setOptionText3EditorState(EditorState.createEmpty());
          setOptionText4EditorState(EditorState.createEmpty());
          setOptionAssertionText1EditorState(EditorState.createEmpty());
          setOptionAssertionText2EditorState(EditorState.createEmpty());
          setOptionAssertionText3EditorState(EditorState.createEmpty());
          setOptionAssertionText4EditorState(EditorState.createEmpty());

          if (newInitialData.classId && newInitialData.subjectId) {
            const booksRes = await fetchBooks({
              page: 1,
              limit: 100000,
              classId: newInitialData.classId,
              subjectId: newInitialData.subjectId,
            });
            if (isMountedRef.current) {
              setBooks(booksRes.options || []);
              if (booksRes.options.length > 0) {
                (newInitialData.bookId = booksRes.options.find(
                  (book) => book.value === userProfile.bookId[0]
                ).value),
                  setInitialData({ ...newInitialData });
                const initialLessons = await fetchLessons(
                  newInitialData.subjectId,
                  newInitialData.classId,
                  newInitialData.bookId
                );
                if (isMountedRef.current) {
                  setLessons(initialLessons);
                  if (initialLessons.length > 0) {
                    newInitialData.lessonId = initialLessons[0].value;
                    setInitialData({ ...newInitialData });
                    const initialTopics = await fetchTopics(
                      newInitialData.subjectId,
                      newInitialData.classId,
                      newInitialData.bookId,
                      newInitialData.lessonId
                    );
                    if (isMountedRef.current) {
                      setTopics(initialTopics);
                      if (initialTopics.length > 0) {
                        newInitialData.topicId = initialTopics[0].value;
                        setInitialData({ ...newInitialData });
                      }
                    }
                  }
                }
              }
            }
          }
          return;
        }

        // Edit mode
        const res = await getApi(APIS.TEST, id);
        const editData = res?.data;
        if (!editData) {
          toast.error("No data found for the provided ID");
          return;
        }
        const newInitialData = {
          codee: editData.codee || "",
          testsName: editData.testsName || "",
          type: editData.type || "",
          testType: editData.testType || "online",
          questionType: editData.questionType || "",
          description: editData.description || "",
          descriptionSol: editData.descriptionSol || "",
          classId: editData.classes?.[0]?._id || "",
          subjectId: editData.subjects?.[0]?._id || "",
          bookId: editData.book?.[0]?._id || "",
          lessonId: editData.lesson?.[0]?._id || "",
          topicId: editData.topic?.[0]?._id || "",
          option1: editData.option1 || false,
          option2: editData.option2 || false,
          option3: editData.option3 || false,
          option4: editData.option4 || false,
          mark1: editData.mark1 || "",
          mark2: editData.mark2 || "",
          mark3: editData.mark3 || "",
          mark4: editData.mark4 || "",
          totalTrue: editData.totalTrue || "",
          desTrue: editData.desTrue || "",
          displayTrue: editData.displayTrue || false,
          optionText1: editData.optionText1 || "",
          optionText2: editData.optionText2 || "",
          optionText3: editData.optionText3 || "",
          optionText4: editData.optionText4 || "",
          optionAssertionText1: editData.optionAssertionText1 || "",
          optionAssertionText2: editData.optionAssertionText2 || "",
          optionAssertionText3: editData.optionAssertionText3 || "",
          optionAssertionText4: editData.optionAssertionText4 || "",
          optionAssertion1: editData.optionAssertion1 || false,
          optionAssertion2: editData.optionAssertion2 || false,
          optionAssertion3: editData.optionAssertion3 || false,
          optionAssertion4: editData.optionAssertion4 || false,
          markAssertion1: editData.markAssertion1 || "",
          markAssertion2: editData.markAssertion2 || "",
          markAssertion3: editData.markAssertion3 || "",
          markAssertion4: editData.markAssertion4 || "",
          optionTrue: editData.optionTrue || "",
          markTrue: editData.markTrue || "",
          markFalse: editData.markFalse || "",
          status: editData.status || "Active",
        };
        setInitialData(newInitialData);

        // Pre-populate dropdown options with edit data
        if (isMountedRef.current) {
          setClasses((prev) => [
            {
              value: editData.classes?.[0]?._id,
              label: editData.classes?.[0]?.nameEn || "Unknown Class",
            },
            ...prev.filter((cls) => cls.value !== editData.classes?.[0]?._id),
          ]);
          setSubjects((prev) => [
            {
              value: editData.subjects?.[0]?._id,
              label: editData.subjects?.[0]?.nameEn || "Unknown Subject",
            },
            ...prev.filter((sub) => sub.value !== editData.subjects?.[0]?._id),
          ]);
          setBooks((prev) => [
            {
              value: editData.book?.[0]?._id,
              label: editData.book?.[0]?.nameEn || "Unknown Book",
            },
            ...prev.filter((book) => book.value !== editData.book?.[0]?._id),
          ]);
          setLessons((prev) => [
            {
              value: editData.lesson?.[0]?._id,
              label: editData.lesson?.[0]?.nameEn || "Unknown Lesson",
            },
            ...prev.filter(
              (lesson) => lesson.value !== editData.lesson?.[0]?._id
            ),
          ]);
          setTopics((prev) => [
            {
              value: editData.topic?.[0]?._id,
              label: editData.topic?.[0]?.nameEn || "Unknown Topic",
            },
            ...prev.filter((topic) => topic.value !== editData.topic?.[0]?._id),
          ]);

          // Fetch additional options
          fetchClasses({ page: 1, limit: 100000 });
          fetchSubjects({ page: 1, limit: 100000 });
          if (editData.subjects?.[0]?._id && editData.classes?.[0]?._id) {
            fetchBooks({
              page: 1,
              limit: 100000,
              subjectId: editData.subjects?.[0]?._id,
              classId: editData.classes?.[0]?._id,
            });
          }
          if (
            editData.subjects?.[0]?._id &&
            editData.classes?.[0]?._id &&
            editData.book?.[0]?._id
          ) {
            fetchLessons(
              editData.subjects?.[0]?._id,
              editData.classes?.[0]?._id,
              editData.book?.[0]?._id
            );
          }
          if (
            editData.subjects?.[0]?._id &&
            editData.classes?.[0]?._id &&
            editData.book?.[0]?._id &&
            editData.lesson?.[0]?._id
          ) {
            fetchTopics(
              editData.subjects?.[0]?._id,
              editData.classes?.[0]?._id,
              editData.book?.[0]?._id,
              editData.lesson?.[0]?._id
            );
          }

          // Initialize editor states with content
          if (newInitialData.description) {
            const blocksFromHTML = convertFromHTML(newInitialData.description);
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setDescriptionEditorState(
              EditorState.createWithContent(contentState)
            );
          } else {
            setDescriptionEditorState(EditorState.createEmpty());
          }

          if (newInitialData.descriptionSol) {
            const blocksFromHTML = convertFromHTML(
              newInitialData.descriptionSol
            );
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setDescriptionSolEditorState(
              EditorState.createWithContent(contentState)
            );
          } else {
            setDescriptionSolEditorState(EditorState.createEmpty());
          }

          // Initialize MCQ option editor states
          if (newInitialData.optionText1) {
            const blocksFromHTML = convertFromHTML(newInitialData.optionText1);
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setOptionText1EditorState(
              EditorState.createWithContent(contentState)
            );
          } else {
            setOptionText1EditorState(EditorState.createEmpty());
          }

          if (newInitialData.optionText2) {
            const blocksFromHTML = convertFromHTML(newInitialData.optionText2);
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setOptionText2EditorState(
              EditorState.createWithContent(contentState)
            );
          } else {
            setOptionText2EditorState(EditorState.createEmpty());
          }

          if (newInitialData.optionText3) {
            const blocksFromHTML = convertFromHTML(newInitialData.optionText3);
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setOptionText3EditorState(
              EditorState.createWithContent(contentState)
            );
          } else {
            setOptionText3EditorState(EditorState.createEmpty());
          }

          if (newInitialData.optionText4) {
            const blocksFromHTML = convertFromHTML(newInitialData.optionText4);
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setOptionText4EditorState(
              EditorState.createWithContent(contentState)
            );
          } else {
            setOptionText4EditorState(EditorState.createEmpty());
          }

          // Initialize Assertion-Reason option editor states
          if (newInitialData.optionAssertionText1) {
            const blocksFromHTML = convertFromHTML(
              newInitialData.optionAssertionText1
            );
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setOptionAssertionText1EditorState(
              EditorState.createWithContent(contentState)
            );
          } else {
            setOptionAssertionText1EditorState(EditorState.createEmpty());
          }

          if (newInitialData.optionAssertionText2) {
            const blocksFromHTML = convertFromHTML(
              newInitialData.optionAssertionText2
            );
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setOptionAssertionText2EditorState(
              EditorState.createWithContent(contentState)
            );
          } else {
            setOptionAssertionText2EditorState(EditorState.createEmpty());
          }

          if (newInitialData.optionAssertionText3) {
            const blocksFromHTML = convertFromHTML(
              newInitialData.optionAssertionText3
            );
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setOptionAssertionText3EditorState(
              EditorState.createWithContent(contentState)
            );
          } else {
            setOptionAssertionText3EditorState(EditorState.createEmpty());
          }

          if (newInitialData.optionAssertionText4) {
            const blocksFromHTML = convertFromHTML(
              newInitialData.optionAssertionText4
            );
            const contentState = ContentState.createFromBlockArray(
              blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap
            );
            setOptionAssertionText4EditorState(
              EditorState.createWithContent(contentState)
            );
          } else {
            setOptionAssertionText4EditorState(EditorState.createEmpty());
          }
        }
      } catch (error) {
        console.error("Error fetching test data:", error);
        // toast.error("Failed to load test data");
        setInitialData(initialValues);
        setDescriptionEditorState(EditorState.createEmpty());
        setDescriptionSolEditorState(EditorState.createEmpty());
        setOptionText1EditorState(EditorState.createEmpty());
        setOptionText2EditorState(EditorState.createEmpty());
        setOptionText3EditorState(EditorState.createEmpty());
        setOptionText4EditorState(EditorState.createEmpty());
        setOptionAssertionText1EditorState(EditorState.createEmpty());
        setOptionAssertionText2EditorState(EditorState.createEmpty());
        setOptionAssertionText3EditorState(EditorState.createEmpty());
        setOptionAssertionText4EditorState(EditorState.createEmpty());
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, fetchClasses, fetchSubjects, fetchBooks, fetchLessons, fetchTopics]);

  const uploadImageCallBack = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ data: { link: reader.result } });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const getNameEn = useCallback((id, options) => {
    if (!id || !options.length) return "";
    const option = options.find((opt) => opt.value === id);
    return option ? option.label : "";
  }, []);

  const handleSubmit = useCallback(
    (values, { setSubmitting, resetForm }) => {
      const payload = {
        codee: values.codee,
        testsName: values.testsName,
        type: values.type,
        testType: values.testType,
        questionType: values.questionType,
        description: values.description,
        descriptionSol: values.descriptionSol,
        classes: values.classId
          ? [
              {
                _id: values.classId,
                nameEn: getNameEn(values.classId, classes),
              },
            ]
          : [],
        subjects: values.subjectId
          ? [
              {
                _id: values.subjectId,
                nameEn: getNameEn(values.subjectId, subjects),
              },
            ]
          : [],
        book: values.bookId
          ? [{ _id: values.bookId, nameEn: getNameEn(values.bookId, books) }]
          : [],
        lesson: values.lessonId
          ? [
              {
                _id: values.lessonId,
                nameEn: getNameEn(values.lessonId, lessons),
              },
            ]
          : [],
        topic: values.topicId
          ? [{ _id: values.topicId, nameEn: getNameEn(values.topicId, topics) }]
          : [],
        option1: values.option1,
        option2: values.option2,
        option3: values.option3,
        option4: values.option4,
        mark1: values.mark1,
        mark2: values.mark2,
        mark3: values.mark3,
        mark4: values.mark4,
        totalTrue: values.totalTrue,
        desTrue: values.desTrue,
        displayTrue: values.displayTrue,
        optionText1: values.optionText1,
        optionText2: values.optionText2,
        optionText3: values.optionText3,
        optionText4: values.optionText4,
        optionAssertionText1: values.optionAssertionText1,
        optionAssertionText2: values.optionAssertionText2,
        optionAssertionText3: values.optionAssertionText3,
        optionAssertionText4: values.optionAssertionText4,
        optionAssertion1: values.optionAssertion1,
        optionAssertion2: values.optionAssertion2,
        optionAssertion3: values.optionAssertion3,
        optionAssertion4: values.optionAssertion4,
        markAssertion1: values.markAssertion1,
        markAssertion2: values.markAssertion2,
        markAssertion3: values.markAssertion3,
        markAssertion4: values.markAssertion4,
        optionTrue: values.optionTrue,
        markTrue: values.markTrue,
        markFalse: values.markFalse,
        isActive: true,
        status: values.status || "Active",
      };

      const apiCall = id
        ? patchApi(APIS.TEST, id, payload)
        : postApi(APIS.TEST, payload);
      apiCall
        .then((response) => {
          toast.success(
            id
              ? "Question updated successfully"
              : "Question created successfully",
            {
              autoClose: 3000,
              onClose: () => {
                if (!id && values.saveAndNew) {
                  resetForm();
                  setInitialData(initialValues);
                  setClasses([]);
                  setSubjects([]);
                  setBooks([]);
                  setLessons([]);
                  setTopics([]);
                  setDescriptionEditorState(EditorState.createEmpty());
                  setDescriptionSolEditorState(EditorState.createEmpty());
                  setOptionText1EditorState(EditorState.createEmpty());
                  setOptionText2EditorState(EditorState.createEmpty());
                  setOptionText3EditorState(EditorState.createEmpty());
                  setOptionText4EditorState(EditorState.createEmpty());
                  setOptionAssertionText1EditorState(EditorState.createEmpty());
                  setOptionAssertionText2EditorState(EditorState.createEmpty());
                  setOptionAssertionText3EditorState(EditorState.createEmpty());
                  setOptionAssertionText4EditorState(EditorState.createEmpty());
                  window.location.reload();
                } else {
                  navigate(-1);
                }
              },
            }
          );
        })
        .catch((error) => {
          console.error("API Error:", error, error.response);
          const message = error.response?.data?.message;
          if (message?.includes("duplicate")) {
            toast.error(
              "This test code already exists. Please use a different code.",
              { autoClose: 5000 }
            );
          } else {
            toast.error(
              id ? "Failed to update test" : "Failed to create test",
              { autoClose: 5000 }
            );
          }
        })
        .finally(() => setSubmitting(false));
    },
    [id, navigate, classes, subjects, books, lessons, topics, getNameEn]
  );

  const normalizeMark = (value) => {
    if (!value) return "";
    const match = value.match(/^\d{1,2}(\.\d{1,2})?$/);
    if (!match) return value;
    return parseFloat(value).toFixed(2);
  };

  const calculateTotalMarks = useCallback((values) => {
    const {
      type,
      mark1,
      mark2,
      mark3,
      mark4,
      markAssertion1,
      markAssertion2,
      markAssertion3,
      markAssertion4,
      markTrue,
      markFalse,
      desTrue,
    } = values;
    let total = 0;

    const markRegex = /^\d{1,2}(\.\d{1,2})?$/;

    if (type === "MCQ") {
      [mark1, mark2, mark3, mark4].forEach((mark) => {
        if (mark && markRegex.test(mark)) {
          total += parseFloat(mark);
        }
      });
    } else if (type === "Assertion-Reason") {
      [markAssertion1, markAssertion2, markAssertion3, markAssertion4].forEach(
        (mark) => {
          if (mark && markRegex.test(mark)) {
            total += parseFloat(mark);
          }
        }
      );
    } else if (type === "True/False") {
      [markTrue, markFalse].forEach((mark) => {
        if (mark && markRegex.test(mark)) {
          total += parseFloat(mark);
        }
      });
    } else if (type === "Descriptive") {
      if (desTrue && markRegex.test(desTrue)) {
        total += parseFloat(desTrue);
      }
    }

    return total.toFixed(2);
  }, []);

  const handleDependencyChange = useCallback(
    (values, prevValues, setFieldValue) => {
      const { subjectId, classId, bookId, lessonId } = values;
      if (
        subjectId !== prevValues.subjectId ||
        classId !== prevValues.classId
      ) {
        if (subjectId && classId) {
          fetchBooks({ page: 1, limit: 10, subjectId, classId }).then(
            ({ options }) => {
              if (isMountedRef.current) {
                setBooks(options);
                if (!id && options.length > 0 && !bookInteractedRef.current) {
                  bookDropdownRef.current?.open();
                }
              }
            }
          );
        } else {
          setBooks([]);
          setLessons([]);
          setTopics([]);
          setFieldValue("bookId", "");
          setFieldValue("lessonId", "");
          setFieldValue("topicId", "");
        }
      }
      if (
        subjectId !== prevValues.subjectId ||
        classId !== prevValues.classId ||
        bookId !== prevValues.bookId
      ) {
        if (subjectId && classId && bookId) {
          debouncedFetchLessons(subjectId, classId, bookId, (newLessons) => {
            if (isMountedRef.current) setLessons(newLessons);
          });
        } else {
          setLessons([]);
          setTopics([]);
          setFieldValue("lessonId", "");
          setFieldValue("topicId", "");
        }
      }
      if (
        subjectId !== prevValues.subjectId ||
        classId !== prevValues.classId ||
        bookId !== prevValues.bookId ||
        lessonId !== prevValues.lessonId
      ) {
        if (subjectId && classId && bookId && lessonId) {
          debouncedFetchTopics(
            subjectId,
            classId,
            bookId,
            lessonId,
            (newTopics) => {
              if (isMountedRef.current) setTopics(newTopics);
            }
          );
        } else {
          setTopics([]);
          setFieldValue("topicId", "");
        }
      }
    },
    [fetchBooks, debouncedFetchLessons, debouncedFetchTopics, id]
  );

  const handleDescriptionChange = (editorState, setFieldValue) => {
    setDescriptionEditorState(editorState);
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const htmlContent = draftToHtml(rawContent);
    setFieldValue("description", htmlContent);
  };

  const handleDescriptionSolChange = (editorState, setFieldValue) => {
    setDescriptionSolEditorState(editorState);
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const htmlContent = draftToHtml(rawContent);
    setFieldValue("descriptionSol", htmlContent);
  };

  const handleOptionTextChange = (index, editorState, setFieldValue) => {
    const editorStates = [
      setOptionText1EditorState,
      setOptionText2EditorState,
      setOptionText3EditorState,
      setOptionText4EditorState,
    ];
    editorStates[index - 1](editorState);
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const htmlContent = draftToHtml(rawContent);
    setFieldValue(`optionText${index}`, htmlContent);
  };

  const handleOptionAssertionTextChange = (
    index,
    editorState,
    setFieldValue
  ) => {
    const editorStates = [
      setOptionAssertionText1EditorState,
      setOptionAssertionText2EditorState,
      setOptionAssertionText3EditorState,
      setOptionAssertionText4EditorState,
    ];
    editorStates[index - 1](editorState);
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const htmlContent = draftToHtml(rawContent);
    setFieldValue(`optionAssertionText${index}`, htmlContent);
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialData}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={true}
      validateOnMount={true}
    >
      {({
        isSubmitting,
        values,
        errors,
        touched,
        setFieldValue,
        setFieldTouched,
      }) => {
        const prevValuesRef = useRef(values);
        useEffect(() => {
          if (
            values.subjectId !== prevValuesRef.current.subjectId ||
            values.classId !== prevValuesRef.current.classId ||
            values.bookId !== prevValuesRef.current.bookId ||
            values.lessonId !== prevValuesRef.current.lessonId
          ) {
            handleDependencyChange(
              values,
              prevValuesRef.current,
              setFieldValue
            );
            prevValuesRef.current = values;
          }
        }, [values, handleDependencyChange, setFieldValue]);

        useEffect(() => {
          const totalMarks = calculateTotalMarks(values);
          setFieldValue("totalTrue", totalMarks);
        }, [
          values.type,
          values.mark1,
          values.mark2,
          values.mark3,
          values.mark4,
          values.markAssertion1,
          values.markAssertion2,
          values.markAssertion3,
          values.markAssertion4,
          values.markTrue,
          values.markFalse,
          values.desTrue,
          setFieldValue,
          calculateTotalMarks,
        ]);

        const optionEditorStates = [
          optionText1EditorState,
          optionText2EditorState,
          optionText3EditorState,
          optionText4EditorState,
        ];

        const optionAssertionEditorStates = [
          optionAssertionText1EditorState,
          optionAssertionText2EditorState,
          optionAssertionText3EditorState,
          optionAssertionText4EditorState,
        ];

        return (
          <Form>
            <ToastContainer position="bottom-right" autoClose={7000} />
            <Container>
              {console.log(values)}
              <Header>
                <div>
                  <BreadCrumbs
                    backNavi={() => navigate("/test/list")}
                    breadCrumbs={[{ name: "Question", path: ROUTES.TEST_LIST }]}
                    boldItem={id ? "Edit Question" : "Add Question"}
                  />
                  <Heading>{id ? "Edit" : "Add"} Question</Heading>
                </div>
                <ButtonContainer className="glowing space-x-2">
                  <Button
                    type={BUTTON_TYPES.SECONDARY}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(ROUTES.TEST_LIST);
                    }}
                    disabled={isSubmitting}
                    className="bg-white border border-[#1a6fab] text-[#1a6fab] hover:bg-[#1a6fab] hover:text-white"
                  >
                    Cancel
                  </Button>
                  {!id && (
                    <Button
                      type={BUTTON_TYPES.SECONDARY}
                      className="bg-white border border-[#1a6fab] text-[#1a6fab] hover:bg-[#1a6fab] hover:text-white"
                      onClick={() => setFieldValue("saveAndNew", true)}
                      disabled={isSubmitting}
                    >
                      Save & New
                    </Button>
                  )}
                  <Button
                    type={BUTTON_TYPES.PRIMARY}
                    className="bg-[#1a6fab] text-white hover:bg-[#145ea4]"
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
                <div className="add-v-form">
                  <div className="width90">
                    <div className="section-shadow w-full">
                      <div className="flex flex-row justify-between items-center">
                        <SidePanel title="Test Information" />
                        <div className="flex space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="testType"
                              value="online"
                              checked={values.testType === "online"}
                              onChange={() =>
                                setFieldValue("testType", "online")
                              }
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-[14px]">
                              Online Test
                            </span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="testType"
                              value="offline"
                              checked={values.testType === "offline"}
                              onChange={() =>
                                setFieldValue("testType", "offline")
                              }
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-[14px]">
                              Offline Test
                            </span>
                          </label>
                        </div>
                        <div className="flex space-x-2 items-center mt-2">
                          <div
                            className={`w-5 h-5 flex items-center justify-center border-2 rounded cursor-pointer ${
                              values.displayTrue
                                ? "bg-blue-500 text-white"
                                : "bg-white"
                            }`}
                            onClick={() =>
                              setFieldValue("displayTrue", !values.displayTrue)
                            }
                          >
                            {values.displayTrue && (
                              <span className="text-lg">✓</span>
                            )}
                          </div>
                          <span className="text-[14px]">
                            After Test Visibility
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-[14px]">Total Marks</span>
                          <input
                            type="text"
                            name="totalTrue"
                            value={values.totalTrue}
                            readOnly
                            className="w-12 h-6 border rounded text-center bg-gray-100"
                          />
                        </div>
                      </div>
                      <div className="add-v-form-right-section">
                        <div className="add-v-form-section">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            <Field name="classId">
                              {({ field, form }) => (
                                <div className="flex-1 w-full">
                                  <label className="block mb-2 font-medium text-black text-[14px]">
                                    Class{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <ErrorBoundary>
                                    <Dropdown
                                      fetchApi={fetchClasses}
                                      options={classes}
                                      onChange={(value) => {
                                        form.setFieldValue(
                                          "classId",
                                          value || ""
                                        );
                                        form.setFieldTouched(
                                          "classId",
                                          true,
                                          true
                                        );
                                        form.setFieldValue("bookId", "");
                                        form.setFieldValue("lessonId", "");
                                        form.setFieldValue("topicId", "");
                                        setBooks([]);
                                        setLessons([]);
                                        setTopics([]);
                                        bookInteractedRef.current = false;
                                      }}
                                      onBlur={() =>
                                        form.setFieldTouched(
                                          "classId",
                                          true,
                                          true
                                        )
                                      }
                                      value={field.value}
                                      placeholder="Select"
                                      getOptionLabel={(option) => option.label}
                                      getOptionValue={(option) => option.value}
                                    />
                                  </ErrorBoundary>
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
                                <div className="flex-1 w-full">
                                  <label className="block mb-2 font-medium text-black text-[14px]">
                                    Subject{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <ErrorBoundary>
                                    <Dropdown
                                      fetchApi={fetchSubjects}
                                      options={subjects}
                                      onChange={(value) => {
                                        form.setFieldValue(
                                          "subjectId",
                                          value || ""
                                        );
                                        form.setFieldTouched(
                                          "subjectId",
                                          true,
                                          true
                                        );
                                        form.setFieldValue("bookId", "");
                                        form.setFieldValue("lessonId", "");
                                        form.setFieldValue("topicId", "");
                                        setBooks([]);
                                        setLessons([]);
                                        setTopics([]);
                                        bookInteractedRef.current = false;
                                      }}
                                      onBlur={() =>
                                        form.setFieldTouched(
                                          "subjectId",
                                          true,
                                          true
                                        )
                                      }
                                      value={field.value}
                                      placeholder="Select"
                                      getOptionLabel={(option) => option.label}
                                      getOptionValue={(option) => option.value}
                                    />
                                  </ErrorBoundary>
                                  {form.touched.subjectId &&
                                    form.errors.subjectId &&
                                    !form.values.subjectId && (
                                      <p className="text-red-600 text-xs mt-1">
                                        {errors.subjectId}
                                      </p>
                                    )}
                                </div>
                              )}
                            </Field>
                            <Field name="bookId">
                              {({ field, form }) => (
                                <div className="flex-100 w-full">
                                  <label className="block mb-2 font-medium text-black text-[14px]">
                                    Book <span className="text-red-500">*</span>
                                  </label>
                                  <ErrorBoundary>
                                    <Dropdown
                                      ref={bookDropdownRef}
                                      fetchApi={(params) =>
                                        fetchBooks({
                                          ...params,
                                          subjectId: values.subjectId,
                                          classId: values.classId,
                                        })
                                      }
                                      options={books}
                                      onChange={(value) => {
                                        form.setFieldValue(
                                          "bookId",
                                          value || ""
                                        );
                                        form.setFieldTouched(
                                          "bookId",
                                          true,
                                          true
                                        );
                                        form.setFieldValue("lessonId", "");
                                        form.setFieldValue("topicId", "");
                                        setLessons([]);
                                        setTopics([]);
                                        bookInteractedRef.current = true;
                                      }}
                                      onBlur={() =>
                                        form.setFieldTouched(
                                          "bookId",
                                          true,
                                          true
                                        )
                                      }
                                      value={field.value}
                                      placeholder={
                                        bookLoading
                                          ? "Loading books..."
                                          : !values.subjectId || !values.classId
                                          ? "Select subject and class first"
                                          : books.length > 0
                                          ? "Select book"
                                          : "No books available"
                                      }
                                      disabled={
                                        !values.subjectId ||
                                        !values.classId ||
                                        bookLoading
                                      }
                                      getOptionLabel={(option) => option.label}
                                      getOptionValue={(option) => option.value}
                                    />
                                  </ErrorBoundary>
                                  {form.touched.bookId &&
                                    form.errors.bookId &&
                                    !form.values.bookId && (
                                      <p className="text-red-500 text-xs mt-1">
                                        {form.errors.bookId}
                                      </p>
                                    )}
                                </div>
                              )}
                            </Field>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            <Field name="lessonId">
                              {({ field, form }) => (
                                <div className="flex-1 w-full">
                                  <label className="block mb-2 font-medium text-black text-[14px]">
                                    Lesson{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <ErrorBoundary>
                                    <Dropdown
                                      options={lessons}
                                      onChange={(value) => {
                                        form.setFieldValue(
                                          "lessonId",
                                          value || ""
                                        );
                                        form.setFieldTouched(
                                          "lessonId",
                                          true,
                                          true
                                        );
                                        form.setFieldValue("topicId", "");
                                        setTopics([]);
                                      }}
                                      onBlur={() =>
                                        form.setFieldTouched(
                                          "lessonId",
                                          true,
                                          true
                                        )
                                      }
                                      value={field.value}
                                      placeholder={
                                        lessonLoading
                                          ? "Loading lessons..."
                                          : !values.subjectId ||
                                            !values.classId ||
                                            !values.bookId
                                          ? "Select subject, class, and book first"
                                          : lessons.length > 0
                                          ? "Select lesson"
                                          : "No lessons available"
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
                                  </ErrorBoundary>
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
                            <Field name="topicId">
                              {({ field, form }) => (
                                <div className="flex-1 w-full">
                                  <label className="block mb-2 font-medium text-black text-[14px]">
                                    Topic
                                  </label>
                                  <ErrorBoundary>
                                    <Dropdown
                                      options={topics}
                                      onChange={(value) => {
                                        form.setFieldValue(
                                          "topicId",
                                          value || ""
                                        );
                                        form.setFieldTouched(
                                          "topicId",
                                          true,
                                          false
                                        );
                                      }}
                                      value={field.value}
                                      placeholder={
                                        topicLoading
                                          ? "Loading topics..."
                                          : !values.subjectId ||
                                            !values.classId ||
                                            !values.bookId ||
                                            !values.lessonId
                                          ? "Select subject, class, book, and lesson first"
                                          : topics.length > 0
                                          ? "Select topic"
                                          : "No topics available"
                                      }
                                      disabled={
                                        !values.subjectId ||
                                        !values.classId ||
                                        !values.bookId ||
                                        !values.lessonId ||
                                        topicLoading
                                      }
                                      isClearable
                                      getOptionLabel={(option) => option.label}
                                      getOptionValue={(option) => option.value}
                                    />
                                  </ErrorBoundary>
                                  {touched.topicId && errors.topicId && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {errors.topicId}
                                    </p>
                                  )}
                                </div>
                              )}
                            </Field>
                            <div className="flex-1 w-full mt-1">
                              <label className="mb-3 font-medium text-[14px]">
                                Question Type{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <Select
                                styles={selectStyles}
                                options={
                                  values.testType === "online"
                                    ? onlineQuestionTypeOptions
                                    : questionTypeOptions
                                }
                                value={(values.testType === "online"
                                  ? onlineQuestionTypeOptions
                                  : questionTypeOptions
                                ).find(
                                  (option) => option.value === values.type
                                )}
                                onChange={(option) =>
                                  setFieldValue(
                                    "type",
                                    option ? option.value : ""
                                  )
                                }
                                placeholder="Select"
                                isClearable={true}
                                components={{ DropdownIndicator }}
                                isRequired
                                menuPlacement="top"
                              />
                              {errors.type && touched.type && (
                                <div className="text-red-500 text-xs mt-1">
                                  {errors.type}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="group-type-1">
                            <div className="flex-1 w-full">
                              <label className="to-label font-semibold text-black">
                                Question
                              </label>
                              <EditorField
                                name="description"
                                initialContent={values.description}
                                setFieldValue={setFieldValue}
                                setFieldTouched={setFieldTouched}
                                touched={touched}
                                errors={errors}
                                uploadImageCallBack={uploadImageCallBack}
                                editorState={descriptionEditorState}
                                onEditorStateChange={(editorState) =>
                                  handleDescriptionChange(
                                    editorState,
                                    setFieldValue
                                  )
                                }
                                className="editor-container" // Apply min-height
                              />
                              {touched.description && errors.description && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {values.type === "Descriptive" && (
                            <div className="group-type-1">
                              <div className="flex-1 w-full">
                                <div className="flex flex-row justify-between mb-3">
                                  <label className="to-label font-semibold text-black">
                                    Option
                                  </label>
                                  <input
                                    type="text"
                                    name="desTrue"
                                    value={values.desTrue}
                                    onChange={(e) =>
                                      setFieldValue("desTrue", e.target.value)
                                    }
                                    onBlur={(e) =>
                                      setFieldValue(
                                        "desTrue",
                                        normalizeMark(e.target.value)
                                      )
                                    }
                                    className="w-12 h-6 border rounded text-center"
                                    placeholder=""
                                  />
                                </div>
                                <EditorField
                                  name="descriptionSol"
                                  initialContent={values.descriptionSol}
                                  setFieldValue={setFieldValue}
                                  setFieldTouched={setFieldTouched}
                                  touched={touched}
                                  errors={errors}
                                  uploadImageCallBack={uploadImageCallBack}
                                  editorState={descriptionSolEditorState}
                                  onEditorStateChange={(editorState) =>
                                    handleDescriptionSolChange(
                                      editorState,
                                      setFieldValue
                                    )
                                  }
                                  className="editor-container"
                                />
                                {touched.descriptionSol &&
                                  errors.descriptionSol && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {errors.descriptionSol}
                                    </p>
                                  )}
                              </div>
                            </div>
                          )}
                          {values.type === "MCQ" && (
                            <>
                              <div className="font-semibold mb-3">Options</div>
                              <div className="">
                                {[1, 2, 3, 4].map((num) => (
                                  <div
                                    key={num}
                                    className="py-6 px-4 border rounded-lg flex flex-col w-full"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <label className="flex items-center space-x-3">
                                        <div
                                          className={`w-6 h-6 flex items-center justify-center border-2 rounded cursor-pointer ${
                                            values[`option${num}`]
                                              ? "bg-blue-500 text-white"
                                              : "bg-white border-gray-300"
                                          }`}
                                          onClick={() =>
                                            setFieldValue(
                                              `option${num}`,
                                              !values[`option${num}`]
                                            )
                                          }
                                        >
                                          {values[`option${num}`] && (
                                            <span className="text-lg">✓</span>
                                          )}
                                        </div>
                                        <span className="text-[14px]">
                                          Option {num}
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        name={`mark${num}`}
                                        value={values[`mark${num}`]}
                                        onChange={(e) =>
                                          setFieldValue(
                                            `mark${num}`,
                                            e.target.value
                                          )
                                        }
                                        onBlur={(e) =>
                                          setFieldValue(
                                            `mark${num}`,
                                            normalizeMark(e.target.value)
                                          )
                                        }
                                        className="w-12 h-6 border rounded text-center text-sm"
                                        placeholder=""
                                      />
                                    </div>
                                    <div className=" w-full">
                                      <EditorField
                                        name={`optionText${num}`}
                                        initialContent={
                                          values[`optionText${num}`]
                                        }
                                        setFieldValue={setFieldValue}
                                        setFieldTouched={setFieldTouched}
                                        touched={touched}
                                        errors={errors}
                                        uploadImageCallBack={
                                          uploadImageCallBack
                                        }
                                        editorState={
                                          optionEditorStates[num - 1]
                                        }
                                        onEditorStateChange={(editorState) =>
                                          handleOptionTextChange(
                                            num,
                                            editorState,
                                            setFieldValue
                                          )
                                        }
                                        className="editor-container"
                                      />
                                      {touched[`optionText${num}`] &&
                                        errors[`optionText${num}`] && (
                                          <p className="text-red-500 text-xs mt-1">
                                            {errors[`optionText${num}`]}
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          {values.type === "Assertion-Reason" && (
                            <>
                              <div className="font-semibold mb-3">Options</div>
                              <div className="">
                                {assertionOptions.map((option, index) => (
                                  <div
                                    key={index}
                                    className="py-6 px-4 border rounded-lg flex flex-col w-full"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <label className="flex items-center space-x-3">
                                        <div
                                          className={`w-6 h-6 flex items-center justify-center border-2 rounded cursor-pointer ${
                                            values[
                                              `optionAssertion${index + 1}`
                                            ]
                                              ? "bg-blue-500 text-white"
                                              : "bg-white border-gray-300"
                                          }`}
                                          onClick={() =>
                                            setFieldValue(
                                              `optionAssertion${index + 1}`,
                                              !values[
                                                `optionAssertion${index + 1}`
                                              ]
                                            )
                                          }
                                        >
                                          {values[
                                            `optionAssertion${index + 1}`
                                          ] && (
                                            <span className="text-lg">✓</span>
                                          )}
                                        </div>
                                        <span className="text-[14px]">
                                          {option}
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        name={`markAssertion${index + 1}`}
                                        value={
                                          values[`markAssertion${index + 1}`]
                                        }
                                        onChange={(e) =>
                                          setFieldValue(
                                            `markAssertion${index + 1}`,
                                            e.target.value
                                          )
                                        }
                                        onBlur={(e) =>
                                          setFieldValue(
                                            `markAssertion${index + 1}`,
                                            normalizeMark(e.target.value)
                                          )
                                        }
                                        className="w-12 h-6 border rounded text-center text-sm"
                                        placeholder=""
                                      />
                                    </div>
                                    <div className=" w-full">
                                      <EditorField
                                        name={`optionAssertionText${index + 1}`}
                                        initialContent={
                                          values[
                                            `optionAssertionText${index + 1}`
                                          ]
                                        }
                                        setFieldValue={setFieldValue}
                                        setFieldTouched={setFieldTouched}
                                        touched={touched}
                                        errors={errors}
                                        uploadImageCallBack={
                                          uploadImageCallBack
                                        }
                                        editorState={
                                          optionAssertionEditorStates[index]
                                        }
                                        onEditorStateChange={(editorState) =>
                                          handleOptionAssertionTextChange(
                                            index + 1,
                                            editorState,
                                            setFieldValue
                                          )
                                        }
                                        className="editor-container"
                                      />
                                      {touched[
                                        `optionAssertionText${index + 1}`
                                      ] &&
                                        errors[
                                          `optionAssertionText${index + 1}`
                                        ] && (
                                          <p className="text-red-500 text-xs mt-1">
                                            {
                                              errors[
                                                `optionAssertionText${
                                                  index + 1
                                                }`
                                              ]
                                            }
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          {values.type === "True/False" && (
                            <>
                              <div className="font-semibold mb-3">Options</div>
                              <div className="flex flex-col md:flex-row space-x-0 md:space-x-4 gap-4 mt-2">
                                <div className="py-4 px-4 m-2 border rounded-lg flex items-center justify-between w-full">
                                  <label className="flex items-center space-x-2">
                                    <Field
                                      type="radio"
                                      name="optionTrue"
                                      value="true"
                                      className="w-4 h-4"
                                      checked={values.optionTrue === "true"}
                                    />
                                    <span>True</span>
                                  </label>
                                  <input
                                    type="text"
                                    name="markTrue"
                                    value={values.markTrue}
                                    onChange={(e) =>
                                      setFieldValue("markTrue", e.target.value)
                                    }
                                    onBlur={(e) =>
                                      setFieldValue(
                                        "markTrue",
                                        normalizeMark(e.target.value)
                                      )
                                    }
                                    className="w-12 h-6 border rounded text-center text-sm"
                                    placeholder=""
                                  />
                                </div>
                                <div className="py-4 px-4 m-2 border rounded-lg flex items-center justify-between w-full">
                                  <label className="flex items-center space-x-2">
                                    <Field
                                      type="radio"
                                      name="optionTrue"
                                      value="false"
                                      className="w-4 h-4"
                                      checked={values.optionTrue === "false"}
                                    />
                                    <span>False</span>
                                  </label>
                                  <input
                                    type="text"
                                    name="markFalse"
                                    value={values.markFalse}
                                    onChange={(e) =>
                                      setFieldValue("markFalse", e.target.value)
                                    }
                                    onBlur={(e) =>
                                      setFieldValue(
                                        "markFalse",
                                        normalizeMark(e.target.value)
                                      )
                                    }
                                    className="w-12 h-6 border rounded text-center text-sm"
                                    placeholder=""
                                  />
                                </div>
                              </div>
                            </>
                          )}
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
  );
};

export default AddEditTest;
