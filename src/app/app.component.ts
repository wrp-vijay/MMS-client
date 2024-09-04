import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { timeout } from 'rxjs';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isMenuRequired = false;
  title = 'manufacturing';
  constructor( private toster:ToastrService, private router: Router){}

  ngDoCheck(): void {
    const currentUrl = this.router.url;
    this.isMenuRequired = currentUrl !== '/login';
  }

  showMessage(){
    this.toster.success('toaster work', 'Success',{closeButton:true, timeOut:1000})
  }
}
