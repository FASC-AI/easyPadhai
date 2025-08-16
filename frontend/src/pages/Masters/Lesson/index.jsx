import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect, useState, useContext, useCallback } from "react";
import { Tooltip } from "@mui/material";
import { ChevronDown } from "lucide-react";
import {
  EllipsisIcon,
  PencilIcon,
  UserRoundCheck,
  UserRoundX,
  TrashIcon,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PopupAlert from "@/components/common/PopupAlert/PopupAlert";
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
import { CounterContext } from "@/components/Layout/commonLayout/TitleOfPageProvider";
import katex from "katex";
import "katex/dist/katex.min.css";
import parse from "html-react-parser";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Placeholder utility functions
const summarizeRepetitiveContent = (content) => {
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };
  const text = stripHtml(content);
  const summary = text.length > 100 ? text.substring(0, 100) + "..." : text;
  return { summarized: summary, full: content };
};

const truncateLatexContent = (content, maxLength) => {
  const isTruncated = content.length > maxLength;
  const truncated = isTruncated
    ? content.substring(0, maxLength) + "..."
    : content;
  return { truncated, isTruncated };
};

const renderLatexContent = (content) => {
  try {
    return content.replace(/\\\(.*?\\\)/g, (match) => {
      const latex = match.slice(2, -2);
      return katex.renderToString(latex, { throwOnError: false });
    });
  } catch (error) {
    return content;
  }
};

