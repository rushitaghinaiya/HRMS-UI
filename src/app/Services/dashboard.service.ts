import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDashboardResponse,GlobalDashboardResponse,Employee,TotalDay,AttendanceLog} from '../Pages/dashboard/dashboard.component';
@Injectable({ providedIn: 'root' })
export class DashboardService {

   private baseUrl = 'https://localhost:7014/v1/'; // 👈 adjust for your API

  constructor(private http: HttpClient) {}

  // ✅ Fetch user-specific dashboard
  getUserDashboard(userId: number): Observable<UserDashboardResponse> {
    return this.http.get<UserDashboardResponse>(`${this.baseUrl}Employee/GetUserDashboard/${userId}`);
  }

  // ✅ Fetch global dashboard
  getGlobalDashboard(): Observable<GlobalDashboardResponse> {
    return this.http.get<GlobalDashboardResponse>(`${this.baseUrl}Employee/GetGlobalDashboard`);
  }

   // ✅ Fetch employee by employee id
  getEmployeeById(userId: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}Employee/GetEmployeeById/${userId}`);
  }
   // ✅ Fetch employee by employee id
  getTotalDayById(userId: number): Observable<TotalDay> {
    return this.http.get<TotalDay>(`${this.baseUrl}Employee/GetEmployeeAttendancePercent/${userId}`);
  }

  saveAttendance(log: AttendanceLog): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}Employee/SaveAttendanceLog`, log);
  }
}
