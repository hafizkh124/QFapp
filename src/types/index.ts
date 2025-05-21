
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
  cashierName: string; // Name of the cashier/employee who processed the sale
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
  role?: string; // Added role
  date: string;
  salesTarget?: number;
  salesAchieved?: number;
  tasksCompleted: number;
  tasksAssigned: number;
}

export interface EmployeeAttendance {
  id: string;
  employeeName: string;
  role?: string; // Added role
  date: string;
  inTime?: string;
  outTime?: string;
  status: 'Present' | 'Absent' | 'Leave';
}

export interface EmployeeSalary {
  id: string;
  employeeName: string;
  role?: string; // Added role
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

    
