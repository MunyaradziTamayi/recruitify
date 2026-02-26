import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvExtractionService } from '../../services/cv-extraction.service';
import { CandidateProfileDto } from '../../models/candidate-profile.model';

@Component({
    selector: 'app-cv-upload',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cv-upload.component.html',
    styleUrl: './cv-upload.component.css'
})
export class CvUploadComponent {
    selectedFile: File | null = null;
    profile: CandidateProfileDto | null = null;
    isLoading = false;
    error: string | null = null;
    @Output() onUploadSuccess = new EventEmitter<CandidateProfileDto>();

    constructor(private cvService: CvExtractionService) { }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            this.selectedFile = input.files[0];
            this.profile = null;
            this.error = null;
        }
    }

    uploadCV(): void {
        if (!this.selectedFile) return;

        this.isLoading = true;
        this.error = null;

        this.cvService.uploadCV(this.selectedFile).subscribe({
            next: (profile) => {
                this.profile = profile;
                this.isLoading = false;
                // Save extracted profile to sessionStorage to be used in the profile page
                sessionStorage.setItem('extractedProfile', JSON.stringify(profile));
                this.onUploadSuccess.emit(profile);
            },
            error: (err) => {
                this.error = 'Failed to extract CV. Please try again.';
                this.isLoading = false;
                console.error(err);
            }
        });
    }

    clearSelection(): void {
        this.selectedFile = null;
        this.profile = null;
        this.error = null;
    }
}
