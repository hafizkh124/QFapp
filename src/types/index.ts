export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SaleRecord {
  id: string;
  date: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'online';
}

export interface ExpenseRecord {
  id:string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface ProfitEntry {
  period: string; // e.g., 'Jan 2024', 'Week 5', '2024-03-15'
  sales: number;
  expenses: number;
  profit: number;
}

export interface EmployeePerformance {
  id: string;
  employeeName: string;
  date: string;
  salesTarget?: number;
  salesAchieved?: number;
  tasksCompleted: number;
  tasksAssigned: number;
}

export interface EmployeeAttendance {
  id: string;
  employeeName: string;
  date: string;
  inTime?: string;
  outTime?: string;
  status: 'Present' | 'Absent' | 'Leave';
}

export interface EmployeeSalary {
  id: string;
  employeeName: string;
  month: string; // e.g., 'Mar 2024'
  basicSalary: number;
  advances: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category?: string; // Optional for now
}
