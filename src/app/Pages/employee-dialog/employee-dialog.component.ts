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
  constructor(private admindashboardService:AdminDashboardService) { }

  ngOnInit(){
    this.getRole();
    this.loadEmployees();
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
  getRole(){
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
}
