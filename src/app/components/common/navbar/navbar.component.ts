import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from 'src/app/services/menu.service';
import { NavbarService } from 'src/app/services/navbar.service';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  menu?: any[];
  permisos?: any[];

  constructor(
    private userSrv: UsuariosService,
    private router: Router,
    private menuSrv: MenuService,
    private seguridadSrv: SeguridadService,
    private navbarSrv: NavbarService,
  ) { 
    this.getPermisos();
    
    let navbarEvent = this.navbarSrv.navchange;

    navbarEvent.subscribe(event =>{
      if(event){
        this.getPermisos();
      }
    })
  }

  ngOnInit(): void {
  }

  logout(){
    this.userSrv.setUser(null);
    this.router.navigate(['login'], {  });
  }

  getPermisos(){
    this.seguridadSrv.getPermisos().subscribe(result => {
      this.permisos = result.data;

      this.getMenu();
    })
  }

  getMenu(){
    this.menuSrv.getMenuPrincipal().subscribe(menu => {
      this.menu = menu.data;

      this.menu?.forEach(async m => {
        if(m.permisos_all){
          m.permiso = true;
        }else{
          let permiso = this.permisos?.find(elt => elt.menu == m.id) != undefined
          m.permiso = permiso
        }
        
        await this.menuSrv.getSubMenu(m.id).subscribe(submenu => {
          m.submenu = submenu.data;

          m.submenu.forEach(async item => {
            if(m.permisos_all){
              item.permiso = true;
            }else{
              let permiso = this.permisos?.find(elt => elt.menu == item.id) != undefined
              item.permiso = permiso
            }

            await this.menuSrv.getSubMenu(item.id).subscribe(submenu2 => {
              item.submenu = submenu2.data;
    
              item.submenu.forEach(item2 => {
                if(item.permisos_all){
                  item2.permiso = true;
                }else{
                  let permiso = this.permisos?.find(elt => elt.menu == item2.id) != undefined
                  item2.permiso = permiso
                }
                
              });
            })
            
          });
        })
      })

      console.log(this.menu)
    })
  }

}
