import {
  ButtonContainer,
  Container,
  Content,
  Header,
  Heading,
  InputsContainer,
  Section,
  SidePanel,
} from "@/components/AddFormLayout/AddFormLayout";
import { generateRandomString } from "@/lib/utils";
import BreadCrumbs from "@/components/common/BreadCrumbs/BreadCrumbs";
import Button from "@/components/common/Button/Button";
import FormikAsyncDropdown from "@/components/inputs/formik/FormikAsyncDropdown/FormikAsyncDropdown";
import FormikSwitch from "@/components/inputs/formik/FormikSwitch";
import FormikTextField from "@/components/inputs/formik/FormikTextField";
import { CounterContext } from "@/components/Layout/commonLayout/TitleOfPageProvider";
import { APIS } from "@/constants/api.constant";
import { BUTTON_TYPES, COMMON_SCHEMA } from "@/constants/common.constant";
import ROUTES from "@/constants/route.constant";
import { getApi, patchApi, postApi } from "@/services/method";
import { Formik } from "formik";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as Yup from "yup";
import axios from "axios";
import {
  CustomSelect,
  CustomSelectById,
} from "@/components/common/CustomSelect";
import Select, { components } from "react-select";
import { ChevronDown } from "lucide-react";

const initialValues = {
  englishName: "",
  hindiName: "",
  lgd: "",
  isActive: true,
  shortName: {
    english: "",
    hindi: "",
  },
  country: {
    _id: null,
    name: null,
  },
};
const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown size={18} />
    </components.DropdownIndicator>
  );
};
const schema = Yup.object().shape({
  englishName: Yup.string().trim().required(COMMON_SCHEMA),
  country: Yup.object({
    _id: Yup.string().required(COMMON_SCHEMA),
  }).required(COMMON_SCHEMA),
});

const AddEditState = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(initialValues);

  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_BASE_URL}/country?limit=10000`
        );
        const data = await response.json();

        // Access the data properly and map it to an array of options for react-select
        const countryOptions = data.data.list
          .filter((item) => item.isActive === true)
          .map((item) => ({
            label: item.name.english,
            value: item._id, // Assuming 'code' is a unique identifier for each country
          }));

        setOptions(countryOptions); // Set options for react-select
      } catch (error) {

      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    fetchOptions();
  }, []);

  // Handle the change in the Select component
  const handleSelectChange = (selectedOption, setFieldValue) => {
    if (!selectedOption) {
      setSelectedOption(null);
      setFieldValue("country", { _id: null, name: null });
      return;
    }
    setSelectedOption(selectedOption);
    setFieldValue("country", {
      _id: selectedOption.value,
      name: selectedOption.label,
    });
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      getApi(APIS.STATE, id)
        .then((res) => {
          const editData = res?.data?.state;
          const country = editData?.country;
          setData((prev) => ({
            ...prev,
            lgd: editData?.lgd,
            englishName: editData?.name?.english,
            hindiName: editData?.name?.hindi,
            isActive: editData?.isActive,
            shortName: {
              english: editData?.shortName?.english,
              hindi: editData?.shortName?.hindi,
            },
            country: {
              _id: country?._id, // Ensure the country ID is included
              name: country?.name?.english, // Populate name
            },
          }));

          setSelectedOption({
            label: country?.name?.english,
            value: country?._id,
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const payload = {
      lgd: values.lgd,
      name: {
        english: values.englishName,
        hindi: values.hindiName,
      },
      shortName: {
        english: values?.shortName?.english,
        hindi: values?.shortName?.hindi,
      },
      country: values?.country?._id,

      isActive: values.isActive,
    };

    if (id) {
      payload._id = id;
      patchApi(APIS.STATE, id, payload).then(() => {
        toast.success("State updated successfully");

        navigate(-1);
      });
    } else {
      postApi(APIS.STATE, payload)
        .then(() => {
          toast.success("State added successfully");
          if (values?.saveAndNew) {
            resetForm();
            setData(initialValues);
            setTimeout(() => {
              window.location.reload();
            }, 200);
          } else {
            navigate(-1);
          }
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };

  // Declare the fetchData function as async to use await inside it
  const fetchData = async (searchTerm, page = 1) => {
    try {
      // Use the correct API endpoint for fetching data
      const response = await fetch(
        `${import.meta.env.VITE_APP_BASE_URL}/country`
      );
      const data = await response.json();

      // Return the results for the dropdown
      return {
        results: data.results, // Make sure to access the data correctly
        nextPage: data.nextPage, // If your API provides pagination
      };
    } catch (error) {

      return {
        results: [],
        nextPage: null,
      };
    }
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
                      breadCrumbs={[{ name: "State", path: ROUTES.MASTERS }]}
                      boldItem={"Add State"}
                    />
                    <Heading>{id ? "Edit" : "Add"} State</Heading>
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
                                  label="State Name"
                                  placeholder="Enter State Name"
                                  name="englishName"
                                  isRequired={true}
                                />
                              </div>
                              <div className="flex-1 w-100">
                                <label className="mb-2 font-semibold text-[14px]">
                                  Country{" "}
                                  <span className="text-red-500">*</span>
                                </label>

                                <Select
                                  name="country"
                                  options={options}
                                  value={selectedOption}
                                  onChange={(option) =>
                                    handleSelectChange(option, setFieldValue)
                                  }
                                  styles={customStyles}
                                  placeholder="Select "
                                  components={{ DropdownIndicator }}
                                  isClearable={true}
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
                              <div className="flex-1 w-100 pt-8 ml-8 item-center">
                                <FormikSwitch
                                  label="Is Active?"
                                  name="isActive"
                                />
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

export default AddEditState;
