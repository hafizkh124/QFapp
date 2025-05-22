
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
import { format, parseISO, getMonth, getYear, setYear, setMonth } from 'date-fns';
import { cn } from '@/lib/utils';
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

const initialMockPerformance: EmployeePerformance[] = allInitialStaffWithRoles.map((emp, index) => ({
  id: `P00${index + 1}`, employeeId: emp.employeeId, employeeName: emp.employeeName, role: emp.role, date: format(new Date(Date.now() - (index * 86400000)), 'yyyy-MM-dd'), salesTarget: 5000 - (index * 500), salesAchieved: emp.status === 'active' ? 4800 - (index * 500) : 0, tasksCompleted: emp.status === 'active' ? 8 - index : 0, tasksAssigned: 10 - index
}));

const initialMockAttendance: EmployeeAttendance[] = allInitialStaffWithRoles.map((emp, index) => ({
  id: `A00${index + 1}`, employeeId: emp.employeeId, employeeName: emp.employeeName, role: emp.role, date: format(new Date(Date.now() - (index * 86400000)), 'yyyy-MM-dd'), 
  inTime: emp.status === 'active' ? `09:0${index % 6} AM` : undefined, 
  outTime: emp.status === 'active' ? `05:0${index % 6} PM` : undefined, 
  status: emp.status === 'active' ? 'Present' : 'Absent'
}));
initialMockAttendance.push({ id: 'A00X', employeeId: 'QE102', employeeName: 'Abdullah Khubaib', role: 'manager', date: format(new Date(Date.now() - (8 * 86400000)), 'yyyy-MM-dd'), status: 'Leave' });


