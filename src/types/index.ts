
export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SaleRecord {
  id: string;
  date: string; // Date of sale in 'yyyy-MM-dd' format
  dateTime: string; // Precise date and time of sale (ISO string)
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'online' | 'credit';
  employeeName: string; // Name of the employee who processed the sale
  employeeId: string; // Unique ID of the employee
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
  employeeId: string; // Unique Employee ID
  employeeName: string;
  role?: string;
  date: string;
  salesTarget?: number;
  salesAchieved?: number;
  tasksCompleted: number;
  tasksAssigned: number;
}

export interface EmployeeAttendance {
  id: string;
  employeeId: string; // Unique Employee ID
  employeeName: string;
  role?: string;
  date: string;
  inTime?: string;
  outTime?: string;
  status: 'Present' | 'Absent' | 'Leave';
}

export interface EmployeeSalary {
  id: string;
  employeeId: string; // Unique Employee ID
  employeeName: string;
  role?: string;
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
  category?: string;
}

// Simplified type for cashier selection
export interface Cashier {
  id: string; // This can be the performance record ID or a specific user ID
  employeeId: string; // The user-facing Employee ID
  name: string;
}

