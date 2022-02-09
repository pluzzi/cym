import { Component, OnInit } from '@angular/core';
import { NavbarService } from 'src/app/services/navbar.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  fecha = new Date();
  usuario: any;
  data: any;
  //ejercicio: any;
  
  constructor(
    private usuarioSrv: UsuariosService, 
    private navBarSrv: NavbarService
  ) { 
    let navbarEvent = this.navBarSrv.navchange;

    navbarEvent.subscribe(event =>{
      if(event){
        this.getUsuario();
        this.getDataBase();
      }
    })
  }

  ngOnInit(): void {
    this.getUsuario();
    this.getDataBase();
  }

  getUsuario(){
    this.usuario = this.usuarioSrv.getUser();
  }

  getDataBase(){
    this.data = this.usuarioSrv.getDatabaseData();
  }

 

}
