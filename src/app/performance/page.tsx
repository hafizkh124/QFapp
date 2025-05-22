
'use client';

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { EmployeePerformance, EmployeeAttendance, EmployeeSalary, ManagedEmployee } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PlusCircle, Trash2, CalendarIcon, Edit, Users, ShieldAlert } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// LocalStorage Keys
const MANAGED_EMPLOYEES_KEY = 'quoriam-managed-employees-v2';
const PERFORMANCE_KEY = 'quoriam-performanceRecords-v2';
const ATTENDANCE_KEY = 'quoriam-attendanceRecords-v2';
const SALARY_KEY = 'quoriam-salaryRecords-v2';

const allInitialStaffWithRoles: ManagedEmployee[] = [
  { employeeId: 'QE101', employeeName: 'Umar Hayat', role: 'admin', email: 'hafizkh124@gmail.com', password: '1quoriam1' },
  { employeeId: 'QE102', employeeName: 'Abdullah Khubaib', role: 'employee', email: 'khubaib@quoriam.com', password: 'khubaib123' },
  { employeeId: 'QE103', employeeName: 'Shoaib Ashfaq', role: 'employee', email: 'shoaib@quoriam.com', password: 'shoaib123' },
  { employeeId: 'QE104', employeeName: 'Salman Karamat', role: 'employee', email: 'salman@quoriam.com', password: 'salman123' },
  { employeeId: 'QE105', employeeName: 'Suraqa Zohaib', role: 'employee', email: 'suraqa@quoriam.com', password: 'suraqa123' },
  { employeeId: 'QE106', employeeName: 'Bilal Karamat', role: 'employee', email: 'bilal@quoriam.com', password: 'bilal123' },
  { employeeId: 'QE107', employeeName: 'Kaleemullah Qarafi', role: 'employee', email: 'kaleem@quoriam.com', password: 'kaleem123' },
  { employeeId: 'QE108', employeeName: 'Arslan Mushtaq', role: 'employee', email: 'arslan@quoriam.com', password: 'arslan123' },
];

// Expanded mock data to include more employees by default
const initialMockPerformance: EmployeePerformance[] = allInitialStaffWithRoles.slice(0, 5).map((emp, index) => ({
  id: `P00${index + 1}`, employeeId: emp.employeeId, employeeName: emp.employeeName, role: emp.role, date: format(new Date(Date.now() - (index * 86400000)), 'yyyy-MM-dd'), salesTarget: 500 - (index * 50), salesAchieved: 480 - (index * 50), tasksCompleted: 8 - index, tasksAssigned: 10 - index
}));

const initialMockAttendance: EmployeeAttendance[] = allInitialStaffWithRoles.slice(0, 5).map((emp, index) => ({
  id: `A00${index + 1}`, employeeId: emp.employeeId, employeeName: emp.employeeName, role: emp.role, date: format(new Date(Date.now() - (index * 86400000)), 'yyyy-MM-dd'), inTime: `09:0${index} AM`, outTime: `05:0${index} PM`, status: 'Present'
}));
initialMockAttendance.push({ id: 'A00X', employeeId: 'QE102', employeeName: 'Abdullah Khubaib', role: 'employee', date: format(new Date(Date.now() - (6 * 86400000)), 'yyyy-MM-dd'), status: 'Leave' });


const initialMockSalaries: EmployeeSalary[] = allInitialStaffWithRoles.slice(0, 4).map((emp, index) => ({
  id: `S00${index + 1}`, employeeId: emp.employeeId, employeeName: emp.employeeName, role: emp.role, month: format(new Date(new Date().getFullYear(), new Date().getMonth() - index, 1), 'yyyy-MM'), basicSalary: emp.role === 'admin' ? 50000 : 30000 - (index * 1000), advances: emp.role === 'admin' ? 5000 : 2000, bonuses: emp.role === 'admin' ? 3000 : 1500, deductions: 500, netSalary: (emp.role === 'admin' ? 50000 : 30000 - (index * 1000)) + (emp.role === 'admin' ? 3000 : 1500) - (emp.role === 'admin' ? 5000 : 2000) - 500
}));


const deriveInitialManagedEmployees = (): ManagedEmployee[] => {
  return [...allInitialStaffWithRoles].sort((a, b) => a.employeeName.localeCompare(b.employeeName));
};

