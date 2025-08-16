import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import TableListView from "@/components/ui/table-list-view/table-list-view";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import apiService from "@/lib/apiService";
import { APIS } from "@/constants/api.constant";
import ROUTES from "@/constants/route.constant";
import { AlertDialogBox } from "@/components/ui/dialog";
import PopupAlert from "@/components/common/PopupAlert/PopupAlert";
import { toTitleCase } from "@/components/functions/tittle-case";
import { patchApi } from "@/services/method";
import { format_dd_mmm_yyyy } from "@/components/functions/date-format";
import DataCharectersTooltip from "@/components/ui/DataCharectersTooltip";
import { Link } from "react-router-dom";
const queryClient = new QueryClient();

const StudentFollowListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    row: null,
    action: null,
  });

  const navigate = useNavigate();
  const { id } = useParams();
  useEffect(() => {
    updateBreadcrumb([{ label: "Student" }]);
  }, []);
  const navigateToBatchfollow = (rowData) => {
    navigate(`/batchFollow/${rowData?._id}`, {
      state: { supplierId: rowData?._id },
    });
  };
  const handleDeleteUser = (id) => {
    setDeleteId(id);
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const response = await apiService.delete(`${APIS.PROFILE}/${deleteId}`);
      if (response?.code === 200 && response?.status === true) {
        toast.success(response.message);
        setIsDialogOpen(false);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setIsDialogOpen(false);
        toast.error(response.message);
      }
    } catch (error) {
      setIsDialogOpen(false);
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const handleStatusToggle = async (row, status) => {
    const payload = { isActive: status === "Active" };

    try {
      const response = await patchApi(APIS.Student, row._id, payload);
      if (response?.status === true && response?.code === 200) {
        toast.success(`Student marked as ${status}`);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleConfirmationResponse = (isConfirmed) => {
    if (isConfirmed && confirmationPopup.row) {
      handleStatusToggle(confirmationPopup.row, confirmationPopup.action);
    }
    setConfirmationPopup({ isOpen: false, row: null, action: null });
  };

  const handleCancelUpdate = () => {
    setConfirmationPopup({ isOpen: false, row: null, action: null });
  };

  const handleAddUser = () => {
    navigate(ROUTES.USER);
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
   const breadcrumbItems = [
   
    { name: "Student", path: ROUTES.STUDENT_LIST },
   
  ];

  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}
          fetchData={fetchData}
          searchPlaceholder="Search"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
       
          paginationMode="server"

            keyword="Batch Follow"
          routes={ROUTES}
          routeId={id}
          breadCrumbs={breadcrumbItems}
          backNavi={() => navigate(ROUTES.STUDENT_LIST)} // Back to institutes list
          boldItem={" Batch Follow"}
        />
      </QueryClientProvider>

      {confirmationPopup.isOpen && (
        <PopupAlert
          open={confirmationPopup.isOpen}
          setOpen={() => setConfirmationPopup({ ...confirmationPopup, isOpen: false })}
          title="Confirm Action"
          message={`Are you sure you want to mark this student as ${confirmationPopup.action}?`}
          onConfirm={() => handleConfirmationResponse(true)}
          onCancel={handleCancelUpdate}
          submitTxt="Yes"
          cancelTxt="No"
        />
      )}

      <AlertDialogBox
        isOpen={isDialogOpen}
        title="Are you absolutely sure you want to delete?"
        description="This action cannot be undone."
        onConfirm={handleConfirm}
        onCancel={() => setIsDialogOpen(false)}
        submitBtnText="Delete"
      />
    </div>
  );
};

export default StudentFollowListView;
