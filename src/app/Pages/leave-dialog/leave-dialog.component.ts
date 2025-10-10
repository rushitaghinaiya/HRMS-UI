import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveBalance } from '../admin-dashboard/admin-dashboard.component';

@Component({
  selector: 'app-leave-dialog',
  imports: [FormsModule, CommonModule],
  templateUrl: './leave-dialog.component.html',
  styleUrl: './leave-dialog.component.scss'
})
export class LeaveDialogComponent {
  @Input() emp: any = {};
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();
   today = new Date();
   selectedLeaveBalanceYear: string = `${this.today.getFullYear()}`;
  leaveTypes: LeaveBalance[] = [
    { LeaveType: 'Casual', Allocated: 0, Used: 0, Available: 0 ,Year:''},
    { LeaveType: 'Paid', Allocated: 0, Used: 0, Available:0 ,Year:'' },
    { LeaveType: 'Sick', Allocated: 0, Used: 0, Available: 0 ,Year:''}
  ];
  save() {
   // Assign selected year to all leave types
  this.leaveTypes.forEach(leave => {
    leave.Year = this.selectedLeaveBalanceYear;
  });
    this.onSave.emit(this.leaveTypes);
  }

  close() {
    this.onClose.emit();
  }
}
