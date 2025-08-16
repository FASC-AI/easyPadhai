// import React, { useEffect, useState } from 'react';
// import { Collapse } from '@mui/material';
// import { ExpandLess, ExpandMore } from '@mui/icons-material';
// import { Link, useLocation } from 'react-router-dom';

// import { sidebarRoutes } from '@/utils/sidebar.utils/side.options';
// import useStore from '@/store/userStore';
// import apiService from '@/lib/apiService';
// import { Button } from '../ui/button';

// const Sidebar = ({ isShowSidebar, toggleSidebar, setIsShowSidebar }) => {
//   const location = useLocation();
//   const pathname = location.pathname;
//   const { permissions } = useStore();
//   const { isAuthenticated } = useStore();
//   const [toggleMenu, setToggleMenu] = useState({});
//   const [updatedSidebar, setUpdatedSidebar] = useState([]);
//   const { metaData, setMetaData } = useStore();
//   const setUserSidebar = () => {
//     const sidebar = [];

//     if (isAuthenticated) {
//       async function fetchData() {
//         try {
//           let response = await apiService.get(`v2/masters/metaData`);
//           // let response = metaData;
//           // console.log("resjdslf",response)
//           let data = response?.masters;
//           // Process your sidebar data with the fetched data
//           for (let items of updatedSidebar) {
//             if (items.label === 'Masters') {
//               for (let sub of items.subItems) {
//                 if (sub?.label === 'Bus Stations / Stops') {
//                   sub.route = `/masters/${data.busStop.routeId}`;
//                 }
//               }
//             }
//           }
//         } catch (error) {
//           console.error(error, 'error fetching data');
//         }
//       }

//       fetchData();
//     }

//     const permissionsArray = Array.isArray(permissions) ? permissions : [];

//     // Function to process sub-items based on permissions
//     const processSubItems = (subItems, module) => {
//       const resultSubItems = [];

//       subItems.forEach((subItem) => {
//         if (subItem.actions?.view) {
//           const foundSubItem = module?.subItems?.find(
//             (d) => d?.label === subItem?.moduleName
//           );
//           if (foundSubItem) {
//             const subItemCopy = { ...foundSubItem, subItems: [] };
//             if (subItem.subItems && subItem.subItems.length > 0) {
//               subItemCopy.subItems = processSubItems(
//                 subItem.subItems,
//                 foundSubItem
//               );
//             }

//             resultSubItems.push(subItemCopy);
//           }
//         }
//       });

//       return resultSubItems;
//     };

//     permissionsArray.forEach((item) => {
//       const module = sidebarRoutes.find((d) => d.label === item.moduleName);

//       if (module) {
//         const moduleCopy = { ...module };
//         moduleCopy.subItems = [];

//         if (item.subItems && item.subItems.length > 0) {
//           moduleCopy.subItems = processSubItems(item.subItems, module);
//           if (moduleCopy.subItems.length > 0) {
//             sidebar.push(moduleCopy);
//           }
//         } else if (item.actions?.view) {
//           sidebar.push(moduleCopy);
//         }
//       }
//     });

//     setUpdatedSidebar(sidebar);
//     // Initialize toggleMenu state to open all sub-items
//     const initialToggleMenu = {};
//     sidebar.forEach((item) => {
//       initialToggleMenu[item.label] = false; // Set each item's sub-items to open
//       item.subItems.forEach((subItem) => {
//         initialToggleMenu[subItem.label] = false; // Open sub-items as well
//       });
//     });
//     setToggleMenu(initialToggleMenu);
//   };

//   useEffect(() => {
//     if (permissions) {
//       setUserSidebar();
//     }
//   }, [permissions]);

//   const handleToggleMenu = (ele) => {
//     if (ele?.isMenu) {
//       const isCurrentlyOpen = toggleMenu[ele?.label];
//       setToggleMenu((prev) => ({
//         ...prev,
//         [ele.label]: !isCurrentlyOpen,
//       }));
//       toggleSidebar(true);
//     } else {
//       setToggleMenu({ type: '', open: false });
//     }
//   };

//   const isRouteActive = (route) =>
//     pathname === route || pathname.startsWith(`${route}/`);

//   // Function to render sub-items, including nested sub-items
//   const renderSubItems = (subItems) => {
//     return subItems.map((subEle) => {
//       const isActive = isRouteActive(subEle.route);
//       const hasNestedMenu = subEle.subItems && subEle.subItems.length > 0;

//       return (
//         <React.Fragment key={subEle.label}>
//           <Link
//             to={subEle.route || '#'}
//             className={`biLink sub-menu-text ${isActive ? 'active' : ''}`}
//             style={{
//               backgroundColor:
              
//                 subEle.label === 'Service'
//                   ? '#ddd'
//                   : subEle.label === 'Rtc_4'
//                     ? '#ddd'
//                     : subEle.label === 'Variance'
//                       ? '#ddd'
                      
