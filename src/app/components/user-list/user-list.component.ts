import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';  // Ensure FormsModule is imported
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],  // Ensure FormsModule is included here
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: any[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  totalPages: number = 1;
  isLoading: boolean = false;
  searchSubject: Subject<string> = new Subject<string>();
  private subscriptions: Subscription = new Subscription();
  errorMessage: string | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getUsers();

    this.subscriptions.add(
      this.searchSubject.pipe(
        debounceTime(300),
        switchMap(search => {
          this.isLoading = true;
          this.errorMessage = null;
          return this.userService.getUsers(search, 1);
        })
      ).subscribe(
        (response) => {
          this.users = response.data;
          this.currentPage = response.currentPage;
          this.totalPages = response.totalPages;
          this.isLoading = false;

          if (this.users.length === 0) {
            this.errorMessage = 'No data found';
            this.toastr.warning('No data found', 'Warning');
          }
        },
        (error) => {
          console.error('Error fetching users', error);
          this.users = [];
          this.isLoading = false;

          if (error.error && error.error.msg === 'FAILED_QUERY') {
            this.errorMessage = 'No data found';
            this.toastr.warning('No data found', 'Warning');
          } else {
            this.errorMessage = 'An error occurred while fetching users';
            this.toastr.error('Error fetching users');
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  searchUsers(): void {
    const trimmedSearchQuery = this.searchQuery.trim();
    const query = trimmedSearchQuery.length >= 3 ? trimmedSearchQuery : '';
    this.getUsers();
    this.searchSubject.next(query);
  }

  getUsers(page: number = 1): void {
    this.isLoading = true;
    this.errorMessage = null;
  
    const query = this.searchQuery.trim().length >= 3 ? this.searchQuery.trim() : '';
  
    const sub = this.userService.getUsers(query, page).subscribe(
      (response) => {
        // Filter out users with the role of 'admin'
        this.users = response.data.filter((user: { role: string; }) => user.role !== 'admin');
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.isLoading = false;
  
        if (this.users.length === 0) {
          this.errorMessage = 'No data found';
          this.toastr.warning('No data found', 'Warning');
        }
      },
      (error) => {
        console.error('Error fetching users', error);
        this.users = [];
        this.isLoading = false;
  
        if (error.error && error.error.msg === 'FAILED_QUERY') {
          this.errorMessage = 'No data found';
          this.toastr.warning('No data found', 'Warning');
        } else {
          this.errorMessage = 'An error occurred while fetching users';
          this.toastr.error('Error fetching users');
        }
      }
    );
  
    this.subscriptions.add(sub);
  }
  

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.isLoading = true;
      const sub = this.userService.deleteUser(id).subscribe(
        () => {
          this.toastr.success('User deleted successfully');
          this.getUsers(this.currentPage);
        },
        (error) => {
          console.error('Error deleting user', error);
          this.toastr.error(error.error.msg);
          this.isLoading = false;
        }
      );
      this.subscriptions.add(sub);
    }
  }

  addUser(): void {
    this.router.navigate(['/add-user']);
  }

  editUser(id: number): void {
    this.router.navigate(['/edit-user', id]);
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.getUsers(page);
    }
  }
}
