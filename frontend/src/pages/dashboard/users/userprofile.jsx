import {
  ButtonContainer,
  Container,
  Header,
  Heading,
} from '@/components/AddFormLayout/AddFormLayout';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import {useEffect} from 'react';
import BreadCrumbs from '@/components/common/BreadCrumbs/BreadCrumbs';
import Button from '@/components/common/Button/Button';
import { BUTTON_TYPES } from '@/constants/common.constant';
import { SidePanel } from '@/components/AddFormLayout/AddFormLayout';
import ROUTES from '@/constants/route.constant';
import useStore from "@/store"
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
const UserProfile = () => {
  const navigate = useNavigate();
  const { user } = useStore(); // Access user data from useStore
 const { updateBreadcrumb } = useBreadcrumb();
  // Format date for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleString('en-GB', options);
  };
 useEffect(() => {
    const breadcrumbData = [
      { label: "User Profile" },
    ];
    updateBreadcrumb(breadcrumbData);
  }, []);
  return (
    <Container>
      <div className="">
        <Header>
          <div>
            <BreadCrumbs
              backNavi={() => navigate('/dashboard')}
              breadCrumbs={[
                {
                  name: 'Dashboard',
                  path: ROUTES.DASHBOARD,
                },
              ]}
              boldItem="User Profile"
            />
            <Heading>User Profile</Heading>
          </div>
          <ButtonContainer>
            <Button
              type={BUTTON_TYPES.SECONDARY}
              onClick={() => navigate(-1)}
              className="bg-white border border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white mr-1"
            >
              Back
            </Button>
            {/* <Button
              type={BUTTON_TYPES.SECONDARY}
              onClick={() =>  navigate(`/users/edit/${user.id}`)}
              className="bg-white border border-[#1A6FAB] text-[#1A6FAB] hover:bg-[#1A6FAB] hover:text-white mr-1"
            >
             Edit
            </Button>  */}
          </ButtonContainer>
        </Header>

        <div className="add-v-form" style={{ padding: '20px', justifyContent: 'center' }}>
          <div className="width90">
            <div className="section-shadow w100">
              <SidePanel title="Personal Information" />
              <div className="add-v-form-right-section">
                <div className="add-v-form-section">
                  {user ? (
                    <>
                      <div className="group-type-3-equal mt-3">
                        <div className="flex-1 w-100">
                          <Label className="mb-2 font-semibold text-[14px]">Name</Label>
                          <div className="border border-gray-200 rounded-md px-4 py-2 text-[12px] bg-gray-50">
                            {user.name?.english || 'N/A'}
                          </div>
                        </div>
                        <div className="flex-1 w-100">
                          <Label className="mb-2 font-semibold text-[14px]">Email</Label>
                          <div className="border border-gray-200 rounded-md px-4 py-2 text-[12px] bg-gray-50">
                            {user.email || 'N/A'}
                          </div>
                        </div>
                       
                      </div>
                      <div className="group-type-3-equal">
                         <div className="flex-1 w-100">
                          <Label className="mb-2 font-semibold text-[14px]">Mobile Number</Label>
                          <div className="border border-gray-200 rounded-md px-4 py-2 text-[12px] bg-gray-50">
                            {user.mobile || 'N/A'}
                          </div>
                        </div>
                        <div className="flex-1 w-100">
                          <Label className="mb-2 font-semibold text-[14px]">District</Label>
                          <div className="border border-gray-200 rounded-md px-4 py-2 text-[12px] bg-gray-50">
                            {user.district || 'N/A'}
                          </div>
                        </div>
                        
                      </div>
                      <div className="group-type-3-equal">
                       <div className="flex-1 w-100">
                          <Label className="mb-2 font-semibold text-[14px]">Role</Label>
                          <div className="border border-gray-200 rounded-md px-4 py-2 text-[12px] bg-gray-50">
                            {user.userRole || 'N/A'}
                          </div>
                        </div>
                        <div className="flex-1 w-100">
                          <Label className="mb-2 font-semibold text-[14px]">Status</Label>
                          <div className="border border-gray-200 rounded-md px-4 py-2 text-[12px] bg-gray-50">
                            {user.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                       
                      </div>
                    </>
                  ) : (
                    <div className="text-center">No user data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default UserProfile;