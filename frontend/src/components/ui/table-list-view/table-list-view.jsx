import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, GridIcon, ListIcon } from "lucide-react";
import PaginatedTableView from "@/components/paginated-table-view";
import "./TableListView.css"; // Add this import if not already present
/**
 * TableListView - A reusable component for displaying data in table/grid formats
 *
 * @param {Object} props
 * @param {string} props.title - Title for the data table section
 * @param {Array} props.data - The data array to display
 * @param {Array} props.columns - Column definitions for the table view
 * @param {Array} props.tabs - Tab definitions for filtering data
 * @param {Function} props.fetchData - Function to fetch/filter data based on parameters
 * @param {React.Component} props.gridViewComponent - Component to render in grid view mode
 * @param {Array} props.actionButtons - Custom action buttons to display in the header
 * @param {Function} props.onAddItem - Function to call when Add button is clicked
 * @param {string} props.addButtonText - Text to display on the Add button
 * @param {React.Component} props.customFilterComponent - Custom filter component
 * @param {string} props.searchPlaceholder - Placeholder text for the search input
 * @param {number} props.defaultPageSize - Default number of items per page
 * @param {string} props.defaultSortField - Default field to sort by
 * @param {string} props.defaultSortOrder - Default sort order ("asc" or "desc")
 * @param {boolean} props.showSearch - Whether to show the search input
 * @param {boolean} props.showAddButton - Whether to show the Add button
 * @param {boolean} props.showViewToggle - Whether to show the view toggle button
 */
const TableListView = ({
  title,
  data,
  columns,
  tabs,
  fetchData,
  gridViewComponent: GridViewComponent,
  actionButtons = [],
  onAddItem,
  addButtonText = "",
  customFilter,
  searchPlaceholder = "Search...",
  defaultPageSize = 10,
  defaultSortField = "id",
  defaultSortOrder = "desc",
  showSearch = true,
  showAddButton = true,
  showViewToggle = false,
  keyword,
  routes,
  routeId,
  breadCrumbs,
  backNavi,
  boldItem,
  refetchKey = false,
}) => {
  const [viewMode, setViewMode] = useState("list");

  const generateHeadButtons = () => {
    const buttons = [];
    if (showViewToggle) {
      buttons.push({
        children: (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className=""
          >
            {viewMode === "list" ? (
              <GridIcon className="size-4" />
            ) : (
              <ListIcon className="size-4" />
            )}
          </Button>
        ),
      });
    }
    if (showAddButton && onAddItem && addButtonText) {
      buttons.push({
        children: (
          <Button
            size="sm"
            onClick={onAddItem}
            className="bg-[#1A6FAB] text-white hover:bg-[#1A6FAB] hover:text-white"
          >
            <PlusIcon className="size-4" /> {addButtonText}
          </Button>
        ),
      });
    }

    actionButtons.forEach((button) => {
      buttons.push({ children: button });
    });

    return buttons;
  };

  const processData = async (params) => {
    if (!fetchData) {
      let filteredData = [...data];
      const { page, pageSize, search, sortBy, order, tab } = params;
      if (tab && tab !== "all") {
        filteredData = filteredData.filter((item) => item.status === tab);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filteredData = filteredData.filter((item) => {
          return Object.keys(item).some((key) => {
            const value = item[key];
            return (
              typeof value === "string" &&
              value.toLowerCase().includes(searchLower)
            );
          });
        });
      }
      filteredData.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (order === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      const totalCount = filteredData.length;
      const startIndex = page * pageSize;
      const paginatedData = filteredData.slice(
        startIndex,
        startIndex + pageSize
      );

      return {
        data: paginatedData,
        totalCount,
      };
    }
    return await fetchData(params);
  };

  return (
    <div className="">
      {title && <h1 className="text-2xl font-bold mb-4">{title}</h1>}
      <PaginatedTableView
        queryKey={refetchKey ? [("dynamicData", refetchKey)] : "dynamicData"}
        queryFn={processData}
        columns={columns}
        defaultPageSize={defaultPageSize}
        searchPlaceholder={searchPlaceholder}
        headButtons={generateHeadButtons()}
        tabs={tabs}
        sortBy={defaultSortField}
        order={defaultSortOrder}
        viewMode={viewMode}
        viewModeComponent={GridViewComponent}
        isSearchRequired={showSearch}
        customFilter={customFilter}
        keyword={keyword}
        routes={routes}
        routeId={routeId}
        breadCrumbs={breadCrumbs}
        backNavi={backNavi}
        boldItem={boldItem}
      />
    </div>
  );
};

export default TableListView;
