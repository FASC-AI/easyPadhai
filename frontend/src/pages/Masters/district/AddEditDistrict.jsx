import {
  ButtonContainer,
  Container,
  Content,
  Header,
  Heading,
  Section,
  SidePanel,
} from "@/components/AddFormLayout/AddFormLayout";
import BreadCrumbs from "@/components/common/BreadCrumbs/BreadCrumbs";
import Button from "@/components/common/Button/Button";
import FormikSwitch from "@/components/inputs/formik/FormikSwitch";
import FormikTextField from "@/components/inputs/formik/FormikTextField";
import { APIS } from "@/constants/api.constant";
import { BUTTON_TYPES, COMMON_SCHEMA } from "@/constants/common.constant";
import ROUTES from "@/constants/route.constant";
import { getApi, patchApi, postApi } from "@/services/method";
import { capitalization, startSpcaeRemover } from "@/utils/common.helper";
import { Formik } from "formik";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as Yup from "yup";
import Select, { components } from "react-select";
import { ChevronDown } from "lucide-react";

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown size={18} />
    </components.DropdownIndicator>
  );
};

const initialValues = {
  englishName: "",
  lgd: "",
  hindiName: "",
  shortName: {
    english: "",
    hindi: "",
  },
  rtoCode: "",
  districtPopulation: "",
  isActive: true,
  country: {
    _id: "",
    name: "",
  },
  state: {
    _id: "",
    name: "",
  },
};

const schema = Yup.object().shape({
  englishName: Yup.string().trim().required(COMMON_SCHEMA),
  country: Yup.object({
    _id: Yup.string().required(COMMON_SCHEMA),
  }).required(COMMON_SCHEMA),
  state: Yup.object({
    _id: Yup.string().required(COMMON_SCHEMA),
  }).required(COMMON_SCHEMA),
});

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

