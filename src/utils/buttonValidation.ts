
// Utility to ensure all buttons have proper click handlers
export const validateButtonFunctionality = () => {
  console.log('Validating button functionality across the application...');
  
  // This runs in the browser console to check for buttons without handlers
  const buttons = document.querySelectorAll('button');
  const problematicButtons: Element[] = [];
  
  buttons.forEach(button => {
    const hasOnClick = button.onclick !== null;
    const hasEventListener = button.getAttribute('data-has-listener') === 'true';
    const isFormSubmit = button.type === 'submit';
    const isDisabled = button.disabled;
    
    if (!hasOnClick && !hasEventListener && !isFormSubmit && !isDisabled) {
      problematicButtons.push(button);
    }
  });
  
  if (problematicButtons.length > 0) {
    console.warn('Found buttons without click handlers:', problematicButtons);
  } else {
    console.log('All buttons appear to have proper handlers.');
  }
  
  return problematicButtons;
};

// Auto-run validation in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(validateButtonFunctionality, 2000);
}
