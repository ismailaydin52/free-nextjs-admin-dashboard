'use client';

/**
 * Küçük İşletme Yönetimi - Ana Sayfa
 * Features: Ürün Yönetimi, Finansman Takibi, Cari Hesap Yönetimi
 * Uses React Context + localStorage for data persistence
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { Product, Transaction, Debt } from '@/types/shopTypes';

// Format date function
const formatDateDDMMYYYY = (dateString: string): string => {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};

// Confirmation dialog function
const confirmDelete = (itemName: string): boolean => {
  return window.confirm(`"${itemName}" silinecek. Emin misiniz?`);
};

// Excel export function with UTF-8 encoding
const exportToExcel = (data: any[], filename: string) => {
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map((row) =>
      Object.values(row)
        .map((val) => (typeof val === 'string' && val.includes(',') ? `"${val}"` : val))
        .join(',')
    ),
  ].join('\n');

  // UTF-8 BOM ekle - Excel'de Türkçe karakterler doğru görünsün
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as 'products' | 'finance' | 'debts' | null;
  const [activeTab, setActiveTab] = useState<'products' | 'finance' | 'debts'>('products');

  useEffect(() => {
    if (tabFromUrl && ['products', 'finance', 'debts'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const {
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
  } = useShop();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Tab Content */}
      {activeTab === 'products' && (
        <ProductsTab products={products} addProduct={addProduct} deleteProduct={deleteProduct} updateProduct={updateProduct} />
      )}
      {activeTab === 'finance' && (
        <FinanceTab
          transactions={transactions}
          addTransaction={addTransaction}
          deleteTransaction={deleteTransaction}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          netProfit={netProfit}
        />
      )}
      {activeTab === 'debts' && (
        <DebtsTab debts={debts} addDebt={addDebt} deleteDebt={deleteDebt} updateDebtStatus={updateDebtStatus} totalReceivables={totalReceivables} totalPayables={totalPayables} />
      )}
    </div>
  );
}

// ============================================================================
// ÜRÜNLER TAB COMPONENT
// ============================================================================

interface ProductsTabProps {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  deleteProduct: (id: string) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
}

