import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';

@Component({
  selector: 'app-post-vacancy',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, RecruiterAccount],
  templateUrl: './post-vacancy.html',
  styleUrl: './post-vacancy.css',
})
export class PostVacancy {
  vacancyForm = new FormGroup({
    jobTitle: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    employmentType: new FormControl('Full-time', [Validators.required]),
    salaryRange: new FormControl(''),
    description: new FormControl('', [Validators.required]),
    requirements: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.vacancyForm.valid) {
      console.log('Vacancy Posted:', this.vacancyForm.value);
      alert('Vacancy posted successfully!');
      this.vacancyForm.reset({
        employmentType: 'Full-time'
      });
    } else {
      Object.keys(this.vacancyForm.controls).forEach(key => {
        const control = this.vacancyForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
