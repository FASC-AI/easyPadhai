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
import BreadCrumbs from "@/components/common/BreadCrumbs/BreadCrumbs";
import Button from "@/components/common/Button/Button";
import FormikSwitch from "@/components/inputs/formik/FormikSwitch";
import FormikTextField from "@/components/inputs/formik/FormikTextField";
import { CounterContext } from "@/components/Layout/commonLayout/TitleOfPageProvider";
import { APIS } from "@/constants/api.constant";
import { BUTTON_TYPES, COMMON_SCHEMA } from "@/constants/common.constant";
import ROUTES from "@/constants/route.constant";
import { getApi, patchApi, postApi } from "@/services/method";
import { capitalization } from "@/utils/common.helper";
import { Formik } from "formik";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as Yup from "yup";

const initialValues = {
  englishName: "",

  isActive: true,
};

const schema = Yup.object().shape({
  englishName: Yup.string().trim().required(COMMON_SCHEMA),
});

const AddEditCountry = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(initialValues);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getApi(APIS.COUNTRY, id)
        .then((res) => {
          const editData = res?.data?.country;
          
          setData((prev) => ({
            ...prev,

            englishName: editData?.name?.english,

            isActive: editData?.isActive,
          }));
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const payload = {
      name: {
        english: values.englishName,
      },
      isActive: values.isActive,
    };
    if (id) {
      payload._id = id;
      patchApi(APIS.COUNTRY, id, payload).then(() => {
        toast.success("Country updated successfully");
        navigate(-1);
      });
    } else {
      postApi(APIS.COUNTRY, payload)
        .then(() => {
          toast.success("Country added successfully");
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
                        { name: "Countries", path: ROUTES.MASTERS },
                      ]}
                      boldItem={"Add Country"}
                    />
                    <Heading>{id ? "Edit" : "Add"} Country</Heading>
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
                                  label="Country Name"
                                  placeholder="Enter Country Name"
                                  name="englishName"
                                  isRequired={true}
                                  onChange={(e) => {
                                    let value = e.target.value;
                                    if (value.charAt(0) === " ") {
                                      value = value.slice(1);
                                    }
                                    setFieldValue(
                                      "englishName",
                                      capitalization(value)
                                    );
                                  }}
                                />
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

export default AddEditCountry;
