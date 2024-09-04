import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  editProfileForm!: FormGroup;
  selectedFile!: File;
  profileImageUrl: string = ''; // To hold the profile image URL

  constructor(
    private fb: FormBuilder,
    private authService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.editProfileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      mobile: ['', Validators.required],
      city: ['', Validators.required],
      role: ['', Validators.required],
      image: ['']
    });

    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.authService.getUserProfile().subscribe(
      (response) => {
        if (!response.error) {
          this.editProfileForm.patchValue(response.data);
          this.profileImageUrl = response.data.image; // Set image URL
        } else {
          this.toastr.error(response.msg);
        }
      },
      (error) => {
        this.toastr.error(error.error.msg);
      }
    );
  }

  onImageChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit(): void {
    const formData = new FormData();
    formData.append('firstName', this.editProfileForm.get('firstName')!.value);
    formData.append('lastName', this.editProfileForm.get('lastName')!.value);
    formData.append('email', this.editProfileForm.get('email')!.value);
    formData.append('password', this.editProfileForm.get('password')!.value);
    formData.append('mobile', this.editProfileForm.get('mobile')!.value);
    formData.append('city', this.editProfileForm.get('city')!.value);
    formData.append('role', this.editProfileForm.get('role')!.value);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.authService.updateUserProfile(formData).subscribe(
      (response) => {
        if (!response.error) {
          this.toastr.success(response.msg);
          this.router.navigate(['/dashboard']);
        } else {
          this.toastr.error(response.msg);
        }
      },
      (error) => {
        this.toastr.error(error.error.msg);
      }
    );
  }
}