const generateNewEmployeeId = (employees: ManagedEmployee[] | null): string => {
  const prefix = "QE";
  let maxNum = 100; // Start checking from QE100
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


interface RecordFormDataBase {
  selectedEmployeeId?: string;
  date?: Date;
}
interface PerformanceFormData extends RecordFormDataBase {
  salesTarget?: number;
  salesAchieved?: number;
  tasksCompleted?: number;
  tasksAssigned?: number;
}
interface AttendanceFormData extends RecordFormDataBase {
  inTime?: string;
  outTime?: string;
  status?: 'Present' | 'Absent' | 'Leave';
}
interface SalaryFormData extends Omit<RecordFormDataBase, 'date'> {
  month?: string; // e.g., "YYYY-MM"
  basicSalary?: number;
  advances?: number;
  bonuses?: number;
  deductions?: number;
}


export default function PerformancePage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [managedEmployees, setManagedEmployees] = useState<ManagedEmployee[]>([]);
  const [performanceRecords, setPerformanceRecords] = useState<EmployeePerformance[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<EmployeeAttendance[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<EmployeeSalary[]>([]);

  const [isManageEmployeesDialogOpen, setIsManageEmployeesDialogOpen] = useState(false);
  const [isEmployeeFormDialogOpen, setIsEmployeeFormDialogOpen] = useState(false);
  const [currentEditingEmployee, setCurrentEditingEmployee] = useState<Partial<ManagedEmployee> | null>(null); // Partial for new employee
  const [employeeFormMode, setEmployeeFormMode] = useState<'add' | 'edit'>('add');

  const [isAddPerformanceDialogOpen, setIsAddPerformanceDialogOpen] = useState(false);
  const [isAddAttendanceDialogOpen, setIsAddAttendanceDialogOpen] = useState(false);
  const [isAddSalaryDialogOpen, setIsAddSalaryDialogOpen] = useState(false);

  const [performanceFormData, setPerformanceFormData] = useState<PerformanceFormData>({});
  const [attendanceFormData, setAttendanceFormData] = useState<AttendanceFormData>({});
  const [salaryFormData, setSalaryFormData] = useState<SalaryFormData>({});

  useEffect(() => {
    const loadData = <T,>(key: string, setter: React.Dispatch<React.SetStateAction<T[]>>, defaultValue: T[], keyNameForLog?: string): void => {
      let loadedFromStorage = false;
      let finalData = defaultValue;
      try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
          const parsedValue = JSON.parse(storedValue);
          // For managed employees, if localStorage has an empty array, still use defaults to ensure dropdowns are populated.
          if (key === MANAGED_EMPLOYEES_KEY && Array.isArray(parsedValue) && parsedValue.length === 0) {
            finalData = defaultValue; // Keep default if stored is empty for managed employees
            loadedFromStorage = false; // Treat as loaded from defaults
          } else if (Array.isArray(parsedValue)) {
            finalData = parsedValue;
            loadedFromStorage = true;
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
    loadData<ManagedEmployee>(MANAGED_EMPLOYEES_KEY, setManagedEmployees, deriveInitialManagedEmployees(), 'Managed Employees');
    loadData<EmployeePerformance>(PERFORMANCE_KEY, setPerformanceRecords, initialMockPerformance, 'Performance Records');
    loadData<EmployeeAttendance>(ATTENDANCE_KEY, setAttendanceRecords, initialMockAttendance, 'Attendance Records');
    loadData<EmployeeSalary>(SALARY_KEY, setSalaryRecords, initialMockSalaries, 'Salary Records');
  }, []);

  useEffect(() => { if ((managedEmployees || []).length > 0 || localStorage.getItem(MANAGED_EMPLOYEES_KEY)) localStorage.setItem(MANAGED_EMPLOYEES_KEY, JSON.stringify(managedEmployees)); }, [managedEmployees]);
  useEffect(() => { if ((performanceRecords || []).length > 0 || localStorage.getItem(PERFORMANCE_KEY)) localStorage.setItem(PERFORMANCE_KEY, JSON.stringify(performanceRecords)); }, [performanceRecords]);
  useEffect(() => { if ((attendanceRecords || []).length > 0 || localStorage.getItem(ATTENDANCE_KEY)) localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendanceRecords)); }, [attendanceRecords]);
  useEffect(() => { if ((salaryRecords || []).length > 0 || localStorage.getItem(SALARY_KEY)) localStorage.setItem(SALARY_KEY, JSON.stringify(salaryRecords)); }, [salaryRecords]);


  const handleOpenAddEmployeeDialog = () => {
    setEmployeeFormMode('add');
    const newId = generateNewEmployeeId(managedEmployees);
    setCurrentEditingEmployee({ employeeId: newId, employeeName: '', role: 'employee', email: '', password: '' });
    setIsEmployeeFormDialogOpen(true);
  };

  const handleOpenEditEmployeeDialog = (employee: ManagedEmployee) => {
    setEmployeeFormMode('edit');
    setCurrentEditingEmployee({ ...employee }); // Don't include password for editing form display
    setIsEmployeeFormDialogOpen(true);
  };

  const handleSaveEmployee = (e: FormEvent) => {
    e.preventDefault();
    if (!currentEditingEmployee || !currentEditingEmployee.employeeId || !currentEditingEmployee.employeeName || !currentEditingEmployee.role || !currentEditingEmployee.email) {
      toast({ title: "Error", description: "Employee Name, Role, and Email are required.", variant: "destructive" });
      return;
    }
    if (employeeFormMode === 'add' && !currentEditingEmployee.password) {
        toast({ title: "Error", description: "Initial Password is required for new employees.", variant: "destructive" });
        return;
    }
    // Ensure email uniqueness for new employees
    if (employeeFormMode === 'add' && (managedEmployees || []).some(emp => emp.email.toLowerCase() === currentEditingEmployee.email?.toLowerCase())) {
        toast({ title: "Error", description: `Email "${currentEditingEmployee.email}" is already in use.`, variant: "destructive" });
        return;
    }
    // Ensure email uniqueness when editing (if email was changed)
    if (employeeFormMode === 'edit' && (managedEmployees || []).some(emp => emp.employeeId !== currentEditingEmployee.employeeId && emp.email.toLowerCase() === currentEditingEmployee.email?.toLowerCase())) {
        toast({ title: "Error", description: `Email "${currentEditingEmployee.email}" is already in use by another employee.`, variant: "destructive" });
        return;
    }


    const employeeToSave: ManagedEmployee = {
        employeeId: currentEditingEmployee.employeeId!,
        employeeName: currentEditingEmployee.employeeName!,
        role: currentEditingEmployee.role!,
        email: currentEditingEmployee.email!,
        password: employeeFormMode === 'add' ? currentEditingEmployee.password : undefined, // Only set password on add
    };


    if (employeeFormMode === 'add') {
      if ((managedEmployees || []).some(emp => emp.employeeId === employeeToSave.employeeId)) {
        toast({ title: "Error", description: `Employee ID ${employeeToSave.employeeId} conflict. This should not happen.`, variant: "destructive" });
        return;
      }
      setManagedEmployees(prev => [...(prev || []), { ...employeeToSave, password: currentEditingEmployee.password }].sort((a, b) => a.employeeName.localeCompare(b.employeeName)));
      toast({ title: "Success", description: "New employee added." });
    } else { // 'edit' mode
      setManagedEmployees(prev => (prev || []).map(emp =>
        emp.employeeId === employeeToSave.employeeId
          ? { ...emp, employeeName: employeeToSave.employeeName, role: employeeToSave.role, email: employeeToSave.email } // Keep existing password if not changed
          : emp
      ).sort((a, b) => a.employeeName.localeCompare(b.employeeName)));

      const updateRecordEmployeeDetails = <T extends { employeeId: string; employeeName: string; role: string }>(records: T[]): T[] => {
        return (records || []).map(rec =>
          rec.employeeId === employeeToSave.employeeId
            ? { ...rec, employeeName: employeeToSave.employeeName!, role: employeeToSave.role! }
            : rec
        );
      };
      setPerformanceRecords(prev => updateRecordEmployeeDetails(prev));
      setAttendanceRecords(prev => updateRecordEmployeeDetails(prev));
      setSalaryRecords(prev => updateRecordEmployeeDetails(prev));
      toast({ title: "Success", description: "Employee details updated." });
    }
    setIsEmployeeFormDialogOpen(false);
    setCurrentEditingEmployee(null);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (user?.employeeId === employeeId && user.role === 'admin') {
      toast({ title: "Cannot Delete", description: "You cannot delete your own admin account.", variant: "destructive"});
      return;
    }

    const hasRecords = (performanceRecords || []).some(r => r.employeeId === employeeId) ||
      (attendanceRecords || []).some(r => r.employeeId === employeeId) ||
      (salaryRecords || []).some(r => r.employeeId === employeeId);
    if (hasRecords) {
      toast({ title: "Cannot Delete", description: "Employee has existing records. Please delete their records first or reassign them.", variant: "destructive" });
      return;
    }
    if (window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      setManagedEmployees(prev => (prev || []).filter(emp => emp.employeeId !== employeeId));
      toast({ title: "Success", description: "Employee deleted." });
    }
  };

  const handleRecordFormInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    formType: 'performance' | 'attendance' | 'salary'
  ) => {
    const { name, value } = e.target;
    const setter = formType === 'performance' ? setPerformanceFormData : formType === 'attendance' ? setAttendanceFormData : setSalaryFormData;
    setter(prev => ({ ...prev, [name]: name.includes('Target') || name.includes('Achieved') || name.includes('Completed') || name.includes('Assigned') || name.includes('Salary') || name.includes('advances') || name.includes('bonuses') || name.includes('deductions') ? parseFloat(value) || 0 : value }));
  };

  const handleRecordFormSelectChange = (
    value: string, name: string,
    formType: 'performance' | 'attendance' | 'salary'
  ) => {
    const setter = formType === 'performance' ? setPerformanceFormData : formType === 'attendance' ? setAttendanceFormData : setSalaryFormData;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const handleRecordDateChange = (date: Date | undefined, name: string, formType: 'performance' | 'attendance') => {
    const setter = formType === 'performance' ? setPerformanceFormData : setAttendanceFormData;
    setter(prev => ({ ...prev, [name]: date }));
  };

  const handleAddPerformanceRecord = (e: FormEvent) => {
    e.preventDefault();
    const selectedEmp = (managedEmployees || []).find(emp => emp.employeeId === performanceFormData.selectedEmployeeId);
    if (!selectedEmp || !performanceFormData.date) {
      toast({ title: "Error", description: "Employee and Date are required.", variant: "destructive" });
      return;
    }
    const newRecord: EmployeePerformance = {
      id: `P${Date.now()}`,
      employeeId: selectedEmp.employeeId,
      employeeName: selectedEmp.employeeName,
      role: selectedEmp.role,
      date: format(performanceFormData.date, 'yyyy-MM-dd'),
      salesTarget: performanceFormData.salesTarget || 0,
      salesAchieved: performanceFormData.salesAchieved || 0,
      tasksCompleted: performanceFormData.tasksCompleted || 0,
      tasksAssigned: performanceFormData.tasksAssigned || 0,
    };
    setPerformanceRecords(prev => [newRecord, ...(prev || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsAddPerformanceDialogOpen(false);
    setPerformanceFormData({ date: new Date() });
    toast({ title: "Success", description: "Performance record added." });
  };

  const handleDeletePerformanceRecord = (id: string) => {
    if (window.confirm("Are you sure you want to delete this performance record?")) {
      setPerformanceRecords(prev => (prev || []).filter(record => record.id !== id));
      toast({ title: "Success", description: "Performance record deleted." });
    }
  };

  const handleAddAttendanceRecord = (e: FormEvent) => {
    e.preventDefault();
    const selectedEmp = (managedEmployees || []).find(emp => emp.employeeId === attendanceFormData.selectedEmployeeId);
    if (!selectedEmp || !attendanceFormData.date || !attendanceFormData.status) {
      toast({ title: "Error", description: "Employee, Date, and Status are required.", variant: "destructive" });
      return;
    }
    const newRecord: EmployeeAttendance = {
      id: `A${Date.now()}`,
      employeeId: selectedEmp.employeeId,
      employeeName: selectedEmp.employeeName,
      role: selectedEmp.role,
      date: format(attendanceFormData.date, 'yyyy-MM-dd'),
      inTime: attendanceFormData.inTime,
      outTime: attendanceFormData.outTime,
      status: attendanceFormData.status,
    };
    setAttendanceRecords(prev => [newRecord, ...(prev || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsAddAttendanceDialogOpen(false);
    setAttendanceFormData({ date: new Date() });
    toast({ title: "Success", description: "Attendance record added." });
  };

  const handleDeleteAttendanceRecord = (id: string) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      setAttendanceRecords(prev => (prev || []).filter(record => record.id !== id));
      toast({ title: "Success", description: "Attendance record deleted." });
    }
  };

  const handleAddSalaryRecord = (e: FormEvent) => {
    e.preventDefault();
    const selectedEmp = (managedEmployees || []).find(emp => emp.employeeId === salaryFormData.selectedEmployeeId);
    if (!selectedEmp || !salaryFormData.month || salaryFormData.basicSalary === undefined) {
      toast({ title: "Error", description: "Employee, Month, and Basic Salary are required.", variant: "destructive" });
      return;
    }
    const basicSalary = salaryFormData.basicSalary || 0;
    const advances = salaryFormData.advances || 0;
    const bonuses = salaryFormData.bonuses || 0;
    const deductions = salaryFormData.deductions || 0;
    const netSalary = basicSalary + bonuses - advances - deductions;

    const newRecord: EmployeeSalary = {
      id: `S${Date.now()}`,
      employeeId: selectedEmp.employeeId,
      employeeName: selectedEmp.employeeName,
      role: selectedEmp.role,
      month: salaryFormData.month,
      basicSalary,
      advances,
      bonuses,
      deductions,
      netSalary,
    };
    setSalaryRecords(prev => [newRecord, ...(prev || [])].sort((a, b) => new Date(b.month + '-01').getTime() - new Date(a.month + '-01').getTime()));
    setIsAddSalaryDialogOpen(false);
    setSalaryFormData({ month: format(new Date(), 'yyyy-MM') });
    toast({ title: "Success", description: "Salary record added." });
  };

  const handleDeleteSalaryRecord = (id: string) => {
    if (window.confirm("Are you sure you want to delete this salary record?")) {
      setSalaryRecords(prev => (prev || []).filter(record => record.id !== id));
      toast({ title: "Success", description: "Salary record deleted." });
    }
  };

  const openRecordDialog = (setter: React.Dispatch<React.SetStateAction<boolean>>, formSetter: any, initialData: Partial<PerformanceFormData | AttendanceFormData | SalaryFormData> = {}) => {
    const defaultDate = new Date();
    let dataToSet: Partial<PerformanceFormData | AttendanceFormData | SalaryFormData> = { ...initialData };

    if (user?.role === 'employee' && user.employeeId) {
      dataToSet = { ...dataToSet, selectedEmployeeId: user.employeeId };
    }

    if (!initialData.hasOwnProperty('date') && !initialData.hasOwnProperty('month')) {
      dataToSet = { ...dataToSet, date: defaultDate };
    } else if (initialData.hasOwnProperty('month') && !initialData.hasOwnProperty('date') && !initialData['month']) {
      dataToSet = { ...dataToSet, month: format(defaultDate, 'yyyy-MM') };
    }
    formSetter(dataToSet);
    setter(true);
  };

  const userPerformanceRecords = useMemo(() => {
    if (!user) return [];
    if (user.role === 'employee') {
      return (performanceRecords || []).filter(r => r.employeeId === user.employeeId);
    }
    return performanceRecords || [];
  }, [performanceRecords, user]);

  const userAttendanceRecords = useMemo(() => {
    if (!user) return [];
    if (user.role === 'employee') {
      return (attendanceRecords || []).filter(r => r.employeeId === user.employeeId);
    }
    return attendanceRecords || [];
  }, [attendanceRecords, user]);

  const userSalaryRecords = useMemo(() => {
    if (!user) return [];
    if (user.role === 'employee') {
      return (salaryRecords || []).filter(r => r.employeeId === user.employeeId);
    }
    return salaryRecords || [];
  }, [salaryRecords, user]);

  const employeeDropdownList = useMemo(() => {
    if (!managedEmployees) return [];
    if (user?.role === 'employee' && user.employeeId) {
      return (managedEmployees || []).filter(emp => emp.employeeId === user.employeeId);
    }
    return managedEmployees || [];
  }, [managedEmployees, user]);


  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
         <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You need to be logged in to view this page.</AlertDescription>
        </Alert>
      </div>
    );
  }


  return (
    <>
      <PageHeader title="Performance Monitor" description="Track employee performance, attendance, and salary details.">
        {user?.role === 'admin' && (
          <Button onClick={() => setIsManageEmployeesDialogOpen(true)}>
            <Users className="mr-2 h-4 w-4" /> Manage Employees
          </Button>
        )}
      </PageHeader>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="performance">Daily Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="salary">Salary Details</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Daily Performance Records</CardTitle>
                <CardDescription>Monitor sales targets and task completion.</CardDescription>
              </div>
              {(user?.role === 'admin' || (user?.role === 'employee' && user.employeeId)) && (
                <Button size="sm" onClick={() => openRecordDialog(setIsAddPerformanceDialogOpen, setPerformanceFormData, { date: new Date() })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Record
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeaderComponent>
                  <TableRow>
                    <TableHead>Emp. ID</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Sales Target</TableHead>
                    <TableHead>Sales Achieved</TableHead>
                    <TableHead>Tasks (C/A)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeaderComponent>
                <TableBody>
                  {(userPerformanceRecords).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.role || 'N/A'}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>PKR {record.salesTarget?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell>PKR {record.salesAchieved?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell>{record.tasksCompleted}/{record.tasksAssigned}</TableCell>
                      <TableCell className="text-right">
                        {(user?.role === 'admin' || (user?.role === 'employee' && user.employeeId === record.employeeId)) && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePerformanceRecord(record.id)} aria-label="Delete performance record">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(userPerformanceRecords).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-4">No performance records yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Employee Attendance</CardTitle>
                <CardDescription>Track daily in-time and out-time.</CardDescription>
              </div>
              {(user?.role === 'admin' || (user?.role === 'employee' && user.employeeId)) && (
                <Button size="sm" onClick={() => openRecordDialog(setIsAddAttendanceDialogOpen, setAttendanceFormData, { date: new Date() })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Mark Attendance
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeaderComponent>
                  <TableRow>
                    <TableHead>Emp. ID</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>In-Time</TableHead>
                    <TableHead>Out-Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeaderComponent>
                <TableBody>
                  {(userAttendanceRecords).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.role || 'N/A'}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.inTime || 'N/A'}</TableCell>
                      <TableCell>{record.outTime || 'N/A'}</TableCell>
                      <TableCell>{record.status}</TableCell>
                      <TableCell className="text-right">
                        {(user?.role === 'admin' || (user?.role === 'employee' && user.employeeId === record.employeeId)) && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAttendanceRecord(record.id)} aria-label="Delete attendance record">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(userAttendanceRecords).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-4">No attendance records yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Salary Details</CardTitle>
                <CardDescription>Manage monthly salaries, advances, bonuses, and deductions.</CardDescription>
              </div>
              {(user?.role === 'admin' || (user?.role === 'employee' && user.employeeId)) && (
                <Button size="sm" onClick={() => openRecordDialog(setIsAddSalaryDialogOpen, setSalaryFormData, { month: format(new Date(), 'yyyy-MM') })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Salary Entry
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeaderComponent>
                  <TableRow>
                    <TableHead>Emp. ID</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Advances</TableHead>
                    <TableHead>Bonuses</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeaderComponent>
                <TableBody>
                  {(userSalaryRecords).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.role || 'N/A'}</TableCell>
                      <TableCell>{record.month && record.month.length === 7 ? format(parseISO(record.month + '-01'), 'MMMM yyyy') : 'N/A'}</TableCell>
                      <TableCell>PKR {record.basicSalary.toLocaleString()}</TableCell>
                      <TableCell>PKR {record.advances.toLocaleString()}</TableCell>
                      <TableCell>PKR {record.bonuses.toLocaleString()}</TableCell>
                      <TableCell>PKR {record.deductions.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">PKR {record.netSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {(user?.role === 'admin' || (user?.role === 'employee' && user.employeeId === record.employeeId)) && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSalaryRecord(record.id)} aria-label="Delete salary record">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(userSalaryRecords).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-4">No salary records yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {user?.role === 'admin' && isManageEmployeesDialogOpen && (
        <Dialog open={isManageEmployeesDialogOpen} onOpenChange={setIsManageEmployeesDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>Manage Employees</DialogTitle></DialogHeader>
            <div className="my-4">
              <Button onClick={handleOpenAddEmployeeDialog}><PlusCircle className="mr-2 h-4 w-4" /> Add New Employee</Button>
            </div>
            <Table>
              <TableHeaderComponent>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeaderComponent>
              <TableBody>
                {(managedEmployees || []).map(emp => (
                  <TableRow key={emp.employeeId}>
                    <TableCell>{emp.employeeId}</TableCell>
                    <TableCell>{emp.employeeName}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.role.charAt(0).toUpperCase() + emp.role.slice(1)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="icon" onClick={() => handleOpenEditEmployeeDialog(emp)} aria-label={`Edit ${emp.employeeName}`}><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteEmployee(emp.employeeId)} aria-label={`Delete ${emp.employeeName}`}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(managedEmployees || []).length === 0 && (<TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">No employees managed yet.</TableCell></TableRow>)}
              </TableBody>
            </Table>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isEmployeeFormDialogOpen && currentEditingEmployee && user?.role === 'admin' && (
        <Dialog open={isEmployeeFormDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setCurrentEditingEmployee(null); setIsEmployeeFormDialogOpen(isOpen); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>{employeeFormMode === 'add' ? 'Add New Employee' : 'Edit Employee'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSaveEmployee} className="space-y-4 py-4">
              <div>
                <Label htmlFor="empFormId">Employee ID</Label>
                <Input
                  id="empFormId"
                  value={currentEditingEmployee.employeeId || ''}
                  disabled
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Label htmlFor="empFormName">Employee Name</Label>
                <Input
                  id="empFormName"
                  value={currentEditingEmployee.employeeName || ''}
                  onChange={(e) => setCurrentEditingEmployee(prev => prev ? { ...prev, employeeName: e.target.value } : null)}
                  required
                />
              </div>
               <div>
                <Label htmlFor="empFormEmail">Email</Label>
                <Input
                  id="empFormEmail"
                  type="email"
                  value={currentEditingEmployee.email || ''}
                  onChange={(e) => setCurrentEditingEmployee(prev => prev ? { ...prev, email: e.target.value } : null)}
                  required
                />
              </div>
              {employeeFormMode === 'add' && (
                <div>
                  <Label htmlFor="empFormPassword">Initial Password</Label>
                  <Input
                    id="empFormPassword"
                    type="password"
                    value={currentEditingEmployee.password || ''}
                    onChange={(e) => setCurrentEditingEmployee(prev => prev ? { ...prev, password: e.target.value } : null)}
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="empFormRole">Role</Label>
                <Select
                  value={currentEditingEmployee.role || 'employee'}
                  onValueChange={(value: 'admin' | 'employee') => setCurrentEditingEmployee(prev => prev ? { ...prev, role: value } : null)}
                  required
                >
                  <SelectTrigger id="empFormRole">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
                <Button type="submit">Save Employee</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Performance Record Dialog */}
      <Dialog open={isAddPerformanceDialogOpen} onOpenChange={(isOpen) => { setIsAddPerformanceDialogOpen(isOpen); if (!isOpen) { setPerformanceFormData({ date: new Date() }); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Performance Record</DialogTitle></DialogHeader>
          <form onSubmit={handleAddPerformanceRecord} className="space-y-4 py-4">
            <div>
              <Label htmlFor="perfEmployeeId">Employee</Label>
              <Select
                name="selectedEmployeeId"
                value={performanceFormData.selectedEmployeeId || ""}
                onValueChange={(value) => handleRecordFormSelectChange(value, 'selectedEmployeeId', 'performance')}
                disabled={user?.role === 'employee'}
              >
                <SelectTrigger id="perfEmployeeId"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                <SelectContent>
                  {(employeeDropdownList && employeeDropdownList.length > 0) ? (
                    employeeDropdownList.map(emp => <SelectItem key={emp.employeeId} value={emp.employeeId}>{emp.employeeName} ({emp.employeeId})</SelectItem>)
                  ) : (
                    <SelectItem value="no-employees" disabled>No employees found. Please add via Manage Employees.</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="perfDate">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !performanceFormData.date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {performanceFormData.date ? format(performanceFormData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={performanceFormData.date} onSelect={(d) => handleRecordDateChange(d, 'date', 'performance')} initialFocus /></PopoverContent>
              </Popover>
            </div>
            <div><Label htmlFor="salesTarget">Sales Target (PKR)</Label><Input id="salesTarget" name="salesTarget" type="number" value={performanceFormData.salesTarget || ''} onChange={(e) => handleRecordFormInputChange(e, 'performance')} min="0" /></div>
            <div><Label htmlFor="salesAchieved">Sales Achieved (PKR)</Label><Input id="salesAchieved" name="salesAchieved" type="number" value={performanceFormData.salesAchieved || ''} onChange={(e) => handleRecordFormInputChange(e, 'performance')} min="0" /></div>
            <div><Label htmlFor="tasksCompleted">Tasks Completed</Label><Input id="tasksCompleted" name="tasksCompleted" type="number" value={performanceFormData.tasksCompleted || ''} onChange={(e) => handleRecordFormInputChange(e, 'performance')} min="0" /></div>
            <div><Label htmlFor="tasksAssigned">Tasks Assigned</Label><Input id="tasksAssigned" name="tasksAssigned" type="number" value={performanceFormData.tasksAssigned || ''} onChange={(e) => handleRecordFormInputChange(e, 'performance')} min="0" /></div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
              <Button type="submit">Add Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Attendance Record Dialog */}
      <Dialog open={isAddAttendanceDialogOpen} onOpenChange={(isOpen) => { setIsAddAttendanceDialogOpen(isOpen); if (!isOpen) { setAttendanceFormData({ date: new Date() }); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
          <form onSubmit={handleAddAttendanceRecord} className="space-y-4 py-4">
            <div>
              <Label htmlFor="attEmployeeId">Employee</Label>
              <Select
                name="selectedEmployeeId"
                value={attendanceFormData.selectedEmployeeId || ""}
                onValueChange={(value) => handleRecordFormSelectChange(value, 'selectedEmployeeId', 'attendance')}
                disabled={user?.role === 'employee'}
              >
                <SelectTrigger id="attEmployeeId"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                <SelectContent>
                  {(employeeDropdownList && employeeDropdownList.length > 0) ? (
                    employeeDropdownList.map(emp => <SelectItem key={emp.employeeId} value={emp.employeeId}>{emp.employeeName} ({emp.employeeId})</SelectItem>)
                  ) : (
                    <SelectItem value="no-employees" disabled>No employees found. Please add via Manage Employees.</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="attDate">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !attendanceFormData.date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {attendanceFormData.date ? format(attendanceFormData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={attendanceFormData.date} onSelect={(d) => handleRecordDateChange(d, 'date', 'attendance')} initialFocus /></PopoverContent>
              </Popover>
            </div>
            <div><Label htmlFor="inTime">In-Time</Label><Input id="inTime" name="inTime" type="time" value={attendanceFormData.inTime || ''} onChange={(e) => handleRecordFormInputChange(e, 'attendance')} /></div>
            <div><Label htmlFor="outTime">Out-Time</Label><Input id="outTime" name="outTime" type="time" value={attendanceFormData.outTime || ''} onChange={(e) => handleRecordFormInputChange(e, 'attendance')} /></div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" value={attendanceFormData.status || ""} onValueChange={(value) => handleRecordFormSelectChange(value as 'Present' | 'Absent' | 'Leave', 'status', 'attendance')}>
                <SelectTrigger id="status"><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
              <Button type="submit">Mark Attendance</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Salary Record Dialog */}
      <Dialog open={isAddSalaryDialogOpen} onOpenChange={(isOpen) => { setIsAddSalaryDialogOpen(isOpen); if (!isOpen) { setSalaryFormData({ month: format(new Date(), 'yyyy-MM') }); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Salary Entry</DialogTitle></DialogHeader>
          <form onSubmit={handleAddSalaryRecord} className="space-y-4 py-4">
            <div>
              <Label htmlFor="salaryEmployeeId">Employee</Label>
              <Select
                name="selectedEmployeeId"
                value={salaryFormData.selectedEmployeeId || ""}
                onValueChange={(value) => handleRecordFormSelectChange(value, 'selectedEmployeeId', 'salary')}
                disabled={user?.role === 'employee'}
              >
                <SelectTrigger id="salaryEmployeeId"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                <SelectContent>
                  {(employeeDropdownList && employeeDropdownList.length > 0) ? (
                    employeeDropdownList.map(emp => <SelectItem key={emp.employeeId} value={emp.employeeId}>{emp.employeeName} ({emp.employeeId})</SelectItem>)
                  ) : (
                    <SelectItem value="no-employees" disabled>No employees found. Please add via Manage Employees.</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="month">Month (YYYY-MM)</Label><Input id="month" name="month" type="month" value={salaryFormData.month || ''} onChange={(e) => handleRecordFormInputChange(e, 'salary')} /></div>
            <div><Label htmlFor="basicSalary">Basic Salary (PKR)</Label><Input id="basicSalary" name="basicSalary" type="number" value={salaryFormData.basicSalary || ''} onChange={(e) => handleRecordFormInputChange(e, 'salary')} min="0" /></div>
            <div><Label htmlFor="advances">Advances (PKR)</Label><Input id="advances" name="advances" type="number" value={salaryFormData.advances || ''} onChange={(e) => handleRecordFormInputChange(e, 'salary')} min="0" /></div>
            <div><Label htmlFor="bonuses">Bonuses (PKR)</Label><Input id="bonuses" name="bonuses" type="number" value={salaryFormData.bonuses || ''} onChange={(e) => handleRecordFormInputChange(e, 'salary')} min="0" /></div>
            <div><Label htmlFor="deductions">Deductions (PKR)</Label><Input id="deductions" name="deductions" type="number" value={salaryFormData.deductions || ''} onChange={(e) => handleRecordFormInputChange(e, 'salary')} min="0" /></div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
              <Button type="submit">Add Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
