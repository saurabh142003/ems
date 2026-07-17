export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: "Super Admin" | "HR Manager" | "Employee";
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: "Active" | "Inactive" | "Suspended";
  manager: Employee | null;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  token: string | null;
  user: Employee | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface DashboardStats {
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    suspendedEmployees: number;
    departmentCount: number;
  };
  charts: {
    departmentDistribution: Array<{ department: string; count: number }>;
    statusDistribution: Array<{ status: string; count: number }>;
    monthlyTrends: Array<{ month: string; count: number }>;
  };
}
