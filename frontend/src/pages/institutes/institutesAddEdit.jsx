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
import {
  validateAlphabetsfortitle,
  validateMobileNumber,
  validatePincode,
  startSpcaeRemover,
} from "@/utils/common.helper";
import Select from "react-select";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import BreadCrumbs from "@/components/common/BreadCrumbs/BreadCrumbs";
import Button from "@/components/common/Button/Button";
import { BUTTON_TYPES } from "@/constants/common.constant";
import * as Yup from "yup";
import { Field, Formik } from "formik";
import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getApi, postApi, patchApi, postFileApi } from "@/services/method";
import { APIS } from "@/constants/api.constant";
import "./institutes.css";
import { CounterContext } from "@/components/Layout/commonLayout/TitleOfPageProvider";
import ROUTES from "@/constants/route.constant";
import FormikTextField from "@/components/inputs/formik/FormikTextField";
import { SidePanel } from "@/components/AddFormLayout/AddFormLayout";
import { generateRandomString } from "@/lib/utils";
import { TextFieldArea } from "@/components/ui/textFieldArea";
import { DatePickerInput } from "@/components/common/DateTimeInputs/index";
import { CustomSelectById } from "@/components/common/CustomSelect";
import { XIcon, ChevronDown } from "lucide-react";

const initialValues = {
  codee: "",
  description: "",
  institutesName: "",
  instituteType: null,
  status: "Active",
  phone: "",
  address: {
    stateId: null,
    districtId: null,
    cityId: null,
    pinCode: "",
    address1: "",
    address2: "",
  },
};
// Yup validation schema with description max length
const userSchema = Yup.object().shape({
  institutesName: Yup.string().required("Name is required"),
  phone: Yup.string()
    .matches(/^\d{10}$/, "Contact Number must be 10 digits")
    .nullable(),
  instituteType: Yup.string().required("Type is required"),
  description: Yup.string().nullable(),
  address: Yup.object().shape({
    stateId: Yup.object().required("State is required"),
    districtId: Yup.object().required("District is required"),
    pinCode: Yup.string()
      .required("Pin Code is required")
      .matches(/^\d{6}$/, "Pin code must be 6 digits")
      .nullable(),
    address1: Yup.string().required("Address 1 is required"),
  }),
});

