import { Component, OnInit } from '@angular/core';
import { FileService } from '../../services/file.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
  errorMessage: string = '';
  showUploadForm: boolean = false; // Control visibility of upload form
  searchQuery: string = ''; // For search functionality

  constructor(private fileService: FileService) { }

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.fileService.getFiles(this.searchQuery).subscribe(
      data => {
        this.files = data.reverse();
      },
      error => {
        this.errorMessage = 'Failed to load files.';
        console.error('Error loading files:', error);
      }
    );
  }

  onFileSelected(event: any): void {
    this.newFile = event.target.files[0];
  }

  uploadFile(): void {
    if (this.newFile && this.newFileTitle) {
      this.fileService.uploadFile(this.newFile, this.newFileTitle, this.newFileDescription).subscribe(
        response => {
          console.log('File uploaded successfully:', response);
          this.loadFiles();
          this.newFile = null;
          this.newFileTitle = '';
          this.newFileDescription = '';
          this.errorMessage = '';
          this.showUploadForm = false; // Hide form after successful upload
        },
        error => {
          this.errorMessage = error.error.error || 'Failed to upload file.';
          console.error('Error uploading file:', error);
        }
      );
    } else {
      this.errorMessage = 'Please select a file and provide a title.';
    }
  }

  downloadFile(id: string, filename: string): void {
    this.fileService.downloadFile(id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  toggleUploadForm(): void {
    this.showUploadForm = !this.showUploadForm;
  }
}
