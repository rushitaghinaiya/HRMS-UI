import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../Services/dashboard.service';
import { AdminDashboardService } from '../../Services/admin-dashboard.service';
import { EmployeeDialogComponent } from '../employee-dialog/employee-dialog.component';
import { LeaveDialogComponent } from '../leave-dialog/leave-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
export interface Employee {
  employeeId: number;
  name: string;
  roleName: string;
  email: string;
  managerId: number;
  managerName: string;
  dateOfBirth: Date;
  dateOfJoining: Date;
  remarks?: string;
  probationId?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

export interface LeaveBalance {
  leaveType: string;
  allocated: number;
  Used: number;
  Available: number
  year: string
  leavePerMonth:number
}
export interface AttendanceRecord {
  Date: string;
  CheckIn: string;
  CheckOut: string;
  Hours: string;
}

export interface LeaveHistory {
  name:number;
  leaveId: number;
  managerId: number;
  email: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  availableLeave:number;
  status: string;
  reason: string;
  appliedDate: string;
}

export interface Holiday {
  Date: string;
  Name: string;
  Type: string;
}

export interface Birthday {
  Date: string;
  Name: string;
  Department: string;
}
export interface TotalDay {
  month: string;
  workingDays: number;
  leaveCount: number;
  pendingLeave: number
  presentDays: number;
  attendancePercent: number;
}
export interface UserDashboardResponse {
  leaveBalance: LeaveBalance[];
  recentAttendance: AttendanceRecord[];
  leaveHistory: LeaveHistory[];
}

export interface GlobalDashboardResponse {
  upcomingHolidays: Holiday[];
  upcomingBirthdays: Birthday[];
}
export interface AttendanceLog {
  logId?: number;       // DB will generate this
  employeeId: number;
  name?: string;
  email?: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  managerId?: number;
  hours?: string;
}
export interface HolidayDto {
  holidayId: number;
  date: string;     // API will return as ISO string (e.g., "2025-10-02T00:00:00")
  name: string;
  type: string;     // e.g. Public, Optional, Company
}

export interface BirthdayDto {
  employeeId: number;
  name: string;
  department: string;
  dateOfBirth: string; // also ISO string
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule, CommonModule, EmployeeDialogComponent, LeaveDialogComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  activeTab: string = 'dashboard';
  selectedLeaveMonth: string = '';
  selectedLeaveBalanceYear: string = '';
  leaveBalance: LeaveBalance[] = [];
  recentAttendance: AttendanceRecord[] = [];
  leaveHistory: LeaveHistory[] = [];
  upcomingHolidays: Holiday[] = [];
  upcomingBirthdays: Birthday[] = [];
  totalDay: TotalDay = {
    workingDays: 0,
    attendancePercent: 0,
    leaveCount: 0,
    pendingLeave: 0,
    month: '',
    presentDays: 0
  }
  employee: Employee = {
    employeeId: 0,
    name: '',
    email: '',
    managerId: 0,
    managerName: '',
    roleName: '',
    dateOfBirth: new Date,
    dateOfJoining: new Date
  }
  attendanceLog: AttendanceLog[] = [];
  employeeList: Employee[] = [];
  userId: number = 0;
  // Form data
  leaveFormData = {
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  };
  editingRow: number | null = null; // holds employeeId of row being edited
  editedEmployee: any = {};

  selectedMonthYear: string = ''; // format: "2025-10"
  selectedAttMonthYear: string = ''; // format: "2025-10"

  selectedMonth: string = '';
  checkInTime: Date | null = null;
  checkOutTime: Date | null = null;
  elapsedTime: string = '';
  totalWorkedTime: string = '';
  holidays: HolidayDto[] = [];
  birthdays: BirthdayDto[] = [];
  private intervalId: any;

  // Default 3 leave types
  // leaveTypes: LeaveBalance[] = [
  //   { leaveType: 'Casual', allocated: 0, Used: 0, Available: 0, year: '' },
  //   { leaveType: 'Paid', allocated: 0, Used: 0, Available: 0, year: '' },
  //   { leaveType: 'Sick', allocated: 0, Used: 0, Available: 0, year: '' }
  // ];
  private router = inject(Router);
  constructor(private dashboardService: DashboardService, private dialog: MatDialog, private admindashboardService: AdminDashboardService) { }

