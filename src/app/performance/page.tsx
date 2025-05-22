
'use client';

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { EmployeePerformance, EmployeeAttendance, EmployeeSalary } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PlusCircle, Trash2, CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

// LocalStorage Keys
const PERFORMANCE_KEY = 'quoriam-performanceRecords';
const ATTENDANCE_KEY = 'quoriam-attendanceRecords';
const SALARY_KEY = 'quoriam-salaryRecords';

// Initial Mock Data (used if localStorage is empty or invalid)
const initialMockPerformance: EmployeePerformance[] = [
  { id: 'P001', employeeId: '001', employeeName: 'Alice Smith', role: 'Staff', date: '2024-07-28', salesTarget: 500, salesAchieved: 480, tasksCompleted: 8, tasksAssigned: 10 },
  { id: 'P002', employeeId: '002', employeeName: 'Bob Johnson', role: 'Staff', date: '2024-07-28', salesTarget: 400, salesAchieved: 410, tasksCompleted: 10, tasksAssigned: 10 },
  { id: 'P003', employeeId: '101', employeeName: 'Umar Hayat', role: 'Branch Manager', date: '2024-07-28', salesTarget: 1000, salesAchieved: 950, tasksCompleted: 15, tasksAssigned: 15 },
  { id: 'P004', employeeId: '102', employeeName: 'Abdullah Qarafi', role: 'Shop Keeper', date: '2024-07-28', salesTarget: 450, salesAchieved: 430, tasksCompleted: 9, tasksAssigned: 10 },
  { id: 'P005', employeeId: '103', employeeName: 'Shoaib Ashfaq', role: 'Delivery Boy', date: '2024-07-28', salesTarget: 0, salesAchieved: 0, tasksCompleted: 12, tasksAssigned: 12 },
  { id: 'P006', employeeId: '104', employeeName: 'Salman Karamat', role: 'Cashier', date: '2024-07-28', salesTarget: 300, salesAchieved: 320, tasksCompleted: 7, tasksAssigned: 8 },
  { id: 'P007', employeeId: '105', employeeName: 'Suraqa Zohaib', role: 'Cashier', date: '2024-07-28', salesTarget: 300, salesAchieved: 280, tasksCompleted: 6, tasksAssigned: 8 },
  { id: 'P008', employeeId: '106', employeeName: 'Bilal Karamat', role: 'Cashier', date: '2024-07-28', salesTarget: 300, salesAchieved: 310, tasksCompleted: 7, tasksAssigned: 7 },
  { id: 'P009', employeeId: '107', employeeName: 'Kaleemullah Qarafi', role: 'Cashier', date: '2024-07-28', salesTarget: 300, salesAchieved: 290, tasksCompleted: 6, tasksAssigned: 7 },
];
const initialMockAttendance: EmployeeAttendance[] = [
  { id: 'A001', employeeId: '001', employeeName: 'Alice Smith', role: 'Staff', date: '2024-07-28', inTime: '09:00 AM', outTime: '05:00 PM', status: 'Present' },
  { id: 'A002', employeeId: '002', employeeName: 'Bob Johnson', role: 'Staff', date: '2024-07-28', inTime: '09:05 AM', outTime: '05:15 PM', status: 'Present' },
  { id: 'A003', employeeId: '101', employeeName: 'Umar Hayat', role: 'Branch Manager', date: '2024-07-28', inTime: '08:45 AM', outTime: '06:00 PM', status: 'Present' },
  { id: 'A004', employeeId: '102', employeeName: 'Abdullah Qarafi', role: 'Shop Keeper', date: '2024-07-28', inTime: '08:50 AM', outTime: '05:30 PM', status: 'Present' },
  { id: 'A005', employeeId: '103', employeeName: 'Shoaib Ashfaq', role: 'Delivery Boy', date: '2024-07-28', status: 'Leave' },
  { id: 'A006', employeeId: '104', employeeName: 'Salman Karamat', role: 'Cashier', date: '2024-07-28', inTime: '09:00 AM', outTime: '05:00 PM', status: 'Present' },
];
const initialMockSalaries: EmployeeSalary[] = [
  { id: 'S001', employeeId: '001', employeeName: 'Alice Smith', role: 'Staff', month: '2024-07', basicSalary: 30000, advances: 2000, bonuses: 1500, deductions: 500, netSalary: 29000 },
  { id: 'S002', employeeId: '002', employeeName: 'Bob Johnson', role: 'Staff', month: '2024-07', basicSalary: 28000, advances: 0, bonuses: 2000, deductions: 200, netSalary: 29800 },
  { id: 'S003', employeeId: '101', employeeName: 'Umar Hayat', role: 'Branch Manager', month: '2024-07', basicSalary: 50000, advances: 5000, bonuses: 3000, deductions: 1000, netSalary: 47000 },
  { id: 'S004', employeeId: '102', employeeName: 'Abdullah Qarafi', role: 'Shop Keeper', month: '2024-07', basicSalary: 35000, advances: 1000, bonuses: 1000, deductions: 300, netSalary: 34700 },
  { id: 'S005', employeeId: '104', employeeName: 'Salman Karamat', role: 'Cashier', month: '2024-07', basicSalary: 25000, advances: 0, bonuses: 500, deductions: 100, netSalary: 25400 },
];