const queryClient = new QueryClient();
const USERS_QUERY_KEY = "dynamicData";

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
    return () => clearTimeout(handler);
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
      toast.error(error?.message || "Failed to fetch lessons");
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
    e.target.style.opacity = "0.5";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.target.closest("tr").style.backgroundColor = "#e0e0e0";
  };

  const handleDragLeave = (e) => {
    e.target.closest("tr").style.backgroundColor = "";
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    e.target.closest("tr").style.backgroundColor = "";
    e.target.closest("tr").style.opacity = "1";
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

  // Disable drag-and-drop when searching or not in "All" pageSize
  const isDragEnabled = isDraggable && pageSize === -1 && !debouncedSearch;

  return (
    <div className="table-list-view">
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
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading lessons...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="empty-state">No lessons found.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.field}
                  className={col.headerClassName}
                  style={{ width: col.width, flex: col.flex }}
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
                onDragLeave={isDragEnabled ? handleDragLeave : undefined}
                onDrop={(e) => isDragEnabled && handleDrop(e, row.id)}
                style={{ cursor: isDragEnabled ? "move" : "default" }}
              >
                {columns.map((col) => (
                  <td
                    key={col.field}
                    style={{ width: col.width, flex: col.flex }}
                  >
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
            {totalCount > 0
              ? `${
                  page * (pageSize === -1 ? totalCount : pageSize) + 1
                }-${Math.min(
                  (page + 1) * (pageSize === -1 ? totalCount : pageSize),
                  totalCount
                )} of ${totalCount}`
              : "0-0 of 0"}
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
        .table-list-view {
          padding: 16px;
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
          table-layout: fixed;
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
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          gap: 10px;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #1a6fab;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }
        .empty-state {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 1em;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <style jsx global>{`
        .responsive-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .katex-wrapper {
          display: inline-block !important;
          vertical-align: middle !important;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .katex-wrapper p {
          margin: 0 !important;
          padding: 0 !important;
          display: inline !important;
          line-height: 1 !important;
        }
        .katex-wrapper .katex {
          display: inline-block !important;
          vertical-align: middle !important;
          font-size: 0.75em !important;
        }
        .katex-wrapper .katex-html {
          line-height: 1 !important;
        }
        .custom-tooltip-content {
          display: block !important;
          vertical-align: middle !important;
          padding: 4px 6px !important;
          font-size: 0.75em !important;
          line-height: 1.2 !important;
          max-width: 400px !important;
          max-height: 200px !important;
          overflow-y: auto !important;
          overflow-x: auto !important;
          white-space: normal !important;
        }
        .custom-tooltip-content p {
          margin: 0 !important;
          padding: 0 !important;
          display: inline !important;
          line-height: 1 !important;
        }
        .custom-tooltip-content .katex {
          display: inline-block !important;
          vertical-align: middle !important;
          font-size: 0.75em !important;
        }
        .custom-tooltip-content .katex-html {
          line-height: 1 !important;
        }
        .responsive-table-wrapper .data-table th,
        .responsive-table-wrapper .data-table td {
          padding: 4px 6px !important;
          font-size: 0.75em !important;
          line-height: 1.2 !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .responsive-table-wrapper .data-table tr {
          height: 36px !important;
        }
        @media (max-width: 768px) {
          .responsive-table-wrapper .data-table th,
          .responsive-table-wrapper .data-table td {
            padding: 3px 5px !important;
            font-size: 0.7em !important;
          }
          .responsive-table-wrapper .data-table tr {
            height: 32px !important;
          }
          .katex-wrapper .katex,
          .custom-tooltip-content .katex {
            font-size: 0.7em !important;
          }
        }
        @media (max-width: 480px) {
          .responsive-table-wrapper .data-table th,
          .responsive-table-wrapper .data-table td {
            padding: 2px 4px !important;
            font-size: 0.65em !important;
          }
          .responsive-table-wrapper .data-table tr {
            height: 28px !important;
          }
          .katex-wrapper .katex,
          .custom-tooltip-content .katex {
            font-size: 0.65em !important;
          }
        }
      `}</style>
    </div>
  );
};

const LessonMasterListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lessonId, setLessonId] = useState(null);
  const navigate = useNavigate();
  const queryClientLocal = useQueryClient();
  const context = useContext(CounterContext);
  const setCount = context?.setCount;
  const { id } = useParams();

  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    row: null,
    action: null,
  });

  useEffect(() => {
    if (setCount) {
      setCount("Lesson");
    } else {
      //
    }
  }, [setCount]);

  useEffect(() => {
    const breadcrumbData = [{ label: "Lesson" }];
    updateBreadcrumb(breadcrumbData);
  }, [updateBreadcrumb]);

  const statusToggleMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      apiService.patch(`${APIS.LESSON_MASTER}/${id}`, payload),
    onSuccess: (response, variables) => {
      if (response?.status === true && response?.code === 200) {
        toast.success(
          `Lesson marked as ${
            variables.payload.isActive ? "Active" : "Inactive"
          } successfully`
        );
        queryClientLocal.setQueryData([USERS_QUERY_KEY], (oldData) => {
          if (!oldData) return oldData;
          const updatedData = {
            ...oldData,
            data: oldData.data.map((lesson) =>
              lesson.id === variables.id
                ? {
                    ...lesson,
                    status: variables.payload.isActive ? "Active" : "Inactive",
                    isActive: variables.payload.isActive,
                  }
                : lesson
            ),
          };
          return updatedData;
        });
        queryClientLocal.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      } else {
        toast.error(response?.message || "Failed to update status");
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Error updating status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiService.delete(`${APIS.LESSON_MASTER}/${id}`),
    onSuccess: (response) => {
      if (response?.code === 200 && response?.status === true) {
        toast.success(response?.message || "Lesson deleted successfully");
        queryClientLocal.setQueryData([USERS_QUERY_KEY], (oldData) => {
          if (!oldData) return oldData;
          const updatedData = {
            ...oldData,
            data: oldData.data.filter((lesson) => lesson.id !== lessonId),
            totalCount: oldData.totalCount - 1,
          };
          return updatedData;
        });
        queryClientLocal.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      } else {
        toast.error(response?.message || "Failed to delete lesson");
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Error deleting lesson");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (orderPayload) =>
      apiService.post(`${APIS.LESSON_REORDER}`, {
        order: orderPayload,
        bookId: id, // Include bookId if reordering is book-specific
      }),
    onMutate: async (orderPayload) => {
      await queryClientLocal.cancelQueries({ queryKey: [USERS_QUERY_KEY] });
      const previousData = queryClientLocal.getQueryData([USERS_QUERY_KEY]);
      queryClientLocal.setQueryData([USERS_QUERY_KEY], (oldData) => {
        if (!oldData) return oldData;
        const updatedData = {
          ...oldData,
          data: oldData.data
            .map((lesson) => {
              const newOrder = orderPayload.find(
                (item) => item._id === lesson._id
              );
              return newOrder ? { ...lesson, order: newOrder.order } : lesson;
            })
            .sort((a, b) => a.order - b.order),
        };
        return updatedData;
      });
      return { previousData };
    },
    onSuccess: (response, variables, context) => {
      if (response?.code === 200 && response?.status === true) {
        if (response?.data?.modifiedCount > 0) {
          toast.success("Lesson order updated successfully");
        } else {
          toast.warning("No changes were made to the lesson order");
          queryClientLocal.setQueryData(
            [USERS_QUERY_KEY],
            context.previousData
          );
        }
        queryClientLocal.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      } else {
        toast.error(response?.message || "Failed to update lesson order");
        queryClientLocal.setQueryData([USERS_QUERY_KEY], context.previousData);
      }
    },
    onError: (error, variables, context) => {
      toast.error(
        error?.response?.data?.message || "Failed to update lesson order"
      );
      queryClientLocal.setQueryData([USERS_QUERY_KEY], context.previousData);
    },
    onSettled: () => {
      queryClientLocal.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });

  const handleConfirm = () => {
    deleteMutation.mutate(lessonId);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const handleStatusToggle = (row, action) => {
    const payload = { isActive: action === "Active" };
    statusToggleMutation.mutate({ id: row._id, payload });
  };

  const handleDragEnd = async ({ oldIndex, newIndex, newData }) => {
    if (oldIndex === newIndex) {
      return;
    }
    const orderPayload = newData.map((lesson, index) => ({
      _id: lesson._id,
      order: index,
    }));
    reorderMutation.mutate(orderPayload);
  };

  const showConfirmationPopup = (row, action) => {
    setConfirmationPopup({
      isOpen: true,
      row,
      action,
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

  const handleAddUser = () => {
    navigate(ROUTES.LESSON_MASTER);
  };

  const handleDeleteUser = (id) => {
    setLessonId(id);
    setIsDialogOpen(true);
  };

  const navigateToEdit = (rowData) => {
    navigate(`${ROUTES.UPDATE_LESSON_MASTER}/${rowData?._id}`, {
      state: { isEditActive: true },
    });
  };

  const fetchData = useCallback(
    async ({ page, pageSize, search, sortBy, order, tab }) => {
      try {
        if (id) {
          const response = await apiService.get(
            `${APIS.LESSON_LISTById}/${id}`,
            {
              params: { search }, // Include search param for book-specific endpoint
            }
          );
          const lessons = response?.data?.Lessons || [];
          return {
            data: lessons.map((lesson) => ({
              ...lesson,
              id: lesson._id,
              status: lesson.isActive ? "Active" : "Inactive",
              order: lesson.order ?? 0,
            })),
            totalCount: response?.data?.count || lessons.length,
          };
        } else {
          const params = {
            limit: pageSize,
            page: page + 1,
            search,
            sortBy,
            order,
          };
          if (tab === "Active") {
            params.isActive = true;
          } else if (tab === "Inactive") {
            params.isActive = false;
          }
          const response = await apiService.get(`${APIS.LESSON_MASTER_LIST}`, {
            params,
          });
          return {
            data: response?.data?.Lessons.map((row) => ({
              ...row,
              id: row._id,
              status: row.isActive ? "Active" : "Inactive",
              order: row.order ?? 0,
            })),
            totalCount: response.data.count || 0,
          };
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to fetch lessons"
        );
        throw error;
      }
    },
    [id]
  );

  const columns = [
    {
      field: "nameEn",
      headerName: "Name",
      headerClassName: "bg-[#1A6FAB] text-white text-left",
      width: 200,
      renderCell: (params) => {
        const value = params.value || "";
        const isTruncated = value.length > 15;
        const truncated = isTruncated ? `${value.substring(0, 15)}...` : value;

        return (
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
        );
      },
    },
    {
      field: "description",
      headerName: "Description",
      headerClassName: "bg-[#1A6FAB] text-white text-left",
      minWidth: 250,
      flex: 1,
      renderCell: (params) => {
        const value = params.value || "";
        const { summarized, full } = summarizeRepetitiveContent(value);
        const renderedContent = renderLatexContent(summarized);
        const renderedFullContent = renderLatexContent(full);
        const { truncated, isTruncated } = truncateLatexContent(summarized, 50);

        return (
          <Link
            to={`${ROUTES.LESSON_MASTER}/${params.row._id}`}
            state={{ id: params.row._id }}
          >
            <Tooltip
              title={
                isTruncated ? (
                  <div className="custom-tooltip-content">
                    {parse(renderedFullContent)}
                  </div>
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
                    maxWidth: "400px",
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
                  maxHeight: "2em",
                  fontSize: "0.75em",
                }}
                className="katex-wrapper"
              >
                {parse(renderedContent)}
              </span>
            </Tooltip>
          </Link>
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
        const color =
          status === "Active"
            ? "green"
            : status === "Inactive"
            ? "red"
            : "gray";
        return <span style={{ color }}>{status}</span>;
      },
    },
    {
      field: "Action",
      headerName: "Action",
      headerClassName: "bg-[#1A6FAB] text-white text-left",
      width: 200,
      editable: false,
      renderCell: (params) => {
        const isInactive = params.row.status === "Inactive";
        const isActive = params.row.status === "Active";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
              <DropdownMenuItem
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
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteUser(params.row._id)}
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

  return (
    <div className="responsive-table-wrapper">
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}
          tabs={[
            { label: "All", value: "all" },
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ]}
          fetchData={fetchData}
          searchPlaceholder="Search Lessons"
          defaultPageSize={10}
          defaultSortField="order" // Sort by order by default
          defaultSortOrder="asc"
          onAddItem={handleAddUser}
          addButtonText="Add Lesson"
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
            message={`Are you sure you want to mark this Lesson as ${confirmationPopup.action}?`}
            onConfirm={() => handleConfirmationResponse(true)}
            onCancel={handleConfirmationResponse}
            submitTxt="Yes"
            cancelTxt="No"
          />
        )}
        <AlertDialogBox
          isOpen={isDialogOpen}
          title="Are you sure you want to delete this lesson?"
          description="This action cannot be undone."
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          submitBtnText="Delete"
        />
      </QueryClientProvider>
    </div>
  );
};

export default LessonMasterListView;