  ngOnInit(): void {

    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.employee = user;
      this.userId = user.employeeId; // <-- get ID
      console.log('User ID:', this.userId);
    }
    this.getDashboard();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // // Load holidays
    // this.dashboardService.getHolidays(currentYear).subscribe(res => {
    //   this.holidays = res;
    // });

    // // Load birthdays
    // this.dashboardService.getBirthdays(currentMonth).subscribe(res => {
    //   this.birthdays = res;
    // });
  }
  Redirect() {
     this.router.navigate(['/dashboard']);
  }
  getDashboard() {
    // this.dashboardService.getEmployeeById(this.userId).subscribe(res => {
    //   this.employee = res;
    // });

    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    this.selectedMonthYear = this.selectedLeaveMonth = this.selectedAttMonthYear = `${today.getFullYear()}-${month}`;

    this.admindashboardService.getLeaveRequest(today.getMonth() + 1, today.getFullYear()).subscribe(res => {
      this.leaveHistory = this.employee.roleName == 'Admin' ? res : res.filter(l => l.managerId === this.userId);
    });

    this.admindashboardService.getAttendanceLog(today.getMonth() + 1, today.getFullYear()).subscribe(res => {
      this.attendanceLog = this.employee.roleName == 'Admin' ? res : res.filter(l => l.managerId === this.userId);
    });


    this.loadEmployees();
    // Call global dashboard API
    this.dashboardService.getGlobalDashboard().subscribe(res => {
      this.upcomingHolidays = res.upcomingHolidays;
      this.upcomingBirthdays = res.upcomingBirthdays;
    });
    this.dashboardService.getTotalDayById(this.userId).subscribe(res => {

      this.totalDay = res;
    });
  }
  loadEmployees() {
    this.admindashboardService.getAllEmployee().subscribe(res => {
      var empList = this.employee.roleName == 'Admin' ? res : res.filter(e => e.managerId == this.userId)
      this.employeeList = empList.map((emp: any) => ({
        ...emp,
        dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.split('T')[0] : null,
        dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : null
      }));
    });
  }
  onMonthChange(event: any): void {
    const [year, month] = this.selectedMonthYear.split('-').map(Number);
    this.admindashboardService.getLeaveRequest(month, year).subscribe(res => {
      this.leaveHistory = this.employee.roleName == 'Admin' ? res : res.filter(l => l.managerId === this.userId);
    });

  }
  onAttendanceMonthchnge(event: any): void {
    const [year, month] = this.selectedAttMonthYear.split('-').map(Number);

    this.admindashboardService.getAttendanceLog(month, year).subscribe(res => {
      this.attendanceLog = this.employee.roleName == 'Admin' ? res : res.filter(l => l.managerId === this.userId);
    });
  }
  downloadAttendance(month: string) {
    this.admindashboardService.downloadAttendanceReport(month, this.userId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${month}.csv`;
      a.click();
    });
  }

  downloadLeaves(month: string) {
    this.admindashboardService.downloadLeavesReport(month, this.userId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leaves_${month}.csv`;
      a.click();
    });
  }

  handleCheckIn(): void {
    this.checkInTime = new Date();
    this.updateElapsedTime();

    // Start live counter
    this.intervalId = setInterval(() => this.updateElapsedTime(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  updateStatus(leaveId: number, status: string): void {
    this.admindashboardService.updateLeaveStatus(leaveId, status, this.userId).subscribe({
      next: () => {
        alert("Status updated successfully")
        // Update local data instead of reloading everything
        const leave = this.leaveHistory.find(l => l.leaveId === leaveId);
        if (leave) leave.status = status;
      },
      error: (err) => console.error('Error updating status', err)
    });
  }

  handleCheckOut(): void {
    if (!this.checkInTime) return;

    this.checkOutTime = new Date();

    // Stop live counter
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Final total time
    const diffMs = this.checkOutTime.getTime() - this.checkInTime.getTime();
    this.totalWorkedTime = this.formatTime(diffMs);

    // 🟢 Build log object
    const log: AttendanceLog = {
      employeeId: this.userId,
      date: new Date().toISOString().split('T')[0],           // YYYY-MM-DD
      checkInTime: this.checkInTime.toISOString(),
      checkOutTime: this.checkOutTime.toISOString()
    };

    // 🟢 Save to DB
    this.dashboardService.saveAttendance(log).subscribe({
      next: (res) => console.log('Attendance saved', res),
      error: (err) => console.error('Error saving attendance', err)
    });
  }
  private updateElapsedTime(): void {
    if (!this.checkInTime) return;

    const now = new Date().getTime();
    const diffMs = now - this.checkInTime.getTime();
    this.elapsedTime = this.formatTime(diffMs);
  }

  private formatTime(diffMs: number): string {
    const diffSec = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  getFirstName(fullName: string): string {
    return fullName.split(' ')[0];
  }

  getInitial(name: string): string {

    return name.charAt(0);
    //return 'j';
  }

  getLeaveBalanceEntries(): Array<[string, any]> {

    return Object.entries(this.leaveBalance);
  }

  capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  getHolidayDay(dateString: string): number {
    return new Date(dateString).getDate();
  }

  getHolidayMonth(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short' });
  }

  submitLeaveRequest(): void {
    console.log('Leave request submitted:', this.leaveFormData);
    // Add your leave submission logic here
    alert('Leave request submitted successfully!');
  }

  cancelLeaveRequest(): void {
    this.leaveFormData = {
      leaveType: 'Casual Leave',
      startDate: '',
      endDate: '',
      reason: ''
    };
  }

  downloadReport(reportType: string): void {
    console.log(`Downloading ${reportType} report...`);
    // Add your download logic here
    alert(`${reportType} report download initiated!`);
  }

  // Icon mappings for lucide-react equivalent icons
  // You would need to install an icon library like ng-lucide or use SVG icons
  getIconSvg(iconName: string): string {
    // This is a placeholder - you would implement actual SVG icons
    const icons: { [key: string]: string } = {
      'users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
      'clock': 'M12 2v10l3 3',
      'calendar': 'M3 6h18M3 12h18',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12',
      'trending-up': 'M23 6l-9.5 9.5-5-5L1 18',
      'gift': 'M20 12v10H4V12',
      'check-circle': 'M22 11.08V12a10 10 0 1 1-5.93-9.14',
      'x-circle': 'M10 10l4 4m0-4l-4 4',
      'alert-circle': 'M12 9v2m0 4h.01'
    };
    return icons[iconName] || '';
  }
  // copy of employee being edited

  // employee-list.component.ts
  dialogOpen = false;
  leaveDialogOpen = false;

  selectedEmployee: any = {};
  addLeaveBalance: any = {};


  openDialog(emp?: any) {
    this.selectedEmployee = emp ? { ...emp } : {};
    if (this.selectedEmployee.startDate) {
      this.selectedEmployee.startDate = this.selectedEmployee.startDate.split('T')[0];
    }
    if (this.selectedEmployee.endDate) {
      this.selectedEmployee.endDate = this.selectedEmployee.endDate.split('T')[0];
    }
    this.dialogOpen = true;
  }

  openLeaveDialog(emp?: any) {
    this.selectedEmployee = emp ? { ...emp } : {};
    this.leaveDialogOpen = true;
  }

  handleSave(emp: any) {
    if (emp.employeeId) {
      // Update employee
      this.admindashboardService.updateEmployee(emp).subscribe({
        next: () => this.loadEmployees(),
        error: (err) => console.error('Update failed', err)
      });
    } else {
      // Add employee
      this.admindashboardService.add(emp).subscribe({
        next: () => this.loadEmployees(),
        error: (err) => console.error('Add failed', err)
      });
    }
    this.dialogOpen = false;
  }

  handleLeaveSave(leave: any) {
    debugger
    const leaves = {
      EmployeeId: this.selectedEmployee.employeeId,
      LeaveType: 'per month',
      Allocated: leave.allocated,
      LeavePerMonth:leave.leavePerMonth,
      Used: leave.Used,
      Year: leave.year
    };
    this.leaveDialogOpen = false;

    this.admindashboardService.addLeaveBalance(leaves).subscribe({
      next: () => {
        alert('Leave balance assigned successfully!');
        //this.getAllLeaveBalances();
      },
      error: (err) => console.error(err)
    });
  }

  save() {
    if (!this.employee.name || !this.employee.email) {
      return; // stop save if required fields missing
    }
  }

  close() {
  }

}