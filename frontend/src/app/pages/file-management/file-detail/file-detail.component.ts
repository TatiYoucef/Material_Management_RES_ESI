import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from '../../../services/file.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../components/notification/notification.service';

@Component({
  selector: 'app-file-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-detail.component.html',
  styleUrl: './file-detail.component.scss'
})
export class FileDetailComponent implements OnInit {
  file: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fileService: FileService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadFile();
  }

  loadFile(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fileService.getFile(id).subscribe({
        next: data => {
          this.file = data;
        },
        error: err => {
          this.notificationService.show({ message: err.error.error || 'Failed to load file details.', type: 'error' });
        }
      });
    }
  }

  downloadFile(): void {
    if (this.file) {
      this.fileService.downloadFile(this.file.id).subscribe({
        next: blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = this.file.originalname;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: err => {
          this.notificationService.show({ message: err.error.error || 'Failed to download file.', type: 'error' });
        }
      });
    }
  }

  deleteFile(): void {
    if (this.file && confirm('Are you sure you want to delete this file?')) {
      this.fileService.deleteFile(this.file.id).subscribe({
        next: () => {
          this.router.navigate(['/files']);
          this.notificationService.show({ message: 'File deleted successfully.', type: 'success' });
        },
        error: err => {
          this.notificationService.show({ message: err.error.error || 'Failed to delete file.', type: 'error' });
        }
      });
    }
  }
}
