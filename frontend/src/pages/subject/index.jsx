import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect, useState, useCallback, useContext } from "react";
import { Tooltip } from "@mui/material";
import {
  EllipsisIcon,
  PencilIcon,
  UserRoundCheck,
  UserRoundX,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertDialogBox } from "@/components/ui/dialog";
import apiService from "@/lib/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { APIS } from "@/constants/api.constant";
import ROUTES from "@/constants/route.constant";
import PopupAlert from "@/components/common/PopupAlert/PopupAlert";
import { CounterContext } from "@/components/Layout/commonLayout/TitleOfPageProvider";

// TableListView component
const TableListView = ({
  columns,
  tabs,
  fetchData,
  searchPlaceholder,
  defaultPageSize,
  defaultSortField,
  defaultSortOrder,
  onAddItem,
  addButtonText,
  isDraggable,
  onDragEnd,
}) => {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState(defaultSortField);
  const [order, setOrder] = useState(defaultSortOrder);
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [loading, setLoading] = useState(false);
  const [dragId, setDragId] = useState(null);

  const pageSizeOptions = [5, 10, 25, { value: -1, label: "All" }];

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const fetchTableData = useCallback(async () => {
    setLoading(true);
    try {
      // Set pageSize to undefined when search is non-empty to fetch all data
      const effectivePageSize = debouncedSearch
        ? undefined
        : pageSize === -1
        ? undefined
        : pageSize;
      const response = await fetchData({
        page: debouncedSearch ? 0 : page, // Reset page to 0 when searching
        pageSize: effectivePageSize,
        search: debouncedSearch,
        sortBy,
        order,
        tab: activeTab,
      });
      setData(response.data);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, sortBy, order, activeTab, fetchData]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    if (dragId === targetId) return;

    const draggedIndex = data.findIndex((row) => row.id === dragId);
    const targetIndex = data.findIndex((row) => row.id === targetId);

    const newData = [...data];
    const [draggedItem] = newData.splice(draggedIndex, 1);
    newData.splice(targetIndex, 0, draggedItem);

    setData(newData);
    setDragId(null);

    if (onDragEnd) {
      await onDragEnd({
        oldIndex: draggedIndex,
        newIndex: targetIndex,
        newData,
      });
    }
  };

  const isDragEnabled = isDraggable && pageSize === -1;

  return (
    <div className="responsive-table-wrapper">
      <div className="header">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={`tab ${activeTab === tab.value ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.value);
                setPage(0);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="controls">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={onAddItem}>{addButtonText}</Button>
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.field}
                  className={col.headerClassName}
                  onClick={() => {
                    if (col.field !== "Action") {
                      setSortBy(col.field);
                      setOrder(order === "asc" ? "desc" : "asc");
                    }
                  }}
                >
                  {col.headerName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                draggable={isDragEnabled}
                onDragStart={(e) => isDragEnabled && handleDragStart(e, row.id)}
                onDragOver={isDragEnabled ? handleDragOver : undefined}
                onDrop={(e) => isDragEnabled && handleDrop(e, row.id)}
                style={{ cursor: isDragEnabled ? "move" : "default" }}
              >
                {columns.map((col) => (
                  <td key={col.field}>
                    {col.renderCell
                      ? col.renderCell({ row, value: row[col.field] })
                      : row[col.field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Conditionally render pagination controls when search is empty */}
      {!debouncedSearch && (
        <div className="pagination">
          <span>Rows per page:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {pageSize === -1 ? "All" : pageSize} <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {pageSizeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value || option}
                  onClick={() => {
                    setPageSize(option.value || option);
                    setPage(0);
                  }}
                >
                  {option.label || option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span>
            {page * pageSize + 1}-
            {Math.min(
              (page + 1) * (pageSize === -1 ? totalCount : pageSize),
              totalCount
            )}{" "}
            of {totalCount}
          </span>
          <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <Button
            disabled={pageSize === -1 || (page + 1) * pageSize >= totalCount}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
      <style jsx>{`
        .responsive-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .tabs {
          display: flex;
          gap: 8px;
        }
        .tab {
          padding: 8px 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
        }
        .tab.active {
          background-color: #1a6fab;
          color: white;
        }
        .controls {
          display: flex;
          gap: 8px;
        }
        .controls input {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th,
        .data-table td {
          padding: 8px;
          border: 1px solid #ddd;
          font-size: 0.75em;
        }
        .data-table th {
          background-color: #1a6fab;
          color: white;
          text-align: left;
        }
        .pagination {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
        }
        tr[draggable="true"]:hover {
          background-color: #f0f0f0;
        }
        .custom-tooltip-content {
          display: block !important;
          vertical-align: middle !important;
          padding: 4px 6px !important;
          font-size: 0.75em !important;
          line-height: 1.2 !important;
          max-width: 300px !important;
          max-height: 200px !important;
          overflow-y: auto !important;
          overflow-x: auto !important;
          white-space: normal !important;
        }
        .data-table td {
          padding: 4px 6px !important;
          font-size: 0.75em !important;
          line-height: 1.2 !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .data-table tr {
          height: 36px !important;
        }
        @media (max-width: 768px) {
          .data-table td {
            padding: 3px 5px !important;
            font-size: 0.7em !important;
          }
          .data-table tr {
            height: 32px !important;
          }
        }
        @media (max-width: 480px) {
          .data-table td {
            padding: 2px 4px !important;
            font-size: 0.65em !important;
          }
          .data-table tr {
            height: 28px !important;
          }
        }
      `}</style>
    </div>
  );
};

const queryClient = new QueryClient();
const SUBJECTS_QUERY_KEY = "subjects";

const SubjectListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subjectId, setSubjectId] = useState(null);
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    row: null,
    action: null,
  });
  const navigate = useNavigate();
  const context = useContext(CounterContext);
  const setCount = context?.setCount;

  useEffect(() => {
    if (setCount) {
      setCount("Subject");
    } else {
      console.warn(
        "CounterContext is not available. Ensure SubjectListView is wrapped in TitleOfPageProvider."
      );
    }
  }, [setCount]);

  useEffect(() => {
    updateBreadcrumb([{ label: "Subject" }]);
  }, [updateBreadcrumb]);

  const handleConfirm = useCallback(async () => {
    try {
      const response = await apiService.delete(`${APIS.SUBJECT}/${subjectId}`);
      if (response?.code === 200 && response?.status === true) {
        toast.success(response?.message || "Subject deleted successfully");
        setIsDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: [SUBJECTS_QUERY_KEY] });
      } else {
        toast.error(response?.message || "Failed to delete subject");
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error deleting subject");
      setIsDialogOpen(false);
    }
  }, [subjectId]);

  const navigateToEdit = useCallback(
    (rowData) => {
      navigate(`${ROUTES.UPDATE_SUBJECT}/${rowData?._id}`, {
        state: { isEditeActive: true },
      });
    },
    [navigate]
  );

  const handleStatusToggle = useCallback(async (row, status) => {
    const payload = { isActive: status === "Active" };
    try {
      const response = await apiService.patch(
        `${APIS.SUBJECT}/${row._id}`,
        payload
      );
      if (response?.status === true && response?.code === 200) {
        toast.success(`Subject has been marked as ${status} successfully`);
        queryClient.invalidateQueries({ queryKey: [SUBJECTS_QUERY_KEY] });
      } else {
        toast.error(response?.message || "Failed to update status");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  }, []);

  const handleDragEnd = useCallback(async ({ oldIndex, newIndex, newData }) => {
    try {
      const orderPayload = newData.map((sub, index) => ({
        id: sub._id,
        order: index,
      }));
      const response = await apiService.post(`${APIS.SUBJECT_REORDER}`, {
        order: orderPayload,
      });
      if (response?.code === 200 && response?.status === true) {
        toast.success("Subject order updated successfully");
        queryClient.invalidateQueries({ queryKey: [SUBJECTS_QUERY_KEY] });
      } else {
        toast.error(response?.message || "Failed to update subject order");
        queryClient.invalidateQueries({ queryKey: [SUBJECTS_QUERY_KEY] });
      }
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update subject order"
      );
      queryClient.invalidateQueries({ queryKey: [SUBJECTS_QUERY_KEY] });
    }
  }, []);

  const showConfirmationPopup = useCallback((row, action) => {
    setConfirmationPopup({
      isOpen: true,
      row,
      action,
    });
  }, []);

  const handleConfirmationResponse = useCallback(
    (isConfirmed) => {
      if (isConfirmed && confirmationPopup.row) {
        handleStatusToggle(confirmationPopup.row, confirmationPopup.action);
      }
      setConfirmationPopup({
        isOpen: false,
        row: null,
        action: null,
      });
    },
    [confirmationPopup, handleStatusToggle]
  );

  const handleCancel = useCallback(() => {
    setIsDialogOpen(false);
    setSubjectId(null);
  }, []);

  const handleAddUser = useCallback(() => {
    navigate(ROUTES.SUBJECT);
  }, [navigate]);

  const fetchData = useCallback(
    async ({ page, pageSize, search, sortBy, order, tab }) => {
      try {
        const params = {
          limit: pageSize,
          page: page + 1,
          search: search || undefined,
          sortBy: sortBy || undefined,
          order: order || undefined,
        };
        if (tab === "Active") {
          params.isActive = true;
        } else if (tab === "Inactive") {
          params.isActive = false;
        }
        const response = await apiService.get(APIS.SUBJECT_LIST, { params });
        const data = response.data.subject.map((row) => ({
          ...row,
          id: row._id,
          status: row.isActive ? "Active" : "Inactive",
        }));
        return {
          data,
          totalCount: response.data.count || 0,
        };
      } catch (error) {
        console.error("Fetch error:", error);
        const message =
          error?.response?.data?.message || "Failed to fetch subjects";
        toast.error(message);
        throw new Error(message);
      }
    },
    []
  );

  const columns = [
    {
      field: "nameEn",
      headerName: "Name",
      headerClassName: "bg-[#1A6FAB] text-white text-left",
      width: 300,
      renderCell: (params) => {
        const value = params.value || "";
        const isTruncated = value.length > 15;
        const truncated = isTruncated ? `${value.substring(0, 15)}...` : value;
        const imageUrl =
          params.row.images?.[0]?.url || params.row.imageUrl || "";

        return (
          <div className="flex items-center">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Banner"
                className="w-8 h-8 rounded object-cover border border-gray-200 mr-2"
              />
            )}
            <Tooltip
              title={
                isTruncated ? (
                  <div className="custom-tooltip-content">{value}</div>
                ) : (
                  ""
                )
              }
              arrow
              placement="bottom"
              PopperProps={{
                sx: {
                  "& .MuiTooltip-tooltip": {
                    backgroundColor: "#fff",
                    color: "#000",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15) !important",
                    borderRadius: "4px",
                    padding: "6px 8px",
                    fontSize: "0.75em",
                    lineHeight: "1.2",
                    border: "1px solid #e0e0e0",
                    maxWidth: "300px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    overflowX: "auto",
                    whiteSpace: "normal",
                  },
                  "& .MuiTooltip-arrow": {
                    color: "#fff",
                    "&::before": {
                      border: "1px solid #e0e0e0",
                    },
                  },
                },
                modifiers: [
                  {
                    name: "preventOverflow",
                    options: {
                      altAxis: true,
                      padding: 5,
                    },
                  },
                ],
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  lineHeight: "1.2",
                  fontSize: "0.75em",
                }}
              >
                {truncated}
              </span>
            </Tooltip>
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      headerClassName: "bg-[#1A6FAB] text-white text-left",
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
      headerClassName: "bg-[#1A6FAB] text-white text-left",
      width: 250,
      editable: false,
      renderCell: (params) => {
        const isInactive = params.row.status === "Inactive";
        const isActive = params.row.status === "Active";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="group"
                onClick={(e) => e.stopPropagation()}
              >
                <EllipsisIcon className="text-blue-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToEdit(params.row);
                }}
                disabled={isInactive}
              >
                <PencilIcon className="size-4 mr-2" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  showConfirmationPopup(
                    params.row,
                    isActive ? "Inactive" : "Active"
                  );
                }}
              >
                {isActive ? (
                  <>
                    <UserRoundX className="size-4 mr-2" />
                    <span>Inactive</span>
                  </>
                ) : (
                  <>
                    <UserRoundCheck className="size-4 mr-2" />
                    <span>Active</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setSubjectId(params.row._id);
                  setIsDialogOpen(true);
                }}
                disabled={isActive}
              >
                <UserRoundX className="size-4 mr-2" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="responsive-table-wrapper">
      <style jsx global>{`
        .responsive-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .custom-tooltip-content {
          display: block !important;
          vertical-align: middle !important;
          padding: 4px 6px !important;
          font-size: 0.75em !important;
          line-height: 1.2 !important;
          max-width: 300px !important;
          max-height: 200px !important;
          overflow-y: auto !important;
          overflow-x: auto !important;
          white Ascendant;
        }
        .responsive-table-wrapper .MuiTableCell-root {
          padding: 4px 6px !important;
          font-size: 0.75em !important;
          line-height: 1.2 !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .responsive-table-wrapper .MuiTableRow-root {
          height: 36px !important;
        }
        @media (max-width: 768px) {
          .responsive-table-wrapper .MuiTableCell-root {
            padding: 3px 5px !important;
            font-size: 0.7em !important;
          }
          .responsive-table-wrapper .MuiTableRow-root {
            height: 32px !important;
          }
        }
        @media (max-width: 480px) {
          .responsive-table-wrapper .MuiTableCell-root {
            padding: 2px 4px !important;
            font-size: 0.65em !important;
          }
          .responsive-table-wrapper .MuiTableRow-root {
            height: 28px !important;
          }
        }
      `}</style>
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}
          tabs={[
            { label: "All", value: "all" },
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ]}
          fetchData={fetchData}
          searchPlaceholder="Search Subjects"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
          onAddItem={handleAddUser}
          addButtonText="Add Subject"
          isDraggable={true}
          onDragEnd={handleDragEnd}
        />
        {confirmationPopup.isOpen && (
          <PopupAlert
            open={confirmationPopup.isOpen}
            setOpen={() =>
              setConfirmationPopup({ isOpen: false, row: null, action: null })
            }
            title="Confirm Action"
            message={`Are you sure you want to mark this Subject as ${confirmationPopup.action}?`}
            onConfirm={() => handleConfirmationResponse(true)}
            onCancel={() => handleConfirmationResponse(false)}
            submitTxt="Yes"
            cancelTxt="No"
          />
        )}
        <AlertDialogBox
          isOpen={isDialogOpen}
          title="Delete Subject"
          description="Are you absolutely sure for delete? This action cannot be undone."
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          submitBtnText="Delete"
        />
      </QueryClientProvider>
    </div>
  );
};

export default SubjectListView;