interface FormDataBase {
  employeeId?: string; // User-facing ID
  date?: Date;
  role?: string;
}
interface PerformanceFormData extends FormDataBase {
  salesTarget?: number;
  salesAchieved?: number;
  tasksCompleted?: number;
  tasksAssigned?: number;
}
interface AttendanceFormData extends FormDataBase {
  inTime?: string;
  outTime?: string;
  status?: 'Present' | 'Absent' | 'Leave';
}
interface SalaryFormData extends Omit<FormDataBase, 'date'> {
  month?: string; // e.g., "YYYY-MM"
  basicSalary?: number;
  advances?: number;
  bonuses?: number;
  deductions?: number;
}

export default function PerformancePage() {
  const { toast } = useToast();
  const [performanceRecords, setPerformanceRecords] = useState<EmployeePerformance[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<EmployeeAttendance[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<EmployeeSalary[]>([]);

  // Dialog states
  const [isAddPerformanceDialogOpen, setIsAddPerformanceDialogOpen] = useState(false);
  const [isAddAttendanceDialogOpen, setIsAddAttendanceDialogOpen] = useState(false);
  const [isAddSalaryDialogOpen, setIsAddSalaryDialogOpen] = useState(false);

  // Form data states
  const [performanceFormData, setPerformanceFormData] = useState<PerformanceFormData>({});
  const [attendanceFormData, setAttendanceFormData] = useState<AttendanceFormData>({});
  const [salaryFormData, setSalaryFormData] = useState<SalaryFormData>({});
  
  const [selectedEmployeeForDialog, setSelectedEmployeeForDialog] = useState<{ employeeId: string, employeeName: string, role?: string} | null>(null);


  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = <T,>(key: string, setter: React.Dispatch<React.SetStateAction<T[]>>, defaultValue: T[]): void => {
      try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
          const parsedValue = JSON.parse(storedValue);
          // Ensure parsedValue is an array; otherwise, use defaultValue
          setter(Array.isArray(parsedValue) ? parsedValue : defaultValue);
        } else {
          setter(defaultValue);
        }
      } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        setter(defaultValue); // Fallback to default on parsing error
      }
    };

    loadData<EmployeePerformance>(PERFORMANCE_KEY, setPerformanceRecords, initialMockPerformance);
    loadData<EmployeeAttendance>(ATTENDANCE_KEY, setAttendanceRecords, initialMockAttendance);
    loadData<EmployeeSalary>(SALARY_KEY, setSalaryRecords, initialMockSalaries);
  }, []);


  // Save data to localStorage on change
  useEffect(() => { 
    if (performanceRecords.length > 0 || localStorage.getItem(PERFORMANCE_KEY)) {
        localStorage.setItem(PERFORMANCE_KEY, JSON.stringify(performanceRecords)); 
    }
  }, [performanceRecords]);
  useEffect(() => { 
    if (attendanceRecords.length > 0 || localStorage.getItem(ATTENDANCE_KEY)) {
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendanceRecords)); 
    }
  }, [attendanceRecords]);
  useEffect(() => { 
    if (salaryRecords.length > 0 || localStorage.getItem(SALARY_KEY)) {
        localStorage.setItem(SALARY_KEY, JSON.stringify(salaryRecords)); 
    }
  }, [salaryRecords]);


  const allKnownEmployees = useMemo(() => {
    const employeeMap = new Map<string, { employeeId: string, employeeName: string, role?: string }>();
    
    // Ensure records are arrays before spreading
    const pRecords = Array.isArray(performanceRecords) ? performanceRecords : [];
    const aRecords = Array.isArray(attendanceRecords) ? attendanceRecords : [];
    const sRecords = Array.isArray(salaryRecords) ? salaryRecords : [];

    [...pRecords, ...aRecords, ...sRecords].forEach(record => {
      if (record?.employeeId && record?.employeeName && !employeeMap.has(record.employeeId)) {
        employeeMap.set(record.employeeId, { 
            employeeId: record.employeeId, 
            employeeName: record.employeeName, 
            role: record.role 
        });
      }
    });
    return Array.from(employeeMap.values()).sort((a,b) => a.employeeName.localeCompare(b.employeeName));
  }, [performanceRecords, attendanceRecords, salaryRecords]);


  const handleFormInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    formType: 'performance' | 'attendance' | 'salary'
  ) => {
    const { name, value } = e.target;
    const setter = formType === 'performance' ? setPerformanceFormData : formType === 'attendance' ? setAttendanceFormData : setSalaryFormData;
    setter(prev => ({ ...prev, [name]: name.includes('Target') || name.includes('Achieved') || name.includes('Completed') || name.includes('Assigned') || name.includes('Salary') || name.includes('advances') || name.includes('bonuses') || name.includes('deductions') ? parseFloat(value) || 0 : value }));
  };
  
  const handleFormSelectChange = (
    value: string, name: string,
    formType: 'performance' | 'attendance' | 'salary'
  ) => {
     const setter = formType === 'performance' ? setPerformanceFormData : formType === 'attendance' ? setAttendanceFormData : setSalaryFormData;
     if (name === 'employeeId') {
        const emp = allKnownEmployees.find(e => e.employeeId === value);
        setSelectedEmployeeForDialog(emp || null);
        setter(prev => ({ 
            ...prev, 
            employeeId: emp?.employeeId, // Explicitly set employeeId in form data
            role: emp?.role || prev.role // Use employee's role or existing form role
        }));
     } else {
        setter(prev => ({ ...prev, [name]: value }));
     }
  };

  const handleDateChange = (date: Date | undefined, name: string, formType: 'performance' | 'attendance') => {
    const setter = formType === 'performance' ? setPerformanceFormData : setAttendanceFormData;
    setter(prev => ({ ...prev, [name]: date }));
  };

  // --- Performance Record Handlers ---
  const handleAddPerformanceRecord = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeForDialog || !performanceFormData.date) {
      toast({ title: "Error", description: "Employee and Date are required.", variant: "destructive" });
      return;
    }
    const newRecord: EmployeePerformance = {
      id: `P${Date.now()}`,
      employeeId: selectedEmployeeForDialog.employeeId,
      employeeName: selectedEmployeeForDialog.employeeName,
      role: performanceFormData.role || selectedEmployeeForDialog.role || 'N/A',
      date: format(performanceFormData.date, 'yyyy-MM-dd'),
      salesTarget: performanceFormData.salesTarget || 0,
      salesAchieved: performanceFormData.salesAchieved || 0,
      tasksCompleted: performanceFormData.tasksCompleted || 0,
      tasksAssigned: performanceFormData.tasksAssigned || 0,
    };
    setPerformanceRecords(prev => [newRecord, ...prev]);
    setIsAddPerformanceDialogOpen(false);
    setPerformanceFormData({date: new Date()}); // Reset with default date
    setSelectedEmployeeForDialog(null);
    toast({ title: "Success", description: "Performance record added." });
  };

  const handleDeletePerformanceRecord = (id: string) => {
    if (window.confirm("Are you sure you want to delete this performance record?")) {
      setPerformanceRecords(prev => prev.filter(record => record.id !== id));
      toast({ title: "Success", description: "Performance record deleted." });
    }
  };

  // --- Attendance Record Handlers ---
  const handleAddAttendanceRecord = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeForDialog || !attendanceFormData.date || !attendanceFormData.status) {
      toast({ title: "Error", description: "Employee, Date, and Status are required.", variant: "destructive" });
      return;
    }
    const newRecord: EmployeeAttendance = {
      id: `A${Date.now()}`,
      employeeId: selectedEmployeeForDialog.employeeId,
      employeeName: selectedEmployeeForDialog.employeeName,
      role: attendanceFormData.role || selectedEmployeeForDialog.role || 'N/A',
      date: format(attendanceFormData.date, 'yyyy-MM-dd'),
      inTime: attendanceFormData.inTime,
      outTime: attendanceFormData.outTime,
      status: attendanceFormData.status,
    };
    setAttendanceRecords(prev => [newRecord, ...prev]);
    setIsAddAttendanceDialogOpen(false);
    setAttendanceFormData({date: new Date()}); // Reset with default date
    setSelectedEmployeeForDialog(null);
    toast({ title: "Success", description: "Attendance record added." });
  };

  const handleDeleteAttendanceRecord = (id: string) => {
     if (window.confirm("Are you sure you want to delete this attendance record?")) {
      setAttendanceRecords(prev => prev.filter(record => record.id !== id));
      toast({ title: "Success", description: "Attendance record deleted." });
    }
  };

  // --- Salary Record Handlers ---
  const handleAddSalaryRecord = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeForDialog || !salaryFormData.month || salaryFormData.basicSalary === undefined) {
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
      employeeId: selectedEmployeeForDialog.employeeId,
      employeeName: selectedEmployeeForDialog.employeeName,
      role: salaryFormData.role || selectedEmployeeForDialog.role || 'N/A',
      month: salaryFormData.month, // expecting YYYY-MM
      basicSalary,
      advances,
      bonuses,
      deductions,
      netSalary,
    };
    setSalaryRecords(prev => [newRecord, ...prev]);
    setIsAddSalaryDialogOpen(false);
    setSalaryFormData({month: format(new Date(), 'yyyy-MM')}); // Reset with default month
    setSelectedEmployeeForDialog(null);
    toast({ title: "Success", description: "Salary record added." });
  };

  const handleDeleteSalaryRecord = (id: string) => {
    if (window.confirm("Are you sure you want to delete this salary record?")) {
      setSalaryRecords(prev => prev.filter(record => record.id !== id));
      toast({ title: "Success", description: "Salary record deleted." });
    }
  };
  
  const openDialog = (setter: React.Dispatch<React.SetStateAction<boolean>>, formSetter: any, initialData = {}) => {
    formSetter(initialData); // Set initial data which might include default date/month
    setSelectedEmployeeForDialog(null); // Reset selected employee
    setter(true);
  };


  return (
    <>
      <PageHeader title="Performance Monitor" description="Track employee performance, attendance, and salary details." />

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="performance">Daily Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="salary">Salary Details</TabsTrigger>
        </TabsList>

        {/* Daily Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Daily Performance Records</CardTitle>
                <CardDescription>Monitor sales targets and task completion.</CardDescription>
              </div>
              <Button size="sm" onClick={() => openDialog(setIsAddPerformanceDialogOpen, setPerformanceFormData, { date: new Date() })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Record
              </Button>
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
                  {(performanceRecords || []).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.role || 'N/A'}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>PKR {record.salesTarget?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell>PKR {record.salesAchieved?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell>{record.tasksCompleted}/{record.tasksAssigned}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePerformanceRecord(record.id)} aria-label="Delete performance record">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(performanceRecords || []).length === 0 && <p className="text-center text-muted-foreground py-4">No performance records yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Employee Attendance</CardTitle>
                <CardDescription>Track daily in-time and out-time.</CardDescription>
              </div>
              <Button size="sm" onClick={() => openDialog(setIsAddAttendanceDialogOpen, setAttendanceFormData, { date: new Date() })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Mark Attendance
              </Button>
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
                  {(attendanceRecords || []).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.role || 'N/A'}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.inTime || 'N/A'}</TableCell>
                      <TableCell>{record.outTime || 'N/A'}</TableCell>
                      <TableCell>{record.status}</TableCell>
                       <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAttendanceRecord(record.id)} aria-label="Delete attendance record">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(attendanceRecords || []).length === 0 && <p className="text-center text-muted-foreground py-4">No attendance records yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Details Tab */}
        <TabsContent value="salary">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Salary Details</CardTitle>
                <CardDescription>Manage monthly salaries, advances, bonuses, and deductions.</CardDescription>
              </div>
               <Button size="sm" onClick={() => openDialog(setIsAddSalaryDialogOpen, setSalaryFormData, { month: format(new Date(), 'yyyy-MM') })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Salary Entry
              </Button>
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
                  {(salaryRecords || []).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.role || 'N/A'}</TableCell>
                      <TableCell>{record.month ? format(parseISO(record.month + '-01'), 'MMMM yyyy') : 'N/A'}</TableCell> {/* Display month name */}
                      <TableCell>PKR {record.basicSalary.toLocaleString()}</TableCell>
                      <TableCell>PKR {record.advances.toLocaleString()}</TableCell>
                      <TableCell>PKR {record.bonuses.toLocaleString()}</TableCell>
                      <TableCell>PKR {record.deductions.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">PKR {record.netSalary.toLocaleString()}</TableCell>
                       <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSalaryRecord(record.id)} aria-label="Delete salary record">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(salaryRecords || []).length === 0 && <p className="text-center text-muted-foreground py-4">No salary records yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Performance Record Dialog */}
      <Dialog open={isAddPerformanceDialogOpen} onOpenChange={(isOpen) => { setIsAddPerformanceDialogOpen(isOpen); if (!isOpen) {setPerformanceFormData({date: new Date()}); setSelectedEmployeeForDialog(null);}}}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Performance Record</DialogTitle></DialogHeader>
          <form onSubmit={handleAddPerformanceRecord} className="space-y-4 py-4">
            <div>
              <Label htmlFor="perfEmployeeId">Employee</Label>
              <Select name="employeeId" value={selectedEmployeeForDialog?.employeeId || ""} onValueChange={(value) => handleFormSelectChange(value, 'employeeId', 'performance')}>
                <SelectTrigger id="perfEmployeeId"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                <SelectContent>
                  {allKnownEmployees.map(emp => <SelectItem key={emp.employeeId} value={emp.employeeId}>{emp.employeeName} ({emp.employeeId})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="perfRole">Role</Label><Input id="perfRole" name="role" value={performanceFormData.role || selectedEmployeeForDialog?.role || ''} onChange={(e) => handleFormInputChange(e, 'performance')} placeholder="Employee Role"/></div>
            <div>
              <Label htmlFor="perfDate">Date</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !performanceFormData.date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {performanceFormData.date ? format(performanceFormData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={performanceFormData.date} onSelect={(d) => handleDateChange(d, 'date', 'performance')} initialFocus /></PopoverContent>
              </Popover>
            </div>
            <div><Label htmlFor="salesTarget">Sales Target (PKR)</Label><Input id="salesTarget" name="salesTarget" type="number" value={performanceFormData.salesTarget || ''} onChange={(e) => handleFormInputChange(e, 'performance')} min="0" /></div>
            <div><Label htmlFor="salesAchieved">Sales Achieved (PKR)</Label><Input id="salesAchieved" name="salesAchieved" type="number" value={performanceFormData.salesAchieved || ''} onChange={(e) => handleFormInputChange(e, 'performance')} min="0"/></div>
            <div><Label htmlFor="tasksCompleted">Tasks Completed</Label><Input id="tasksCompleted" name="tasksCompleted" type="number" value={performanceFormData.tasksCompleted || ''} onChange={(e) => handleFormInputChange(e, 'performance')} min="0"/></div>
            <div><Label htmlFor="tasksAssigned">Tasks Assigned</Label><Input id="tasksAssigned" name="tasksAssigned" type="number" value={performanceFormData.tasksAssigned || ''} onChange={(e) => handleFormInputChange(e, 'performance')} min="0"/></div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button type="submit">Add Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Attendance Record Dialog */}
      <Dialog open={isAddAttendanceDialogOpen} onOpenChange={(isOpen) => { setIsAddAttendanceDialogOpen(isOpen); if (!isOpen) {setAttendanceFormData({date: new Date()}); setSelectedEmployeeForDialog(null);}}}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
          <form onSubmit={handleAddAttendanceRecord} className="space-y-4 py-4">
            <div>
              <Label htmlFor="attEmployeeId">Employee</Label>
              <Select name="employeeId" value={selectedEmployeeForDialog?.employeeId || ""} onValueChange={(value) => handleFormSelectChange(value, 'employeeId', 'attendance')}>
                <SelectTrigger id="attEmployeeId"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                <SelectContent>
                  {allKnownEmployees.map(emp => <SelectItem key={emp.employeeId} value={emp.employeeId}>{emp.employeeName} ({emp.employeeId})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div><Label htmlFor="attRole">Role</Label><Input id="attRole" name="role" value={attendanceFormData.role || selectedEmployeeForDialog?.role || ''} onChange={(e) => handleFormInputChange(e, 'attendance')} placeholder="Employee Role"/></div>
            <div>
              <Label htmlFor="attDate">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !attendanceFormData.date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {attendanceFormData.date ? format(attendanceFormData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={attendanceFormData.date} onSelect={(d) => handleDateChange(d, 'date', 'attendance')} initialFocus /></PopoverContent>
              </Popover>
            </div>
            <div><Label htmlFor="inTime">In-Time</Label><Input id="inTime" name="inTime" type="time" value={attendanceFormData.inTime || ''} onChange={(e) => handleFormInputChange(e, 'attendance')} /></div>
            <div><Label htmlFor="outTime">Out-Time</Label><Input id="outTime" name="outTime" type="time" value={attendanceFormData.outTime || ''} onChange={(e) => handleFormInputChange(e, 'attendance')} /></div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" value={attendanceFormData.status || ""} onValueChange={(value) => handleFormSelectChange(value as 'Present' | 'Absent' | 'Leave', 'status', 'attendance')}>
                <SelectTrigger id="status"><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button type="submit">Mark Attendance</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Salary Record Dialog */}
      <Dialog open={isAddSalaryDialogOpen} onOpenChange={(isOpen) => { setIsAddSalaryDialogOpen(isOpen); if (!isOpen) {setSalaryFormData({month: format(new Date(), 'yyyy-MM')}); setSelectedEmployeeForDialog(null);}}}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Salary Entry</DialogTitle></DialogHeader>
          <form onSubmit={handleAddSalaryRecord} className="space-y-4 py-4">
             <div>
              <Label htmlFor="salaryEmployeeId">Employee</Label>
              <Select name="employeeId" value={selectedEmployeeForDialog?.employeeId || ""} onValueChange={(value) => handleFormSelectChange(value, 'employeeId', 'salary')}>
                <SelectTrigger id="salaryEmployeeId"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                <SelectContent>
                  {allKnownEmployees.map(emp => <SelectItem key={emp.employeeId} value={emp.employeeId}>{emp.employeeName} ({emp.employeeId})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="salaryRole">Role</Label><Input id="salaryRole" name="role" value={salaryFormData.role || selectedEmployeeForDialog?.role || ''} onChange={(e) => handleFormInputChange(e, 'salary')} placeholder="Employee Role"/></div>
            <div><Label htmlFor="month">Month (YYYY-MM)</Label><Input id="month" name="month" type="month" value={salaryFormData.month || ''} onChange={(e) => handleFormInputChange(e, 'salary')} /></div>
            <div><Label htmlFor="basicSalary">Basic Salary (PKR)</Label><Input id="basicSalary" name="basicSalary" type="number" value={salaryFormData.basicSalary || ''} onChange={(e) => handleFormInputChange(e, 'salary')} min="0" /></div>
            <div><Label htmlFor="advances">Advances (PKR)</Label><Input id="advances" name="advances" type="number" value={salaryFormData.advances || ''} onChange={(e) => handleFormInputChange(e, 'salary')} min="0"/></div>
            <div><Label htmlFor="bonuses">Bonuses (PKR)</Label><Input id="bonuses" name="bonuses" type="number" value={salaryFormData.bonuses || ''} onChange={(e) => handleFormInputChange(e, 'salary')} min="0"/></div>
            <div><Label htmlFor="deductions">Deductions (PKR)</Label><Input id="deductions" name="deductions" type="number" value={salaryFormData.deductions || ''} onChange={(e) => handleFormInputChange(e, 'salary')} min="0"/></div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button type="submit">Add Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

