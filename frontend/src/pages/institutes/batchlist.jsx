import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TableListView from "@/components/ui/table-list-view/table-list-view";
import DataCharectersTooltip from "@/components/ui/DataCharectersTooltip";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiService from "@/lib/apiService";
import { APIS } from "@/constants/api.constant";
import ROUTES from "@/constants/route.constant";

const queryClient = new QueryClient();

const BatchList = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const columns = [
    {
      field: "batchCode",
      headerName: "Batch Code",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
      renderCell: (params) => <span>{params.value || "-"}</span>,
    },
    {
      field: "className",
      headerName: "Class",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 250,
      renderCell: (params) => <span>{params.value || "-"}</span>,
    },
    {
      field: "section",
      headerName: "Section",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
      renderCell: (params) => <span>{params.value || "-"}</span>,
    },
    {
      field: "teacherName",
      headerName: "Teacher Name",
      headerClassName: "bg-[#1A6FAB] text-white",
      width: 200,
      renderCell: (params) => (
        <Link to={`/batch/${params.row._id}`} state={{ id: params.row._id }}>
          {params.value?.length >= 25 ? (
            <DataCharectersTooltip text={params.value} maxLength="25" />
          ) : (
            params.value || "-"
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
        <Link to={`/batch/${params.row._id}`} state={{ id: params.row._id }}>
          {params.value?.length >= 25 ? (
            <DataCharectersTooltip text={params.value} maxLength="25" />
          ) : (
            params.value || "-"
          )}
        </Link>
      ),
    },
    {
      field: "mobile",
      headerName: "Teacher Mobile Number",
      headerClassName: "bg-[#1A6FAB] text-white",
      minWidth: 250,
      flex: 1,
      renderCell: (params) => (
        <Link to={`/batch/${params.row._id}`} state={{ id: params.row._id }}>
          {params.value?.length >= 25 ? (
            <DataCharectersTooltip text={params.value} maxLength="25" />
          ) : (
            params.value || "-"
          )}
        </Link>
      ),
    },
  ];

  const fetchData = async ({ page, pageSize, search, sortBy, order }) => {
    try {
      const params = {
        limit: pageSize,
        page: page + 1,
        search,
        sortBy,
        order,
      };

      const response = await apiService.get(`${APIS.INSTITUTES}/${id}`, { params });

      if (!response.data || !response.data.batchDetails) {
        throw new Error("No batch data received from API");
      }

      const mappedData = response.data.batchDetails.map((row) => ({
        id: row?._id || "-",
        className: row?.class?.name || "-",
        section: row?.section?.name || "-",
        batchCode: row?.code || "-",
        teacherName: row?.teacher?.name || "-",
        email: row?.teacher?.email || "-",
        mobile: row?.teacher?.mobile || "-",
      }));

      return {
        data: mappedData,
        totalCount: response.data.batchDetails.length || 0,
      };
    } catch (error) {
      console.error("Error fetching batch data:", error);
      return {
        data: [],
        totalCount: 0,
      };
    }
  };

  // Dynamic breadcrumb configuration
  const breadcrumbItems = [
   
    { name: "Institutes", path: ROUTES.INSTITUTES_LIST },
   
  ];

  return (
    <div className="p-4">
      <QueryClientProvider client={queryClient}>
        <TableListView
          columns={columns}
          tabs={[{ label: "All", value: "all" }]}
          fetchData={fetchData}
          searchPlaceholder="Search batches"
          defaultPageSize={10}
          defaultSortField="createdAt"
          defaultSortOrder="desc"
          
          keyword="Batch"
          routes={ROUTES}
          routeId={id}
          breadCrumbs={breadcrumbItems}
          backNavi={() => navigate(ROUTES.INSTITUTES_LIST)} // Back to institutes list
          boldItem={" Batch"}
        />
      </QueryClientProvider>
    </div>
  );
};

export default BatchList;