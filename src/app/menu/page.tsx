// src/app/menu/page.tsx
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import type { MenuItem } from '@/types';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'quoriam-menu-items';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedItems) {
      setMenuItems(JSON.parse(storedItems));
    }
  }, []);

  useEffect(() => {
    if (menuItems.length > 0 || localStorage.getItem(LOCAL_STORAGE_KEY)) { // Avoid overwriting with empty on initial load if nothing found yet
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(menuItems));
    }
  }, [menuItems]);

  const handleAddNewItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice || parseFloat(newItemPrice) <= 0) {
      toast({ title: "Error", description: "Please enter a valid name and price.", variant: "destructive" });
      return;
    }
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: newItemName,
      price: parseFloat(newItemPrice),
    };
    setMenuItems(prevItems => [...prevItems, newItem]);
    setNewItemName('');
    setNewItemPrice('');
    toast({ title: "Success", description: `${newItem.name} added to the menu.` });
  };

  const handleOpenEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setEditItemName(item.name);
    setEditItemPrice(item.price.toString());
    setIsEditDialogOpen(true);
  };

  const handleSaveEditItem = () => {
    if (!editingItem || !editItemName || !editItemPrice || parseFloat(editItemPrice) <= 0) {
      toast({ title: "Error", description: "Please enter a valid name and price for editing.", variant: "destructive" });
      return;
    }
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === editingItem.id ? { ...item, name: editItemName, price: parseFloat(editItemPrice) } : item
      )
    );
    setIsEditDialogOpen(false);
    setEditingItem(null);
    toast({ title: "Success", description: `${editItemName} updated successfully.` });
  };

  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = menuItems.find(item => item.id === itemId);
    if (confirm(`Are you sure you want to delete "${itemToDelete?.name}"?`)) {
      setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
      toast({ title: "Success", description: `Item deleted successfully.` });
    }
  };

  return (
    <>
      <PageHeader title="Menu Management" description="Add, edit, or delete your restaurant's menu items." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Add New Menu Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddNewItem} className="space-y-4">
              <div>
                <Label htmlFor="newItemName">Item Name</Label>
                <Input id="newItemName" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g., Chicken Biryani" />
              </div>
              <div>
                <Label htmlFor="newItemPrice">Price (PKR)</Label>
                <Input id="newItemPrice" type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="e.g., 250" min="0" step="0.01" />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Menu Items</CardTitle>
            <CardDescription>View and manage your existing menu items.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price (PKR)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No menu items yet. Add some!</TableCell>
                  </TableRow>
                )}
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleOpenEditDialog(item)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {editingItem && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Menu Item: {editingItem.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="editItemName">Item Name</Label>
                <Input id="editItemName" value={editItemName} onChange={(e) => setEditItemName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="editItemPrice">Price (PKR)</Label>
                <Input id="editItemPrice" type="number" value={editItemPrice} onChange={(e) => setEditItemPrice(e.target.value)} min="0" step="0.01"/>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveEditItem}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
