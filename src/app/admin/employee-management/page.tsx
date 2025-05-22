
'use client';

import { useState, useEffect, type FormEvent, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Trash2, Edit, Users, ShieldAlert } from 'lucide-react';
import { Switch } from "@/components/ui/switch"
import type { ManagedEmployee } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MANAGED_EMPLOYEES_KEY = 'quoriam-managed-employees-v2';
const PERFORMANCE_KEY = 'quoriam-performanceRecords-v2';
const ATTENDANCE_KEY = 'quoriam-attendanceRecords-v2';
const SALARY_KEY = 'quoriam-salaryRecords-v2';

const allInitialStaffWithRoles: ManagedEmployee[] = [
  { employeeId: 'QE101', employeeName: 'Umar Hayat', role: 'admin', email: 'hafizkh124@gmail.com', password: '1quoriam1', phone: '03001234567', status: 'active' },
  { employeeId: 'QE102', employeeName: 'Abdullah Khubaib', role: 'manager', email: 'khubaib@quoriam.com', password: 'khubaib123', phone: '03011234567', status: 'active' },
  { employeeId: 'QE103', employeeName: 'Shoaib Ashfaq', role: 'employee', email: 'shoaib@quoriam.com', password: 'shoaib123', phone: '03021234567', status: 'active' },
  { employeeId: 'QE104', employeeName: 'Salman Karamat', role: 'employee', email: 'salman@quoriam.com', password: 'salman123', phone: '03031234567', status: 'active' },
  { employeeId: 'QE105', employeeName: 'Suraqa Zohaib', role: 'employee', email: 'suraqa@quoriam.com', password: 'suraqa123', phone: '03041234567', status: 'active' },
  { employeeId: 'QE106', employeeName: 'Bilal Karamat', role: 'employee', email: 'bilal@quoriam.com', password: 'bilal123', phone: '03051234567', status: 'active' },
  { employeeId: 'QE107', employeeName: 'Kaleemullah Qarafi', role: 'employee', email: 'kaleem@quoriam.com', password: 'kaleem123', phone: '03061234567', status: 'active' },
  { employeeId: 'QE108', employeeName: 'Arslan Mushtaq', role: 'employee', email: 'arslan@quoriam.com', password: 'arslan123', phone: '03071234567', status: 'active' },
];

const deriveInitialManagedEmployees = (): ManagedEmployee[] => {
  return [...allInitialStaffWithRoles].sort((a, b) => a.employeeName.localeCompare(b.employeeName));
};

