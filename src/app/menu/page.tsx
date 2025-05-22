
// src/app/menu/page.tsx
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Pencil, Trash2, ShieldExclamation } from 'lucide-react';
import type { MenuItem } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MENU_ITEMS_LOCAL_STORAGE_KEY = 'quoriam-menu-items';
const MENU_CATEGORIES_LOCAL_STORAGE_KEY = 'quoriam-menu-categories';

const NO_CATEGORY_VALUE = "__no_category__";

const defaultInitialCategories = ["Chicken Items", "Beef Items", "Extras", "Beverages"];

const defaultMenuItems: MenuItem[] = [
  { id: 'default-1', name: 'Quoriam Single', price: 310, category: 'Chicken Items' },
  { id: 'default-2', name: 'Quoriam Half', price: 210, category: 'Chicken Items' },
  { id: 'default-3', name: 'Quoriam Single Choice', price: 320, category: 'Chicken Items' },
  { id: 'default-4', name: 'Quoriam Special', price: 450, category: 'Chicken Items' },
  { id: 'default-5', name: 'Quoriam Single Without Kabab', price: 270, category: 'Chicken Items' },
  { id: 'default-6', name: 'Quoriam Shami Kabab', price: 40, category: 'Extras' },
  { id: 'default-7', name: 'Quoriam Chicken Piece', price: 90, category: 'Chicken Items' },
  { id: 'default-8', name: 'Pulao Kabab without Chicken', price: 210, category: 'Beef Items' },
  { id: 'default-9', name: 'Quoriam Beef Pulao - Single', price: 350, category: 'Beef Items' },
  { id: 'default-10', name: 'Quoriam Beef Pulao - Half', price: 230, category: 'Beef Items' },
  { id: 'default-11', name: 'Quoriam Beef Pulao - 1 KG Deal', price: 690, category: 'Beef Items' },
  { id: 'default-12', name: 'Quoriam Raita', price: 30, category: 'Extras' },
  { id: 'default-13', name: 'Quoriam Salad', price: 30, category: 'Extras' },
  { id: 'default-14', name: 'Quoriam Qehwa', price: 50, category: 'Beverages' },
];

export default function MenuPage() {
  const { user } = useAuth(); // Get authenticated user
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<string | undefined>(undefined);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [editItemCategory, setEditItemCategory] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    const storedCategories = localStorage.getItem(MENU_CATEGORIES_LOCAL_STORAGE_KEY);
    if (storedCategories) {
      try {
        const parsedCategories = JSON.parse(storedCategories);
        if (Array.isArray(parsedCategories)) {
          setCategories(parsedCategories);
        } else {
          setCategories(defaultInitialCategories);
        }
      } catch (e) {
        setCategories(defaultInitialCategories);
      }
    } else {
      setCategories(defaultInitialCategories);
    }

    const storedItems = localStorage.getItem(MENU_ITEMS_LOCAL_STORAGE_KEY);
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems);
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          setMenuItems(parsedItems);
        } else {
          setMenuItems(defaultMenuItems);
        }
      } catch (e) {
         setMenuItems(defaultMenuItems);
      }
    } else {
      setMenuItems(defaultMenuItems);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (categories.length > 0 || localStorage.getItem(MENU_CATEGORIES_LOCAL_STORAGE_KEY)) {
      localStorage.setItem(MENU_CATEGORIES_LOCAL_STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (menuItems.length > 0 || localStorage.getItem(MENU_ITEMS_LOCAL_STORAGE_KEY)) {
        localStorage.setItem(MENU_ITEMS_LOCAL_STORAGE_KEY, JSON.stringify(menuItems));
    }
  }, [menuItems]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    const existingCategory = categories.find(cat => cat.toLowerCase() === newCategoryName.trim().toLowerCase());
    if (existingCategory) {
      toast({ title: "Error", description: `Category "${newCategoryName.trim()}" already exists.`, variant: "destructive" });
      return;
    }
    setCategories(prev => [...prev, newCategoryName.trim()].sort());
    setNewCategoryName('');
    toast({ title: "Success", description: `Category "${newCategoryName.trim()}" added.` });
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryToDelete}"? Items in this category will become uncategorized.`)) {
      setCategories(prev => prev.filter(cat => cat !== categoryToDelete));
      setMenuItems(prevItems =>
        prevItems.map(item =>
          item.category === categoryToDelete ? { ...item, category: undefined } : item
        )
      );
      toast({ title: "Success", description: `Category "${categoryToDelete}" deleted.` });
    }
  };

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
      category: newItemCategory,
    };
    setMenuItems(prevItems => [...prevItems, newItem]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemCategory(undefined);
    toast({ title: "Success", description: `${newItem.name} added to the menu.` });
  };

  const handleOpenEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setEditItemName(item.name);
    setEditItemPrice(item.price.toString());
    setEditItemCategory(item.category);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditItem = () => {
    if (!editingItem || !editItemName || !editItemPrice || parseFloat(editItemPrice) <= 0) {
      toast({ title: "Error", description: "Please enter a valid name and price for editing.", variant: "destructive" });
      return;
    }
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === editingItem.id ? { ...item, name: editItemName, price: parseFloat(editItemPrice), category: editItemCategory } : item
      )
    );
    setIsEditDialogOpen(false);
    setEditingItem(null);
    toast({ title: "Success", description: `${editItemName} updated successfully.` });
  };

  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = menuItems.find(item => item.id === itemId);
    if (window.confirm(`Are you sure you want to delete "${itemToDelete?.name}"?`)) {
      setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
      toast({ title: "Success", description: `Item deleted successfully.` });
    }
  };
  
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive">
          <ShieldExclamation className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to manage the menu. Please contact an administrator.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Menu & Category Management" description="Manage your restaurant's menu items and their categories." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Manage Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
              />
              <Button onClick={handleAddCategory} className="whitespace-nowrap">
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
            {categories.length > 0 ? (
              <ul className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                {categories.map(cat => (
                  <li key={cat} className="flex justify-between items-center p-1 hover:bg-muted/50 rounded">
                    <span>{cat}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat)} className="h-7 w-7">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">No categories defined yet.</p>
            )}
          </CardContent>
        </Card>

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
              <div>
                <Label htmlFor="newItemCategory">Category</Label>
                <Select
                  value={newItemCategory === undefined ? NO_CATEGORY_VALUE : newItemCategory}
                  onValueChange={(value) => setNewItemCategory(value === NO_CATEGORY_VALUE ? undefined : value)}
                >
                  <SelectTrigger id="newItemCategory">
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CATEGORY_VALUE}>Uncategorized</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    {categories.length === 0 && <p className="p-2 text-sm text-muted-foreground">No categories defined.</p>}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Current Menu Items</CardTitle>
            <CardDescription>View and manage your existing menu items.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price (PKR)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No menu items yet. Add some!</TableCell>
                  </TableRow>
                )}
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category || 'Uncategorized'}</TableCell>
                    <TableCell>{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="icon" onClick={() => handleOpenEditDialog(item)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteItem(item.id)} className="h-8 w-8">
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
              <div>
                <Label htmlFor="editItemCategory">Category</Label>
                <Select
                  value={editItemCategory === undefined ? NO_CATEGORY_VALUE : editItemCategory}
                  onValueChange={(value) => setEditItemCategory(value === NO_CATEGORY_VALUE ? undefined : value)}
                >
                  <SelectTrigger id="editItemCategory">
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value={NO_CATEGORY_VALUE}>Uncategorized</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                     {categories.length === 0 && <p className="p-2 text-sm text-muted-foreground">No categories defined.</p>}
                  </SelectContent>
                </Select>
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
