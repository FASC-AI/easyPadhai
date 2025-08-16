
// dd-mm-yyyy format
export const format_dd_mm_yyyy = (date) => {
    // Convert input to Date object if it's not already
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    // Get day, month and year
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = dateObj.getFullYear();
    
    // Return the formatted date
    return `${day}-${month}-${year}`;
  };


  export const format_dd_mmm_yyyy = (date) => {
    // Convert input to Date object if it's not already
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    // Array of 3-letter month abbreviations
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Get day, month and year
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = monthNames[dateObj.getMonth()]; // Get 3-letter month abbreviation
    const year = dateObj.getFullYear();
    
    // Return the formatted date
    return `${day}-${month}-${year}`;
  };
  