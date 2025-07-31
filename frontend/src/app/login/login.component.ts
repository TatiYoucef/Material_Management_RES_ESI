import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username!: string;
  password!: string;
  loginError: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  // In your login component
  login(): void {
    this.loginError = false; // Reset error state
    this.authService.login(this.username, this.password).subscribe({
      next: success => {
        if (success) {
          this.router.navigate(['/home']);
        } else {
          this.loginError = true;
        }
      },
      error: err => {
        this.loginError = true;
        console.error('Subscription error:', err);
      }
    });
  }
}