const initialMockSalaries: EmployeeSalary[] = allInitialStaffWithRoles.map((emp, index) => ({
  id: `S00${index + 1}`, employeeId: emp.employeeId, employeeName: emp.employeeName, role: emp.role, 
  month: format(new Date(new Date().getFullYear(), new Date().getMonth() - index, 1), 'yyyy-MM'), 
  basicSalary: emp.role === 'admin' ? 70000 : (emp.role === 'manager' ? 50000 : 30000 - (index * 1000)), 
  advances: emp.role === 'admin' ? 5000 : (emp.role === 'manager' ? 2000 : 1000), 
  bonuses: emp.role === 'admin' ? 3000 : (emp.role === 'manager' ? 1500 : 500), 
  deductions: 500, 
  netSalary: (emp.role === 'admin' ? 70000 : (emp.role === 'manager' ? 50000 : 30000 - (index * 1000))) + (emp.role === 'admin' ? 3000 : (emp.role === 'manager' ? 1500 : 500)) - (emp.role === 'admin' ? 5000 : (emp.role === 'manager' ? 2000 : 1000)) - 500
}));


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
  month?: string;
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

  const [isAddPerformanceDialogOpen, setIsAddPerformanceDialogOpen] = useState(false);
  const [isAddAttendanceDialogOpen, setIsAddAttendanceDialogOpen] = useState(false);
  const [isAddSalaryDialogOpen, setIsAddSalaryDialogOpen] = useState(false);

  const [performanceFormData, setPerformanceFormData] = useState<PerformanceFormData>({});
  const [attendanceFormData, setAttendanceFormData] = useState<AttendanceFormData>({});
  const [salaryFormData, setSalaryFormData] = useState<SalaryFormData>({});

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
    loadData<ManagedEmployee>(MANAGED_EMPLOYEES_KEY, setManagedEmployees, allInitialStaffWithRoles, 'Managed Employees (Performance Page)');
    loadData<EmployeePerformance>(PERFORMANCE_KEY, setPerformanceRecords, initialMockPerformance, 'Performance Records');
    loadData<EmployeeAttendance>(ATTENDANCE_KEY, setAttendanceRecords, initialMockAttendance, 'Attendance Records');
    loadData<EmployeeSalary>(SALARY_KEY, setSalaryRecords, initialMockSalaries, 'Salary Records');
  }, []);

  useEffect(() => { if ((performanceRecords || []).length > 0 || localStorage.getItem(PERFORMANCE_KEY)) localStorage.setItem(PERFORMANCE_KEY, JSON.stringify(performanceRecords)); }, [performanceRecords]);
  useEffect(() => { if ((attendanceRecords || []).length > 0 || localStorage.getItem(ATTENDANCE_KEY)) localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendanceRecords)); }, [attendanceRecords]);
  useEffect(() => { if ((salaryRecords || []).length > 0 || localStorage.getItem(SALARY_KEY)) localStorage.setItem(SALARY_KEY, JSON.stringify(salaryRecords)); }, [salaryRecords]);

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
    setPerformanceFormData({ date: new Date(), selectedEmployeeId: user?.role === 'employee' ? user.employeeId : undefined });
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
    setAttendanceFormData({ date: new Date(), selectedEmployeeId: user?.role === 'employee' ? user.employeeId : undefined });
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
    setSalaryFormData({ month: format(new Date(), 'yyyy-MM'), selectedEmployeeId: user?.role === 'employee' ? user.employeeId : undefined });
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
    } else if ((user?.role === 'admin' || user?.role === 'manager') && (!initialData.selectedEmployeeId && employeeDropdownList.length > 0)) {
        dataToSet = { ...dataToSet, selectedEmployeeId: employeeDropdownList[0].employeeId }
    }


    if (!initialData.hasOwnProperty('date') && !initialData.hasOwnProperty('month')) { 
      dataToSet = { ...dataToSet, date: defaultDate }; 
    } else if (initialData.hasOwnProperty('month') && !initialData.hasOwnProperty('date') && !initialData['month']) { 
      dataToSet = { ...dataToSet, month: format(defaultDate, 'yyyy-MM') };
    }
    formSetter(dataToSet);
    setter(true);
  };

  const displayedPerformanceRecords = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin' || user.role === 'manager') {
      return performanceRecords || [];
    }
    return (performanceRecords || []).filter(r => r.employeeId === user.employeeId);
  }, [performanceRecords, user]);

  const displayedAttendanceRecords = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin' || user.role === 'manager') {
      return attendanceRecords || [];
    }
    return (attendanceRecords || []).filter(r => r.employeeId === user.employeeId);
  }, [attendanceRecords, user]);

  const displayedSalaryRecords = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') { // Only admin sees all salaries
        return salaryRecords || [];
    }
    // Managers and Employees see only their own salary
    return (salaryRecords || []).filter(r => r.employeeId === user.employeeId);
  }, [salaryRecords, user]);

  const employeeDropdownList = useMemo(() => {
    if (!managedEmployees) return [];
    if (user?.role === 'employee' && user.employeeId) {
      return (managedEmployees || []).filter(emp => emp.employeeId === user.employeeId && emp.status === 'active');
    }
    return (managedEmployees || []).filter(emp => emp.status === 'active');
  }, [managedEmployees, user]);

  const canAddOrDeleteRecord = (recordEmployeeId?: string) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'manager' && recordEmployeeId) {
        const targetEmployee = managedEmployees.find(emp => emp.employeeId === recordEmployeeId);
        return targetEmployee?.role !== 'admin'; // Manager can manage other managers and employees, but not admins
    }
    if (user.role === 'employee' && recordEmployeeId) {
        return user.employeeId === recordEmployeeId; // Employee can only manage their own
    }
    return false; // Default to no permission if no recordEmployeeId provided for an action by employee/manager
  };

  const canAddRecordForSelected = (selectedEmpId?: string) => {
    if (!user || !selectedEmpId) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'manager') {
        const targetEmployee = managedEmployees.find(emp => emp.employeeId === selectedEmpId);
        return targetEmployee?.role !== 'admin';
    }
    if (user.role === 'employee') {
        return user.employeeId === selectedEmpId;
    }
    return false;
  }


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
      <PageHeader title="Performance Monitor" description="Track employee performance, attendance, and salary details." />
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
              {(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'employee') && (
                <Button size="sm" onClick={() => openRecordDialog(setIsAddPerformanceDialogOpen, setPerformanceFormData, { date: new Date(), selectedEmployeeId: user?.role === 'employee' ? user.employeeId : employeeDropdownList[0]?.employeeId })}>
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
                  {(displayedPerformanceRecords || []).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.role || 'N/A'}</TableCell>
                      <TableCell>{format(parseISO(record.date), "PPP")}</TableCell>
                      <TableCell>PKR {record.salesTarget?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell>PKR {record.salesAchieved?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell>{record.tasksCompleted}/{record.tasksAssigned}</TableCell>
                      <TableCell className="text-right">
                        {canAddOrDeleteRecord(record.employeeId) && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePerformanceRecord(record.id)} aria-label="Delete performance record">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(displayedPerformanceRecords || []).length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-4">No performance records yet.</TableCell></TableRow>
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
              {(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'employee') && (
                <Button size="sm" onClick={() => openRecordDialog(setIsAddAttendanceDialogOpen, setAttendanceFormData, { date: new Date(), selectedEmployeeId: user?.role === 'employee' ? user.employeeId : employeeDropdownList[0]?.employeeId })}>
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
                  {(displayedAttendanceRecords || []).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.role || 'N/A'}</TableCell>
                      <TableCell>{format(parseISO(record.date), "PPP")}</TableCell>
                      <TableCell>{record.inTime || 'N/A'}</TableCell>
                      <TableCell>{record.outTime || 'N/A'}</TableCell>
                      <TableCell>{record.status}</TableCell>
                      <TableCell className="text-right">
                         {canAddOrDeleteRecord(record.employeeId) && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAttendanceRecord(record.id)} aria-label="Delete attendance record">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(displayedAttendanceRecords || []).length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-4">No attendance records yet.</TableCell></TableRow>
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
              {user?.role === 'admin' && ( 
                <Button size="sm" onClick={() => openRecordDialog(setIsAddSalaryDialogOpen, setSalaryFormData, { month: format(new Date(), 'yyyy-MM'), selectedEmployeeId: employeeDropdownList[0]?.employeeId })}>
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
                    {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead> }
                  </TableRow>
                </TableHeaderComponent>
                <TableBody>
                  {(displayedSalaryRecords || []).map((record) => (
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
                      {user?.role === 'admin' && (
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSalaryRecord(record.id)} aria-label="Delete salary record">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {(displayedSalaryRecords || []).length === 0 && (
                    <TableRow><TableCell colSpan={user?.role === 'admin' ? 10 : 9} className="text-center text-muted-foreground py-4">No salary records yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Performance Record Dialog */}
      {isAddPerformanceDialogOpen && (
      <Dialog open={isAddPerformanceDialogOpen} onOpenChange={(isOpen) => { setIsAddPerformanceDialogOpen(isOpen); if (!isOpen) { setPerformanceFormData({ date: new Date(), selectedEmployeeId: user?.role === 'employee' ? user.employeeId : employeeDropdownList[0]?.employeeId }); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Performance Record</DialogTitle></DialogHeader>
          <form onSubmit={handleAddPerformanceRecord} className="space-y-4 py-4">
            <div>
              <Label htmlFor="perfEmployeeId">Employee</Label>
              <Select
                name="selectedEmployeeId"
                value={performanceFormData.selectedEmployeeId || ""}
                onValueChange={(value) => handleRecordFormSelectChange(value, 'selectedEmployeeId', 'performance')}
                disabled={user?.role === 'employee' || !canAddRecordForSelected(performanceFormData.selectedEmployeeId)}
              >
                <SelectTrigger id="perfEmployeeId"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                <SelectContent>
                  {(employeeDropdownList && employeeDropdownList.length > 0) ? (
                    employeeDropdownList.filter(emp => user?.role === 'admin' || user?.role === 'manager' || emp.employeeId === user?.employeeId).map(emp => <SelectItem key={emp.employeeId} value={emp.employeeId} disabled={!canAddRecordForSelected(emp.employeeId)}>{emp.employeeName} ({emp.employeeId})</SelectItem>)
                  ) : (
                    <SelectItem value="no-employees" disabled>No active employees found.</SelectItem>
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
              <Button type="submit" disabled={!canAddRecordForSelected(performanceFormData.selectedEmployeeId)}>Add Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      )}

      {/* Add Attendance Record Dialog */}
      {isAddAttendanceDialogOpen && (
      <Dialog open={isAddAttendanceDialogOpen} onOpenChange={(isOpen) => { setIsAddAttendanceDialogOpen(isOpen); if (!isOpen) { setAttendanceFormData({ date: new Date(), selectedEmployeeId: user?.role === 'employee' ? user.employeeId : employeeDropdownList[0]?.employeeId }); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
          <form onSubmit={handleAddAttendanceRecord} className="space-y-4 py-4">
            <div>
              <Label htmlFor="attEmployeeId">Employee</Label>
              <Select
                name="selectedEmployeeId"
                value={attendanceFormData.selectedEmployeeId || ""}
                onValueChange={(value) => handleRecordFormSelectChange(value, 'selectedEmployeeId', 'attendance')}
                disabled={user?.role === 'employee' || !canAddRecordForSelected(attendanceFormData.selectedEmployeeId)}
              >
                <SelectTrigger id="attEmployeeId"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                <SelectContent>
                  {(employeeDropdownList && employeeDropdownList.length > 0) ? (
                    employeeDropdownList.filter(emp => user?.role === 'admin' || user?.role === 'manager' || emp.employeeId === user?.employeeId).map(emp => <SelectItem key={emp.employeeId} value={emp.employeeId} disabled={!canAddRecordForSelected(emp.employeeId)}>{emp.employeeName} ({emp.employeeId})</SelectItem>)
                  ) : (
                     <SelectItem value="no-employees" disabled>No active employees found.</SelectItem>
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
              <Button type="submit" disabled={!canAddRecordForSelected(attendanceFormData.selectedEmployeeId)}>Mark Attendance</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      )}

      {/* Add Salary Record Dialog - Only for Admins */}
      {user?.role === 'admin' && isAddSalaryDialogOpen && (
        <Dialog open={isAddSalaryDialogOpen} onOpenChange={(isOpen) => { setIsAddSalaryDialogOpen(isOpen); if (!isOpen) { setSalaryFormData({ month: format(new Date(), 'yyyy-MM'), selectedEmployeeId: employeeDropdownList[0]?.employeeId }); } }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Salary Entry</DialogTitle></DialogHeader>
            <form onSubmit={handleAddSalaryRecord} className="space-y-4 py-4">
              <div>
                <Label htmlFor="salaryEmployeeId">Employee</Label>
                <Select
                  name="selectedEmployeeId"
                  value={salaryFormData.selectedEmployeeId || ""}
                  onValueChange={(value) => handleRecordFormSelectChange(value, 'selectedEmployeeId', 'salary')}
                >
                  <SelectTrigger id="salaryEmployeeId"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                  <SelectContent>
                    {(employeeDropdownList && employeeDropdownList.length > 0) ? (
                      employeeDropdownList.map(emp => <SelectItem key={emp.employeeId} value={emp.employeeId}>{emp.employeeName} ({emp.employeeId})</SelectItem>)
                    ) : (
                       <SelectItem value="no-employees" disabled>No active employees found.</SelectItem>
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
      )}
    </>
  );
}
