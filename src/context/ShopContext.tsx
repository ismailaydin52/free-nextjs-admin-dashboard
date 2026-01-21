'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Transaction, Debt, ShopContextType } from '@/types/shopTypes';

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('shop_products');
    const savedTransactions = localStorage.getItem('shop_transactions');
    const savedDebts = localStorage.getItem('shop_debts');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedDebts) setDebts(JSON.parse(savedDebts));

    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('shop_products', JSON.stringify(products));
    }
  }, [products, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('shop_transactions', JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('shop_debts', JSON.stringify(debts));
    }
  }, [debts, isLoaded]);

  // ============ PRODUCTS ============
  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProducts([...products, newProduct]);
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  // ============ TRANSACTIONS ============
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([...transactions, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  // ============ DEBTS ============
  const addDebt = (debt: Omit<Debt, 'id' | 'createdAt'>) => {
    const newDebt: Debt = {
      ...debt,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setDebts([...debts, newDebt]);
  };

  const deleteDebt = (id: string) => {
    setDebts(debts.filter((d) => d.id !== id));
  };

  const updateDebtStatus = (id: string, status: 'pending' | 'paid') => {
    setDebts(debts.map((d) => (d.id === id ? { ...d, status } : d)));
  };

  // ============ CALCULATED FIELDS ============
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const totalReceivables = debts
    .filter((d) => d.type === 'receivable' && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalPayables = debts
    .filter((d) => d.type === 'payable' && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const value: ShopContextType = {
    products,
    addProduct,
    deleteProduct,
    updateProduct,
    transactions,
    addTransaction,
    deleteTransaction,
    debts,
    addDebt,
    deleteDebt,
    updateDebtStatus,
    totalIncome,
    totalExpense,
    netProfit,
    totalReceivables,
    totalPayables,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextType {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
