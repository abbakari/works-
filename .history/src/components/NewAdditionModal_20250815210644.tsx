import React, { useState, useEffect } from 'react';
import { X, Plus, User, Package, Save, Search } from 'lucide-react';
import { apiService } from '../lib/api';

interface NewAdditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: any) => void;
}

const NewAdditionModal: React.FC<NewAdditionModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [existingCustomers, setExistingCustomers] = useState<any[]>([]);
  const [existingItems, setExistingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', code: '' });
  const [newItem, setNewItem] = useState({ name: '', code: '', category: '', brand: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load customers from API
      const customersResponse = await apiService.request('/inventory/customers/');
      if (customersResponse.error) {
        throw new Error(customersResponse.error);
      }
      
      // Load items from API
      const itemsResponse = await apiService.request('/inventory/items/');
      if (itemsResponse.error) {
        throw new Error(itemsResponse.error);
      }

      setExistingCustomers(Array.isArray(customersResponse.data) ? customersResponse.data : 
                          customersResponse.data?.results || []);
      setExistingItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : 
                      itemsResponse.data?.results || []);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setError('Failed to load data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const createNew = async (type: 'customer' | 'item', data: any) => {
    try {
      const response = await apiService.request(`/inventory/${type}s/create/`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (response.error) {
        console.error(`API Error:`, response.error);
        return null;
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`Failed to create ${type}:`, error);
      return null;
    }
  };

  const handleSubmit = async () => {
    let customerName = '';
    let itemName = '';

    if (showNewCustomer) {
      if (!newCustomer.name || !newCustomer.code) {
        alert('Please enter customer name and code');
        return;
      }
      const created = await createNew('customer', newCustomer);
      if (created) {
        customerName = created.name || created.customer_name || 'Unknown Customer';
        setExistingCustomers(prev => [...prev, created]);
      } else {
        alert('Failed to create customer');
        return;
      }
    } else {
      if (!selectedCustomer) {
        alert('Please select a customer');
        return;
      }
      const customer = existingCustomers.find(c => c.id === selectedCustomer);
      customerName = customer?.name || customer?.customer_name || '';
    }

    if (showNewItem) {
      if (!newItem.name || !newItem.code || !newItem.category || !newItem.brand) {
        alert('Please enter all item fields');
        return;
      }
      const created = await createNew('item', newItem);
      if (created) {
        itemName = created.name || created.item_name || 'Unknown Item';
        setExistingItems(prev => [...prev, created]);
      } else {
        alert('Failed to create item');
        return;
      }
        return;
      }
    } else {
      if (!selectedItem) {
        alert('Please select an item');
        return;
      }
      const item = existingItems.find(i => i.id === selectedItem);
      itemName = item?.name || item?.item_name || '';
    }

    onAdd({ customer: customerName, item: itemName });
    onClose();
    setSelectedCustomer('');
    setSelectedItem('');
    setCustomerSearch('');
    setItemSearch('');
    setShowNewCustomer(false);
    setShowNewItem(false);
    setNewCustomer({ name: '', code: '' });
    setNewItem({ name: '', code: '', category: '', brand: '' });
  };

  const filteredCustomers = existingCustomers.filter(customer =>
    (customer.name || customer.customer_name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (customer.code || customer.customer_code || '').toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredItems = existingItems.filter(item =>
    (item.name || item.item_name || '').toLowerCase().includes(itemSearch.toLowerCase()) ||
    (item.code || item.item_code || '').toLowerCase().includes(itemSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Add Customer-Item Combination</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading data...</p>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <User className="w-4 h-4 inline mr-1" />Customer
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewCustomer(!showNewCustomer)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {showNewCustomer ? 'Select Existing' : 'Create New'}
                  </button>
                </div>
                {showNewCustomer ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Customer name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer(prev => ({...prev, name: e.target.value}))}
                    />
                    <input
                      type="text"
                      placeholder="Customer code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newCustomer.code}
                      onChange={(e) => setNewCustomer(prev => ({...prev, code: e.target.value}))}
                    />
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search customers..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                      />
                    </div>
                    <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                      {filteredCustomers.map(customer => (
                        <div
                          key={customer.id}
                          className={`p-2 cursor-pointer hover:bg-gray-50 ${selectedCustomer === customer.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                          onClick={() => setSelectedCustomer(customer.id)}
                        >
                          <div className="font-medium">{customer.name || customer.customer_name || 'Unknown Customer'}</div>
                          <div className="text-sm text-gray-500">{customer.code || customer.customer_code || 'N/A'}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Package className="w-4 h-4 inline mr-1" />Item
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewItem(!showNewItem)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {showNewItem ? 'Select Existing' : 'Create New'}
                  </button>
                </div>
                {showNewItem ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Item name"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({...prev, name: e.target.value}))}
                    />
                    <input
                      type="text"
                      placeholder="Item code"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newItem.code}
                      onChange={(e) => setNewItem(prev => ({...prev, code: e.target.value}))}
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newItem.category}
                      onChange={(e) => setNewItem(prev => ({...prev, category: e.target.value}))}
                    />
                    <input
                      type="text"
                      placeholder="Brand"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newItem.brand}
                      onChange={(e) => setNewItem(prev => ({...prev, brand: e.target.value}))}
                    />
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search items..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                      />
                    </div>
                    <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                      {filteredItems.map(item => (
                        <div
                          key={item.id}
                          className={`p-2 cursor-pointer hover:bg-gray-50 ${selectedItem === item.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                          onClick={() => setSelectedItem(item.id)}
                        >
                          <div className="font-medium">{item.name || item.item_name || 'Unknown Item'}</div>
                          <div className="text-sm text-gray-500">
                            {item.code || item.item_code || 'N/A'} • {item.category || 'N/A'} • {item.brand || 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end p-6 border-t border-gray-200 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            disabled={loading}
          >
            <Save className="w-4 h-4" />
            <span>Add Combination</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAdditionModal;