import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from '../../../services/file.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-detail.component.html',
  styleUrl: './file-detail.component.scss'
})
export class FileDetailComponent implements OnInit {
  file: any;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fileService: FileService
  ) { }

  ngOnInit(): void {
    this.loadFile();
  }

  loadFile(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fileService.getFile(id).subscribe(
        data => {
          this.file = data;
        },
        error => {
          this.errorMessage = 'Failed to load file details.';
          console.error('Error loading file:', error);
        }
      );
    }
  }

  downloadFile(): void {
    if (this.file) {
      this.fileService.downloadFile(this.file.id).subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.file.originalname;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
    }
  }

  deleteFile(): void {
    if (this.file && confirm('Are you sure you want to delete this file?')) {
      this.fileService.deleteFile(this.file.id).subscribe(
        () => {
          this.router.navigate(['/files']);
        },
        error => {
          this.errorMessage = 'Failed to delete file.';
          console.error('Error deleting file:', error);
        }
      );
    }
  }
}
