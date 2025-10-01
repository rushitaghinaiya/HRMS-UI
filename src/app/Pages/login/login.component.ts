import { AuthService } from '../../Services/auth.service';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface LoginData {
  otp: string;
  userId: number;
  email: string;
}
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private baseUrl = 'https://localhost:7014/v1/';
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  LoginData: LoginData = {
    userId: 0,
    otp: '',
    email: ''

  };
  showOTP = false;
  isLoading = false;
  constructor(private http: HttpClient) { }
  adminForm: FormGroup = this.fb.group({
    emailId: ['', [Validators.required, Validators.email]],
    otp: ['']
  });

  get mobile() {
    return this.adminForm.get('mobile');
  }

  get emailId() {
    return this.adminForm.get('emailId');
  }
  get otp() {
    return this.adminForm.get('otp');
  }

  checkUserExists(email: string): Observable<any> {
    const cleanMobile = email.replace(/\D/g, '');
    return this.http.post<any>(`${this.baseUrl}UserSignUp/RequestOtp`, {email}).pipe(
      catchError(() => of({ success: false })) // return default structure on error
    );
  }

  handleSendOTP(): void {
    const emailValue = this.emailId?.value;

    if (!emailValue || emailValue.trim() === '') {

      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
      return;
    }

    this.checkUserExists(emailValue).subscribe(response => {
      if (!response.success) {
        alert("User Not Found");
        return;
      }

      alert(response.message);
      this.showOTP = true;
      localStorage.setItem('user', JSON.stringify(response.data));
      console.log(response.data)
      // Continue your logic for existing admin here
    });


    // Add OTP validation when OTP field becomes visible
    this.adminForm.get('otp')?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
    this.adminForm.get('otp')?.updateValueAndValidity();


  }

  handleSubmit() {
    if (!this.showOTP) {
      // Validate  email first
      if (this.adminForm.get('emailId')?.invalid) {
        this.adminForm.get('emailId')?.markAsTouched();

        return;
      }
      this.handleSendOTP();
      return;
    }

    // Mark OTP field as touched to trigger validation display
    this.adminForm.get('otp')?.markAsTouched();

    // Validate OTP
    if (this.adminForm.get('otp')?.invalid) {

      return;
    }

    // Additional check for empty OTP value (even if form is valid)
    const otpValue = this.adminForm.get('otp')?.value;
    if (!otpValue || otpValue.trim() === '') {

      return;
    }

    if (otpValue.length !== 6) {

      return;
    }

    try {
      this.isLoading = true;
      this.LoginData = {
        otp: this.adminForm.value.otp,
        userId: 0,
        email: this.adminForm.value.emailId
      };

      this.verifyOtp(this.LoginData).subscribe(response => {
        debugger;
        if (!response.success) {
          alert("OTP Verification Failed");

          this.isLoading = false;
          return;
        }
        localStorage.setItem('accessToken', response.accessToken);


        this.router.navigate(['/dashboard']);
        this.isLoading = false;
      });

    } finally {
      this.isLoading = false;
    }
  }

  verifyOtp(adminData: LoginData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}UserSignUp/VerifyOtp`, adminData).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error("OTP verification failed:", error);
        return of({ success: false });
      })
    );
  }


}