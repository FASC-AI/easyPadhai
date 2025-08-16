import {
  ButtonContainer,
  Container,
  Header,
  Heading,
} from '@/components/AddFormLayout/AddFormLayout';

import {
  uploadIcon,
  imageThumbnail,
  pdfThumbnail,
  spreadSheetThumbnail,
  deleteIcon,
  fileThumbnail,
} from '@/assets/Icons';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/common/CustomSelect';


import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { validateMobileNumber, validatePincode } from '@/utils/common.helper';

import { Checkbox } from '@/components/ui/checkbox';
import BreadCrumbs from '@/components/common/BreadCrumbs/BreadCrumbs';
import Button from '@/components/common/Button/Button';
import { BUTTON_TYPES } from '@/constants/common.constant';
import * as Yup from 'yup';
import { Field, Formik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "sonner";
import { getApi, postApi, patchApi, postFileApi } from '@/services/method';
import { APIS } from '@/constants/api.constant';
import './section.css';
import { CounterContext } from '@/components/Layout/commonLayout/TitleOfPageProvider';
import ROUTES from '@/constants/route.constant';
import FormikTextField from '@/components/inputs/formik/FormikTextField';
import { SidePanel } from '@/components/AddFormLayout/AddFormLayout';
import { generateRandomString } from '@/lib/utils';
import { DatePickerInput } from '@/components/common/DateTimeInputs/index';
import { CustomSelectById } from '@/components/common/CustomSelect';
import { startSpcaeRemover, validateNumbers } from '@/utils/common.helper';
import {

  validateAlphabetsfortitle,
} from '@/utils/common.helper';
import { Phone } from 'lucide-react';
import { TextFieldArea } from '@/components/ui/textFieldArea';
const initialValues = {
  codee:'',
  description: '',
  sectionsName: '',
 
};
const userSchema = Yup.object().shape({
 sectionsName: Yup.string().required("Name is required"),
 
});
const Addsections = () => {
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

  const [firstNewFiles, setFirstNewFiles] = useState([]);
  const [secondNewFiles, setSecondNewFiles] = useState([]);
  const [sectionsName, setsectionsName] = useState('');
  const [firstShowSubmittedTable, setFirstShowSubmittedTable] = useState(false);
  const [secondShowSubmittedTable, setSecondShowSubmittedTable] =
    useState(false);
  const [number, setnumber] = useState('');

  const status = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];
 

 



 

  useEffect(() => {
    if (id) {
      setLoading(true);
      getApi(APIS.SECTION, id)
        .then((res) => {
          const editData = res?.data;

          if (editData) {
            // Update the state with fetched data
            const statusValue =
              status.find((s) => s.value === editData?.status) || status[0];
            setData({
              codee: editData?.codee || '',
              description: editData?.description || '',
              sectionsName: editData?.sectionsName || '',
            
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

  const fetchStatusTypes = async (inputValue) => {
    const filteredStatus = status.filter((s) =>
      s.label.toLowerCase().includes((inputValue || '').toLowerCase())
    );

    return {
      results: filteredStatus,
      nextPage: false,
    };
  };
 

  
  const sectionTYpe = [
    { id: 'Coaching', label: 'Coaching' },
    { id: 'School', label: 'School' },
   
  ];
  const handleSubmit = (values, { setSubmitting, resetForm }) => {
   


    const payload = {
      isActive: true,
      codee: values.codee,
      description: values.description,
      sectionsName: values.sectionsName,
   
     
    };
   
    if (id) {
      //  payload._id = id;
      patchApi(APIS.SECTION, id, payload)
        .then(() => {
          toast.success('Section updated successfully');
          navigate(-1);
        })
        .catch((error) => {
          toast.error('Failed to update data');
         
        })
        .finally(() => setSubmitting(false));
    } else {
      postApi(APIS.SECTION, payload)
        .then(() => {
          toast.success('Section added successfully');
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
            toast.error("This Section code already exists in the system. Please use a different code.", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          } else {
            toast.error("Failed to create Section. Please try again.", {
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
          setShowSubmittedTable;
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
                      backNavi={() => navigate('/section/list')}
                      breadCrumbs={[
                        {
                          name: 'Section',
                          path: ROUTES.SECTION_LIST,
                        },
                      ]}
                      boldItem={id ? 'Edit section' : 'Add Section'}
                    />
                    <Heading>{id ? 'Edit' : 'Add'} Section </Heading>
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

                      onClick={() => {
                        values.saveAndNew = false;
                        formikSubmit();
                      }}
                      loading={isSubmitting && !values?.saveAndNew}
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
                          <div className="group-type-2-70-30">
                            <div className="group-type-1-70"></div>
                          </div>
                          <div className="group-type-3-equal">
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
                                label=" Name"
                                placeholder="Enter Name"
                                name="sectionsName"
                                isRequired
                                value={values.sectionsName}
                                onChange={(e) =>
                                  validateAlphabetsfortitle(
                                    e,
                                    setFieldValue,
                                    'sectionsName'
                                  )
                                }
                              />
                            </div>
                      
                          </div>
                          {/* <div className="group-type-1">
                                                   <div className="flex-1 w-100">
                                                     <div className="to-input-field">
                                                       <TextFieldArea
                                                         className="to-label c-black"
                                                         as="textarea"
                                                         name="description"
                                                         label="Section Description"
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

export default Addsections;
