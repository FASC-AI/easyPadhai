import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
import FormikTextField from "@/components/inputs/formik/FormikTextField";
import { getApi, postApi, patchApi } from "@/services/method";
import { APIS } from "@/constants/api.constant";
import useStore from "@/store";
import {
  startSpcaeRemover,
  validateMobileNumber,
  validatePincode,
} from "@/utils/common.helper";
import { USERS } from "./config";
import "./users.css";
import debounce from "lodash/debounce";

const initialValues = {
  name: "",
  email: "",
  mobile: "",
  address: {
    address1: "",
    address2: "",
    country: null,
    state: null,
    district: null,
    pinCode: "",
  },
  role: "editor",
  classId: [],
  classOptions: [],
  subjectId: [],
  subjectOptions: [],
  bookId: [],
  bookOptions: [],
  saveAndNew: false,
};

const userSchema = (id) =>
  Yup.object().shape({
    name: Yup.string()
      .matches(
        /^[A-Za-z\s]{1,50}$/,
        "Name must contain only letters and spaces, up to 50 characters"
      )
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    mobile: Yup.string()
      .matches(/^\d{10}$/, "Mobile number must be 10 digits")
      .optional(),
    address: Yup.object().shape({
      pinCode: Yup.string().matches(
        /^\d{6}$/,
        "Pincode must be exactly 6 digits"
      ),
      country: Yup.string().nullable(),
      state: Yup.string().nullable(),
      district: Yup.string().nullable(),
    }),
    role: Yup.string().required("Role is required"),
    classId: Yup.array()
      .of(Yup.string())
      .min(1, "Class is required")
      .required("Class is required"),
    subjectId: Yup.array()
      .of(Yup.string())
      .min(1, "Subject is required")
      .required("Subject is required"),
    bookId: Yup.array().of(Yup.string()).required("Book is required"), // Optional, allows empty array
  });

const AddEditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const userRole = location.state?.userRole;
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [initialData, setInitialData] = useState(initialValues);
  const [emailStatus, setEmailStatus] = useState({
    checking: false,
    available: null,
  });
  const [isRole, setIsRole] = useState("editor");
  const [mobileStatus, setMobileStatus] = useState({
    checking: false,
    available: null,
  });
  const [districts, setDistricts] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const originalValuesRef = useRef(initialValues);
  const isMountedRef = useRef(false);

  const dependencyRef = useRef({
    state: null,
  });
  const { user } = useStore();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    originalValuesRef.current = initialData;
  }, [initialData]);

  const fetchCountriesApi = async ({ search, page = 1, limit = 10 }) => {
    try {
      const query = search
        ? `search=${encodeURIComponent(search)}`
        : `page=${page}&limit=${limit}`;
      const res = await getApi(`${APIS.COUNTRY}?${query}`);
      const countryData = res?.data?.list || [];
      const total = res?.data?.total || countryData.length;
      const formattedCountries = countryData.map((country) => ({
        value: country._id,
        label: country.name?.english || "Unknown Country",
      }));
      if (isMountedRef.current) {
        setCountryOptions(formattedCountries);
      }
      return { options: formattedCountries, total };
    } catch (error) {
      console.error("Error fetching countries:", error);
      return { options: [], total: 0 };
    }
  };

  const fetchStatesApi = async ({ search, page = 1, limit = 10 }) => {
    try {
      const query = search
        ? `search=${encodeURIComponent(search)}`
        : `page=${page}&limit=${limit}`;
      const res = await getApi(`${APIS.STATE}?${query}`);
      const stateData = res?.data?.list || [];
      const total = res?.data?.total || stateData.length;
      const formattedStates = stateData.map((state) => ({
        value: state._id,
        label: state.name?.english || "Unknown State",
      }));
      if (isMountedRef.current) {
        setStateOptions(formattedStates);
      }
      return { options: formattedStates, total };
    } catch (error) {
      console.error("Error fetching states:", error);
      return { options: [], total: 0 };
    }
  };

  const fetchSubjectsApi = async ({ search, page = 1, limit = 10 }) => {
    try {
      const query = search
        ? `search=${encodeURIComponent(search)}`
        : `page=${page}&limit=${limit}`;
      const res = await getApi(`${APIS.SUBJECT_LIST}?${query}`);
      const subjectData = res?.data?.subject || [];
      const total = res?.data?.total || subjectData.length;
      const formattedSubjects = subjectData.map((subject) => ({
        value: subject._id,
        label: subject.nameEn || "Unknown Subject",
      }));
      if (isMountedRef.current) {
        setSubjectOptions(formattedSubjects);
      }
      return { options: formattedSubjects, total };
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return { options: [], total: 0 };
    }
  };

  const fetchClassesApi = async ({ search, page = 1, limit = 10 }) => {
    try {
      const query = search
        ? `search=${encodeURIComponent(search)}`
        : `page=${page}&limit=${limit}`;
      const res = await getApi(`${APIS.CLASS_LIST}?${query}`);
      const classData = res?.data?.Classes || [];
      const total = res?.data?.total || classData.length;
      const formattedClasses = classData.map((cls) => ({
        value: cls._id,
        label: cls.nameEn || "Unknown Class",
      }));
      if (isMountedRef.current) {
        setClassOptions(formattedClasses);
      }
      return { options: formattedClasses, total };
    } catch (error) {
      console.error("Error fetching classes:", error);
      return { options: [], total: 0 };
    }
  };

  const fetchBookApi = async ({
    search,
    page = 1,
    limit = 15,
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
        label: book.book || book.nameEn || "Unknown Book",
      }));
      return { options: formattedBooks, total };
    } catch (error) {
      console.error("Error fetching books:", error);
      return { options: [], total: 0 };
    }
  };

  const fetchDistricts = async (stateId, preSelectedDistrict = null) => {
    if (!stateId || typeof stateId !== "string") {
      if (isMountedRef.current) {
        setDistricts([]);
      }
      return [];
    }
    try {
      setDistrictLoading(true);
      const res = await getApi(
        `${APIS.DISTRICT_BY_STATE}/${stateId}?limit=10000`
      );
      const districtData = res?.data?.list || [];
      let formattedDistricts = districtData
        .filter((district) => district?.name?.english)
        .map((district) => ({
          value: district?._id,
          label: district.name.english,
        }));

      if (isMountedRef.current) {
        setDistricts(formattedDistricts);
      }
      return formattedDistricts;
    } catch (error) {
      console.error("Error fetching districts:", error);
      if (isMountedRef.current) {
        setDistricts([]);
      }
      return [];
    } finally {
      if (isMountedRef.current) {
        setDistrictLoading(false);
      }
    }
  };

  const debouncedFetchDistricts = useMemo(
    () =>
      debounce((stateId, preSelectedDistrict, callback) => {
        fetchDistricts(stateId, preSelectedDistrict).then((districts) => {
          if (isMountedRef.current) {
            callback(districts);
          }
        });
      }, 300),
    []
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const [classRes, subjectRes, stateRes, countryRes, bookRes] =
          await Promise.all([
            fetchClassesApi({ page: 1, limit: 100 }),
            fetchSubjectsApi({ page: 1, limit: 100 }),
            fetchStatesApi({ page: 1, limit: 100 }),
            fetchCountriesApi({ page: 1, limit: 100 }),
            fetchBookApi({ page: 1, limit: 100 }),
          ]);

        if (!id) {
          setInitialData(initialValues);
          setIsRole("editor");
          setLoading(false);
          return;
        }

        const res = await getApi(APIS.PROFILE, id);
        const editData = res?.data;

        setIsRole(editData?.userId?.userRole || "editor");

        if (editData) {
          const classOptions = classRes.options || [];
          const subjectOptions = subjectRes.options || [];
          const stateOptions = stateRes.options || [];
          const countryOptions = countryRes.options || [];

          const classId = Array.isArray(editData.classId)
            ? editData.classId
                .map((id) => {
                  const option = classOptions.find((opt) => opt.value === id);
                  return option ? { value: id, label: option.label } : null;
                })
                .filter(Boolean)
            : [];

          const subjectId = Array.isArray(editData.subjectId)
            ? editData.subjectId
                .map((id) => {
                  const option = subjectOptions.find((opt) => opt.value === id);
                  return option ? { value: id, label: option.label } : null;
                })
                .filter(Boolean)
            : [];

          const country = editData.address?.country
            ? {
                value: editData.address.country,
                label:
                  countryOptions.find(
                    (opt) => opt.value === editData.address.country
                  )?.label || "Unknown Country",
              }
            : null;

          const state = editData.address?.state
            ? {
                value: editData.address.state,
                label:
                  stateOptions.find(
                    (opt) => opt.value === editData.address.state
                  )?.label || "Unknown State",
              }
            : null;

          let districts = [];
          if (state) {
            districts = await fetchDistricts(
              state.value,
              editData.address?.district || null
            );
          }

          const roleOptions = [{ value: "editor", label: "Editor" }];
          const role = editData.userId?.userRole
            ? {
                value: editData.userId.userRole,
                label:
                  roleOptions.find(
                    (opt) => opt.value === editData.userId.userRole
                  )?.label || editData.userId.userRole,
              }
            : { value: "editor", label: "Editor" };

          let bookOptions = [];
          if (editData.classId?.[0] && editData.subjectId?.[0]) {
            const bookRes = await fetchBookApi({
              classId: editData.classId[0],
              subjectId: editData.subjectId[0],
            });
            bookOptions = bookRes.options || [];
          }

          const bookId = Array.isArray(editData.bookId)
            ? editData.bookId
                .map((id) => {
                  const option = bookOptions.find((opt) => opt.value === id);
                  return option ? { value: id, label: option.label } : null;
                })
                .filter(Boolean)
            : [];
          const initialBookId =
            bookId.length > 0 ? bookId.map((opt) => opt.value) : [];

          const newInitialData = {
            name: editData.userId.name.english || "",
            email: editData.userId.email || "",
            mobile: editData.userId.mobile || "",
            address: {
              address1: editData.address?.address1 || "",
              address2: editData.address?.address2 || "",
              country: country ? country.value : null,
              state: state ? state.value : null,
              district: editData.address?.district || null,
              pinCode: editData.address?.pinCode || "",
            },
            role: role ? role.value : "editor",
            classId: classId.map((opt) => opt.value),
            classOptions: classId,
            subjectId: subjectId.map((opt) => opt.value),
            subjectOptions: subjectId,
            bookId: initialBookId,
            bookOptions: bookId,
            saveAndNew: false,
          };

          if (isMountedRef.current) {
            setDistricts(districts);
            setInitialData(newInitialData);
            setBooks(bookOptions);
            if (state) {
              dependencyRef.current = { state: state.value };
            }
          }
        } else {
          navigate(USERS.USERS, {
            state: { error: "No data found for the provided ID" },
          });
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        navigate(USERS.USERS, {
          state: { error: "Failed to load data due to a server error" },
        });
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
  }, [id, navigate]);

  const checkEmailExists = async (email) => {
    try {
      const res = await postApi(APIS.CHECK_EMAIL_EXISTENCE, { email });
      return !res?.data?.exists;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const checkMobileExists = async (mobile) => {
    try {
      const res = await postApi(APIS.CHECK_MOBILE_EXISTENCE, { mobile });
      return !res?.data?.exists;
    } catch (error) {
      console.error("Error checking mobile:", error);
      return false;
    }
  };

  const debouncedCheckEmail = useMemo(
    () =>
      debounce(async (email, setFieldError) => {
        if (!email || !Yup.string().email().isValidSync(email)) {
          setEmailStatus({ checking: false, available: null });
          return;
        }
        if (id && email === originalValuesRef.current.email) {
          setEmailStatus({ checking: false, available: true });
          return;
        }
        setEmailStatus({ checking: true, available: null });
        const isAvailable = await checkEmailExists(email);
        setEmailStatus({ checking: false, available: isAvailable });
        if (!isAvailable) {
          setFieldError("email", "Email already exists");
        } else {
          setFieldError("email", "");
        }
      }, 500),
    [id]
  );

  const debouncedCheckMobile = useMemo(
    () =>
      debounce(async (mobile, setFieldError) => {
        if (!mobile || !/^\d{10}$/.test(mobile)) {
          setMobileStatus({ checking: false, available: null });
          return;
        }
        if (id && mobile === originalValuesRef.current.mobile) {
          setMobileStatus({ checking: false, available: true });
          return;
        }
        setMobileStatus({ checking: true, available: null });
        const isAvailable = await checkMobileExists(mobile);
        setMobileStatus({ checking: false, available: isAvailable });
        if (!isAvailable) {
          setFieldError("mobile", "Mobile number already exists");
        } else {
          setFieldError("mobile", "");
        }
      }, 500),
    [id]
  );

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    console.log("handleSubmit called with id:", id);
    if (
      emailStatus.checking ||
      mobileStatus.checking ||
      emailStatus.available === false ||
      (mobileStatus.available === false && values.mobile)
    ) {
      toast.error(
        "Please resolve email or mobile conflicts or wait for validation",
        { autoClose: 7000 }
      );
      setSubmitting(false);
      return;
    }

    const payload = {
      name: values.name,
      email: values.email || null,
      mobile: values.mobile || null,
      address: {
        address1: values.address.address1 || "",
        address2: values.address.address2 || "",
        country: values.address.country || null,
        state: values.address.state || null,
        district: values.address.district || null,
        pinCode: values.address.pinCode || "",
      },
      role: values.role || "editor",
      classId: Array.isArray(values.classId) ? values.classId : [],
      subjectId: Array.isArray(values.subjectId) ? values.subjectId : [],
      bookId: Array.isArray(values.bookId) ? values.bookId : [],
    };

    const apiCall = id
      ? patchApi(APIS.PROFILE, id, payload)
      : postApi(APIS.PROFILE, payload);

    apiCall
      .then((res) => {
        if (res.code === 200 || res.code === 201) {
          const successMessage = id
            ? "User updated successfully"
            : "User saved successfully";
          toast.success(successMessage, { autoClose: 7000 });

          setTimeout(() => {
            if (values.saveAndNew) {
              resetForm({ values: initialValues });
              setEmailStatus({ checking: false, available: null });
              setMobileStatus({ checking: false, available: null });
              setDistricts([]);
              setInitialData(initialValues);
              setIsRole("editor");
              setBooks([]);
            } else {
              navigate(USERS.USERS);
            }
          }, 1000);
        } else {
          throw new Error(res.message || "Operation failed");
        }
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          (id ? "Failed to update user" : "Failed to save user");
        toast.error(errorMessage, { autoClose: 7000 });
      })
      .finally(() => setSubmitting(false));
  };

  const handleCancel = () => {
    console.log("Cancel button clicked");
    navigate(-1);
  };

  const getOptionLabel = (option) => option.label;
  const getOptionValue = (option) => option.value;

  return (
    <Formik
      enableReinitialize
      initialValues={initialData}
      validationSchema={userSchema(id)}
      onSubmit={handleSubmit}
    >
      {({
        isSubmitting,
        values,
        setFieldValue,
        setFieldError,
        errors,
        touched,
      }) => {
        useEffect(() => {
          if (values.address.state) {
            if (values.address.state !== dependencyRef.current.state) {
              dependencyRef.current = { state: values.address.state };
              fetchDistricts(
                values.address.state,
                id ? initialData.address.district : null
              ).then((newDistricts) => {
                if (isMountedRef.current) {
                  const currentDistrict = values.address.district;
                  const newDistrictIds = newDistricts.map((d) => d.value);
                  if (
                    currentDistrict &&
                    !newDistrictIds.includes(currentDistrict) &&
                    !id
                  ) {
                    setFieldValue("address.district", null);
                  }
                }
              });
            }
          } else {
            setDistricts([]);
            if (!id || !initialData.address.district) {
              setFieldValue("address.district", null);
            }
            setDistrictLoading(false);
          }
        }, [
          values.address.state,
          setFieldValue,
          initialData.address.district,
          id,
        ]);

        useEffect(() => {
          if (values.classId.length > 0 && values.subjectId.length > 0) {
            fetchBookApi({
              classId: values.classId[0],
              subjectId: values.subjectId[0],
            }).then(({ options }) => {
              if (isMountedRef.current) {
                setBooks(options);
                if (values.bookId.length > 0) {
                  const currentBookId = values.bookId[0];
                  const bookExists = options.find(
                    (book) => book.value === currentBookId
                  );
                  if (bookExists) {
                    setFieldValue("bookOptions", [
                      { value: currentBookId, label: bookExists.label },
                    ]);
                  } else {
                    setFieldValue("bookId", []);
                    setFieldValue("bookOptions", []);
                  }
                }
              }
            });
          } else {
            setBooks([]);
            setFieldValue("bookId", []);
            setFieldValue("bookOptions.place");
          }
        }, [values.classId, values.subjectId, setFieldValue]);

        return (
          <Form>
            {/* onSubmit=
            {(e) => {
              console.log("Form submitted");
              handleSubmit(values, { setSubmitting, resetForm });
            }} */}
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
              <div>
                <Header>
                  <div>
                    <BreadCrumbs
                      backNavi={() => navigate(USERS.USERS)}
                      breadCrumbs={[{ name: "User", path: USERS.USERS }]}
                      boldItem={id ? "Edit User" : "Add User"}
                    />
                    <Heading>{id ? "Edit" : "Add"} User</Heading>
                  </div>
                  <ButtonContainer className="space-x-2">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancel();
                      }}
                      disabled={isSubmitting}
                      className="bg-white border border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white"
                    >
                      Cancel
                    </Button>
                    {!id && (
                      <Button
                        type="submit"
                        className="bg-white border border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white"
                        onClick={() => setFieldValue("saveAndNew", true)}
                        disabled={
                          isSubmitting ||
                          emailStatus.checking ||
                          mobileStatus.checking
                        }
                      >
                        Save & New
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="bg-[#1A6FAB] text-white hover:bg-[#1A6FAB] hover:text-white"
                      onClick={() => setFieldValue("saveAndNew", false)}
                      loading={isSubmitting}
                      disabled={
                        isSubmitting ||
                        emailStatus.checking ||
                        mobileStatus.checking
                      }
                    >
                      {id ? "Update" : "Save"}
                    </Button>
                  </ButtonContainer>
                </Header>

                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <div
                    className="add-v-form h-screen"
                    style={{ padding: "20px", justifyContent: "center" }}
                  >
                    <div className="width90">
                      <div className="section-shadow w100">
                        <SidePanel title="Basic Information" />
                        <div className="add-v-form-right-section">
                          <div className="add-v-form-section">
                            <div className="group-type-3-equal">
                              <div className="flex-1 w-100">
                                <FormikTextField
                                  label="Name"
                                  placeholder="Enter Name"
                                  name="name"
                                  isRequired
                                  onChange={(e) =>
                                    setFieldValue(
                                      "name",
                                      startSpcaeRemover(e.target.value)
                                    )
                                  }
                                  className="larger-input"
                                />
                              </div>
                              <div className="flex-1 w-100">
                                <FormikTextField
                                  label="Email"
                                  placeholder="Enter Email"
                                  name="email"
                                  isRequired
                                  className="larger-input"
                                  onChange={(e) => {
                                    const emailValue = e.target.value;
                                    setFieldValue("email", emailValue);
                                    debouncedCheckEmail(
                                      emailValue,
                                      setFieldError
                                    );
                                  }}
                                  style={{
                                    borderColor: emailStatus.checking
                                      ? "gray"
                                      : emailStatus.available === null
                                      ? "gray"
                                      : emailStatus.available
                                      ? "green"
                                      : "red",
                                  }}
                                />
                                {emailStatus.checking && (
                                  <p className="text-gray-500 text-xs mt-1">
                                    Checking email...
                                  </p>
                                )}
                                {!emailStatus.checking &&
                                  emailStatus.available === false && (
                                    <p className="text-red-500 text-xs mt-1">
                                      Email already exists
                                    </p>
                                  )}
                                {!emailStatus.checking &&
                                  emailStatus.available === true && (
                                    <p className="text-green-500 text-xs mt-1">
                                      Email is available
                                    </p>
                                  )}
                              </div>
                              <div className="flex-1 w-100">
                                <FormikTextField
                                  label="Mobile Number (Optional)"
                                  placeholder="Enter Mobile Number"
                                  name="mobile"
                                  onChange={(e) => {
                                    validateMobileNumber(
                                      e,
                                      setFieldValue,
                                      "mobile"
                                    );
                                    debouncedCheckMobile(
                                      e.target.value,
                                      setFieldError
                                    );
                                  }}
                                  className="larger-input"
                                  error={touched.mobile && errors.mobile}
                                  style={{
                                    borderColor:
                                      touched.mobile && errors.mobile
                                        ? "red"
                                        : mobileStatus.checking
                                        ? "gray"
                                        : mobileStatus.available === null ||
                                          !values.mobile
                                        ? "gray"
                                        : mobileStatus.available
                                        ? "green"
                                        : "red",
                                  }}
                                />
                                {mobileStatus.checking && values.mobile && (
                                  <p className="text-gray-500 text-xs mt-1">
                                    Checking mobile...
                                  </p>
                                )}
                                {!mobileStatus.checking &&
                                  mobileStatus.available === false &&
                                  values.mobile && (
                                    <p className="text-red-500 text-xs mt-1">
                                      Mobile number already exists
                                    </p>
                                  )}
                                {!mobileStatus.checking &&
                                  mobileStatus.available === true &&
                                  values.mobile && (
                                    <p className="text-green-500 text-xs mt-1">
                                      Mobile number is available
                                    </p>
                                  )}
                              </div>
                            </div>
                            <div className="group-type-3-equal">
                              <Field name="classId">
                                {({ field, form }) => (
                                  <div className="flex-1 w-100">
                                    <label className="block mb-2 font-medium c-black text-[14px]">
                                      Class{" "}
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <Dropdown
                                      options={classOptions}
                                      isMulti={id && isRole !== "editor"}
                                      onChange={(selected) => {
                                        const isMulti =
                                          id && isRole !== "editor";
                                        let selectedValues = [];
                                        let options = [];

                                        if (isMulti) {
                                          selectedValues = Array.isArray(
                                            selected
                                          )
                                            ? selected
                                            : [];
                                          options = selectedValues
                                            .map((value) => {
                                              const option = classOptions.find(
                                                (opt) => opt.value === value
                                              );
                                              return option
                                                ? { value, label: option.label }
                                                : null;
                                            })
                                            .filter(Boolean);
                                        } else {
                                          selectedValues = selected
                                            ? [selected]
                                            : [];
                                          options = selected
                                            ? [
                                                {
                                                  value: selected,
                                                  label:
                                                    classOptions.find(
                                                      (opt) =>
                                                        opt.value === selected
                                                    )?.label || "Unknown Class",
                                                },
                                              ]
                                            : [];
                                        }

                                        form.setFieldValue(
                                          "classId",
                                          selectedValues
                                        );
                                        form.setFieldValue(
                                          "classOptions",
                                          options
                                        );
                                        form.setFieldValue("bookId", []);
                                        form.setFieldValue("bookOptions", []);
                                      }}
                                      value={
                                        id && isRole !== "editor"
                                          ? field.value
                                          : field.value[0] || null
                                      }
                                      placeholder="Select Class"
                                      getOptionLabel={getOptionLabel}
                                      getOptionValue={getOptionValue}
                                    />
                                    {form.touched.classId &&
                                      form.errors.classId && (
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
                                      options={subjectOptions}
                                      isMulti={id && isRole !== "editor"}
                                      onChange={(selected) => {
                                        const isMulti =
                                          id && isRole !== "editor";
                                        let selectedValues = [];
                                        let options = [];

                                        if (isMulti) {
                                          selectedValues = Array.isArray(
                                            selected
                                          )
                                            ? selected
                                            : [];
                                          options = selectedValues
                                            .map((value) => {
                                              const option =
                                                subjectOptions.find(
                                                  (opt) => opt.value === value
                                                );
                                              return option
                                                ? { value, label: option.label }
                                                : null;
                                            })
                                            .filter(Boolean);
                                        } else {
                                          selectedValues = selected
                                            ? [selected]
                                            : [];
                                          options = selected
                                            ? [
                                                {
                                                  value: selected,
                                                  label:
                                                    subjectOptions.find(
                                                      (opt) =>
                                                        opt.value === selected
                                                    )?.label ||
                                                    "Unknown Subject",
                                                },
                                              ]
                                            : [];
                                        }

                                        form.setFieldValue(
                                          "subjectId",
                                          selectedValues
                                        );
                                        form.setFieldValue(
                                          "subjectOptions",
                                          options
                                        );
                                        form.setFieldValue("bookId", []);
                                        form.setFieldValue("bookOptions", []);
                                      }}
                                      value={
                                        id && isRole !== "editor"
                                          ? field.value
                                          : field.value[0] || null
                                      }
                                      placeholder="Select Subject"
                                      getOptionLabel={getOptionLabel}
                                      getOptionValue={getOptionValue}
                                    />
                                    {form.touched.subjectId &&
                                      form.errors.subjectId && (
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
                                      Book
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <Dropdown
                                      options={
                                        books.length > 0
                                          ? books
                                          : values.bookOptions
                                      }
                                      isMulti={false}
                                      onChange={(selectedValue) => {
                                        const selectedValues = selectedValue
                                          ? [selectedValue]
                                          : [];
                                        const selectedOption = (
                                          books.length > 0
                                            ? books
                                            : values.bookOptions
                                        ).find(
                                          (opt) => opt.value === selectedValue
                                        );
                                        form.setFieldValue(
                                          "bookId",
                                          selectedValues
                                        );
                                        form.setFieldValue(
                                          "bookOptions",
                                          selectedOption
                                            ? [
                                                {
                                                  value: selectedOption.value,
                                                  label: selectedOption.label,
                                                },
                                              ]
                                            : []
                                        );
                                      }}
                                      value={
                                        field.value.length > 0
                                          ? field.value[0]
                                          : null
                                      }
                                      placeholder={
                                        values.classId.length === 0 ||
                                        values.subjectId.length === 0
                                          ? "Select class and subject first"
                                          : books.length > 0
                                          ? "Select Book"
                                          : "No Books Available"
                                      }
                                      disabled={
                                        values.classId.length === 0 ||
                                        values.subjectId.length === 0
                                      }
                                      isClearable
                                      getOptionLabel={getOptionLabel}
                                      getOptionValue={getOptionValue}
                                    />
                                    {form.touched.bookId &&
                                      form.errors.bookId && (
                                        <p className="text-red-500 text-xs mt-1">
                                          {form.errors.bookId}
                                        </p>
                                      )}
                                  </div>
                                )}
                              </Field>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="section-shadow w100">
                        <SidePanel title="Address Information" />
                        <div className="add-v-form-right-section">
                          <div className="add-v-form-section">
                            <div className="group-type-3-equal">
                              <div className="flex-1 w-100">
                                <FormikTextField
                                  label="Address 1"
                                  placeholder="Enter Address1"
                                  name="address.address1"
                                  onChange={(e) =>
                                    setFieldValue(
                                      "address.address1",
                                      startSpcaeRemover(e.target.value)
                                    )
                                  }
                                  className="larger-input"
                                />
                              </div>
                              <div className="flex-1 w-100">
                                <FormikTextField
                                  label="Address 2"
                                  placeholder="Enter Address2"
                                  name="address.address2"
                                  onChange={(e) =>
                                    setFieldValue(
                                      "address.address2",
                                      startSpcaeRemover(e.target.value)
                                    )
                                  }
                                  className="larger-input"
                                />
                              </div>
                            </div>
                            <div className="group-type-3-equal">
                              <Field name="address.state">
                                {({ field, form }) => (
                                  <div className="flex-1 w-100">
                                    <label className="block mb-2 font-medium c-black text-[14px]">
                                      State
                                    </label>
                                    <Dropdown
                                      fetchApi={fetchStatesApi}
                                      options={stateOptions}
                                      isMulti={false}
                                      onChange={(value) => {
                                        form.setFieldValue(
                                          "address.state",
                                          value || null
                                        );
                                        form.setFieldValue(
                                          "address.district",
                                          null
                                        );
                                      }}
                                      value={field.value || null}
                                      placeholder="Select State"
                                      getOptionLabel={getOptionLabel}
                                      getOptionValue={getOptionValue}
                                    />
                                  </div>
                                )}
                              </Field>
                              <Field name="address.district">
                                {({ field, form }) => {
                                  const cleanDistricts = districts;
                                  const districtOptions = cleanDistricts;
                                  return (
                                    <div className="flex-1 w-100">
                                      <label className="block mb-2 font-medium c-black text-[14px]">
                                        District
                                      </label>
                                      {districtLoading ? (
                                        <p>Loading Districts...</p>
                                      ) : (
                                        <Dropdown
                                          options={districtOptions}
                                          isMulti={false}
                                          onChange={(value) => {
                                            form.setFieldValue(
                                              "address.district",
                                              value || null
                                            );
                                          }}
                                          value={field.value || null}
                                          placeholder={
                                            values.address.state
                                              ? "Select District"
                                              : "Select State First"
                                          }
                                          disabled={!values.address.state}
                                          getOptionLabel={getOptionLabel}
                                          getOptionValue={getOptionValue}
                                        />
                                      )}
                                    </div>
                                  );
                                }}
                              </Field>
                              <div className="flex-1 w-100">
                                <FormikTextField
                                  label="Pincode"
                                  placeholder="Enter Pincode"
                                  name="address.pinCode"
                                  onChange={(e) =>
                                    validatePincode(
                                      e,
                                      setFieldValue,
                                      "address.pinCode"
                                    )
                                  }
                                  className="larger-input"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Container>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AddEditUser;