const generateNewEmployeeId = (employees: ManagedEmployee[] | null): string => {
  const prefix = "QE";
  let maxNum = 100; // Start checking from 100
  (employees || []).forEach(emp => {
    if (emp && emp.employeeId && emp.employeeId.startsWith(prefix)) {
      const numPartString = emp.employeeId.substring(prefix.length);
      if (numPartString.length > 0) { // Ensure there's a numeric part
        const numPart = parseInt(numPartString, 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    }
  });
  return `${prefix}${maxNum + 1}`;
};

interface EmployeeFormData extends Partial<ManagedEmployee> {
  formPassword?: string;
}

export default function EmployeeManagementPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [managedEmployees, setManagedEmployees] = useState<ManagedEmployee[]>([]);
  const [isEmployeeFormDialogOpen, setIsEmployeeFormDialogOpen] = useState(false);
  const [currentEditingEmployee, setCurrentEditingEmployee] = useState<EmployeeFormData | null>(null);
  const [employeeFormMode, setEmployeeFormMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    const loadData = <T,>(key: string, setter: React.Dispatch<React.SetStateAction<T[]>>, defaultValue: T[], keyNameForLog?: string): void => {
      let loadedFromStorage = false;
      let finalData: T[] = defaultValue;
      try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
          const parsedValue = JSON.parse(storedValue);
          if (Array.isArray(parsedValue) && (key !== MANAGED_EMPLOYEES_KEY || parsedValue.length > 0)) {
            finalData = parsedValue;
            loadedFromStorage = true;
          } else if (key === MANAGED_EMPLOYEES_KEY && Array.isArray(parsedValue) && parsedValue.length === 0) {
            finalData = defaultValue;
            loadedFromStorage = false; 
          }
        }
      } catch (error) {
        console.error(`Error loading ${key} from localStorage. Using defaults. Error:`, error);
      }
      setter(finalData);
      if (keyNameForLog) {
        console.log(`${keyNameForLog} loaded from ${loadedFromStorage ? 'localStorage' : 'defaults'}. Count: ${finalData.length}`);
      }
    };
    loadData<ManagedEmployee>(MANAGED_EMPLOYEES_KEY, setManagedEmployees, deriveInitialManagedEmployees(), 'Managed Employees (Admin Page)');
  }, []);

  useEffect(() => {
    if ((managedEmployees || []).length > 0 || localStorage.getItem(MANAGED_EMPLOYEES_KEY)) {
      localStorage.setItem(MANAGED_EMPLOYEES_KEY, JSON.stringify(managedEmployees));
    }
  }, [managedEmployees]);

  const handleOpenAddEmployeeDialog = () => {
    setEmployeeFormMode('add');
    const newId = generateNewEmployeeId(managedEmployees);
    setCurrentEditingEmployee({ employeeId: newId, employeeName: '', role: 'employee', email: '', formPassword: '', phone: '', status: 'active' });
    setIsEmployeeFormDialogOpen(true);
  };

  const handleOpenEditEmployeeDialog = (employee: ManagedEmployee) => {
    setEmployeeFormMode('edit');
    setCurrentEditingEmployee({ ...employee, formPassword: '' });
    setIsEmployeeFormDialogOpen(true);
  };

  const handleSaveEmployee = (e: FormEvent) => {
    e.preventDefault();
    if (!currentEditingEmployee || !currentEditingEmployee.employeeId || !currentEditingEmployee.employeeName || !currentEditingEmployee.role || !currentEditingEmployee.email || !currentEditingEmployee.status) {
      toast({ title: "Error", description: "Employee Name, Role, Email, and Status are required.", variant: "destructive" });
      return;
    }
    if (employeeFormMode === 'add' && (!currentEditingEmployee.formPassword || currentEditingEmployee.formPassword.trim() === '')) {
      toast({ title: "Error", description: "Initial Password is required for new employees.", variant: "destructive" });
      return;
    }

    if (employeeFormMode === 'add' && (managedEmployees || []).some(emp => emp.email.toLowerCase() === currentEditingEmployee.email!.toLowerCase())) {
      toast({ title: "Error", description: `Email "${currentEditingEmployee.email}" is already in use.`, variant: "destructive" });
      return;
    }
    if (employeeFormMode === 'edit' && (managedEmployees || []).some(emp => emp.employeeId !== currentEditingEmployee.employeeId && emp.email.toLowerCase() === currentEditingEmployee.email!.toLowerCase())) {
      toast({ title: "Error", description: `Email "${currentEditingEmployee.email}" is already in use by another employee.`, variant: "destructive" });
      return;
    }

    const employeeToSave: ManagedEmployee = {
      employeeId: currentEditingEmployee.employeeId!,
      employeeName: currentEditingEmployee.employeeName!,
      role: currentEditingEmployee.role!,
      email: currentEditingEmployee.email!,
      password: currentEditingEmployee.password, 
      phone: currentEditingEmployee.phone || '',
      status: currentEditingEmployee.status!,
    };

    if (employeeFormMode === 'add') {
      if ((managedEmployees || []).some(emp => emp.employeeId === employeeToSave.employeeId)) {
        toast({ title: "Error", description: `Employee ID ${employeeToSave.employeeId} conflict. This should not happen.`, variant: "destructive" });
        return;
      }
      employeeToSave.password = currentEditingEmployee.formPassword;
      setManagedEmployees(prev => [...(prev || []), employeeToSave].sort((a, b) => a.employeeName.localeCompare(b.employeeName)));
      toast({ title: "Success", description: "New employee added." });
    } else {
      setManagedEmployees(prev => (prev || []).map(emp => {
        if (emp.employeeId === employeeToSave.employeeId) {
          const updatedEmp: ManagedEmployee = { ...emp, employeeName: employeeToSave.employeeName, role: employeeToSave.role, email: employeeToSave.email, phone: employeeToSave.phone, status: employeeToSave.status };
          if (currentEditingEmployee.formPassword && currentEditingEmployee.formPassword.trim() !== '') {
            updatedEmp.password = currentEditingEmployee.formPassword;
          }
          return updatedEmp;
        }
        return emp;
      }).sort((a, b) => a.employeeName.localeCompare(b.employeeName)));
      toast({ title: "Success", description: "Employee details updated." });
    }
    setIsEmployeeFormDialogOpen(false);
    setCurrentEditingEmployee(null);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (user?.employeeId === employeeId && user.role === 'admin') {
      toast({ title: "Cannot Delete", description: "You cannot delete your own admin account.", variant: "destructive" });
      return;
    }
    
    const performanceRecords = JSON.parse(localStorage.getItem(PERFORMANCE_KEY) || '[]') as any[];
    const attendanceRecords = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]') as any[];
    const salaryRecords = JSON.parse(localStorage.getItem(SALARY_KEY) || '[]') as any[];

    const hasRecords = performanceRecords.some(r => r.employeeId === employeeId) ||
      attendanceRecords.some(r => r.employeeId === employeeId) ||
      salaryRecords.some(r => r.employeeId === employeeId);

    if (hasRecords) {
      toast({ title: "Cannot Delete", description: "Employee has existing records (performance, attendance, or salary). Please delete their records first or reassign them.", variant: "destructive" });
      return;
    }
    if (window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      setManagedEmployees(prev => (prev || []).filter(emp => emp.employeeId !== employeeId));
      toast({ title: "Success", description: "Employee deleted." });
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Employee Management" description="Add, edit, and manage employee details, roles, and credentials.">
        <Button onClick={handleOpenAddEmployeeDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Employee
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>List of all registered employees in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeaderComponent>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeaderComponent>
            <TableBody>
              {(managedEmployees || []).map(emp => (
                <TableRow key={emp.employeeId}>
                  <TableCell>{emp.employeeId}</TableCell>
                  <TableCell>{emp.employeeName}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.phone || 'N/A'}</TableCell>
                  <TableCell>{emp.role.charAt(0).toUpperCase() + emp.role.slice(1)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="outline" size="icon" onClick={() => handleOpenEditEmployeeDialog(emp)} aria-label={`Edit ${emp.employeeName}`}><Edit className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteEmployee(emp.employeeId)} aria-label={`Delete ${emp.employeeName}`}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {(managedEmployees || []).length === 0 && (<TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-4">No employees managed yet.</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isEmployeeFormDialogOpen && currentEditingEmployee && (
        <Dialog open={isEmployeeFormDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setCurrentEditingEmployee(null); setIsEmployeeFormDialogOpen(isOpen); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>{employeeFormMode === 'add' ? 'Add New Employee' : 'Edit Employee'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSaveEmployee} className="space-y-4 py-4">
              <div>
                <Label htmlFor="empFormId">Employee ID</Label>
                <Input id="empFormId" value={currentEditingEmployee.employeeId || ''} disabled className="bg-muted/50" />
              </div>
              <div>
                <Label htmlFor="empFormName">Employee Name</Label>
                <Input id="empFormName" value={currentEditingEmployee.employeeName || ''} onChange={(e) => setCurrentEditingEmployee(prev => prev ? { ...prev, employeeName: e.target.value } : null)} required />
              </div>
              <div>
                <Label htmlFor="empFormEmail">Email</Label>
                <Input id="empFormEmail" type="email" value={currentEditingEmployee.email || ''} onChange={(e) => setCurrentEditingEmployee(prev => prev ? { ...prev, email: e.target.value } : null)} required />
              </div>
              <div>
                <Label htmlFor="empFormPhone">Phone Number</Label>
                <Input id="empFormPhone" type="tel" value={currentEditingEmployee.phone || ''} onChange={(e) => setCurrentEditingEmployee(prev => prev ? { ...prev, phone: e.target.value } : null)} placeholder="e.g., 03001234567" />
              </div>
              <div>
                <Label htmlFor="empFormPassword">
                  {employeeFormMode === 'add' ? 'Initial Password' : 'New Password (leave blank to keep current)'}
                </Label>
                <Input id="empFormPassword" type="password" value={currentEditingEmployee.formPassword || ''} onChange={(e) => setCurrentEditingEmployee(prev => prev ? { ...prev, formPassword: e.target.value } : null)} required={employeeFormMode === 'add'} placeholder={employeeFormMode === 'edit' ? 'Enter new password or leave blank' : 'Required'} />
              </div>
              <div>
                <Label htmlFor="empFormRole">Role</Label>
                <Select value={currentEditingEmployee.role || 'employee'} onValueChange={(value: 'admin' | 'manager' | 'employee') => setCurrentEditingEmployee(prev => prev ? { ...prev, role: value } : null)}>
                  <SelectTrigger id="empFormRole"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="flex items-center space-x-2">
                <Switch id="empFormStatus" checked={currentEditingEmployee.status === 'active'} onCheckedChange={(checked) => setCurrentEditingEmployee(prev => prev ? { ...prev, status: checked ? 'active' : 'inactive' } : null)} />
                <Label htmlFor="empFormStatus">
                  {currentEditingEmployee.status === 'active' ? 'Active' : 'Inactive'} Employee
                </Label>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
                <Button type="submit">Save Employee</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
