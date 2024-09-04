import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../../services/user.model';
import { CommonModule } from '@angular/common';
import { RolePermissionService } from '../../../services/role-permission.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  userId: number | null = null;
  roles: any[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private rolePermissionService: RolePermissionService, // Inject the role permission service
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      mobile: ['', [Validators.required]],
      city: ['', [Validators.required]],
      role: ['vendor', [Validators.required]],
      image: ['']
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ? +this.route.snapshot.paramMap.get('id')! : null;
    this.loadRoles();
  
    if (this.userId) {
      // Editing existing user
      this.loadUser();
    } else {
      // Adding new user, make password required
      this.userForm.get('password')?.setValidators([Validators.required]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }
  

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadRoles(): void {
    const sub = this.rolePermissionService.getRoles().subscribe(
      (response: any) => {
        this.roles = response.data; // Access the data array
        // console.log(this.roles);
      },
      (error) => {
        console.error('Error fetching roles', error);
        this.toastr.error('Error fetching roles');
      }
    );
    this.subscriptions.add(sub);
  }

  loadUser(): void {
    const sub = this.userService.getUserById(this.userId!).subscribe(
      (user: User) => {
        // console.log('User data:', user); 
        this.userForm.setValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: '', // Leave password empty on edit
          mobile: user.mobile,
          city: user.city,
          role: user.role,
          image: user.image
        });
      },
      (error) => {
        console.error('Error fetching user', error);
        this.toastr.error('Error fetching user');
      }
    );
    this.subscriptions.add(sub);
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
        this.toastr.warning('Please fill all required fields');
        return;
    }

    const user: User = this.userForm.value;

    // If userId is present, it means we're editing, and we should handle the password field
    if (this.userId) {
        if (!user.password) {
            delete user.password; // Remove password from the object if it is empty
        }
        this.updateUser(user);
    } else {
        this.addUser(user);
    }
}


  addUser(user: User): void {
    const sub = this.userService.addUser(user).subscribe(
      () => {
        this.toastr.success('User added successfully');
        this.router.navigate(['/user-list']);
      },
      (error) => {
        console.error('Error adding user', error);
        this.toastr.error('Error adding user');
      }
    );
    this.subscriptions.add(sub);
  }

  updateUser(user: User): void {
    // Remove the password from the user object if the field is blank
    if (!user.password) {
      delete user.password;
    }
  
    const sub = this.userService.updateUser(this.userId!, user).subscribe(
      () => {
        this.toastr.success('User updated successfully');
        this.router.navigate(['/user-list']);
      },
      (error) => {
        console.error('Error updating user', error);
        this.toastr.error('Error updating user');
      }
    );
    this.subscriptions.add(sub);
  }
  
}
