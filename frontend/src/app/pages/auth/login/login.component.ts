import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../components/notification/notification.service';

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

  constructor(private authService: AuthService, private router: Router, private notificationService: NotificationService) { }

  // In your login component
  login(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: success => {
        if (success) {
          this.router.navigate(['/home']);
        } else {
          this.notificationService.show({ message: 'Login failed', type: 'error' });
        }
      },
      error: err => {
        this.notificationService.show({ message: err.error.error || 'An unknown error occurred', type: 'error' });
        console.error('Subscription error:', err);
      }
    });
  }
}