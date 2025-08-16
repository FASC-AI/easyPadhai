import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect, useState } from "react";
import { format_dd_mmm_yyyy } from "@/components/functions/date-format";
import TableListView from "@/components/ui/table-list-view/table-list-view";
import { ChevronDown, Settings2Icon } from "lucide-react";
import {
  EllipsisIcon, EyeIcon, PencilIcon, UserRoundCheck,
  UserRoundX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import {
  FileUpIcon,
  ImportIcon,
  LocateFixedIcon,
  TrashIcon,
  PlusIcon,
  CopyPlus,

} from "lucide-react";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { toTitleCase } from "@/components/functions/tittle-case";
import { AlertDialogBox } from "@/components/ui/dialog";
import { Trash2Icon } from "lucide-react";
import apiService from "@/lib/apiService";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { APIS } from "@/constants/api.constant";
import ROUTES from "@/constants/route.constant";
import DataCharectersTooltip from "@/components/ui/DataCharectersTooltip";
import { Link } from "react-router-dom";
import PopupAlert from '@/components/common/PopupAlert/PopupAlert';
import { getApi, patchApi } from '@/services/method';

const queryClient = new QueryClient();

const TeacherFollowListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classId, setClassId] = useState();
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    row: null,
    action: null,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const handleConfirm = async () => {
    try {
      const response = await apiService.delete(`${APIS.PROFILE}/${classId}`);
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
  const navigateToEdit = (rowData) => {
    navigate(`${ROUTES.UPDATE_Teacher}/${rowData?._id}`, {
      state: { isEditeActive: true },
    });
  };

  const handleViewUser = async (id, name, email, mobile) => {
    // navigate(USERS.USER_PREVIEW, {
    //   state: { id: id, name: name, email: email, mobile: mobile },
    // });
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };
  useEffect(() => {
    const breadcrumbData = [{ label: "Teacher" }];
    updateBreadcrumb(breadcrumbData);
  }, []);
  const handleStatusToggle = async (row, status) => {
    let payload = {};

    switch (status) {
      case "Active":
        payload = { isActive: true };
        break;
      case "Inactive":
        payload = { isActive: false };
        break;
      default:
        break;
    }

    try {
      const response = await patchApi(APIS.PROFILE, row._id, payload);

      // Axios auto-throws on non-2xx, so if we're here, it's 2xx
      if (response?.status === true && response?.code === 200) {
        toast.success(`Class marked as ${status} successfully`);


      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      // Catch any error including Axios thrown errors
      toast.error(
        error?.response?.message ||
        error?.message
      );
    }
  };

  const columns = [
    {
      field: "batchCreatedcode",
      headerName: "Batch Code",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
      renderCell: (params) => <span>{params.value || '--'}</span>,
    },
    {
      field: "batchCreatedclass",
      headerName: "Class",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      renderCell: (params) => {
        const value = params.value;
        const displayText = value?.nameEn || value?.codee || '--';

        return (
          <div className="relative group w-full">
            <span className="truncate block max-w-full">
              {displayText}
            </span>
            {displayText !== '--' && (
              <div className="absolute top-full left-0 hidden group-hover:block bg-white p-2 rounded shadow-lg z-10 max-w-xs whitespace-normal">
                {displayText}
              </div>
            )}
          </div>
        );
      },
    },

    {
      field: "batchFollowsubject",
      headerName: "Section",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      renderCell: (params) => {
        const subjects = params.value || [];
        const names = subjects.map(s => s.sectionsName || s.codee).filter(Boolean);

        return (
          <div className="relative group w-full">
            <span className="truncate block max-w-full">
              {names.join(', ') || '--'}
            </span>
            {names.length > 0 && (
              <div className="absolute top-full left-0 hidden group-hover:block bg-white p-2 rounded shadow-lg z-10 max-w-xs whitespace-normal">
                {names.join(', ')}
              </div>
            )}
          </div>
        );
      },
    }
,
    {
      field: "space",
      headerName: "",
      headerClassName: "bg-[#1A6FAB] text-white",
      minWidth: 350,
      flex: 1,
      renderCell: (params) => (
        <Link to={``} state={{ id: params.row._id }}>
          {params.value.length >= 25 ? (
            <DataCharectersTooltip text={params.value} maxLength="25" />
          ) : (
            params.value
          )}
        </Link>
      ),
    },
  ];

  
  const fetchData = async ({ page, pageSize, search, sortBy, order, tab }) => {
    const params = {
      limit: pageSize,
      page: page + 1,
      search,
      sortBy,
      order,
      status: tab === 'Active' ? 'active' : tab === 'Inactive' ? 'inactive' : null
    };
    try {
      const response = await apiService.get(`${APIS.PROFILE}/teachers/${id}`, { params });

      if (response?.data?.batchfollow?.length) {
        const mappedData = response.data.batchfollow.map((item, index) => {
          const batch = item.batchDoc || {};
          return {
            id: item._id || batch._id || index,  // Ensure a unique fallback
            batchCreatedcode: batch.code || '--',
            batchCreatedclass: batch.classId || {},
            batchFollowsubject: batch.sectionId ? [batch.sectionId] : [],
            space: '',
          };
        });



      
        return {
          data: mappedData,
          totalCount: response.data.pagination?.total || 0
        };
      }
      return { data: [], totalCount: 0 };
    } catch (error) {
 
      return { data: [], totalCount: 0 };
    }
  };
  const handleAddUser = () => {
    navigate(ROUTES.USER);
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
  const handleDeleteUser = (id) => {
    setClassId(id);
    setIsDialogOpen(true);
  };
   const breadcrumbItems = [{ name: "Teacher", path: ROUTES.TEACHER_LIST }];
  return (
    <div className="">
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}

          fetchData={fetchData}
          searchPlaceholder="Search"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
      keyword="Batch Follow"
          routes={ROUTES}
          routeId={id}
          breadCrumbs={breadcrumbItems}
          backNavi={() => navigate(ROUTES.TEACHER_LIST)} // Back to institutes list
          boldItem={" Batch Follow"}
        />
      </QueryClientProvider>
      {confirmationPopup.isOpen && (
        <PopupAlert
          open={confirmationPopup.isOpen}
          setOpen={setOpenDialog}
          title="Confirm Action"
          message={`Are you sure, you want to mark this Class as ${confirmationPopup.action}?`}
          onConfirm={() => handleConfirmationResponse(true)} // Yes
          onCancel={handleCancelUpdate}
          submitTxt="Yes"
          cancelTxt="No"
        />
      )}
      <AlertDialogBox
        isOpen={isDialogOpen}
        title="Are you absolutely sure for delete?"
        description="This action cannot be undone."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        submitBtnText="Delete"
      />
    </div>
  );
};

export default TeacherFollowListView;
