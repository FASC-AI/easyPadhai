export const toTitleCase = (text) => {
    // Return empty string if input is null or undefined
    if (!text) return '';
    
    // List of words that should not be capitalized (unless they're the first word)
    const minorWords = [
      'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 
      'of', 'on', 'or', 'the', 'to', 'with'
    ];
    
    // Split the text into words
    return text
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        // If it's an empty string, return as is
        if (word.length === 0) return word;
        
        // If it's the first word or not a minor word, capitalize it
        if (index === 0 || !minorWords.includes(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        
        // Otherwise, it's a minor word that's not the first word, so keep it lowercase
        return word;
      })
      .join(' ');
  };
  