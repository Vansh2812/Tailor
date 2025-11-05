import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function RepairWorkManager() {
  const { t } = useTranslation();

  const [repairWorks, setRepairWorks] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '' });
  const API_URL = 'https://tailor-9pdf.onrender.com/api/repairWorks';

  const fetchRepairWorks = async () => {
    try {
      const res = await axios.get(API_URL);
      setRepairWorks(res.data);
    } catch (err) {
      console.error(t('errorFetchingRepairWorks'), err);
    }
  };

  useEffect(() => {
    fetchRepairWorks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) return;

    try {
      if (editingWork) {
        const res = await axios.put(`${API_URL}/${editingWork._id}`, { name: formData.name.trim(), price });
        setRepairWorks(repairWorks.map(work => (work._id === res.data._id ? res.data : work)));
      } else {
        const res = await axios.post(API_URL, { name: formData.name.trim(), price });
        setRepairWorks([...repairWorks, res.data]);
      }
      resetForm();
    } catch (err) {
      console.error(t('errorSavingRepairWork'), err);
    }
  };

  const handleEdit = (work) => {
    setEditingWork(work);
    setFormData({ name: work.name, price: work.price.toString() });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setRepairWorks(repairWorks.filter(work => work._id !== id));
    } catch (err) {
      console.error(t('errorDeletingRepairWork'), err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '' });
    setEditingWork(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{t('repairWorkManagement')}</h2>
          <p className="text-gray-600">{t('manageRepairServices')}</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              {t('addRepairWork')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingWork ? t('editRepairWork') : t('addNewRepairWork')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('repairWorkName')}</Label>
                <Input
                  id="name"
                  placeholder={t('repairWorkPlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">{t('price')}</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="150"
                  min="1"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">{editingWork ? t('updateWork') : t('addWork')}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>{t('cancel')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('repairWorksList')}</CardTitle>
        </CardHeader>
        <CardContent>
          {repairWorks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>{t('noRepairWorks')}</p>
              <p className="text-sm">{t('clickAddRepairWork')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('workName')}</TableHead>
                  <TableHead>{t('price')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairWorks.map((work) => (
                  <TableRow key={work._id}>
                    <TableCell className="font-medium">{work.name}</TableCell>
                    <TableCell><Badge variant="secondary">₹{work.price}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(work)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(work._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