//                         : subEle.label === 'Licence Validity'
//                           ? '#ddd'
//                           : subEle.label === 'Dainik Sanchalan'
//                             ? '#ddd'
//                             : subEle.label === 'Un Assigned Crew'
//                               ? '#ddd'
//                               : subEle.label === 'Un assigned Vehicles'
//                                 ? '#ddd'
//                                 : subEle.label === 'Trip Cancellation'
//                                   ? '#ddd'
//                                   : subEle.label === 'Vehicle Transfer'
//                                     ? '#ddd'
//                                     : subEle.label === 'Conductor'
//                                       ? '#ddd'
//                                       : subEle.label === 'Time Table Variance'
//                                         ? '#ddd'
//                                         : subEle.label ===
//                                             'Vehicle Contract Renewal'
//                                           ? '#ddd'
//                                           : subEle.label === 'Pollution Expiry'
//                                             ? '#ddd'
//                                             : subEle.label === 'RC Expiry'
//                                               ? '#ddd'
//                                               : subEle.label ===
//                                                   'Fuel Consumption'
//                                                 ? '#ddd'
//                                                 : subEle.label ===
//                                                     'Vehicle Fuel Avg History'
//                                                   ? '#ddd'
//                                                   : subEle.label ===
//                                                       'Vehicle Challan'
//                                                     ? '#ddd'
//                                                     : subEle.label ===
//                                                         'Passenger'
//                                                       ? '#ddd'
//                                                       : subEle.label ===
//                                                           'Vehicle Toll Tax'
//                                                         ? '#ddd'
//                                                         : subEle.label ===
//                                                             'Waybill'
//                                                           ? '#ddd'
//                                                           : subEle.label ===
//                                                               'Daily Duty Allocation'
//                                                             ? '#ddd'
//                                                             : subEle.label ===
//                                                                 'Vehicle Dispatch Register'
//                                                               ? '#ddd'
//                                                               : subEle.label ===
//                                                                   'Reason For Cancellations'
//                                                                 ? '#ddd'
//                                                                 : subEle.label ===
//                                                                     'Vehicle Log'
//                                                                   ? '#ddd'
//                                                                   : subEle.label ===
//                                                                       'Dispatch Vehicles'
//                                                                     ? '#ddd'
//                                                                     : subEle.label ===
//                                                                         'Driver Accident'
//                                                                       ? '#ddd'
//                                                                       : subEle.label ===
//                                                                           'Division/Region'
//                                                                         ? '#ddd'
//                                                                         : subEle.label ===
//                                                                             'Liscense Expiry'
//                                                                           ? '#ddd'
//                                                                           : 'transparent',
//             }}
//             onClick={(e) => {
//               if (hasNestedMenu) {
//                 e.preventDefault(); // Prevent default navigation if it has nested items
//                 handleToggleMenu(subEle);
//               }
//             }}
//           >
//             {subEle.img}
//             <span>{subEle.label}</span>
//             {hasNestedMenu && (
//               <span>
//                 {toggleMenu[subEle.label] ? <ExpandLess /> : <ExpandMore />}
//               </span>
//             )}
//           </Link>
//           <Collapse
//             in={toggleMenu[subEle.label]}
//             timeout="auto"
//             unmountOnExit
//             className="collapse-menu"
//           >
//             {renderSubItems(subEle.subItems)}
//           </Collapse>
//         </React.Fragment>
//       );
//     });
//   };

//   return (
//     <div className={`biSidebarWrap ${isShowSidebar ? 'hide' : ''}`}>
//       <div
//         className={`${isShowSidebar ? 'd-flex' : ''}`}
//         style={{ justifyContent: 'center' }}
//       >
//         {closedStateLogo({ width: 50, height: 50 })}
//       </div>
//       <button
//         className={`arrowBtn z-50 ${!isShowSidebar ? '' : 'rotate'}`}
//         onClick={() => {
//           // close all submenus
//           setToggleMenu({});
//           setIsShowSidebar(false);
//           toggleSidebar();
//         }}
//       >
//         {greaterThenIcon({ width: 14, height: 12, fill: '#fff' })}
//       </button>
//       <ul className={`${isShowSidebar ? 'biSidebar' : 'biSidebar2'}`}>
//         {updatedSidebar.map((ele) => {
//           const isActive = isRouteActive(ele.route);
//           const hasNestedMenu = ele.subItems && ele.subItems.length > 0;
 
   
 
//           return (
            
//             <li
//               className={`biList ${isActive ? 'active' : ''}`}
             
//               key={ele.label}
              
//             >
//               <Link
//                 to={ele.route || '#'}
//                 className={`biLink ${isActive ? 'active' : ''}`}
//                 onClick={(e) => {
//                   if (hasNestedMenu) {
//                     e.preventDefault(); // Prevent default navigation if it has nested items
//                     handleToggleMenu(ele);
//                   }
//                 }}
//               >
//                 {ele.img}
//                 <span>{ele.label}</span>
//                 {hasNestedMenu && (
//                   <span>
//                     {toggleMenu[ele.label] ? <ExpandLess /> : <ExpandMore />}
//                   </span>
//                 )}
//               </Link>
//               {hasNestedMenu && (
//                 <Collapse
//                   in={toggleMenu[ele.label]}
//                   timeout="auto"
//                   unmountOnExit
//                   className="collapse-menu"
//                 >
//                   {renderSubItems(ele.subItems)}
//                 </Collapse>
//               )}
//             </li>
//           );
//         })}
//       </ul>
//       {isShowSidebar ? (
//         <div className="text-[#8990a5] flex gap-1 flex-col mt-auto">
//           <div className="flex text-xs">
//             <strong>Version: </strong> &nbsp; <span>1.0.0</span>
//           </div>
//           <div className="text-xs">Powered By MARGSOFT Technologies</div>
//         </div>
//       ) : (
//         <div className="w-10 h-10 mx-auto mt-auto">
//           <div className="w-8 h-8 bg-white rounded-full mx-auto flex items-center justify-center font-semibold text-[#002850]">
//             M
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Sidebar;
