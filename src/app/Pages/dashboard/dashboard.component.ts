import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../Services/dashboard.service';
import { HttpClientModule } from '@angular/common/http';

export interface Employee {
  employeeId: number;
  name: string;
  roleName: string;
  email: string;
  managerName: string;
  dateOfBirth: Date;
  dateOfJoining: Date;
}

interface LeaveBalance {
  LeaveType: string;
  Allocated: number;
  Used: number;
  Available: number
}
export interface AttendanceRecord {
  Date: string;
  CheckIn: string;
  CheckOut: string;
  Hours: string;
}

export interface LeaveHistory {
  Type: string;
  StartDate: string;
  EndDate: string;
  Days: number;
  Status: string;
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
  date: string;
  checkInTime: string;
  checkOutTime: string;
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
export interface LeaveRequest {
  employeeId: number;
  leaveType: string;       // Casual, Sick, Paid, etc.
  startDate: string;       // ISO string from API e.g. "2025-10-05T00:00:00"
  endDate: string;         // ISO string
  reason?: string;         // optional
 
}


@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  activeTab: string = 'dashboard';

 // leaveRequest: LeaveRequest|null = null;
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
    managerName: '',
    roleName: '',
    dateOfBirth: new Date,
    dateOfJoining: new Date
  }
  userId: number = 0;
  // Form data
  leaveFormData : LeaveRequest={
     
    employeeId:0,
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',

  };

  selectedMonth: string = '';
  checkInTime: Date | null = null;
  checkOutTime: Date | null = null;
  elapsedTime: string = '';
  totalWorkedTime: string = '';
  holidays: HolidayDto[] = [];
  birthdays: BirthdayDto[] = [];
  private intervalId: any;

  // leaveBalance: LeaveBalance = {
  //   casual: { allocated: 12, used: 3, available: 9 },
  //   sick: { allocated: 10, used: 2, available: 8 },
  //   paid: { allocated: 15, used: 5, available: 10 }
  // };

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    debugger;
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
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

  getDashboard() {
    this.dashboardService.getEmployeeById(this.userId).subscribe(res => {
      this.employee = res;
      debugger;
    });
    // Call user dashboard API
    this.dashboardService.getUserDashboard(this.userId).subscribe(res => {
      this.leaveBalance = res.leaveBalance;
      this.recentAttendance = res.recentAttendance;
      this.leaveHistory = res.leaveHistory;
    });

    // Call global dashboard API
    this.dashboardService.getGlobalDashboard().subscribe(res => {
      debugger;
      this.upcomingHolidays = res.upcomingHolidays;
      this.upcomingBirthdays = res.upcomingBirthdays;
    });
    this.dashboardService.getTotalDayById(this.userId).subscribe(res => {
      debugger;
      this.totalDay = res;
    });
  }
  submitLeaveRequest() {
    debugger;
    this.leaveFormData.employeeId=this.userId;
    this.dashboardService.applyLeave(this.leaveFormData).subscribe(res => {
      if (res=='success') {
        
      }
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
    debugger;
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

  cancelLeaveRequest(): void {
    this.leaveFormData = {
      employeeId:0,
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
}