try {
  console.log('Test "" currency:', new Intl.NumberFormat('en-GB', { style: 'currency', currency: '' || 'GBP' }).format(100));
} catch(e) {
  console.log('Error with "":', e.message);
}

try {
  console.log('Test undefined locale:', new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'USD' }).format(100));
  console.log('Test undefined locale:', new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(100));
} catch(e) {
  console.log('Error:', e.message);
}