const AddEditDistrict = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [allStates, setAllStates] = useState([]);
  const hasFetchedDistrict = useRef(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/country?limit=10000`);
        const json = await res.json();
        const options = json.data.list
          .filter((item) => item.isActive === true)
          .map((item) => ({
            label: item.name.english,
            value: item._id,
          }));
        setCountryOptions(options);
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    };

    const fetchStates = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/state?limit=10000`);
        const json = await res.json();
        const options = json.data.list
          .filter((item) => item.isActive === true)
          .map((item) => ({
            label: item.name.english,
            value: item._id,
            countryId: item.country?._id,
          }));
        setAllStates(options);
      } catch (err) {
        console.error("Failed to fetch states", err);
      }
    };

    fetchCountries();
    fetchStates();
  }, []);

  useEffect(() => {
    if (id && !hasFetchedDistrict.current) {
      setLoading(true);
      getApi(APIS.DISTRICT, id)
        .then((res) => {
          const editData = res?.data?.district;
          const country = editData?.country;
          const state = editData?.state;
          setData({
            ...initialValues,
            lgd: editData.lgd,
            englishName: editData?.name?.english,
            hindiName: editData?.name?.hindi,
            isActive: editData?.isActive,
            districtPopulation: editData?.districtPopulation,
            rtoCode: editData?.rtoCode,
            shortName: {
              english: editData?.shortName?.english || "",
              hindi: editData?.shortName?.hindi || "",
            },
            country: {
              _id: country?._id,
              name: country?.name?.english,
            },
            state: {
              _id: state?._id,
              name: state?.name?.english,
            },
          });

          setSelectedCountry({
            label: country?.name?.english,
            value: country?._id,
          });

          setSelectedState({
            label: state?.name?.english,
            value: state?._id,
          });

          const filteredStates = allStates.filter(
            (state) => state.countryId === country?._id
          );
          setStateOptions(filteredStates);

          hasFetchedDistrict.current = true;
        })
        .catch((error) => {
         
          toast.error("Failed to load district data");
        })
        .finally(() => setLoading(false));
    }
  }, [id, allStates]);

  const handleCountryChange = (option, setFieldValue) => {
    setSelectedCountry(option);
    setFieldValue("country", {
      _id: option ? option.value : "",
      name: option ? option.label : "",
    });
    const filteredStates = option
      ? allStates.filter((state) => state.countryId === option.value)
      : [];
    setStateOptions(filteredStates);

    setSelectedState(null);
    setFieldValue("state", { _id: "", name: "" });
  };

  const handleStateChange = (option, setFieldValue) => {
    setSelectedState(option);
    setFieldValue("state", {
      _id: option ? option.value : "",
      name: option ? option.label : "",
    });
  };

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const { englishName, hindiName, ...rest } = values;
    const payload = {
      ...rest,
      country: values.country?._id,
      state: values.state?._id,
      name: {
        english: englishName,
      },
    };

    if (id) {
      payload._id = id;
      patchApi(APIS.DISTRICT, id, payload)
        .then(() => {
          toast.success("District updated successfully");
          if (!values.state._id && values.country._id) {
            const filteredStates = allStates.filter(
              (state) => state.countryId === values.country._id
            );
            setStateOptions(filteredStates);
          }
          navigate(-1);
        })
        .catch((error) => {
   
          toast.error("Failed to update district");
        })
        .finally(() => setSubmitting(false));
    } else {
      postApi(APIS.DISTRICT, payload)
        .then(() => {
          toast.success("District added successfully");
          if (values?.saveAndNew) {
            resetForm();
            setData(initialValues);
            setSelectedCountry(null);
            setSelectedState(null);
            setStateOptions([]);
            setTimeout(() => {
              window.location.reload();
            }, 200);
          } else {
            navigate(-1);
          }
        })
        .catch((error) => {

          toast.error("Failed to create district");
        })
        .finally(() => setSubmitting(false));
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={data}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >
      {({
        isSubmitting,
        handleSubmit: formikSubmit,
        values,
        setFieldValue,
        touched,
        errors,
      }) => {
        return (
          <Container>
            <div className="">
              <>
                <Header>
                  <div>
                    <BreadCrumbs
                      backNavi={() => navigate(-1)}
                      breadCrumbs={[
                        { name: "Districts", path: ROUTES.MASTERS },
                      ]}
                      boldItem={"Add District"}
                    />
                    <Heading>{id ? "Edit" : "Add"} District</Heading>
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
                      onClick={formikSubmit}
                      loading={isSubmitting && !values?.saveAndNew}
                    >
                      {id ? "Update" : "Save"}
                    </Button>
                  </ButtonContainer>
                </Header>
                <div className="section-shadow w100 my-8 mx-8">
                  <div
                    className="add-v-form"
                    style={{ padding: "20px", justifyContent: "center" }}
                  >
                    <div className="width90">
                      <div className=" w100">
                        <SidePanel title={`Basic Information`} />
                        <div className="add-v-form-right-section">
                          <div className="add-v-form-section">
                            <div className="group-type-3-equal mt-2">
                              <div className="flex-1 w-100">
                                <FormikTextField
                                  label="District Name"
                                  placeholder="Enter District Name"
                                  name="englishName"
                                  onChange={(e) => {
                                    setFieldValue(
                                      "englishName",
                                      capitalization(e.target.value)
                                    );
                                  }}
                                  isRequired
                                />
                              </div>

                              <div className="flex-1 w-100 pt-8 ml-8 item-center">
                                <FormikSwitch
                                  label="Is Active?"
                                  name="isActive"
                                />
                              </div>
                            </div>

                            <div className="group-type-3-equal mt-2">
                              <div className="flex-1 w-100">
                                <label className="mb-2 font-semibold text-[14px]">
                                  Country{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <Select
                                  styles={customStyles}
                                  options={countryOptions}
                                  value={selectedCountry}
                                  onChange={(option) =>
                                    handleCountryChange(option, setFieldValue)
                                  }
                                  placeholder="Select"
                                  isClearable={true}
                                  components={{ DropdownIndicator }}
                                  onBlur={() =>
                                    setFieldTouched("country", true)
                                  }
                                  menuPlacement="top"
                                />
                                {touched.country && errors.country?._id && (
                                  <div className="text-red-500 text-[12px] mt-2">
                                    {errors.country._id}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 w-100">
                                <label className="mb-2 font-semibold text-[14px]">
                                  State <span className="text-red-500">*</span>
                                </label>
                                <Select
                                  styles={customStyles}
                                  options={stateOptions}
                                  value={selectedState}
                                  onChange={(option) =>
                                    handleStateChange(option, setFieldValue)
                                  }
                                  placeholder="Select"
                                  isDisabled={!selectedCountry}
                                  components={{ DropdownIndicator }}
                                  isClearable={true}
                                  onBlur={() => setFieldTouched("state", true)}
                                  menuPlacement="top"
                                />
                                {touched.state && errors.state?._id && (
                                  <div className="text-red-500 text-[12px] mt-2">
                                    {errors.state._id}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>{" "}
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

export default AddEditDistrict;
