import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect, useState, useContext, useCallback } from "react";
import { Tooltip } from "@mui/material";
import {
  ChevronDown,
  EllipsisIcon,
  PencilIcon,
  UserRoundCheck,
  UserRoundX,
  TrashIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import apiService from "@/lib/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { APIS } from "@/constants/api.constant";
import ROUTES from "@/constants/route.constant";
import { CounterContext } from "@/components/Layout/commonLayout/TitleOfPageProvider";
import PopupAlert from "@/components/common/PopupAlert/PopupAlert";
import katex from "katex";
import "katex/dist/katex.min.css";
import parse from "html-react-parser";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const pageSizeOptions = [5, 10, 25, { value: -1, label: "All" }];

  // Fetch classes and subjects
  useEffect(() => {
    const fetchClassesAndSubjects = async () => {
      try {
        const classResponse = await apiService.get(APIS.CLASS_LIST);
        const subjectResponse = await apiService.get(APIS.SUBJECT_LIST);
        setClasses(classResponse?.data?.Classes || []);
        setSubjects(subjectResponse?.data?.subject || []);
      } catch (error) {
        console.error("Error fetching classes or subjects:", error);
        toast.error("Failed to fetch classes or subjects");
      }
    };
    fetchClassesAndSubjects();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Modified fetchTableData to bypass pagination when searching
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
        classId: selectedClass || undefined,
        subjectId: selectedSubject || undefined,
      });
      setData(response.data);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.message || "Failed to fetch books");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    debouncedSearch,
    sortBy,
    order,
    activeTab,
    selectedClass,
    selectedSubject,
    fetchData,
  ]);

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

    // Update the order field for all items
    const updatedData = newData.map((item, index) => ({
      ...item,
      order: index,
    }));

    setData(updatedData);
    setDragId(null);

    if (onDragEnd) {
      await onDragEnd({
        oldIndex: draggedIndex,
        newIndex: targetIndex,
        newData: updatedData,
      });
    }
  };

  // Disable drag-and-drop when searching or not in "All" pageSize
  const isDragEnabled = isDraggable && pageSize === -1 && !debouncedSearch;

  const clearClassFilter = () => {
    setSelectedClass("");
    setPage(0);
  };

  const clearSubjectFilter = () => {
    setSelectedSubject("");
    setPage(0);
  };

  const clearAllFilters = () => {
    setSelectedClass("");
    setSelectedSubject("");
    setSearch("");
    setPage(0);
  };

  return (
    <div className="table-list-view">
      {/* Filters placed above the header */}
      <div className="filters flex gap-4 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-48 bg-white border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-[#1A6FAB] text-gray-700"
            >
              {selectedClass
                ? classes.find((c) => c._id === selectedClass)?.nameEn ||
                  "Select Class"
                : "Select Class"}{" "}
              <ChevronDown size={16} className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-white border border-gray-200 rounded-md shadow-lg">
            <DropdownMenuItem
              onClick={() => {
                setSelectedClass("");
                setPage(0);
              }}
              className="text-gray-700 hover:bg-gray-100 cursor-pointer px-4 py-2"
            >
              All Classes
            </DropdownMenuItem>
            {classes.map((cls) => (
              <DropdownMenuItem
                key={cls._id}
                onClick={() => {
                  setSelectedClass(cls._id);
                  setPage(0);
                }}
                className="text-gray-700 hover:bg-gray-100 cursor-pointer px-4 py-2"
              >
                {cls.nameEn}
              </DropdownMenuItem>
            ))}
            <div className="border-t border-gray-200 mt-2">
              <DropdownMenuItem
                onClick={clearClassFilter}
                className="text-red-600 hover:bg-gray-100 cursor-pointer px-4 py-2"
              >
                Clear
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-48 bg-white border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-[#1A6FAB] text-gray-700"
            >
              {selectedSubject
                ? subjects.find((s) => s._id === selectedSubject)?.nameEn ||
                  "Select Subject"
                : "Select Subject"}{" "}
              <ChevronDown size={16} className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-white border border-gray-200 rounded-md shadow-lg">
            <DropdownMenuItem
              onClick={() => {
                setSelectedSubject("");
                setPage(0);
              }}
              className="text-gray-700 hover:bg-gray-100 cursor-pointer px-4 py-2"
            >
              All Subjects
            </DropdownMenuItem>
            {subjects.map((sub) => (
              <DropdownMenuItem
                key={sub._id}
                onClick={() => {
                  setSelectedSubject(sub._id);
                  setPage(0);
                }}
                className="text-gray-700 hover:bg-gray-100 cursor-pointer px-4 py-2"
              >
                {sub.nameEn}
              </DropdownMenuItem>
            ))}
            <div className="border-t border-gray-200 mt-2">
              <DropdownMenuItem
                onClick={clearSubjectFilter}
                className="text-red-600 hover:bg-gray-100 cursor-pointer px-4 py-2"
              >
                Clear
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          onClick={clearAllFilters}
          className="bg-white border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-[#1A6FAB] text-gray-700 px-4 py-2"
        >
          Clear All Filters
        </Button>
      </div>

      {/* Header with tabs, search, and Add Book button on the same row */}
      <div className="header flex justify-between items-center mb-4">
        <div className="tabs flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={`tab px-4 py-2 border border-gray-300 rounded-md cursor-pointer ${
                activeTab === tab.value
                  ? "bg-[#1A6FAB] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => {
                setActiveTab(tab.value);
                setPage(0);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="controls flex gap-2 items-center">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A6FAB]"
          />
          <Button
            onClick={onAddItem}
            className="bg-[#1A6FAB] text-white hover:bg-[#175A8F] px-4 py-2 rounded-md"
          >
            {addButtonText}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading books...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="empty-state">No books found.</div>
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
        <div className="pagination flex items-center gap-2 mt-4">
          <span>Rows per page:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-[#1A6FAB]"
              >
                {pageSize === -1 ? "All" : pageSize}{" "}
                <ChevronDown size={16} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 rounded-md shadow-lg">
              {pageSizeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value || option}
                  onClick={() => {
                    setPageSize(option.value || option);
                    setPage(0);
                  }}
                  className="text-gray-700 hover:bg-gray-100 cursor-pointer px-4 py-2"
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
          <Button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="bg-[#1A6FAB] text-white hover:bg-[#175A8F]"
          >
            Previous
          </Button>
          <Button
            disabled={pageSize === -1 || (page + 1) * pageSize >= totalCount}
            onClick={() => setPage(page + 1)}
            className="bg-[#1A6FAB] text-white hover:bg-[#175A8F]"
          >
            Next
          </Button>
        </div>
      )}
      <style>{`
        .table-list-view {
          padding: 16px;
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
    </div>
  );
};

const queryClient = new QueryClient();
const BOOKS_QUERY_KEY = "books";

// Utility functions for LaTeX rendering
const summarizeRepetitiveContent = (value) => {
  if (!value) return { summarized: "", full: "" };

  const parts = value.split(/(\\\([^()]+\\\))/g).filter(Boolean);
  const seen = new Map();
  let summarizedParts = [];
  let fullContent = value;

  for (const part of parts) {
    if (part.startsWith("\\(") && part.endsWith("\\)")) {
      const expr = part;
      if (seen.has(expr)) {
        seen.set(expr, seen.get(expr) + 1);
      } else {
        seen.set(expr, 1);
        summarizedParts.push(expr);
      }
    } else {
      const trimmedPart = part.trim();
      if (trimmedPart) {
        if (seen.has(trimmedPart)) {
          seen.set(trimmedPart, seen.get(trimmedPart) + 1);
        } else {
          seen.set(trimmedPart, 1);
          summarizedParts.push(trimmedPart);
        }
      }
    }
  }

  let summarized = "";
  for (const part of summarizedParts) {
    const count = seen.get(part);
    if (count > 1) {
      if (part.startsWith("\\(") && part.endsWith("\\)")) {
        summarized += `${part} (repeated ${count}x) `;
      } else {
        summarized += `${part} (repeated ${count}x) `;
      }
    } else {
      summarized += part + " ";
    }
  }

  return { summarized: summarized.trim(), full: fullContent };
};

const truncateLatexContent = (value, maxLength = 20) => {
  if (!value || value.length <= maxLength)
    return { truncated: value || "", isTruncated: false };

  let truncated = "";
  let currentLength = 0;
  const parts = value.split(/(\\\([^)]+\))/g).filter(Boolean);

  for (const part of parts) {
    currentLength += part.length;
    if (currentLength > maxLength) break;
    truncated += part;
  }

  return { truncated: truncated + "...", isTruncated: true };
};

const renderLatexContent = (value) => {
  if (!value) return "";

  try {
    let processedValue = value;

    const hasLatexDelimiters =
      /\\\(.*?\\\)/.test(value) || /\\\[.*?\\\]/.test(value);

    if (!hasLatexDelimiters) {
      const mathPatterns = [
        { pattern: /(\w+)\/(\w+)/g, replacement: "\\frac{$1}{$2}" },
        { pattern: /(\w+)\^(\w+)/g, replacement: "$1^{$2}" },
        { pattern: /(\w+)_(\w+)/g, replacement: "$1_{$2}" },
      ];

      let transformedValue = value;
      let containsMath = false;
      mathPatterns.forEach(({ pattern, replacement }) => {
        if (pattern.test(transformedValue)) {
          containsMath = true;
          transformedValue = transformedValue.replace(pattern, replacement);
        }
      });

      if (containsMath) {
        processedValue = `\\(${transformedValue}\\)`;
      } else {
        return value;
      }
    }

    const renderedContent = processedValue
      .replace(/\\\((.*?)\\\)/g, (_, expr) => {
        try {
          return katex.renderToString(expr, {
            displayMode: false,
            throwOnError: false,
          });
        } catch {
          return `<span class="katex-error">${expr}</span>`;
        }
      })
      .replace(/\\\[(.*?)\\\]/g, (_, expr) => {
        try {
          return katex.renderToString(expr, {
            displayMode: false,
            throwOnError: false,
          });
        } catch {
          return `<span class="katex-error">${expr}</span>`;
        }
      });

    return renderedContent;
  } catch (error) {
    return value;
  }
};

const BookListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bookId, setBookId] = useState(null);
  const navigate = useNavigate();
  const queryClientLocal = useQueryClient();
  const context = useContext(CounterContext);
  const setCount = context?.setCount;
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    row: null,
    action: null,
  });
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    if (setCount) {
      setCount("Book");
    } else {
      console.warn("CounterContext is not provided or setCount is undefined");
    }
  }, [setCount]);

  useEffect(() => {
    const breadcrumbData = [{ label: "Book" }];
    updateBreadcrumb(breadcrumbData);
  }, [updateBreadcrumb]);

  // Mutation for status toggle
  const statusToggleMutation = useMutation({
    mutationFn: ({ id, payload, action }) =>
      apiService.patch(`${APIS.BOOK}/${id}`, payload),
    onSuccess: (response, variables) => {
      if (response?.status === true && response?.code === 200) {
        toast.success(`Book marked as ${variables.action} successfully`);
        queryClientLocal.setQueryData([BOOKS_QUERY_KEY], (oldData) => {
          if (!oldData) return oldData;
          const updatedData = {
            ...oldData,
            data: oldData.data.map((book) =>
              book.id === variables.id
                ? {
                    ...book,
                    status: variables.action,
                    isActive: variables.action === "Active",
                  }
                : book
            ),
          };
          return updatedData;
        });
        queryClientLocal.invalidateQueries({ queryKey: [BOOKS_QUERY_KEY] });
      } else {
        toast.error(response?.message || "Failed to update status");
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Error updating status");
    },
  });

  // Mutation for delete
  const deleteMutation = useMutation({
    mutationFn: (id) => apiService.delete(`${APIS.BOOK}/${id}`),
    onSuccess: (response) => {
      if (response?.code === 200 && response?.status === true) {
        toast.success(response?.message || "Book deleted successfully");
        queryClientLocal.setQueryData([BOOKS_QUERY_KEY], (oldData) => {
          if (!oldData) return oldData;
          const updatedData = {
            ...oldData,
            data: oldData.data.filter((book) => book.id !== bookId),
            totalCount: oldData.totalCount - 1,
          };
          return updatedData;
        });
        queryClientLocal.invalidateQueries({ queryKey: [BOOKS_QUERY_KEY] });
      } else {
        toast.error(response?.message || "Failed to delete book");
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Error deleting book");
    },
  });

  // Mutation for reorder
  const reorderMutation = useMutation({
    mutationFn: (orderPayload) =>
      apiService.post(`${APIS.BOOK_REORDER}`, { order: orderPayload }),
    onMutate: async (orderPayload) => {
      setIsReordering(true);
      await queryClientLocal.cancelQueries({ queryKey: [BOOKS_QUERY_KEY] });
      const previousData = queryClientLocal.getQueryData([BOOKS_QUERY_KEY]);
      queryClientLocal.setQueryData([BOOKS_QUERY_KEY], (oldData) => {
        if (!oldData) return oldData;
        const updatedData = {
          ...oldData,
          data: orderPayload
            .map((item) => {
              const book = oldData.data.find((b) => b._id === item.id);
              return book ? { ...book, order: item.order } : null;
            })
            .filter(Boolean)
            .sort((a, b) => a.order - b.order),
        };
        return updatedData;
      });
      return { previousData };
    },
    onSuccess: (response) => {
      console.log("Reorder API Response:", response);
      if (response?.code === 200 && response?.status === true) {
        toast.success("Book order updated successfully");
      } else {
        toast.error(response?.message || "Failed to update book order");
      }
    },
    onError: (error, variables, context) => {
      console.error("Reorder error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update book order"
      );
      queryClientLocal.setQueryData([BOOKS_QUERY_KEY], context.previousData);
    },
    onSettled: () => {
      setIsReordering(false);
      queryClientLocal.invalidateQueries({ queryKey: [BOOKS_QUERY_KEY] });
    },
  });

  const handleConfirm = () => {
    deleteMutation.mutate(bookId);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const navigateToEdit = (rowData) => {
    navigate(`${ROUTES.UPDATE_BOOK}/${rowData?._id}`, {
      state: { isEditActive: true },
    });
  };

  const handleStatusToggle = (row, action) => {
    const payload = { isActive: action === "Active" };
    statusToggleMutation.mutate({ id: row._id, payload, action });
  };

  const handleDragEnd = async ({ oldIndex, newIndex, newData }) => {
    console.log("Drag End:", { oldIndex, newIndex });
    const orderPayload = newData.map((book, index) => ({
      id: book._id,
      order: index,
    }));
    console.log("Sending reorder payload:", orderPayload);
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

  const handleAddBook = () => {
    navigate(ROUTES.BOOK);
  };

  const handleDeleteBook = (id) => {
    setBookId(id);
    setIsDialogOpen(true);
  };

  const fetchData = useCallback(
    async ({
      page,
      pageSize,
      search,
      sortBy,
      order,
      tab,
      classId,
      subjectId,
    }) => {
      try {
        const params = {
          limit: pageSize,
          page: page + 1,
          search: search || undefined,
          sortBy: sortBy || "order",
          order: order || "asc",
          classId: classId || undefined,
          subjectId: subjectId || undefined,
        };
        if (tab === "Active") {
          params.isActive = true;
        } else if (tab === "Inactive") {
          params.isActive = false;
        }
        const response = await apiService.get(`${APIS.BOOK_LIST}`, { params });
        return {
          data: response?.data?.Books.map((row) => ({
            ...row,
            id: row._id,
            status: row.isActive ? "Active" : "Inactive",
            subject: row?.subject?.nameEn || "Unknown Subject",
            class: row?.class?.nameEn || "Unknown Class",
            book: row?.book || "Unknown Book",
            lessonCount: row?.lessonCount || 0,
            order: row.order || 0,
          })),
          totalCount: response.data.count || 0,
        };
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to fetch books";
        toast.error(message);
        throw new Error(message);
      }
    },
    []
  );

  const columns = [
    {
      field: "book",
      headerName: "Name",
      headerClassName: "bg-[#1A6FAB] text-white text-left",
      width: 100,
      renderCell: (params) => {
        const imageUrl =
          params.row.images?.[0]?.url || params.row.imageUrl || "";
        const value = params.value || "";
        const isTruncated = value.length > 15;
        const truncatedValue = isTruncated
          ? `${value.substring(0, 15)}...`
          : value;

        return (
          <div className="flex items-center space-x-2">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Banner"
                className="w-8 h-8 rounded object-cover border border-gray-200"
              />
            )}
            <Tooltip
              title={
                isTruncated ? (
                  <div className="custom-tooltip-content">{value}</div>
                ) : null
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
              <span>{truncatedValue}</span>
            </Tooltip>
          </div>
        );
      },
    },
    {
      field: "class",
      headerName: "Class",
      headerClassName: "bg-[#1A6FAB] text-white text-left",
      width: 100,
      renderCell: (params) => {
        const value = params.value || "";
        const isTruncated = value.length > 15;
        const truncated = isTruncated ? `${value.substring(0, 15)}...` : value;

        return (
          <Tooltip
            title={
              isTruncated ? (
                <div className="custom-tooltip-content">{value}</div>
              ) : null
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
            <span>{truncated}</span>
          </Tooltip>
        );
      },
    },
    {
      field: "subject",
      headerName: "Subject",
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
              ) : null
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
            <span>{truncated}</span>
          </Tooltip>
        );
      },
    },
    {
      field: "description",
      headerName: "Description",
      headerClassName: "bg-[#1A6FAB] text-white text-left",
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        const value = params.value || "";
        const { summarized, full } = summarizeRepetitiveContent(value);
        const renderedContent = renderLatexContent(summarized);
        const renderedFullContent = renderLatexContent(full);
        const { truncated, isTruncated } = truncateLatexContent(summarized, 50);

        return (
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
                maxHeight: "2em",
                fontSize: "0.75em",
              }}
              className="katex-wrapper"
            >
              {parse(renderedContent)}
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: "lessonCount",
      headerName: "Lesson",
      headerClassName: "bg-[#1A6FAB] text-white text-left",
      minWidth: 50,
      flex: 1,
      renderCell: (params) => (
        <div
          style={{
            cursor: "pointer",
            color: "#1A6FAB",
            textDecoration: "underline",
          }}
          onClick={() =>
            navigate(`${ROUTES.LESSON_MASTER}/list/${params.row._id}`)
          }
        >
          {params.value}
        </div>
      ),
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
                <EllipsisIcon className="text-blue-primary-200" />
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
                  handleDeleteBook(params.row._id);
                }}
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
          searchPlaceholder="Search Books"
          defaultPageSize={10}
          defaultSortField="order"
          defaultSortOrder="asc"
          onAddItem={handleAddBook}
          addButtonText="Add Book"
          isDraggable={true}
          onDragEnd={handleDragEnd}
        />
        {isReordering && <div>Reordering...</div>}
        {confirmationPopup.isOpen && (
          <PopupAlert
            open={confirmationPopup.isOpen}
            setOpen={() =>
              setConfirmationPopup({ isOpen: false, row: null, action: null })
            }
            title="Confirm Action"
            message={`Are you sure you want to mark this Book as ${confirmationPopup.action}?`}
            onConfirm={() => handleConfirmationResponse(true)}
            onCancel={() => handleConfirmationResponse(false)}
            submitTxt="Yes"
            cancelTxt="No"
          />
        )}
        <PopupAlert
          open={isDialogOpen}
          setOpen={() => setIsDialogOpen(false)}
          title="Are you absolutely sure you want to delete?"
          message="This action cannot be undone."
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          submitTxt="Delete"
          cancelTxt="Cancel"
        />
      </QueryClientProvider>
      <style>{`
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
          white-space: nowrap;
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
    </div>
  );
};

export default BookListView;