const InstitutionTypeDropdown = ({ name, label, options }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    console.log("Filtered Options:", filteredOptions);
    if (filteredOptions.length < 6) {
      console.warn(
        "Fewer than 6 options. Scrollbar requires more than 5 options to appear."
      );
    }
  }, [filteredOptions]);

  const handleSearchKeyDown = (e, form) => {
    if (e.key === "Enter" && searchTerm.trim() === "") {
      setOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <Field name={name}>
      {({ field, form }) => {
        const selectedOption = options.find((opt) => opt.id === field.value);

        return (
          <div className="flex-1 w-full relative" ref={dropdownRef}>
            <style>{`
              .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #1A6FAB transparent;
              }
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #1A6FAB;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #555;
              }
            `}</style>
            <label className="block mb-2 font-semibold text-[14px]">
              {label}
            </label>
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full border border-gray-200 rounded-md px-4 py-2 text-left bg-white text-[12px] flex items-center justify-between"
              >
                <span className={selectedOption ? "" : "text-gray-500"}>
                  {selectedOption ? selectedOption.label : "Select"}
                </span>
                {selectedOption ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      form.setFieldValue(name, "");
                      setOpen(false);
                      setSearchTerm("");
                    }}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Clear selection"
                  >
                    <XIcon size={14} />
                  </button>
                ) : (
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>
            </div>
            {open && (
              <div className="absolute mt-1 z-[99999] w-full bg-white border border-gray-300 rounded shadow-md text-[12px]">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full px-2 py-1 border rounded text-[12px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => handleSearchKeyDown(e, form)}
                    autoFocus
                  />
                </div>
                <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          form.setFieldValue(name, option.id);
                          setOpen(false);
                          setSearchTerm("");
                        }}
                      >
                        <span>{option.label}</span>
                        {field.value === option.id && (
                          <svg
                            className="w-4 h-4 text-blue-600 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-gray-500">
                      No options found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }}
    </Field>
  );
};

const customStyles = {
  menu: (provided) => ({
    ...provided,
    zIndex: 99999, // Increased to ensure it appears above all elements
    position: "absolute", // Ensure dropdown breaks out of parent stacking context
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
  // menuList: (provided) => ({
  //   ...provided,
  //   maxHeight: '150px',
  //   overflowY: 'auto',
  // }),
};

const Addinstitutes = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpenn, setModalIsOpenn] = useState(false);
  const [showSubmittedTable, setShowSubmittedTable] = useState(false);
  const [assets, setAssets] = useState([]);
  const [data, setData] = useState(initialValues);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [firstTableFiles, setFirstTableFiles] = useState([]);
  const [secondTableFiles, setSecondTableFiles] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [allState, setAllState] = useState(null);
  const [allDistrict, setAllDistrict] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [allCity, setAllCity] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [firstNewFiles, setFirstNewFiles] = useState([]);
  const [secondNewFiles, setSecondNewFiles] = useState([]);
  const [institutesName, setinstitutesName] = useState("");
  const [existingCodes, setExistingCodes] = useState([]);
  const [firstShowSubmittedTable, setFirstShowSubmittedTable] = useState(false);
  const [secondShowSubmittedTable, setSecondShowSubmittedTable] =
    useState(false);
  const [number, setnumber] = useState("");
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [pasteError, setPasteError] = useState("");

  const status = [{ value: "Active", label: "Active" }];

  useEffect(() => {
    // Fetch all existing class codes
    getApi(APIS.CLASS_LIST)
      .then((res) => {
        const codes = res.data.Classes.map((classItem) => classItem.codee);
        setExistingCodes(codes);
      })
      .catch((error) => {
        console.error("Error fetching class codes:", error);
      });
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_BASE_URL}/state?limit=10000`
        );
        const json = await res.json();
        const options = json.data.list.map((item) => ({
          label: item.name.english,
          value: item._id,
        }));
        setStateOptions(options);
      } catch (err) {
        console.error("Failed to fetch states", err);
        setPasteError("Failed to fetch states");
      }
    };

    const fetchDistrict = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_BASE_URL}/district?limit=10000`
        );
        const json = await res.json();
        const options = json.data.list.map((item) => ({
          label: item?.name?.english,
          value: item?._id,
          stateId: item?.state?._id,
        }));
        setAllDistrict(options);
      } catch (err) {
        console.error("Failed to fetch districts", err);
        setPasteError("Failed to fetch districts");
      }
    };
    const fetchCity = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_BASE_URL}/city?limit=10000`
        );
        const json = await res.json();
        const options = json.data.list.map((item) => ({
          label: item.name.english,
          value: item._id,
          districtId: item.district?._id,
        }));
        setAllCity(options);
      } catch (err) {
        console.error("Failed to fetch city", err);
        setPasteError("Failed to fetch city");
      }
    };
    fetchCity();
    fetchStates();
    fetchDistrict();
  }, []);

  const handleStateChange = (option, setFieldValue) => {
    setSelectedState(option);
    setFieldValue("address.stateId", {
      _id: option.value,
      name: option.label,
    });
    const filteredDistrict = allDistrict.filter(
      (district) => district.stateId === option.value
    );
    setDistrictOptions(filteredDistrict);
    setSelectedDistrict(null);
    setFieldValue("address.districtId", null);
  };

  const handleDistrictChange = (option, setFieldValue) => {
    setSelectedDistrict(option);
    setFieldValue("address.districtId", {
      _id: option.value,
      name: option.label,
    });
    const filteredCity = allCity.filter(
      (city) => city.districtId === option.value
    );
    setCityOptions(filteredCity);
    setSelectedCity(null);
    setFieldValue("address.cityId", null);
  };
  const handleCityChange = (option, setFieldValue) => {
    setSelectedCity(option);
    setFieldValue("address.cityId", {
      _id: option.value,
      name: option.label,
    });
  };
  useEffect(() => {
    if (id) {
      setLoading(true);
      getApi(APIS.INSTITUTES, id)
        .then((res) => {
          const editData = res?.data;
          if (editData) {
            const statusValue =
              status.find((s) => s.value === editData?.status) || status[0];
            const stateData = editData?.address?.stateId;
            const districtData = editData?.address?.districtId;
            const cityData = editData?.address?.cityId;
            setSelectedState(
              stateData
                ? {
                    label: stateData.name.english,
                    value: stateData._id,
                  }
                : null
            );
            setSelectedDistrict(
              districtData
                ? {
                    label: districtData.name.english,
                    value: districtData._id,
                  }
                : null
            );
            setSelectedCity(
              cityData
                ? {
                    label: cityData.name.english,
                    value: cityData._id,
                  }
                : null
            );
            const description = editData?.description || "";
            setData({
              codee: editData?.codee || "",
              description,
              institutesName: editData?.institutesName || "",
              status: { value: editData?.status, label: editData?.status },
              phone: editData?.phone || "",
              instituteType: editData?.instituteType,
              address: {
                stateId: stateData
                  ? {
                      _id: stateData._id,
                      name: stateData.name.english,
                    }
                  : null,
                districtId: districtData
                  ? {
                      _id: districtData._id,
                      name: districtData.name.english,
                    }
                  : null,
                cityId: cityData
                  ? {
                      _id: cityData._id,
                      name: cityData.name.english,
                    }
                  : null,
                pinCode: editData?.address?.pinCode,
                address1: editData?.address?.address1,
                address2: editData?.address?.address2,
              },
            });
            setDescriptionLength(description.length);

            if (stateData && allDistrict) {
              const filteredDistrict = allDistrict.filter(
                (district) => district.stateId === stateData._id
              );
              setDistrictOptions(filteredDistrict);
            }

            if (districtData && allCity) {
              const filteredCity = allCity.filter(
                (city) => city.districtId === districtData._id
              );
              setCityOptions(filteredCity);
            }
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
  }, [id, allDistrict, allCity]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-GB", options);
  };

  const instituteType = [
    { id: "Coaching", label: "Coaching" },
    { id: "School", label: "School" },
  ];

  const handleDescriptionChange = (e, setFieldValue) => {
    const value = e.target.value;
    setDescriptionLength(value.length);
    setPasteError("");
    validateAlphabetsfortitle(e, setFieldValue, "description");
  };

  const handlePaste = (e, setFieldValue) => {
    const pastedText = e.clipboardData.getData("text");
    const currentLength = descriptionLength;
    const pastedLength = pastedText.length;

    if (currentLength + pastedLength > 1000) {
      e.preventDefault();
      setPasteError("Pasted content would exceed 1000 character limit.");
      return;
    }
    setPasteError("");
  };

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const payload = {
      codee: values.codee,
      description: values.description,
      isActive: true,
      isVerified: false,
      status: values.status?.value || "",
      address: {
        pinCode: values?.address?.pinCode,
        address1: values?.address?.address1,
        address2: values?.address?.address2,
      },
      institutesName: values.institutesName,
      phone: values.phone || "",
      instituteType: values?.instituteType,
    };

    if (values?.address?.stateId?._id) {
      payload.address.stateId = values.address.stateId._id;
    }
    if (values?.address?.districtId?._id) {
      payload.address.districtId = values.address.districtId._id;
    }
    if (values?.address?.cityId?._id) {
      payload.address.cityId = values.address.cityId._id;
    }

    if (id) {
      patchApi(APIS.INSTITUTES, id, payload)
        .then(() => {
          toast.success("Institution updated successfully");
          navigate(-1);
        })
        .catch((error) => {
          toast.error("Failed to update data");
          console.error(error);
        })
        .finally(() => setSubmitting(false));
    } else {
      postApi(APIS.INSTITUTES, payload)
        .then(() => {
          toast.success("Institution added successfully");
          if (values?.saveAndNew) {
            resetForm();
            setData(initialValues);
            setDescriptionLength(0);
            setPasteError("");
            setSelectedState(null);
            setSelectedDistrict(null);
            setDistrictOptions([]);
            setSelectedCity(null);
            setCityOptions([]);
            setTimeout(() => {
              window.location.reload();
            }, 200);
          } else {
            navigate(-1);
          }
        })
        .catch((error) => {
          console.error(error);
          if (error.response?.data?.message?.includes("duplicate")) {
            setPasteError(
              "This Institution already exists in the system. Please use a different name."
            );
          } else {
            setPasteError("Failed to create Institution. Please try again.");
          }
        })
        .finally(() => {
          setSubmitting(false);
          setShowSubmittedTable(false);
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
        touched,
      }) => (
        <Container>
          <div className="">
            <Header>
              <div>
                <BreadCrumbs
                  backNavi={() => navigate("/institutes/list")}
                  breadCrumbs={[
                    {
                      name: "Institution",
                      path: ROUTES.INSTITUTES_LIST,
                    },
                  ]}
                  boldItem={id ? "Edit Institution" : "Add Institution"}
                />
                <Heading>{id ? "Edit" : "Add"} Institution</Heading>
              </div>
              <ButtonContainer>
                <Button
                  type={BUTTON_TYPES.SECONDARY}
                  onClick={() => navigate(-1)}
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
                      {/* <div className="group-type-2-70-30">
                        <div className="group-type-1-70"></div>
                      </div> */}
                      <div className="group-type-3-equal">
                        <div className="flex-1 w-100">
                          <label className=" font-semibold text-[14px]">
                            Type <span className="text-red-500">*</span>
                          </label>
                          <InstitutionTypeDropdown
                            name="instituteType"
                            options={instituteType}
                          />
                          {touched.instituteType && errors.instituteType && (
                            <div className="text-red-500 text-[12px] mt-1">
                              {errors.instituteType}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="group-type-3-equal">
                        <div className="flex-1 w-100">
                          <FormikTextField
                            label="Name"
                            placeholder="Enter Name"
                            name="institutesName"
                            isRequired
                            value={values.institutesName}
                            onChange={(e) =>
                              validateAlphabetsfortitle(
                                e,
                                setFieldValue,
                                "institutesName"
                              )
                            }
                          />
                        </div>
                        <div className="flex-1 w-100">
                          <FormikTextField
                            label="Contact Number"
                            placeholder="Enter contact number"
                            name="phone"
                            onChange={(e) =>
                              validateMobileNumber(e, setFieldValue, "phone")
                            }
                          />
                        </div>
                      </div>
                      <div className="group-type-1">
                        <div className="flex-1 w-100">
                          <div className="to-input-field">
                            <TextFieldArea
                              className="to-label c-black"
                              as="textarea"
                              name="description"
                              label="Description"
                              charLimit={1000}
                              rows={5}
                              placeholder="Enter description"
                              value={values.description}
                              onChange={(e) =>
                                handleDescriptionChange(e, setFieldValue)
                              }
                              onPaste={(e) => handlePaste(e, setFieldValue)}
                              style={{
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                padding: "8px",
                                width: "100%",
                                height: "100px",
                                transition: "border-color 0.2s ease-in-out",
                                outline: "none",
                                resize: "none",
                              }}
                            />
                            <div>
                              <div className="text-left">
                                {pasteError && (
                                  <p className="text-red-500 text-xs">
                                    {pasteError}
                                  </p>
                                )}

                                {touched.description && errors.description && (
                                  <p className="text-red-500 text-xs">
                                    {errors.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="section-shadow w100">
                  <SidePanel title="Address" />
                  <div className="add-v-form-right-section">
                    <div className="add-v-form-section">
                      <div className="group-type-3-equal">
                        <div className="flex-1 w-100">
                          <FormikTextField
                            label="Address 1"
                            placeholder="Enter address"
                            name="address.address1"
                            isRequired
                            onChange={(e) => {
                              let value = e.target.value;
                              setFieldValue(
                                "address.address1",
                                startSpcaeRemover(value)
                              );
                            }}
                          />
                        </div>
                        <div className="flex-1 w-100">
                          <FormikTextField
                            label="Address 2"
                            placeholder="Enter address"
                            name="address.address2"
                            onChange={(e) => {
                              let value = e.target.value;
                              setFieldValue(
                                "address.address2",
                                startSpcaeRemover(value)
                              );
                            }}
                          />
                        </div>
                        <div className="flex-1 w-100 mt-2">
                          <label className="mb-2 font-semibold rounded-lg text-[14px]">
                            State <span className="text-red-500">*</span>
                          </label>
                          <Select
                            name="address.stateId"
                            styles={customStyles}
                            options={stateOptions}
                            value={selectedState}
                            onChange={(option) =>
                              handleStateChange(option, setFieldValue)
                            }
                            placeholder="Select"
                            menuPlacement="top"
                            isRequired
                          />
                          {touched.address?.stateId &&
                            errors.address?.stateId && (
                              <div className="text-red-500 text-[12px] mt-1">
                                {errors.address.stateId}
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="group-type-3-equal">
                        <div className="flex-1 w-100 mt-2">
                          <label className="mb-2 font-semibold rounded-lg text-[14px]">
                            District <span className="text-red-500">*</span>
                          </label>
                          <Select
                            name="address.districtId"
                            styles={customStyles}
                            options={districtOptions}
                            value={selectedDistrict}
                            onChange={(option) =>
                              handleDistrictChange(option, setFieldValue)
                            }
                            placeholder="Select"
                            isDisabled={!selectedState}
                            menuPlacement="top"
                            isRequired
                          />
                          {touched.address?.districtId &&
                            errors.address?.districtId && (
                              <div className="text-red-500 text-[12px] mt-1">
                                {errors.address.districtId}
                              </div>
                            )}
                        </div>

                        <div className="flex-1 w-100">
                          <FormikTextField
                            label="Pin Code"
                            placeholder="Enter pin code"
                            name="address.pinCode"
                            isRequired
                            onChange={(e) =>
                              validatePincode(
                                e,
                                setFieldValue,
                                "address.pinCode"
                              )
                            }
                          />
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

export default Addinstitutes;
