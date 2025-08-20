import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect, useState } from "react";
import TableListView from "@/components/ui/table-list-view/table-list-view";
import { ChevronDown, Settings2Icon } from "lucide-react";
import { EllipsisIcon, EyeIcon, PencilIcon,BadgeCheck ,BadgeAlert  } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataCharectersTooltip from '@/components/ui/DataCharectersTooltip';
import { Link} from 'react-router-dom';
import axios from 'axios';
import PopupAlert from '@/components/common/PopupAlert/PopupAlert';
import {
  
  
  FileUpIcon,
  ImportIcon,
  LocateFixedIcon,
  TrashIcon,
  PlusIcon,
  CopyPlus,
  UserRoundCheck,
  UserRoundX,
} from 'lucide-react';
import * as Yup from 'yup';
import { Button } from "@/components/ui/button";
import { format_dd_mmm_yyyy } from "@/components/functions/date-format";
import { toTitleCase } from "@/components/functions/tittle-case";
import { AlertDialogBox } from "@/components/ui/dialog";
import { Trash2Icon } from "lucide-react";
import apiService from "@/lib/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { APIS } from '@/constants/api.constant';
import ROUTES from '@/constants/route.constant';
import { getApi, patchApi } from '@/services/method';
const queryClient = new QueryClient();



const InstitutesListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [userApiData, setUserApiData] = useState('executed');
  const [classId, setClassId] = useState();
  const navigate = useNavigate();
  const handleConfirm = async () => {
    try {
      const response = await apiService.delete(`${APIS.INSTITUTES}/${classId}`);
      if (response?.code === 200 && response?.status === true) {
        toast.success(response?.message);

        setIsDialogOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setIsDialogOpen(false);
        toast.error(response?.message);
      }
    } catch (error) {
      setIsDialogOpen(false);
      toast.error(error?.response?.data?.message);
    }
  };
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    row: null,
    action: null,
  });

  const refreshData = () => {
    setRefreshFlag((prev) => !prev);
  };
  const showConfirmationPopup = (row, action) => {
    setConfirmationPopup({
      isOpen: true,
      row,
      action,

    });
  };
  const navigateToEdit = (rowData) => {
    navigate(`${ROUTES.UPDATE_INSTITUTES}/${rowData?._id}`, {
      state: { isEditeActive: true },
    });
  };
 const navigateTobatch = (rowData) => {
    navigate(`${ROUTES.BATCH_DATA}/${rowData?._id}`, {
      state: { isEditeActive: true },
    });
  };
  const handleViewUser = async (id, name, email, mobile) => {
    // navigate(USERS.USER_PREVIEW, {
    //   state: { id: id, name: name, email: email, mobile: mobile },
    // });
  };
const queryClient= useQueryClient()
  const handleCancel = () => {
    setIsDialogOpen(false);
  };
  useEffect(() => {
    const breadcrumbData = [
  
      { label: "Institution"},
    
    ];
    updateBreadcrumb(breadcrumbData);
  }, []);

