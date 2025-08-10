import { Component, OnInit } from '@angular/core';
import { FileService } from '../../../services/file.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../components/notification/notification.service';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.scss'
})
export class FileListComponent implements OnInit {
  files: any[] = [];
  newFile: File | null = null;
  newFileTitle: string = '';
  newFileDescription: string = '';
  newFileType: string = 'Facture'; // Default type
  newFileSupplier: string = '';
  newFactureDate: string = '';
  showUploadForm: boolean = false; // Control visibility of upload form
  searchQuery: string = ''; // For search functionality
  fileType: string = ''; // For filtering
  supplier: string = ''; // For filtering
  fromDate: string = '';
  toDate: string = '';
  factureFromDate: string = '';
  factureToDate: string = '';

  constructor(private fileService: FileService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.fileService.getFiles(
      this.searchQuery,
      this.fileType,
      this.supplier,
      this.fromDate,
      this.toDate,
      this.factureFromDate,
      this.factureToDate
    ).subscribe({
      next: data => {
        this.files = data.reverse();
      },
      error: err => {
        this.notificationService.show({ message: err.error.error || 'Failed to load files.', type: 'error' });
      }
    });
  }

  onFileSelected(event: any): void {
    this.newFile = event.target.files[0];
  }

  uploadFile(): void {
    if (this.newFile && this.newFileTitle) {
      if (this.newFileType === 'Facture' && !this.newFactureDate) {
        this.notificationService.show({ message: 'Facture Date is required for Facture files.', type: 'warning' });
        return;
      }
      this.fileService.uploadFile(
        this.newFile,
        this.newFileTitle,
        this.newFileDescription,
        this.newFileType,
        this.newFileSupplier,
        this.newFileType === 'Facture' ? this.newFactureDate : undefined
      ).subscribe({
        next: response => {
          this.notificationService.show({ message: 'File uploaded successfully.', type: 'success' });
          this.loadFiles();
          this.newFile = null;
          this.newFileTitle = '';
          this.newFileDescription = '';
          this.newFileType = 'Facture';
          this.newFileSupplier = '';
          this.newFactureDate = '';
          this.showUploadForm = false; // Hide form after successful upload
        },
        error: err => {
          this.notificationService.show({ message: err.error.error || 'Failed to upload file.', type: 'error' });
        }
      });
    } else {
      this.notificationService.show({ message: 'Please select a file and provide a title.', type: 'warning' });
    }
  }

  downloadFile(id: string, filename: string): void {
    this.fileService.downloadFile(id).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.notificationService.show({ message: 'File downloaded successfully.', type: 'success' });
      },
      error: err => {
        this.notificationService.show({ message: err.error.error || 'Failed to download file.', type: 'error' });
      }
    });
  }

  toggleUploadForm(): void {
    this.showUploadForm = !this.showUploadForm;
  }
}
