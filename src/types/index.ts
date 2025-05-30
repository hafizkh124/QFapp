
export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  category?: string; // Added from menu categorization
}

export type OrderType = 'Dine-in' | 'Takeaway' | 'Delivery';

export interface SaleRecord {
  id: string;
  date: string; // Date of sale in 'yyyy-MM-dd' format
  dateTime: string; // Precise date and time of sale (ISO string)
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'online' | 'credit';
  employeeName: string;
  employeeId: string;
  orderType: OrderType; // New field for order type
}

export interface ExpenseRecord {
  id:string;
  date: string;
  category: string;
  description: string;
  amount: number;
  employeeId?: string;
  employeeName?: string;
}

export interface ProfitEntry {
  period: string; // e.g., 'Jan 2024', 'Week 5', '2024-03-15'
  sales: number;
  expenses: number;
  profit: number;
}

// Master Employee Type
export interface ManagedEmployee {
  employeeId: string; // Unique Employee ID
  employeeName: string;
  role: 'admin' | 'manager' | 'employee';
  email: string; // For login
  password?: string; // For login (mocked, plain text for this simulation)
  phone?: string;
  status: 'active' | 'inactive';
}

export interface EmployeePerformance {
  id: string; // Record ID
  employeeId: string;
  employeeName: string;
  role: 'admin' | 'manager' | 'employee'; // Denormalized role at the time of record creation
  date: string;
  salesTarget?: number;
  salesAchieved?: number;
  tasksCompleted: number;
  tasksAssigned: number;
}

export interface EmployeeAttendance {
  id: string; // Record ID
  employeeId: string;
  employeeName: string;
  role: 'admin' | 'manager' | 'employee'; // Denormalized role
  date: string;
  inTime?: string;
  outTime?: string;
  status: 'Present' | 'Absent' | 'Leave';
}

export interface EmployeeSalary {
  id: string; // Record ID
  employeeId: string;
  employeeName: string;
  role: 'admin' | 'manager' | 'employee'; // Denormalized role
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

// User type for AuthContext
export interface AuthUser {
  uid: string; // Can be same as employeeId for simplicity in mock
  email: string | null;
  role: 'admin' | 'manager' | 'employee';
  employeeId?: string; // Link to ManagedEmployee ID
  employeeName?: string;
  status?: 'active' | 'inactive';
}
