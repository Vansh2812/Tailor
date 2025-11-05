// frontend/src/components/StoreManager.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Store, Phone, MapPin } from 'lucide-react';
import axios from 'axios';

export default function StoreManager() {
  const { t } = useTranslation();

  const [stores, setStores] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({ name: '', ownerName: '', mobile: '', address: '' });

  const API_URL = 'https://tailor-9pdf.onrender.com/api/stores'; // Update with your backend URL

  // Fetch stores from backend
  const fetchStores = async () => {
    try {
      const res = await axios.get(API_URL);
      setStores(res.data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.ownerName.trim() || !formData.mobile.trim() || !formData.address.trim()) return;

    try {
      if (editingStore) {
        const res = await axios.put(`${API_URL}/${editingStore._id}`, formData);
        setStores(stores.map(store => (store._id === res.data._id ? res.data : store)));
      } else {
        const res = await axios.post(API_URL, formData);
        setStores([...stores, res.data]);
      }
      resetForm();
    } catch (err) {
      console.error('Error saving store:', err);
    }
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    setFormData({ name: store.name, ownerName: store.ownerName, mobile: store.mobile, address: store.address });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setStores(stores.filter(store => store._id !== id));
    } catch (err) {
      console.error('Error deleting store:', err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', ownerName: '', mobile: '', address: '' });
    setEditingStore(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{t('storeManagement')}</h2>
          <p className="text-gray-600">{t('storeManagementDescription')}</p>
        </div>

        {/* Add/Edit Store Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              {t('addStore')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingStore ? t('editStore') : t('addNewStore')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">{t('storeName')}</Label>
                <Input
                  id="storeName"
                  placeholder={t('storeName')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">{t('ownerName')}</Label>
                <Input
                  id="ownerName"
                  placeholder={t('ownerName')}
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">{t('mobileNumber')}</Label>
                <Input
                  id="mobile"
                  placeholder={t('mobileNumber')}
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('address')}</Label>
                <Textarea
                  id="address"
                  placeholder={t('address')}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingStore ? t('update') : t('add')} {t('storeName')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t('cancel')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Store Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <Card key={store._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-lg">{store.name}</CardTitle>
                </div>
                <Badge variant="secondary">{t('active')}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{store.ownerName}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{store.mobile}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{store.address}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(store)}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  {t('editStore')}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(store._id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {stores.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t('noStoresYet')}</p>
            <p className="text-sm text-gray-400">{t('clickAddStore')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
