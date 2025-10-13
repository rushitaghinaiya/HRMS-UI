import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable

} from 'rxjs';
import { AttendanceLog, Employee, LeaveHistory,LeaveBalance } from '../Pages/admin-dashboard/admin-dashboard.component';
@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  private baseUrl = 'https://localhost:7014/v1/';
  constructor(private http: HttpClient) { }
  getLeaveRequest(month: number, year: number): Observable<LeaveHistory[]> {
    return this.http.get<LeaveHistory[]>(`${this.baseUrl}Leave/GetAllLeaves?month=${month}&year=${year}`);
  }
   getAttendanceLog(month: number, year: number): Observable<AttendanceLog[]> {
    return this.http.get<AttendanceLog[]>(`${this.baseUrl}Employee/GetAttendanceByMonth?month=${month}&year=${year}`);
  }
  getAllEmployee(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}Employee/GetAllEmployees`);
  }
  updateLeaveStatus(id: number, status: string, approvedBy: number): Observable<any> {
    return this.http.put(`${this.baseUrl}leave/UpdateLeaveStatus/${id}/status?status=${status}&approvedBy=${approvedBy}`, status, {
      headers: { 'Content-Type': 'application/json' }
    });

  }
  updateEmployee(employee: Employee) {
   
    return this.http.put<any>(`${this.baseUrl}Employee/UpdateEmployee`, employee);
  }
  addLeaveBalance(leaves: any) {
    return this.http.post(`${this.baseUrl}Leave/AssignLeave`, leaves);
  }
   // ✅ Get Leave Balance by EmployeeId
  getLeaveBalanceByEmployeeId(empId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}Leave/GetByEmployeeId?employeeId=${empId}`);
  }
  downloadAttendanceReport(month: string, userId: number) {
    return this.http.get(`${this.baseUrl}Leave/GetAttendanceReport?month=${month}&managerId=${userId}&format=excel`, {
      responseType: 'blob'
    });
  }
  downloadLeavesReport(month: string, userId: number) {
    return this.http.get(`${this.baseUrl}Leave/GetLeavesReport?month=${month}&managerId=${userId}&format=excel`, {
      responseType: 'blob'
    });
  }
   getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}Employee/GetRoles`);
  }
  add(employee: Employee): Observable<any> {
     console.log(employee);
    return this.http.post<any>(`${this.baseUrl}Employee/AddEmployee`, employee);
  }

  update(employee: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}Employee/UpdateEmployee`, employee);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
