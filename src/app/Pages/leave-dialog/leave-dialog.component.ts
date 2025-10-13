import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveBalance } from '../admin-dashboard/admin-dashboard.component';
import { AdminDashboardService } from '../../Services/admin-dashboard.service';

@Component({
  selector: 'app-leave-dialog',
  imports: [FormsModule, CommonModule],
  templateUrl: './leave-dialog.component.html',
  styleUrl: './leave-dialog.component.scss'
})
export class LeaveDialogComponent {
  @Input() employeeId: number = 0;
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();
  today = new Date();
  selectedLeaveBalanceYear: string = `${this.today.getFullYear()}`;
  
  leave: LeaveBalance = {
    leaveType: 'Casual',
    leavePerMonth:0,
    allocated: 0,
    Used: 0,
    Available: 0,
    year: ''
  }
  constructor(private admindashboardService: AdminDashboardService) { }
  ngOnInit() {

    this.getLeaveBalanceByEmp();
  }
  save() {
    this.leave.year = this.selectedLeaveBalanceYear;
    this.onSave.emit(this.leave);
  }

  close() {
    this.onClose.emit();
  }
  LeaveYearChange() {
    this.getLeaveBalanceByEmp();
  }

  getLeaveBalanceByEmp() {
    this.admindashboardService.getLeaveBalanceByEmployeeId(this.employeeId).subscribe(res => {
      debugger;
      this.leave = res.find(l => Number(l.year) === Number(this.selectedLeaveBalanceYear));

    });
    console.log(this.employeeId);
  }
}
