import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect, useState, useContext } from "react";
import TableListView from "@/components/ui/table-list-view/table-list-view";
import { ChevronDown, Settings2Icon } from "lucide-react";
import {
  EllipsisIcon, EyeIcon, PencilIcon, UserRoundCheck,
  UserRoundX, TrashIcon,
} from "lucide-react";
import DataCharectersTooltip from "@/components/ui/DataCharectersTooltip";
import { Link } from "react-router-dom";
import PopupAlert from '@/components/common/PopupAlert/PopupAlert';
import { getApi, patchApi } from '@/services/method';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { format_dd_mmm_yyyy } from "@/components/functions/date-format";
import { toTitleCase } from "@/components/functions/tittle-case";
import { AlertDialogBox } from "@/components/ui/dialog";
import { Trash2Icon } from "lucide-react";
import apiService from "@/lib/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { APIS } from "@/constants/api.constant";
import ROUTES from "@/constants/route.constant";
import { CounterContext } from "@/components/Layout/commonLayout/TitleOfPageProvider";
import { formatDateToDDMMYYYY, formatDate } from '@/utils/dateHelper';
const queryClient = new QueryClient();

const NotificationListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notificationId, setNotificationId] = useState();
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();
  let setCount = useContext(CounterContext);
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    row: null,
    action: null,
  });

  useEffect(() => {
    setCount = "Notification";
  }, []);

  const handleConfirm = async () => {
    try {
      const response = await apiService.delete(`${APIS.NOTIFICATION}/${notificationId}`);
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
      toast.error(error?.response?.message);
    }
  };

  const navigateToEdit = (rowData) => {
    navigate(`${ROUTES.UPDATE_NOTIFICATION}/${rowData?._id}`, {
      state: { isEditeActive: true },
    });
  };

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
      const response = await patchApi(APIS.NOTIFICATION, row._id, payload);
      if (response?.status === true && response?.code === 200) {
        toast.success(`Notification has been marked as ${status} successfully`);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error(error?.response?.message || error?.message);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  useEffect(() => {
    const breadcrumbData = [{ label: "Notification" }];
    updateBreadcrumb(breadcrumbData);
  }, []);

  const columns = [
    {
      field: "title",
      headerName: "Title",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 350,
      renderCell: (params) => <span>{params.value}</span>,
    },
    {
      field: "message",
      headerName: "Message",
      headerClassName: "bg-[#1A6FAB] text-white",
      minWidth: 350,
      flex: 1,
      renderCell: (params) => {
        const plainText = params.value?.replace(/<[^>]*>/g, '') || '';
        return (
          <Link to={``} state={{ id: params.row._id }}>
            {plainText.length >= 25 ? (
              <DataCharectersTooltip text={plainText} maxLength="25" />
            ) : (
              plainText
            )}
          </Link>
        );
      },
    },
    {
      field: "type",
      headerName: "Type",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
     renderCell: (params) => {
 
  const types = Array.isArray(params.value)
    ? params.value.map(item => toTitleCase(item.nameEn)).join(', ')
    : '';
  return <span>{types}</span>;
},
    },
    {
      field: "date",
      headerName: "Date",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
      renderCell: (params) => <span>{params.value ? formatDate(params.value,'date'):" "}</span>,
    }, 
    {
      field: "fromm",
      headerName: "Valid From",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
      renderCell: (params) => <span>{params.value ? formatDate(params.value, 'date') : " "}</span>,
    }, {
      field: "to",
      headerName: "Valid To",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
      renderCell: (params) => <span>{params.value ? formatDate(params.value, 'date') : " "}</span>,
    },
    {
      field: "status",
      headerName: "Status",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
      renderCell: (params) => {
        const status = params.value;
        let color = "gray";
        if (status === "Active") color = "green";
        else if (status === "Inactive") color = "red";
        return <span style={{ color }}>{status}</span>;
      },
    },
    {
      field: "Action",
      headerName: "Action",
      headerClassName: "bg-[#1A6FAB] text-white",
      minWidth: 150,
      flex: 1,
      editable: false,
      renderCell: (params) => {
        const isInactive = params.row.status === 'Inactive';
        const isActive = params.row.status === 'Active';
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="icon" className="group">
                <EllipsisIcon className="text-blue-primary-200" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigateToEdit(params.row)}
                disabled={isInactive}
              >
                <PencilIcon className="size-4 mr-2" />
                <span>Edit</span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem 
                onClick={() => showConfirmationPopup(params.row, "Active")}
                disabled={isActive}
              >
                <UserRoundCheck className="size-4 mr-2" />
                <span>Active</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => showConfirmationPopup(params.row, "Inactive")}
                disabled={isInactive}
              >
                <UserRoundX className="size-4 mr-2" />
                <span>Inactive</span>
              </DropdownMenuItem> */}
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
                onClick={() => handleDeleteNotification(params.row._id)}
                disabled={isInactive}
              >
                <TrashIcon className="size-4 mr-2" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

  const handleAddNotification = () => {
    navigate(ROUTES.NOTIFICATION);
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

  const handleDeleteNotification = (id) => {
    setNotificationId(id);
    setIsDialogOpen(true);
  };

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
    } else if (tab === 'Inactive') {
      params.isActive = false;
    }
    const response = await apiService.get(`${APIS.NOTIFICATION_LIST}`, {
      params,
    });
    return {
      data: response.data.notifications.map((row) => {
        let status = "Active";
        if (row.isActive) status = "Active";
        else if (!row.isActive) status = "Inactive";
        return { ...row, id: row._id, status };
      }),
      totalCount: response.data.count || 0,
    };
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
          onAddItem={handleAddNotification}
          addButtonText="Add Notification"
        />
      </QueryClientProvider>
      {confirmationPopup.isOpen && (
        <PopupAlert
          open={confirmationPopup.isOpen}
          setOpen={setOpenDialog}
          title="Status"
          message={`Are you sure, you want to mark this Notification as ${confirmationPopup.action}?`}
          onConfirm={() => handleConfirmationResponse(true)}
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

export default NotificationListView;

