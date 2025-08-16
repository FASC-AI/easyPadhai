import moment from 'moment';

const removeObjectEmptyValues = (obj) =>
  obj
    ? Object.fromEntries(
        Object.entries(obj).filter(
          ([_, v]) => ![null, '', undefined].includes(v)
        )
      )
    : null;

/**
 * @param arr input array
 * @returns new array after removing blank (null, undefined, '') values
 */
const removeArrayNullValues = (arr) =>
  arr?.filter((v) => ![null, '', undefined].includes(v));

/**
 * @param value input array
 * @returns new value after removing blank (null, undefined, '') values
 * @description removes blank (null, undefined, '') values from array & object, other types are returned as it is
 */
export const removeNullValues = (value) => {
  if (Array.isArray(value)) {
    return removeArrayNullValues(value);
  }

  if (typeof value === 'object') {
    return removeObjectEmptyValues(value);
  }

  return value;
};

export const getFormattedCode = (prefix, value) =>
  prefix + value?.toString()?.padStart(4, '0');
export const getFormattedCodee = (prefix, value) => {
  const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  return `${prefix}${numValue.toString().padStart(4, '0')}`;
};
export const getCommonSearchConditionForMasters = (search) => {
  const numericSearch = parseInt(search.replace(/\D/g, ''), 10);

  return [
    { 'name.english': { $regex: search, $options: 'i' } },
    { 'name.hindi': { $regex: search, $options: 'i' } },
    { 'name.hinglish': { $regex: search, $options: 'i' } },
    { 'email': { $regex: search, $options: 'i' } },
    { 'mobile': { $regex: search, $options: 'i' } },
  ].filter(Boolean);
};

export const formatDate = (date) => {
  if (!date) return null;
  const momentDate = moment(date, 'DD/MM/YYYY');
  if (
    momentDate.isValid() &&
    momentDate.year() > 1000 &&
    momentDate.year() < 3000
  ) {
    return momentDate.format();
  } else {
    return null;
  }
};

export const getCommonSearchConditionForRoute = (search) => {
  const numericSearch = parseInt(search.replace(/\D/g, ''), 10);

  return [
    { name: { $regex: search, $options: 'i' } },
    { code: { $regex: search, $options: 'i' } },

    !isNaN(numericSearch) && { code: numericSearch },
  ].filter(Boolean);
};
export const separateNames = (fullName) => {
  const regex = /^(.+?)\((.+)\)$/;
  const match = fullName.match(regex);

  if (match) {
    const englishName = match[1].trim();
    const hindiName = match[2].trim();
    return { englishName, hindiName };
  }
};
export const getSearchConditionForUser = (search) => {
  return [
    { loginEmail: { $regex: search, $options: 'i' } },
    { loginMobile: { $regex: search, $options: 'i' } },
    { designation: { $regex: search, $options: 'i' } },
    { 'name.english': { $regex: search, $options: 'i' } },
    { 'name.hindi': { $regex: search, $options: 'i' } },
    { 'name.hinglish': { $regex: search, $options: 'i' } },
  ];
};
export const capitalizeFirstLetter = (str) => {
  str = String(str);
  if (typeof str !== 'string') {
    return '';
  }

  if (str.trim() === '') {
    return '';
  }

  return str
    .trim()
    .split(/\s+/) // Split by any whitespace characters (including multiple spaces)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
