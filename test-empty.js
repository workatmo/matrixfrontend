try {
  console.log(new Intl.NumberFormat('en-GB', { style: 'currency', currency: '' }).format(100));
} catch(e) {
  console.log('Error:', e.message);
}
