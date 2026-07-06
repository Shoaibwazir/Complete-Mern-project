// Shared rental + sale pricing helpers

export const getSalePrice = (product) => Number(product?.price) || 0;

export const getRentPricePerDay = (product) =>
  Number(product?.rental?.pricePerDay) || 0;

export const canBuyProduct = (product) => {
  if (!product || getSalePrice(product) <= 0) return false;
  return product.listingType === 'sale' || product.listingType === 'both';
};

export const canRentProduct = (product) => {
  if (!product || (product.stock ?? 0) <= 0) return false;
  if (!product.rental?.available) return false;
  if (getRentPricePerDay(product) <= 0) return false;
  return product.listingType === 'rental' || product.listingType === 'both';
};

export const calculateRentalTotals = (product, days = 1, quantity = 1, depositRules = {}) => {
  const perDay = getRentPricePerDay(product);
  const totalRental = perDay * days * quantity;

  const percentage = depositRules.percentage ?? 30;
  const minAmount = depositRules.minAmount ?? 50;
  const maxAmount = depositRules.maxAmount ?? 1000;

  let deposit = totalRental * (percentage / 100);
  deposit = Math.max(deposit, minAmount);
  deposit = Math.min(deposit, maxAmount);

  return {
    perDay,
    total: totalRental,
    deposit,
    totalWithDeposit: totalRental + deposit,
  };
};
