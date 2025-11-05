import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Calendar, User, Store } from 'lucide-react';

export default function WorkAssignment() {
  const { t } = useTranslation();

  const [repairWorks, setRepairWorks] = useState([]);
  const [stores, setStores] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedRepairWorks, setSelectedRepairWorks] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');

  const API_BASE = 'https://tailor-9pdf.onrender.com/api'; // Backend URL

  // Fetch data from backend
  useEffect(() => {
    fetch(`${API_BASE}/repairWorks`)
      .then(res => res.json())
      .then(data => setRepairWorks(data))
      .catch(err => console.error(err));

    fetch(`${API_BASE}/stores`)
      .then(res => res.json())
      .then(data => setStores(data))
      .catch(err => console.error(err));

    fetch(`${API_BASE}/workOrders`)
      .then(res => res.json())
      .then(data => setWorkOrders(data))
      .catch(err => console.error(err));
  }, []);

  const addRepairWork = (repairWorkId) => {
    const repairWork = repairWorks.find(rw => rw._id === repairWorkId);
    if (repairWork && !selectedRepairWorks.find(srw => srw._id === repairWorkId)) {
      setSelectedRepairWorks([...selectedRepairWorks, repairWork]);
    }
  };

  const removeRepairWork = (repairWorkId) => {
    setSelectedRepairWorks(selectedRepairWorks.filter(rw => rw._id !== repairWorkId));
  };

  const calculateTotal = () => {
    return selectedRepairWorks.reduce((total, rw) => total + rw.price, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerName.trim() || !selectedStoreId || selectedRepairWorks.length === 0) return;

    const selectedStore = stores.find(s => s._id === selectedStoreId);
    if (!selectedStore) return;

    const newOrder = {
      customerName: customerName.trim(),
      storeId: selectedStoreId,
      storeName: selectedStore.name,
      repairWorks: selectedRepairWorks.map(rw => ({
        repairWorkId: rw._id,
        name: rw.name,
        price: rw.price
      })),
      totalAmount: calculateTotal()
    };

    try {
      const res = await fetch(`${API_BASE}/workOrders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      const savedOrder = await res.json();

      setWorkOrders([savedOrder, ...workOrders]);

      // Reset form
      setCustomerName('');
      setSelectedStoreId('');
      setSelectedRepairWorks([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{t('workAssignment')}</h2>
        <p className="text-gray-600">{t('workAssignmentDescription')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('newOrder')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">{t('customerName')}</Label>
                <Input
                  id="customerName"
                  placeholder={t('enterCustomerName')}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store">{t('selectStore')}</Label>
                <Select value={selectedStoreId} onValueChange={setSelectedStoreId} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('chooseStore')} />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map(store => (
                      <SelectItem key={store._id} value={store._id}>
                        {store.name} - {store.ownerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('addRepairWorks')}</Label>
                <Select onValueChange={addRepairWork}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectRepairWorkToAdd')} />
                  </SelectTrigger>
                  <SelectContent>
                    {repairWorks.map(work => (
                      <SelectItem key={work._id} value={work._id}>
                        {work.name} - ₹{work.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRepairWorks.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('selectedWorks')}</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedRepairWorks.map(work => (
                      <div key={work._id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{work.name} - ₹{work.price}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeRepairWork(work._id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="text-right font-semibold">
                    {t('total')}: ₹{calculateTotal()}
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!customerName.trim() || !selectedStoreId || selectedRepairWorks.length === 0}
              >
                {t('createOrder')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>{t('recentOrders')}</CardTitle>
          </CardHeader>
          <CardContent>
            {workOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t('noOrdersCreatedYet')}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {workOrders.slice(0, 5).map(order => (
                  <div key={order._id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{order.customerName}</span>
                      </div>
                      <Badge>₹{order.totalAmount}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Store className="w-4 h-4" />
                      <span>{order.storeName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {t('works')}: {order.repairWorks.map(rw => rw.name).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('allOrders')}</CardTitle>
        </CardHeader>
        <CardContent>
          {workOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>{t('noOrdersToDisplay')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('customer')}</TableHead>
                  <TableHead>{t('store')}</TableHead>
                  <TableHead>{t('works')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead className="text-right">{t('amount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map(order => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">{order.customerName}</TableCell>
                    <TableCell>{order.storeName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.repairWorks.map(rw => rw.name).join(', ')}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">₹{order.totalAmount}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
