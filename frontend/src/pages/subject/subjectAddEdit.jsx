import { Formik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "sonner";
import { useEffect, useState } from 'react';
import {
  ButtonContainer,
  Container,
  Header,
  Heading,
} from '@/components/AddFormLayout/AddFormLayout';
import { BUTTON_TYPES } from '@/constants/common.constant';
import Button from '@/components/common/Button/Button';
import FormikTextField from '@/components/inputs/formik/FormikTextField';
import BreadCrumbs from '@/components/common/BreadCrumbs/BreadCrumbs';
import ROUTES from '@/constants/route.constant';
import { getApi, postApi, patchApi } from '@/services/method';
import { APIS } from '@/constants/api.constant';
import { SidePanel } from '@/components/AddFormLayout/AddFormLayout';
import * as Yup from 'yup';
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { startSpcaeRemover } from '@/utils/common.helper';
import './subject.css';
import { TextFieldArea } from '@/components/ui/textFieldArea';
import { Textarea } from '@/components/ui/textarea';
import FormikDocumentUploder from '@/components/inputs/formik/FormikDocumentUploader/FormikDocumentUploader';
import {
  validateNumbers,
  validateAlphabetsfortitle,
} from '@/utils/common.helper';
const initialValues = {
 
 
  category: '',
  description: '',
  images: [], 
  nameEn: '',
 
};
const userSchema = Yup.object().shape({
  nameEn: Yup.string().required('Name is required'),
 
  
});
const AddSubject = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(initialValues);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const breadcrumbData = [
      { label: "Subject" },
    ];
    updateBreadcrumb(breadcrumbData);
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getApi(APIS.SUBJECT, id)
        .then((res) => {
          const editData = res?.data;

          if (editData) {
            // Update the state with fetched data

          setData({
              nameEn: editData?.nameEn || '',
            codee: editData?.codee || '',
            description: editData?.description || '',
            images: editData?.images || []
            });

          
                    } else {
            toast.error('No data found for the provided ID');
          }
        })
        .catch((error) => {

          toast.error('Failed to load data');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);



 

  const handleSubmit = (values, { setSubmitting, resetForm }) => {

    const payload = {
      isActive: true,
      codee: values.codee,
      description: values.description,
      images: values.images || [],
      nameEn: values.nameEn,
      
    };
   
    if (id) {
      //  payload._id = id;
      patchApi(APIS.SUBJECT, id, payload)
        .then(() => {
          toast.success('Subject updated successfully');
          navigate(-1);
        })
        .catch((error) => {
          toast.error('Failed to update data');
        })
        .finally(() => setSubmitting(false));
    } else {
      postApi(APIS.SUBJECT, payload)
        .then(() => {
          toast.success('Subject added successfully');
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
        .catch((error) => {
          if (error.response?.data?.message?.includes("duplicate")) {
            toast.error("This Subject code already exists in the system. Please use a different code.", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          } else {
            toast.error("Failed to create Subject. Please try again.", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
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
      validationSchema={userSchema}

      onSubmit={handleSubmit}
    >
      {({
        isSubmitting,
        values,
        errors,
        setFieldValue,
        handleSubmit: formikSubmit,
      }) => {
      
        
        return (
          <Container>
            <div className="">
              <>
                <Header>
                  <div>
                    <BreadCrumbs
                      backNavi={() => navigate('/subject/list')}
                      breadCrumbs={[
                        {
                          name: 'Subject',
                          path: ROUTES.SUBJECT_LIST,
                        },
                      ]}
                      boldItem={id ? 'Edit Subject' : 'Add Subject'}
                    />
                    <Heading >{id ? 'Edit' : 'Add'} Subject </Heading>
                  </div>
                  <ButtonContainer>
                    <Button
                      type={BUTTON_TYPES.SECONDARY}
                      onClick={() => navigate(ROUTES.SUBJECT_LIST)}
                      disabled={isSubmitting}
                      className=" bg-white boder border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white mr-1"

                    >
                      Cancel
                    </Button>
                    {!id && (
                      <Button
                        type={BUTTON_TYPES.SECONDARY}
                        onClick={() => {
                          values.saveAndNew = true;
                          formikSubmit();
                        }}
                        disabled={isSubmitting && values?.saveAndNew === true}
                        className=" bg-white boder border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white mr-1"

                      >
                        Save & Add New
                      </Button>
                    )}

                    <Button
                      type={BUTTON_TYPES.PRIMARY}
                      //   onClick={formikSubmit}
                        onClick={() => {
                        values.saveAndNew = false;
                        formikSubmit();
                      }}
                      loading={isSubmitting && !values?.saveAndNew}
                      className="bg-[#1A6FAB] text-white hover:bg-[#1A6FAB] hover:text-white"
                    >
                      {id ? 'Update' : 'Save'}
                    </Button>
                  </ButtonContainer>{' '}
                </Header>

                <div
                  className="add-v-form"
                  style={{ padding: '20px', justifyContent: 'center' }}
                >
                  <div className="width90">
                    <div className="section-shadow w100">
                      <SidePanel title={`Basic Information`} />
                      <div className="add-v-form-right-section">
                        <div className="add-v-form-section">
                         
                          <div className="group-type-3-equal mt-2">
                           
                            {/* <div className="flex-1 w-100">
                            <FormikTextField
  label="Code"
  placeholder="Enter Code"
  name="codee"
  isRequired
  disabled={!!id} // disable if editing
  onChange={(e) => {
    let value = e.target.value.toUpperCase(); // ensure uppercase
    setFieldValue("codee", startSpcaeRemover(value));
  }}
/>
                            </div> */}
                            <div className="flex-1 w-100">
                              <FormikTextField
                                label="Name"
                                placeholder="Enter name"
                                name="nameEn"
                                isRequired
                                onChange={(e) => {
                                  let value = e.target.value;
                                  setFieldValue(
                                    'nameEn',
                                    startSpcaeRemover(value)
                                  );
                                  //  validateNumbers(e, setFieldValue, 'averageDate')
                                }}
                              />
                            </div>
                            
                          </div>
                          <div className="group-type-1 mt-2">
                            <div>
                              <label className="upload-wrap border ">
                                <FormikDocumentUploder
                                  name="images"
                                  id="subject-images"
                                  title="Upload Subject Images"
                                  message="or drag & drop subject image files here"
                                  btnText="BROWSE FILE"
                                  bottomMessage="Supported File Format: jpeg, png (upto 1 MB)"
                                  accept="image/*"
                                />
                              </label>
                            </div>


                          </div>
                          {/* <div className="group-type-1">
                            <div className="flex-1 w-100">
                              <div className="to-input-field">
                                <TextFieldArea
                                  className="to-label c-black"
                                  as="textarea"
                                  name="description"
                                  label="Subject Description"
                                  charLimit={1000}
                                  rows={5}
                                  placeholder="Enter description"
                                  value={values.description}
                                  onChange={(e) =>
                                    validateAlphabetsfortitle(
                                      e,
                                      setFieldValue,
                                      'description'
                                    )
                                  }
                                  style={{
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    padding: '8px',
                                    width: '100%',
                                    height: '100px',
                                    transition: 'border-color 0.2s ease-in-out',
                                    outline: 'none',
                                    resize: 'none',
                                  }}
                                />
                              </div>
                            </div>
                          </div> */}
                            

                        </div>{' '}
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

export default AddSubject;
