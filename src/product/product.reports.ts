export interface BestsellingProduct {
  productId: string;
  productName: string;
  totalQuantity: string;
}

export interface ClientWithMostOrders {
  customerId: string;
  customerName: string;
  orderCount: string;
}

export interface ProductWithHighestStock {
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productName: string;
  totalStock: string;
}
