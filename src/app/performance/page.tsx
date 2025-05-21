
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { EmployeePerformance, EmployeeAttendance, EmployeeSalary } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// Updated Mock Data with new team members and Employee IDs
const mockPerformance: EmployeePerformance[] = [
  { id: 'P001', employeeId: '001', employeeName: 'Alice Smith', role: 'Staff', date: '2024-07-28', salesTarget: 500, salesAchieved: 480, tasksCompleted: 8, tasksAssigned: 10 },
  { id: 'P002', employeeId: '002', employeeName: 'Bob Johnson', role: 'Staff', date: '2024-07-28', salesTarget: 400, salesAchieved: 410, tasksCompleted: 10, tasksAssigned: 10 },
  { id: 'P003', employeeId: '101', employeeName: 'Umar Hayat', role: 'Branch Manager', date: '2024-07-28', salesTarget: 1000, salesAchieved: 950, tasksCompleted: 15, tasksAssigned: 15 },
  { id: 'P004', employeeId: '102', employeeName: 'Abdullah Qarafi', role: 'Shop Keeper', date: '2024-07-28', salesTarget: 450, salesAchieved: 430, tasksCompleted: 9, tasksAssigned: 10 },
  { id: 'P005', employeeId: '103', employeeName: 'Shoaib Ashfaq', role: 'Delivery Boy', date: '2024-07-28', salesTarget: 100, salesAchieved: 120, tasksCompleted: 20, tasksAssigned: 20 },
  { id: 'P006', employeeId: '104', employeeName: 'Salman Karamat', role: 'Cashier', date: '2024-07-28', salesTarget: 350, salesAchieved: 360, tasksCompleted: 7, tasksAssigned: 8 },
  { id: 'P007', employeeId: '105', employeeName: 'Suraqa Zohaib', role: 'Cashier', date: '2024-07-28', salesTarget: 350, salesAchieved: 330, tasksCompleted: 6, tasksAssigned: 8 },
  { id: 'P008', employeeId: '106', employeeName: 'Bilal Karamat', role: 'Cashier', date: '2024-07-28', salesTarget: 350, salesAchieved: 370, tasksCompleted: 8, tasksAssigned: 8 },
  { id: 'P009', employeeId: '107', employeeName: 'Kaleemullah Qarafi', role: 'Cashier', date: '2024-07-28', salesTarget: 350, salesAchieved: 340, tasksCompleted: 7, tasksAssigned: 8 },
];

const mockAttendance: EmployeeAttendance[] = [
  { id: 'A001', employeeId: '001', employeeName: 'Alice Smith', role: 'Staff', date: '2024-07-28', inTime: '09:00 AM', outTime: '05:00 PM', status: 'Present' },
  { id: 'A002', employeeId: '002', employeeName: 'Bob Johnson', role: 'Staff', date: '2024-07-28', inTime: '09:05 AM', outTime: '05:15 PM', status: 'Present' },
  { id: 'A003', employeeId: '003', employeeName: 'Charlie Brown', role: 'Staff',date: '2024-07-28', status: 'Absent' },
  { id: 'A004', employeeId: '101', employeeName: 'Umar Hayat', role: 'Branch Manager', date: '2024-07-28', inTime: '08:45 AM', outTime: '06:00 PM', status: 'Present' },
  { id: 'A005', employeeId: '102', employeeName: 'Abdullah Qarafi', role: 'Shop Keeper', date: '2024-07-28', inTime: '09:00 AM', outTime: '05:30 PM', status: 'Present' },
  { id: 'A006', employeeId: '103', employeeName: 'Shoaib Ashfaq', role: 'Delivery Boy', date: '2024-07-28', inTime: '10:00 AM', outTime: '07:00 PM', status: 'Present' },
  { id: 'A007', employeeId: '104', employeeName: 'Salman Karamat', role: 'Cashier', date: '2024-07-28', inTime: '08:58 AM', outTime: '05:05 PM', status: 'Present' },
  { id: 'A008', employeeId: '105', employeeName: 'Suraqa Zohaib', role: 'Cashier', date: '2024-07-28', status: 'Leave' },
  { id: 'A009', employeeId: '106', employeeName: 'Bilal Karamat', role: 'Cashier', date: '2024-07-28', inTime: '09:10 AM', outTime: '05:00 PM', status: 'Present' },
  { id: 'A010', employeeId: '107', employeeName: 'Kaleemullah Qarafi', role: 'Cashier', date: '2024-07-28', inTime: '09:00 AM', outTime: '04:45 PM', status: 'Present' },
];

