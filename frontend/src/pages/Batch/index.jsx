import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBreadcrumb } from "@/components/ui/breadcrumb/breadcrumb-context";
import { useEffect } from "react";
import TableListView from "@/components/ui/table-list-view/table-list-view";
import DataCharectersTooltip from "@/components/ui/DataCharectersTooltip";
import { Link } from "react-router-dom";
import apiService from "@/lib/apiService";
import { APIS } from "@/constants/api.constant";

const queryClient = new QueryClient();

const BatchListView = () => {
  const { updateBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    const breadcrumbData = [{ label: "Batch" }];
    updateBreadcrumb(breadcrumbData);
  }, []);

  const columns = [
    {
      field: "className",
      headerName: "Class",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      renderCell: (params) => <span>{params.value}</span>,
    },
    {
      field: "section",
      headerName: "Section",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
      renderCell: (params) => <span>{params.value}</span>,
    },
    {
      field: "batchCode",
      headerName: "Batch Code",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
      renderCell: (params) => <span>{params.value}</span>,
    },
    {
      field: "teacherName",
      headerName: "Teacher Name",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
      renderCell: (params) => (
        <Link to={``} state={{ id: params.row._id }}>
          {params.value?.length >= 25 ? (
            <DataCharectersTooltip text={params.value} maxLength="25" />
          ) : (
            params.value
          )}
        </Link>
      ),
    },
    {
      field: "email",
      headerName: "Teacher Email",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      renderCell: (params) => (
        <Link to={``} state={{ id: params.row._id }}>
          {params.value?.length >= 25 ? (
            <DataCharectersTooltip text={params.value} maxLength="25" />
          ) : (
            params.value
          )}
        </Link>
      ),
    },
    {
      field: "approvedRequestsCount",
      headerName: "Batch Follower",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
      renderCell: (params) => (
        <Link to={``} state={{ id: params.row._id }}>
          {params.value?.length >= 25 ? (
            <DataCharectersTooltip text={params.value} maxLength="25" />
          ) : (
            params.value
          )}
        </Link>
      ),
    },
    {
      field: "approvedStudentRequestsCount",
      headerName: "Student",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
      renderCell: (params) => (
        <Link to={``} state={{ id: params.row._id }}>
          {params.value?.length >= 25 ? (
            <DataCharectersTooltip text={params.value} maxLength="25" />
          ) : (
            params.value
          )}
        </Link>
      ),
    },
  ];

  const fetchData = async ({ page, pageSize, search, sortBy, order }) => {
    const params = {
      limit: pageSize,
      page: page + 1,
      search,
      sortBy,
      order,
    };

    const response = await apiService.get(`${APIS.BATCH_LIST}`, {
      params,
    });
console.log(response,'resp')
    return {
      data: response.data.batches.map((row) => ({
        ...row,
        id: row?._id,
        code: row?.code, // Map to Batch schema
        className: row?.class?.nameEn, // From populated class
        section: row?.section?.sectionsName || "-", // Adjust if section exists
        batchCode: row?.code, // Assuming batchCode is same as code
        teacherName: row?.classTeacher?.name?.english, // From populated use
        email: row?.classTeacher?.email || "-", // From populated user
        batchFollower: row?.batchFollower?.name?.english || "-", // Assuming batchFollower is a user
        student: row?.student?.name?.english || "-", // Assuming student is a user
        approvedRequestsCount: row?.approvedRequestsCount,
        approvedStudentRequestsCount: row?.approvedStudentRequestsCount,
      })),
      totalCount: response.data.count || 0,
    };
  };

  return (
    <div className="">
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}
          tabs={[{ label: "All", value: "all" }]}
          fetchData={fetchData}
          searchPlaceholder="Search"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
        />
      </QueryClientProvider>
    </div>
  );
};

export default BatchListView;
