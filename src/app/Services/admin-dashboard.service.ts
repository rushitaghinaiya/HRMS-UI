import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable

 } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

   private baseUrl = 'https://localhost:7014/v1/';
  constructor(private http: HttpClient) { }
  getLeaveRequest(month: number, year: number ) {
    return this.http.get<any>(`${this.baseUrl}Leave/GetAllLeaves?month=${month}&year=${year}`);
  }
  updateLeaveStatus(id: number, status: string,approvedBy:number): Observable<any> {
  return this.http.put(`${this.baseUrl}leave/UpdateLeaveStatus/${id}/status?status=${status}&approvedBy=${approvedBy}`, status, {
    headers: { 'Content-Type': 'application/json' }
  });
}

}