const mockSalaries: EmployeeSalary[] = [
  { id: 'S001', employeeId: '001', employeeName: 'Alice Smith', role: 'Staff', month: 'July 2024', basicSalary: 3000, advances: 200, bonuses: 150, deductions: 50, netSalary: 2900 },
  { id: 'S002', employeeId: '002', employeeName: 'Bob Johnson', role: 'Staff', month: 'July 2024', basicSalary: 2800, advances: 0, bonuses: 200, deductions: 20, netSalary: 2980 },
  { id: 'S003', employeeId: '101', employeeName: 'Umar Hayat', role: 'Branch Manager', month: 'July 2024', basicSalary: 5000, advances: 500, bonuses: 300, deductions: 100, netSalary: 4700 },
  { id: 'S004', employeeId: '102', employeeName: 'Abdullah Qarafi', role: 'Shop Keeper', month: 'July 2024', basicSalary: 3200, advances: 100, bonuses: 100, deductions: 30, netSalary: 3170 },
  { id: 'S005', employeeId: '103', employeeName: 'Shoaib Ashfaq', role: 'Delivery Boy', month: 'July 2024', basicSalary: 2500, advances: 0, bonuses: 250, deductions: 25, netSalary: 2725 },
  { id: 'S006', employeeId: '104', employeeName: 'Salman Karamat', role: 'Cashier', month: 'July 2024', basicSalary: 2700, advances: 50, bonuses: 50, deductions: 10, netSalary: 2690 },
  { id: 'S007', employeeId: '105', employeeName: 'Suraqa Zohaib', role: 'Cashier', month: 'July 2024', basicSalary: 2700, advances: 0, bonuses: 0, deductions: 0, netSalary: 2700 },
  { id: 'S008', employeeId: '106', employeeName: 'Bilal Karamat', role: 'Cashier', month: 'July 2024', basicSalary: 2700, advances: 100, bonuses: 75, deductions: 15, netSalary: 2660 },
  { id: 'S009', employeeId: '107', employeeName: 'Kaleemullah Qarafi', role: 'Cashier', month: 'July 2024', basicSalary: 2700, advances: 0, bonuses: 100, deductions: 5, netSalary: 2795 },
];

export default function PerformancePage() {
  const [performanceRecords, setPerformanceRecords] = useState<EmployeePerformance[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<EmployeeAttendance[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<EmployeeSalary[]>([]);

  useEffect(() => {
    // For a real app, data would be fetched from an API / Firestore
    setPerformanceRecords(mockPerformance);
    setAttendanceRecords(mockAttendance);
    setSalaryRecords(mockSalaries);
  }, []);

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
              <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Record</Button>
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
                    <TableHead>Tasks (Completed/Assigned)</TableHead>
                  </TableRow>
                </TableHeaderComponent>
                <TableBody>
                  {performanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.role || 'N/A'}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>PKR {record.salesTarget?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell>PKR {record.salesAchieved?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell>{record.tasksCompleted}/{record.tasksAssigned}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {performanceRecords.length === 0 && <p className="text-center text-muted-foreground py-4">No performance records yet.</p>}
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
              <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Mark Attendance</Button>
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
                  </TableRow>
                </TableHeaderComponent>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.role || 'N/A'}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.inTime || 'N/A'}</TableCell>
                      <TableCell>{record.outTime || 'N/A'}</TableCell>
                      <TableCell>{record.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {attendanceRecords.length === 0 && <p className="text-center text-muted-foreground py-4">No attendance records yet.</p>}
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
               <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Salary Entry</Button>
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
                  </TableRow>
                </TableHeaderComponent>
                <TableBody>
                  {salaryRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.role || 'N/A'}</TableCell>
                      <TableCell>{record.month}</TableCell>
                      <TableCell>PKR {record.basicSalary.toLocaleString()}</TableCell>
                      <TableCell>PKR {record.advances.toLocaleString()}</TableCell>
                      <TableCell>PKR {record.bonuses.toLocaleString()}</TableCell>
                      <TableCell>PKR {record.deductions.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">PKR {record.netSalary.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {salaryRecords.length === 0 && <p className="text-center text-muted-foreground py-4">No salary records yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
