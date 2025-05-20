'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { EmployeePerformance, EmployeeAttendance, EmployeeSalary } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// Mock Data
const mockPerformance: EmployeePerformance[] = [
  { id: 'P001', employeeName: 'Alice Smith', date: '2024-07-28', salesTarget: 500, salesAchieved: 480, tasksCompleted: 8, tasksAssigned: 10 },
  { id: 'P002', employeeName: 'Bob Johnson', date: '2024-07-28', salesTarget: 400, salesAchieved: 410, tasksCompleted: 10, tasksAssigned: 10 },
];

const mockAttendance: EmployeeAttendance[] = [
  { id: 'A001', employeeName: 'Alice Smith', date: '2024-07-28', inTime: '09:00 AM', outTime: '05:00 PM', status: 'Present' },
  { id: 'A002', employeeName: 'Bob Johnson', date: '2024-07-28', inTime: '09:05 AM', outTime: '05:15 PM', status: 'Present' },
  { id: 'A003', employeeName: 'Charlie Brown', date: '2024-07-28', status: 'Absent' },
];

const mockSalaries: EmployeeSalary[] = [
  { id: 'S001', employeeName: 'Alice Smith', month: 'July 2024', basicSalary: 3000, advances: 200, bonuses: 150, deductions: 50, netSalary: 2900 },
  { id: 'S002', employeeName: 'Bob Johnson', month: 'July 2024', basicSalary: 2800, advances: 0, bonuses: 200, deductions: 20, netSalary: 2980 },
];

export default function PerformancePage() {
  const [performanceRecords, setPerformanceRecords] = useState<EmployeePerformance[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<EmployeeAttendance[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<EmployeeSalary[]>([]);

  useEffect(() => {
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
            <CardHeader>
              <CardTitle>Daily Performance Records</CardTitle>
              <CardDescription>Monitor sales targets and task completion.</CardDescription>
              <Button size="sm" className="ml-auto"><PlusCircle className="mr-2 h-4 w-4" /> Add Record</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeaderComponent>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Sales Target</TableHead>
                    <TableHead>Sales Achieved</TableHead>
                    <TableHead>Tasks (Completed/Assigned)</TableHead>
                  </TableRow>
                </TableHeaderComponent>
                <TableBody>
                  {performanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeName}</TableCell>
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
            <CardHeader>
              <CardTitle>Employee Attendance</CardTitle>
              <CardDescription>Track daily in-time and out-time.</CardDescription>
              <Button size="sm" className="ml-auto"><PlusCircle className="mr-2 h-4 w-4" /> Mark Attendance</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeaderComponent>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>In-Time</TableHead>
                    <TableHead>Out-Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeaderComponent>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeName}</TableCell>
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
            <CardHeader>
              <CardTitle>Salary Details</CardTitle>
              <CardDescription>Manage monthly salaries, advances, bonuses, and deductions.</CardDescription>
               <Button size="sm" className="ml-auto"><PlusCircle className="mr-2 h-4 w-4" /> Add Salary Entry</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeaderComponent>
                  <TableRow>
                    <TableHead>Employee</TableHead>
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
                      <TableCell>{record.employeeName}</TableCell>
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
