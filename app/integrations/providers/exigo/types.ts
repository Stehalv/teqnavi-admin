import type { IntegrationConfig } from '../../core/types.js';

export interface ExigoConfig extends IntegrationConfig {
  shopId: string;
  companyId: number;
  loginName: string;
  password: string;
  apiUrl?: string;
}

export interface ExigoCustomer {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  enrollerId?: number;
  customerType: number;
  customerStatus: number;
  createdDate: Date;
  modifiedDate: Date;
}

export interface ExigoOrder {
  orderId: number;
  customerId: number;
  orderStatus: number;
  orderDate: Date;
  currencyCode: string;
  warehouseId: number;
  total: number;
  subTotal: number;
  taxTotal: number;
  shippingTotal: number;
  details: ExigoOrderDetail[];
}

export interface ExigoOrderDetail {
  orderDetailId: number;
  itemCode: string;
  quantity: number;
  priceEach: number;
  priceTotal: number;
  tax: number;
  weight: number;
} 