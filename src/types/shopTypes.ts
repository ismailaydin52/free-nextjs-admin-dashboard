/**
 * Shop Types - Complete type definitions for small business management
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

export interface Debt {
  id: string;
  person: string;
  amount: number;
  type: 'receivable' | 'payable';
  status: 'pending' | 'paid';
  dueDate?: string;
  createdAt: string;
}

export interface ShopContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  deleteProduct: (id: string) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  // Debts
  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  deleteDebt: (id: string) => void;
  updateDebtStatus: (id: string, status: 'pending' | 'paid') => void;

  // Calculated fields
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  totalReceivables: number;
  totalPayables: number;
}
