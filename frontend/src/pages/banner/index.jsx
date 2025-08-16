import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect, useState } from "react";
import TableListView from "@/components/ui/table-list-view/table-list-view";
import { ChevronDown, Settings2Icon } from "lucide-react";
import { EllipsisIcon, EyeIcon, PencilIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from 'axios';
import DataCharectersTooltip from '@/components/ui/DataCharectersTooltip';
import { Link} from 'react-router-dom';
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
import PopupAlert from '@/components/common/PopupAlert/PopupAlert';
import { getApi, patchApi } from '@/services/method';

const queryClient = new QueryClient();

const bannersListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bannerId, setBannerId] = useState();
  const [openDialog, setOpenDialog] = useState(false);
  
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    row: null,
    action: null,
  });
  const navigate = useNavigate();
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
      const response = await patchApi(APIS.BANNER, row._id, payload);
      console.log(response, "response")
      // Axios auto-throws on non-2xx, so if we're here, it's 2xx
      if (response?.status === true && response?.code === 200) {
        toast.success(`Instruction has been marked as ${status} successfully`);
        setTimeout(() => {
          window.location.reload();
        }, 1000);

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
  const handleConfirm = async () => {
    try {
      const response = await apiService.delete(`${APIS.BANNER}/${bannerId}`);
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
    navigate(`${ROUTES.UPDATE_BANNER}/${rowData?._id}`, {
      state: { isEditeActive: true },
    });
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  useEffect(() => {
    const breadcrumbData = [
      { label: "Banner" },
    ];
    updateBreadcrumb(breadcrumbData);
  }, []);

  const columns = [
   
    {
  field: "bannersName",
  headerName: "Name",
  headerClassName: "bg-[#1A6FAB] text-white",

   width: 300,
   
  renderCell: (params) => {
    const imageUrl =
      params.row.images?.[0]?.url || params.row.imageUrl || ""; // fallback
    return (
      <div className="flex items-center space-x-3">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Banner"
            className="w-8 h-8 rounded object-cover border border-gray-200 mr-2"
          />
        )}
        <span>{params.value}</span>
      </div>
    );
  },
},

    // {
    //   field: "description",
    //   headerName: "Description",
    //   headerClassName: "bg-[#1A6FAB] text-white",
    //   minWidth: 250,
    //   flex: 1,
    //   renderCell: (params) => (
    //     <Link to={``} state={{ id: params.row._id }}>
    //       {params.value?.length >= 25 ? (
    //         <DataCharectersTooltip text={params.value} maxLength="25" />
    //       ) : (
    //         params.value
    //       )}
    //     </Link>
    //   ),
    // },
   
     {
      field: "status",
      headerName: "Status",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 300,
      renderCell: (params) => {
        const status = params.value;

        let color = "gray";
        if (status === "Active") color = "green";
        else if (status === "Inactive") color = "red";

        return <span style={{ color }}>{status}</span>;
      },
    },
    {
      field: 'Action',
      headerName: 'Action',
      headerClassName: "bg-[#1A6FAB] text-white cursor-pointer",
      minWidth: 200,
      flex: 1,
     
      renderCell: (params) => {
       const isInactive = params.row.status === 'Inactive';
        const isActive = params.row.status === 'Active';
          return (
          <div className="cursor-pointer">
          <DropdownMenu className="cursor-pointer" >
            <DropdownMenuTrigger className="cursor-pointer">
              <Button variant="outline" size="icon" className="group">
                <EllipsisIcon className="text-blue-primary-200 cursor-pointer" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigateToEdit(params.row)}
                
              >
                <PencilIcon className="size-4 mr-2" />
                <span>Edit</span>
              </DropdownMenuItem>
                {isActive ? (
                                        <DropdownMenuItem onClick={() => showConfirmationPopup(params.row, "Inactive")}>
                                          <UserRoundX className="size-4 mr-2" />
                                          <span>Inactive</span>
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem onClick={() => showConfirmationPopup(params.row, "Active")}>
                                          <UserRoundCheck className="size-4 mr-2" />
                                          <span>Active</span>
                                        </DropdownMenuItem>
                                      )}
              <DropdownMenuItem
                onClick={() => handleDeleteBanner(params.row._id)}
              
              >
                <TrashIcon className="size-4 mr-2" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        );
      },
    },
  ];
 const showConfirmationPopup = (row, action) => {
    setConfirmationPopup({
      isOpen: true,
      row,
      action,
    });
  };
  const fetchData = async ({ page, pageSize, search, sortBy, order, tab }) => {
    const params = {
      limit: pageSize,
      page: page + 1,
      search,
      sortBy,
      order,
      isInbound: tab === "inbound" ? true : null, };
if (tab === 'Active') {
      params.isActive = true;

    } else if (tab === 'Inactive') {
      params.isActive = false;

    }
    const response = await apiService.get(`${APIS.BANNER}/list`, {
      params,
    });
    return {
      data: response.data.Banners.map((row) => 
      { let status = "Active"; // default

        if (row.isActive) status = "Active";
        else if (!row.isActive) status = "Inactive";

            return{ ...row, id: row._id ,status}}),
      totalCount: response.data.count || 0,
      }
  };

  const handleAddBanner = () => {
    navigate(ROUTES.BANNER);
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
  const handleDeleteBanner = (id) => {
    setBannerId(id);
    setIsDialogOpen(true);
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
          ]}
          fetchData={fetchData}
          searchPlaceholder="Search"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
          onAddItem={handleAddBanner}
          addButtonText="Add Banner"
        />
      </QueryClientProvider>
{confirmationPopup.isOpen && (
                    <PopupAlert
                      open={confirmationPopup.isOpen}
                      setOpen={setOpenDialog}
                      title="Status"
                      message={`Are you sure, you want to mark this Instruction as ${confirmationPopup.action}?`}
                      onConfirm={() => handleConfirmationResponse(true)} // Yes
                      onCancel={handleCancelUpdate}
                      submitTxt="Yes"
                      cancelTxt="No"
                    />
                  )}
      <AlertDialogBox
        isOpen={isDialogOpen}
        title="Delete"
        description="Are you absolutely sure for delete? This action cannot be undone."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        submitBtnText="Delete"
      />
    </div>
  );
};

export default bannersListView;