const columns = [
  {
    field: 'institutesName',
    headerName: 'Name',
    headerClassName: 'bg-[#1A6FAB] text-white',
    width: 300,
    renderCell: (params) => {
      const text = params.value || '';
      return (
        <div className="truncate w-full">
          {text.length >= 40 ? (
            <DataCharectersTooltip text={text} maxLength="25" />
          ) : (
            <span>{text}</span>
          )}
        </div>
      );
    },
  },
  {
    field: 'instituteType',
    headerName: 'Institution Type',
    headerClassName: 'bg-[#1A6FAB] text-white',
    width: 200,
    renderCell: (params) => {
      const value = typeof params.value === 'object' && params.value !== null
        ? params.value.School || params.value.name || JSON.stringify(params.value)
        : params.value || '-';
      return <span>{value}</span>;
    },
  },
  {
    field: 'phone',
    headerName: 'Contact Number',
    headerClassName: 'bg-[#1A6FAB] text-white',
    width: 200,
    renderCell: (params) => <span>{params.value || '-'}</span>,
  },
  {
    field: 'address.stateId',
    headerName: 'State',
    headerClassName: 'bg-[#1A6FAB] text-white',
    width: 200,
    renderCell: (params) => <span>{params.row.address?.stateId?.name?.english || '-'}</span>,
  },
  {
    field: 'address.districtId',
    headerName: 'District',
    headerClassName: 'bg-[#1A6FAB] text-white',
    width: 200,
    renderCell: (params) => <span>{params.row.address?.districtId?.name?.english || '-'}</span>,
  },
{
    field: 'batchDetails',
    headerName: 'Batches',
    headerClassName: 'bg-[#1A6FAB] text-white',
    width: 300,
    renderCell: (params) => {
      const batches = params.row.batchDetails || [];
      const batchCount = batches.length; // Get the count of batches
      return (
        <div
          className="truncate w-full cursor-pointer hover:text-blue-500 transition-colors duration-200"
         onClick={() => navigateTobatch(params.row)}
        >
          {batchCount > 0 ? (
            <span className="px-2 py-1 rounded-full w-[4px] h-[4px] bg-gray-200"onClick={() => navigateTobatch(params.row)}>{batchCount} </span>
          ) : (
            <span>-</span>
          )}
        </div>
      );
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    headerClassName: 'bg-[#1A6FAB] text-white',
    width: 200,
    renderCell: (params) => {
      const status = params.value;
      let color = 'gray';
      if (status === 'Active') color = 'green';
      else if (status === 'Inactive') color = 'red';
      else if (status === 'Activation Pending') color = 'orange';
      return <span style={{ color }}>{status}</span>;
    },
  },
  {
    field: 'Action',
    headerName: 'Action',
    headerClassName: 'bg-[#1A6FAB] text-white super-app-theme--header hide-img-bordersvg',
    minWidth: 150,
    flex: 1,
    editable: false,
    renderCell: (params) => {
      const isInactive = params.row.status === 'Inactive';
      const isActive = params.row.status === 'Active';
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9 group">
              <EllipsisIcon className="text-blue-primary-200" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigateToEdit(params.row)} disabled={isInactive}>
              <PencilIcon className="size-4 mr-2" />
              <span>Edit</span>
            </DropdownMenuItem>
            {isActive ? (
              <DropdownMenuItem onClick={() => showConfirmationPopup(params.row, 'Inactive')}>
                <UserRoundX className="size-4 mr-2" />
                <span>Inactive</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => showConfirmationPopup(params.row, 'Active')}>
                <UserRoundCheck className="size-4 mr-2" />
                <span>Active</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleDeleteUser(params.row._id)} disabled={isInactive}>
              <TrashIcon className="size-4 mr-2" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
 
  const fetchData = async ({ page, pageSize, search, sortBy, order, tab }) => {
    const params = {
      limit: pageSize,
      page: page + 1,
      search,
      sortBy,
      order,
    };

    if (tab === 'Active') {
      params.isActive = true;
      params.isVerified = false;
    } else if (tab === 'Inactive') {
      params.isActive = false;
      params.isVerified = true;
    } else if (tab === 'Verified') {
      params.isActive = true;
      params.isVerified = true;
    } else if (tab === 'Activation Pending') {
      params.isActive = false;
      params.isVerified = false;
    }

    const response = await apiService.get(`${APIS.INSTITUTES_LIST}`, {
      params,
    });
    return {
      data: response.data.institutes.map((row) => {
        let status = "Activation Pending"; // default
      
        if (row.isActive && row.isVerified) status = "Verified";
        else if (row.isActive) status = "Active";
        else if (!row.isActive && row.isVerified) status = "Inactive";
        else status = "Activation Pending";
      
        return {
          ...row,
          id: row._id,
          status,
          space: '',
        };
      }),
      totalCount: response.data.count || 0,
    };
  };
  const handleAddUser = () => {
    navigate(ROUTES.INSTITUTES);
  };

  const handleDeleteUser = (id) => {
    setClassId(id);
    setIsDialogOpen(true);
  };
  const handleCancelUpdate = () => {
    setConfirmationPopup({
      isOpen: false,
      row: null,
      action: null,
    });
  };
  const handleConfirmationResponse = (isConfirmed) => {
    if (isConfirmed && confirmationPopup.row) {
      handleStatusToggle(confirmationPopup.row, confirmationPopup.action);
    }

    setConfirmationPopup({
      isOpen: false,
      row: null,
      action: null,
    });

  };

  const handleStatusToggle = (row, status) => {
    let payload = {};
  
    switch (status) {
      case "Active":
        payload = { isActive: true, isVerified: false };
        break;
      case "Inactive":
        payload = { isActive: false, isVerified: true };
        break;
      case "Activation Pending":
        payload = { isActive: false, isVerified: false };
        break;
      case "Verified":
        payload = { isActive: true, isVerified: true };
        break;
      default:
        break;
    }
  
    patchApi(APIS.INSTITUTES, row._id, payload)
      .then(() => {
        toast.success(`Institution has been marked as ${status} successfully`);
        setUserApiData("executed");
        refreshData();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch(() => toast.error("Failed to update status"));
  };
  

  return (
    <div className="">
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}
          tabs={[
            { label: 'All', value: 'all' },
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
            // { label: 'Verified', value: 'verified' },
            { label: 'Activation Pending', value: 'Activation Pending' },
          ]}
          fetchData={fetchData}
        
          searchPlaceholder="Search"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
          onAddItem={handleAddUser}
          addButtonText="Add Institution"
        />
      </QueryClientProvider>
      {confirmationPopup.isOpen && (
        <PopupAlert
          open={confirmationPopup.isOpen}
          setOpen={setOpenDialog}
          title="Status"
          message={`Are you sure, you want to mark this Institution as ${confirmationPopup.action}?`}
          onConfirm={() => handleConfirmationResponse(true)} // Yes
          onCancel={handleCancelUpdate}
          submitTxt="Yes"
          cancelTxt="No"
        />
      )}
      <AlertDialogBox
        isOpen={isDialogOpen}
        title="Delete?"
        description="Are you absolutely sure for delete? This action cannot be undone."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        submitBtnText="Delete"
      />
    </div>
  );
};

export default InstitutesListView;
