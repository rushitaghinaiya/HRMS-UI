import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoginData {
  email: string;
  otp: string;
}

@Injectable({ providedIn: 'root' })

export class AuthService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();
  constructor(private http: HttpClient) { }
  get isLoading(): boolean {
    return this.isLoadingSubject.value;
  }
  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  saveTokens(access: string, refresh: string) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  refreshToken() {
    return this.http.post('/auth/refresh-token', {
      accessToken: localStorage.getItem('access_token'),
      refreshToken: localStorage.getItem('refresh_token')
    });
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // redirect to login
  }

  async login(userType: string, userData: LoginData): Promise<void> {
    this.isLoadingSubject.next(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock login validation
      if (userData.otp === '123456') {
        // Store user data in localStorage or sessionStorage
        localStorage.setItem('user', JSON.stringify({
          userType,
          email: userData.email,
          isAuthenticated: true
        }));
        return Promise.resolve();
      } else {
        throw new Error('Invalid OTP');
      }
    } finally {
      this.isLoadingSubject.next(false);
    }
  }



  isAuthenticated(): boolean {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).isAuthenticated : false;
  }
}
