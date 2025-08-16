import { useQuery } from "@tanstack/react-query";
import React, { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";
import BreadCrumbs from "@/components/common/BreadCrumbs/BreadCrumbs";
import ROUTES from "@/constants/route.constant";
import { DataGrid } from "@mui/x-data-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import useDebounce from "@/hooks/useDebounce";
import { CounterContext } from "./Layout/commonLayout/TitleOfPageProvider";
import { FilterDropdown } from "./DataGrid/DataTableAction/DataTableAction";
import { useNavigate } from "react-router-dom";
import {
  kanbanNotUsedButton,
  kanbanUsedButton,
  listNotUsedButton,
  listUsedButton,
} from "@/assets/Icons";

import DateRangePicker from "@/components/ui/date-range-picker";
import { DatePickerInput } from "@/components/common/DateTimeInputs";
import { Slider } from "@/components/ui/slider";
import { MinusIcon, PlusIcon } from "lucide-react";

// const EnhancedDaysSlider = ({ value, onChange }) => {

//   const handleIncrement = () => {
//     if (value < 100) onChange(Math.min(100, value + 5));
//   };

//   const handleDecrement = () => {
//     if (value > 10) onChange(Math.max(10, value - 5));
//   };

//   return (
//     <div className="flex items-center justify-between rounded-lg">
//       {/* Slider Section */}
//       <div className="flex items-center gap-4">
//         {/* Decrement Button */}
//         <button
//           onClick={handleDecrement}
//           className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//           disabled={value <= 10}
//           aria-label="Decrease value"
//         >
//           <MinusIcon className="w-3 h-3 text-gray-600" />
//         </button>

//         {/* Slider and Value Display */}
//         <div className="flex flex-col items-center">
//           <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
//             <span>10d</span>
//             <span className="font-semibold text-gray-800">{value} days</span>
//             <span>100d</span>
//           </div>
//           <Slider
//             value={[value]}
//             max={100}
//             min={10}
//             step={5}
//             onValueChange={(newValue) => {
//               if (Array.isArray(newValue) && newValue.length > 0) {
//                 onChange(newValue[0]);
//               }
//             }}
//             className="w-full sm:w-40"
//             aria-label="Days slider"
//             aria-valuemin={10}
//             aria-valuemax={100}
//             aria-valuenow={value}
//           />
//         </div>

//         {/* Increment Button */}
//         <button
//           onClick={handleIncrement}
//           className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//           disabled={value >= 100}
//           aria-label="Increase value"
//         >
//           <PlusIcon className="w-3 h-3 text-gray-600" />
//         </button>
//       </div>
//     </div>
//   );
// };

const PaginatedTableView = ({
  queryKey,
  queryFn,
  LIST_OF_FILTERS,
  columns,
  pageSizeOptions = [10, 20, 25, 50, 100],
  defaultPageSize = 10,
  searchPlaceholder = "Search",
  headButtons = [],
  pageName = "Table",
  tabs = [{ label: "All", value: "all" }],
  debounceDelay = 500,
  sortBy = "createdAt",
  isGrid,
  isGridOpened,
  defaultTabsValue = tabs[0].value,
  keyword,
  routes = ROUTES,
  routeId,
  breadCrumbs,
  backNavi,
  boldItem,
  isSearchRequired = true,
  customFilter = () => <></>,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState(isGridOpened ? "grid" : "list");
  const debouncedSearch = useDebounce(search, debounceDelay);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: defaultPageSize,
    page: 0,
  });
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState(defaultTabsValue);
  const order = "desc";

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  const { isFetching, refetch } = useQuery({
    queryKey: [
      queryKey,
      paginationModel,
      debouncedSearch,
      sortBy,
      order,
      activeTab,
      viewMode,
    ],
    queryFn: () =>
      queryFn({
        page: paginationModel.page,
        pageSize: viewMode === "grid" ? 1000 : paginationModel.pageSize,
        search: debouncedSearch,
        sortBy,
        order,
        tab: activeTab,
      }).then((data) => {
        setRows(data.data);
        setTotalCount(data.totalCount);
        return data;
      }),
    keepPreviousData: true,
  });

  // Generate default breadcrumb items if not provided
  const defaultBreadCrumbs = keyword
    ? [
        {
          name: keyword,
          path:
            routes?.[`${keyword.toUpperCase()}_LIST`] ||
            `/${keyword.toLowerCase()}s/list`,
        },
      ]
    : [];

  // Use provided breadCrumbs or default
  const finalBreadCrumbs = breadCrumbs || defaultBreadCrumbs;

  // Generate default backNavi function if not provided
  const defaultBackNavi = () => {
    const path =
      finalBreadCrumbs.length > 0
        ? finalBreadCrumbs[finalBreadCrumbs.length - 1].path
        : `/${keyword?.toLowerCase() || "items"}/list`;
    navigate(path);
  };

  // Use provided backNavi or default
  const finalBackNavi = backNavi || defaultBackNavi;

  // Generate default boldItem if not provided
  const defaultBoldItem = keyword
    ? routeId
      ? `Edit ${keyword}`
      : `Add ${keyword}`
    : routeId
    ? "Edit Item"
    : "Add Item";

  // Use provided boldItem or default
  const finalBoldItem = boldItem || defaultBoldItem;

  function FilterButtons({ LIST_OF_FILTERS }) {
    return (
      <div className="flex gap-2 items-center justify-center">
        {LIST_OF_FILTERS?.map((item, index) => {
          return item.type === "button" ? (
            <button onClick={item.submitAction} className={item.className}>
              {item.title}
            </button>
          ) : (
            <FilterDropdown
              title={item.title}
              submitAction={item.submitAction}
              name={item.name}
              key={index}
              endpoint={item.endpoint}
              isClearAll={item.isClearAll}
            />
          );
        })}
      </div>
    );
  }

  return (
    <section className="bg-white w-full flex-1 shadow-lg">
      <section className="flex justify-between items-center px-4 py-2">
        <div className="flex items-center justify-center gap-4 ml-4 ">
          <div className="gap-4">
            {(finalBreadCrumbs.length > 0 || keyword) && (
              <BreadCrumbs
                backNavi={finalBackNavi}
                breadCrumbs={finalBreadCrumbs}
                boldItem={finalBoldItem}
              />
            )}
            <div className="flex flex-row gap-4 items-center justify-center">
              {isSearchRequired && (
                <div className="relative w-[200px]">
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="py-2 pr-10 pl-4"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 ">
                    <SearchIcon className="size-4" />
                  </span>
                </div>
              )}
              <FilterButtons LIST_OF_FILTERS={LIST_OF_FILTERS} />
              {customFilter && customFilter()}
            </div>
          </div>
        </div>
        <section className="flex items-start justify-center gap-3">
          {isGrid && (
            <div className="flex gap-3 cursor-pointer">
              <div onClick={() => handleViewModeChange("grid")}>
                {viewMode === "grid"
                  ? kanbanUsedButton({ height: "32" })
                  : kanbanNotUsedButton({ height: "32" })}
              </div>
              <div onClick={() => handleViewModeChange("list")}>
                {viewMode === "list"
                  ? listUsedButton({ height: "32" })
                  : listNotUsedButton({ height: "32" })}
              </div>
            </div>
          )}
          {headButtons.map((button, index) => (
            <React.Fragment key={index}>{button.children}</React.Fragment>
          ))}
        </section>
      </section>
      <Tabs defaultValue={defaultTabsValue} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="cursor-pointer data-[state=active]:underline data-[state=active]:text-[#1A6FAB] data-[state=active]:underline-offset-10 data-[state=active]:decoration-[#1A6FAB] data-[state=active]:decoration-1.5"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <section className="pl-4 pr-4 flex flex-col gap-4">
              <section className="flex items-center justify-between gap-4">
                <div>{/* Add filter section if needed */}</div>
              </section>
              <section className="w-full h-[calc(100vh-185px)]">
                <DataGrid
                  rows={rows}
                  columns={columns}
                  paginationMode="server"
                  rowCount={totalCount}
                  pageSizeOptions={pageSizeOptions}
                  paginationModel={paginationModel}
                  onPaginationModelChange={handlePaginationModelChange}
                  disableRowSelectionOnClick
                  disableColumnMenu
                  loading={isFetching}
                />
              </section>
            </section>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
};

export default PaginatedTableView;
