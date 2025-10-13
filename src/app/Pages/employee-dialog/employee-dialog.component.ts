import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDashboardService } from '../../Services/admin-dashboard.service';

interface Role {
  roleId: number;
  roleName: string;
}
interface Manager {
  employeeId: number;
  name: string;
}
@Component({
  selector: 'app-employee-dialog',
  standalone: true,
  templateUrl: './employee-dialog.component.html',
  styleUrls: ['./employee-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
  ]
})
export class EmployeeDialogComponent {
  @Input() employee: any = {};
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();

  roleList: Role[] = [];
  managerList: Manager[] = [];
  probationDurations: number[] = [3, 6, 9, 12];
  selectedProbationMonths: number | null = null;
  today: string = '';
  constructor(private admindashboardService: AdminDashboardService) { }

  ngOnInit() {
    this.getRole();
    this.loadEmployees();
    this.onDateOfJoiningChange();
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // sets max date
  }
  save() {
    if (!this.employee.name || !this.employee.email || !this.employee.roleId || !this.employee.dateOfJoining) {
      return; // stop save if required fields missing
    }
    this.onSave.emit(this.employee);
  }

  close() {
    this.onClose.emit();
  }
  getRole() {
    this.admindashboardService.getRoles().subscribe(res => {
      debugger;
      this.roleList = res;
    });
  }
  loadEmployees() {
    this.admindashboardService.getAllEmployee().subscribe(res => {
      this.managerList = res
    });
  }
  onDateOfJoiningChange() {
    if (this.employee.dateOfJoining) {
      this.employee.startDate = this.employee.dateOfJoining;
      this.calculateProbationEnd(); // also update end date if duration already selected
    }
  }

  calculateProbationEnd() {
    if (this.employee.dateOfJoining && this.selectedProbationMonths) {
      const doj = new Date(this.employee.dateOfJoining);
      const probationEnd = new Date(doj);
      probationEnd.setMonth(probationEnd.getMonth() + Number(this.selectedProbationMonths));
      this.employee.endDate = probationEnd.toISOString().split('T')[0];
    } else {
      this.employee.endDate = ''; // clear if no duration or DOJ
    }
  }
}
