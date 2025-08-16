// import { useId, useState, useRef, useEffect } from "react";

// export default function AutoSelectDropdown({
//   options = [],
//   label = "Select an option",
//   name,
//   formik,
//   placeholder = "Select option",
//   searchPlaceholder = "Search...",
//   emptyMessage = "No options found.",
//   required = false
// }) {
//   const id = useId();
//   const [open, setOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const dropdownRef = useRef(null);
//   const searchInputRef = useRef(null);
//   const filteredOptions = options.filter(option =>
//     option.label.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSelect = (currentValue) => {
//     const newValue = currentValue === formik.values[name] ? "" : currentValue;
//     formik.setFieldValue(name, newValue);
//     formik.setFieldTouched(name, true, false);
//     setOpen(false);
//     setSearchTerm("");
//   };
//   const selectedLabel = formik?.values[name]
//     ? options.find((option) => option.value === formik.values[name])?.label
//     : null;
//   useEffect(() => {
//     if (open && searchInputRef.current) {
//       setTimeout(() => {
//         searchInputRef.current.focus();
//       }, 100);
//     }
//   }, [open]);
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === "Escape" && open) {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);
//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [open]);

//   return (
//     <div className="relative w-full mb-2" ref={dropdownRef}>
//       <label htmlFor={id} className="block text-sm font-medium mb-1">
//         {label} {required === true ? <span className="text-red-500">*</span> : ''}

//       </label>

//       <button
//         id={id}
//         type="button"
//         className="flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         onClick={() => setOpen(!open)}
//         onBlur={() => formik.setFieldTouched(name, true)}
//         aria-haspopup="listbox"
//         aria-expanded={open}
//       >
//         <span className={`truncate ${!formik?.values[name] ? "text-gray-400" : ""}`}>
//           {selectedLabel || placeholder}
//         </span>
//         <svg
//           className="w-4 h-4 ml-2"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M19 9l-7 7-7-7"
//           />
//         </svg>
//       </button>

//       {open && (
//         <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
//           <div className="flex items-center px-3 py-2 border-b">
//             <svg
//               className="w-4 h-4 mr-2 text-gray-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//               />
//             </svg>
//             <input
//               ref={searchInputRef}
//               type="text"
//               className="w-full py-1 text-sm bg-transparent border-none focus:outline-none"
//               placeholder={searchPlaceholder}
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <div className="max-h-60 overflow-y-auto">
//             {filteredOptions.length === 0 ? (
//               <div className="py-4 px-3 text-sm text-gray-500 text-center">
//                 {emptyMessage}
//               </div>
//             ) : (
//               <ul role="listbox">
//                 {filteredOptions.map((option) => (
//                   <li
//                     key={option.value}
//                     role="option"
//                     aria-selected={formik.values[name] === option.value}
//                     className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex justify-between items-center ${formik.values[name] === option.value ? "bg-blue-50 text-blue-700" : ""
//                       }`}
//                     onClick={() => handleSelect(option.value)}
//                   >
//                     {option.label}
//                     {formik.values[name] === option.value && (
//                       <svg
//                         className="w-4 h-4 text-blue-500"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                         xmlns="http://www.w3.org/2000/svg"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </div>
//       )}
//       {formik.touched[name] && formik.errors[name] && (
//         <p className="mt-1 text-xs text-red-500">{formik.errors[name]}</p>
//       )}
//     </div>
//   );
// }

import { useId, useState, useRef, useEffect } from "react";

export default function AutoSelectDropdown({
  options = [],
  label = "Select an option",
  name,
  formik,
  placeholder = "Select option",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  required = false,
  onChange, // Add custom onChange prop
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (currentValue) => {
    const newValue = currentValue === formik.values[name] ? "" : currentValue;
    formik.setFieldValue(name, newValue); // Update Formik state
    formik.setFieldTouched(name, true, false);
    setOpen(false);
    setSearchTerm("");

    // Call custom onChange if provided
    if (onChange && typeof onChange === "function") {
      onChange(newValue, name); // Pass the new value and field name to onChange
    }
  };

  const selectedLabel = formik?.values[name]
    ? options.find((option) => option.value === formik.values[name])?.label
    : null;

  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="relative w-full mb-2" ref={dropdownRef}>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}{" "}
        {required === true ? <span className="text-red-500">*</span> : ""}
      </label>

      <button
        id={id}
        type="button"
        className="flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        onClick={() => setOpen(!open)}
        onBlur={() => formik.setFieldTouched(name, true)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={`truncate ${!formik?.values[name] ? "text-gray-400" : ""}`}
        >
          {selectedLabel || placeholder}
        </span>
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          <div className="flex items-center px-3 py-2 border-b">
            <svg
              className="w-4 h-4 mr-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              className="w-full py-1 text-sm bg-transparent border-none focus:outline-none"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-4 px-3 text-sm text-gray-500 text-center">
                {emptyMessage}
              </div>
            ) : (
              <ul role="listbox">
                {filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={formik.values[name] === option.value}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
                      formik.values[name] === option.value
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }`}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                    {formik.values[name] === option.value && (
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {formik.touched[name] && formik.errors[name] && (
        <p className="mt-1 text-xs text-red-500">{formik.errors[name]}</p>
      )}
    </div>
  );
}