function ProductsTab({ products, addProduct, deleteProduct, updateProduct }: ProductsTabProps) {
  const [formData, setFormData] = useState({ name: '', category: '', stock: '', price: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = !filterCategory || p.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, filterCategory]);

  const categories = [...new Set(products.map((p) => p.category))];

  const handleExportProducts = () => {
    if (filteredProducts.length === 0) {
      alert('Dışa aktarılacak ürün yok');
      return;
    }
    const exportData = filteredProducts.map((p) => ({
      'Ürün Adı': p.name,
      'Kategori': p.category,
      'Stok': p.stock,
      'Fiyat (₺)': p.price.toFixed(2),
      'Oluşturma Tarihi': p.createdAt.split('T')[0],
    }));
    exportToExcel(exportData, 'urunler');
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.stock || !formData.price) {
      alert('Lütfen tüm alanları doldurunuz');
      return;
    }

    addProduct({
      name: formData.name,
      category: formData.category,
      stock: parseInt(formData.stock),
      price: parseFloat(formData.price),
    });

    setFormData({ name: '', category: '', stock: '', price: '' });
  };

  const handleStockChange = (id: string, newStock: number) => {
    updateProduct(id, { stock: newStock });
  };

  return (
    <div className="space-y-6">
      {/* Add Product Form */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">➕ Yeni Ürün Ekle</h2>
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Ürün Adı"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Kategori"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          <input
            type="number"
            placeholder="Stok Miktarı"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Fiyat (₺)"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            Ekle
          </button>
        </form>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🔍 Arama</label>
            <input
              type="text"
              placeholder="Ürün adı veya kategori ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🏷️ Kategori Filtresi</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="">Tümü</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExportProducts}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            📊 Excel'e Aktar
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-blue-500">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-lg font-bold text-white">📦 Ürün Listesi ({filteredProducts.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 border-b-2 border-blue-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-900">Ürün Adı</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-900">Kategori</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-900">Stok</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-900">Fiyat</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-900">Durum</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-blue-900">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg">Ürün bulunamadı</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={product.stock}
                        onChange={(e) => handleStockChange(product.id, parseInt(e.target.value))}
                        className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-center font-semibold"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">₺{product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {product.stock < 5 ? (
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          ⚠️ Az Stok
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          ✓ Stokta
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          if (confirmDelete(product.name)) {
                            deleteProduct(product.id);
                          }
                        }}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-bold text-lg"
                        title="Ürünü sil"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FINANSMAN TAB COMPONENT
// ============================================================================

interface FinanceTabProps {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}

function FinanceTab({
  transactions,
  addTransaction,
  deleteTransaction,
  totalIncome,
  totalExpense,
  netProfit,
}: FinanceTabProps) {
  const [formData, setFormData] = useState<{ type: 'income' | 'expense'; amount: string; description: string }>({ 
    type: 'income', 
    amount: '', 
    description: '' 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === 'all' || t.type === filterType;
      return matchSearch && matchType;
    });
  }, [transactions, searchQuery, filterType]);

  const handleExportTransactions = () => {
    if (filteredTransactions.length === 0) {
      alert('Dışa aktarılacak işlem yok');
      return;
    }
    const exportData = filteredTransactions.map((t) => ({
      'Tür': t.type === 'income' ? 'Gelir' : 'Gider',
      'Açıklama': t.description,
      'Miktar (₺)': t.amount.toFixed(2),
      'Tarih': t.date,
    }));
    exportToExcel(exportData, 'islemler');
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      alert('Lütfen miktar ve açıklama giriniz');
      return;
    }

    addTransaction({
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: new Date().toISOString().split('T')[0],
    });

    setFormData({ type: 'income', amount: '', description: '' });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-8 text-white">
          <p className="text-green-100 text-sm font-semibold">Toplam Gelir</p>
          <p className="text-4xl font-bold mt-4">₺{totalIncome.toFixed(2)}</p>
          <p className="text-green-100 text-xs mt-2">Son işlem kaydı</p>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg p-8 text-white">
          <p className="text-red-100 text-sm font-semibold">Toplam Gider</p>
          <p className="text-4xl font-bold mt-4">₺{totalExpense.toFixed(2)}</p>
          <p className="text-red-100 text-xs mt-2">Son işlem kaydı</p>
        </div>
        <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-blue-400 to-blue-600' : 'from-orange-400 to-orange-600'} rounded-xl shadow-lg p-8 text-white`}>
          <p className="text-blue-100 text-sm font-semibold">Net Bakiye</p>
          <p className="text-4xl font-bold mt-4">₺{netProfit.toFixed(2)}</p>
          <p className={`text-xs mt-2 ${netProfit >= 0 ? 'text-blue-100' : 'text-orange-100'}`}>
            {netProfit >= 0 ? '✓ Pozitif' : '⚠️ Negatif'}
          </p>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">➕ İşlem Kaydet</h2>
        <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors font-semibold"
          >
            <option value="income">📈 Gelir</option>
            <option value="expense">📉 Gider</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Miktar (₺)"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Açıklama"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            Ekle
          </button>
        </form>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🔍 Arama</label>
            <input
              type="text"
              placeholder="İşlem açıklaması ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📊 Tür Filtresi</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="all">Tümü</option>
              <option value="income">📈 Gelir</option>
              <option value="expense">📉 Gider</option>
            </select>
          </div>
          <button
            onClick={handleExportTransactions}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            📊 Excel'e Aktar
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-green-500">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h3 className="text-lg font-bold text-white">💳 İşlem Geçmişi ({filteredTransactions.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-50 border-b-2 border-green-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-green-900">Tür</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-green-900">Açıklama</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-green-900">Miktar</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-green-900">Tarih</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-green-900">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg">İşlem bulunamadı</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-200 hover:bg-green-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.type === 'income' ? '📈 Gelir' : '📉 Gider'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{transaction.description}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'income' ? '+' : '-'}₺{transaction.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{transaction.date}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          if (confirmDelete(`${transaction.description} (₺${transaction.amount})`)) {
                            deleteTransaction(transaction.id);
                          }
                        }}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-bold text-lg"
                        title="İşlemi sil"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CARİ HESAP TAB COMPONENT
// ============================================================================

interface DebtsTabProps {
  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  deleteDebt: (id: string) => void;
  updateDebtStatus: (id: string, status: 'pending' | 'paid') => void;
  totalReceivables: number;
  totalPayables: number;
}

function DebtsTab({
  debts,
  addDebt,
  deleteDebt,
  updateDebtStatus,
  totalReceivables,
  totalPayables,
}: DebtsTabProps) {
  const [formData, setFormData] = useState<{
    person: string;
    amount: string;
    type: 'receivable' | 'payable';
    dueDate: string;
  }>({
    person: '',
    amount: '',
    type: 'receivable',
    dueDate: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDebtType, setFilterDebtType] = useState<'all' | 'receivable' | 'payable'>('all');

  const receivables = debts.filter((d) => d.type === 'receivable');
  const payables = debts.filter((d) => d.type === 'payable');

  const filteredReceivables = useMemo(() => {
    return receivables.filter((d) => d.person.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [receivables, searchQuery]);

  const filteredPayables = useMemo(() => {
    return payables.filter((d) => d.person.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [payables, searchQuery]);

  const handleExportDebts = () => {
    const dataToExport = filterDebtType === 'all' 
      ? [...filteredReceivables, ...filteredPayables]
      : filterDebtType === 'receivable' 
      ? filteredReceivables 
      : filteredPayables;

    if (dataToExport.length === 0) {
      alert('Dışa aktarılacak borç yok');
      return;
    }

    const exportData = dataToExport.map((d) => ({
      'Kişi': d.person,
      'Miktar (₺)': d.amount.toFixed(2),
      'Tür': d.type === 'receivable' ? 'Alacak' : 'Borç',
      'Durum': d.status === 'pending' ? 'Ödenmedi' : 'Ödendi',
      'Vade Tarihi': d.dueDate || '-',
    }));
    exportToExcel(exportData, 'borçlar');
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.person || !formData.amount) {
      alert('Lütfen kişi adı ve miktar giriniz');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    addDebt({
      person: formData.person,
      amount: parseFloat(formData.amount),
      type: formData.type,
      status: 'pending',
      dueDate: today,
    });

    setFormData({ person: '', amount: '', type: 'receivable', dueDate: '' });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-8 text-white">
          <p className="text-green-100 text-sm font-semibold">Alacaklar</p>
          <p className="text-4xl font-bold mt-4">₺{totalReceivables.toFixed(2)}</p>
          <p className="text-green-100 text-xs mt-2">{receivables.filter((d) => d.status === 'pending').length} beklemede</p>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg p-8 text-white">
          <p className="text-red-100 text-sm font-semibold">Borçlar</p>
          <p className="text-4xl font-bold mt-4">₺{totalPayables.toFixed(2)}</p>
          <p className="text-red-100 text-xs mt-2">{payables.filter((d) => d.status === 'pending').length} beklemede</p>
        </div>
      </div>

      {/* Add Debt Form */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-red-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">➕ Borç/Alacak Ekle</h2>
        <form onSubmit={handleAddDebt} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Kişi Adı"
            value={formData.person}
            onChange={(e) => setFormData({ ...formData, person: e.target.value })}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Miktar (₺)"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'receivable' | 'payable' })}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors font-semibold"
          >
            <option value="receivable">👤 O Bana Borçlu</option>
            <option value="payable">👤 Ben Ona Borçluyum</option>
          </select>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            Ekle
          </button>
        </form>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🔍 Arama</label>
            <input
              type="text"
              placeholder="Kişi adı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🏷️ Tür Filtresi</label>
            <select
              value={filterDebtType}
              onChange={(e) => setFilterDebtType(e.target.value as 'all' | 'receivable' | 'payable')}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="all">Tümü</option>
              <option value="receivable">👤 Alacaklar</option>
              <option value="payable">👤 Borçlar</option>
            </select>
          </div>
          <button
            onClick={handleExportDebts}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            📊 Excel'e Aktar
          </button>
        </div>
      </div>

      {/* Debts and Receivables Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receivables */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-green-500">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white">👤 Bana Ödenen Borçlar ({filteredReceivables.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50 border-b-2 border-green-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-900">Kişi</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-900">Miktar</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-900">Tarih</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green-900">Durum</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-green-900">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceivables.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      Alacak bulunamadı
                    </td>
                  </tr>
                ) : (
                  filteredReceivables.map((debt) => (
                    <tr key={debt.id} className="border-b border-gray-200 hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{debt.person}</td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">₺{debt.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDateDDMMYYYY(debt.dueDate || '')}</td>
                      <td className="px-6 py-4">
                        {debt.status === 'pending' ? (
                          <button
                            onClick={() => updateDebtStatus(debt.id, 'paid')}
                            className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors cursor-pointer"
                          >
                            ⏳ Ödenmedi
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            ✓ Ödendi
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            if (confirmDelete(`${debt.person} - Alacak (₺${debt.amount})`)) {
                              deleteDebt(debt.id);
                            }
                          }}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-bold text-lg"
                          title="Borcu sil"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payables */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-red-500">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white">👤 Ödememiz Gereken Borçlar ({filteredPayables.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-50 border-b-2 border-red-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-red-900">Kişi</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-red-900">Miktar</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-red-900">Tarih</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-red-900">Durum</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-red-900">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayables.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      Borç bulunamadı
                    </td>
                  </tr>
                ) : (
                  filteredPayables.map((debt) => (
                    <tr key={debt.id} className="border-b border-gray-200 hover:bg-red-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{debt.person}</td>
                      <td className="px-6 py-4 text-sm font-bold text-red-600">₺{debt.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDateDDMMYYYY(debt.dueDate || '')}</td>
                      <td className="px-6 py-4">
                        {debt.status === 'pending' ? (
                          <button
                            onClick={() => updateDebtStatus(debt.id, 'paid')}
                            className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors cursor-pointer"
                          >
                            ⏳ Ödenmedi
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            ✓ Ödendi
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            if (confirmDelete(`${debt.person} - Borç (₺${debt.amount})`)) {
                              deleteDebt(debt.id);
                            }
                          }}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-bold text-lg"
                          title="Borcu sil"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
