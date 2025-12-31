export const searchProducts = (products, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) return products;
  
  const searchLower = searchTerm.toLowerCase().trim();
  const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
  
  return products.filter(product => {
    const productNameLower = (product.name || '').toString().toLowerCase();
    const productCategoryLower = (product.category || '').toString().toLowerCase();
    const productPriceLower = (product.price || '').toString().toLowerCase();

    // Match if any of the search terms appears in name, category or price (OR behavior)
    return searchTerms.some(term => 
      productNameLower.includes(term) ||
      productCategoryLower.includes(term) ||
      productPriceLower.includes(term)
    );
  });
};
