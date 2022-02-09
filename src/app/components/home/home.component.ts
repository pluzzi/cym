import { Component, OnInit } from '@angular/core';
import { NavbarService } from 'src/app/services/navbar.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private navbarSrv: NavbarService
  ) { }

  ngOnInit(): void {
    this.navbarSrv.navchange.emit(true);
  }

}
