import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';
  submitting = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.authService.restoreSession().subscribe({
      next: (user) => {
        if (user) this.navigateForRole(user.role);
      },
      error: () => {
        this.errorMessage = 'The sign-in service is unavailable. Please try again.';
      }
    });
  }

  useDemoAccount(role: 'Admin' | 'Reporter' | 'Technician'): void {
    const demoAccounts = {
      Admin: { email: 'admin@hackathon.local', password: 'Admin123!' },
      Reporter: { email: 'user@hackathon.local', password: 'User123!' },
      Technician: { email: 'tech@hackathon.local', password: 'Tech123!' }
    };
    this.loginForm.patchValue(demoAccounts[role]);
    this.errorMessage = '';
  }

  submit(): void {
    this.errorMessage = '';
    if (this.submitting) {
      return;
    }

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please enter a valid email and password.';
      return;
    }

    this.submitting = true;
    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {
        this.submitting = false;
        this.navigateForRole(response.role);
      },
      error: (err) => {
        this.submitting = false;
        if (err.status === 401) {
          this.errorMessage = 'Invalid email or password.';
          return;
        }

        this.errorMessage = 'Unable to sign in. Please try again.';
      }
    });
  }

  private navigateForRole(role: string | null): void {
    this.router.navigate([role === 'Admin' ? '/admin' : role === 'Technician' ? '/technician' : '/reporter']);
  }
}
