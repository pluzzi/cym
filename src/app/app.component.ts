import { Component } from '@angular/core';
import { Event, Router, RouterEvent } from '@angular/router';
import { SeguridadService } from './services/seguridad.service';
import { UsuariosService } from './services/usuarios.service';
import { filter } from 'rxjs/operators';
import { EmpresaService } from './services/empresa.service';
import { EjercicioService } from './services/ejercicio.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CYM';
  isLogin: boolean = false;
  user: any;

  constructor(
    private router: Router,
    private userSrv: UsuariosService,
    private segSrv: SeguridadService,
    private empresaSrv: EmpresaService,
    private ejercicioSrv: EjercicioService,
    private datepipe: DatePipe
  ){
    this.router.events.pipe(
      filter((e: Event): e is RouterEvent => e instanceof RouterEvent)
    ).subscribe((e: RouterEvent) => {
      this.isLogin = this.userSrv.isLogin();

      if(this.isLogin){
        if(e.url != '/home' && e.url != '/login'){
          this.segSrv.getPermiso(e.url.replace('/','')).subscribe(result =>{
            let tienePermiso = result.data

            if(!tienePermiso){
              this.router.navigate(['home'], {})
            }
          })
        }
      }
    });

    let empresa = this.empresaSrv.getEmpresaActiva();

    if(empresa == null){
      this.empresaSrv.setEmpresaActiva(1);
    }

    let ejercicio = this.ejercicioSrv.getEjercicioActivo();

    if(ejercicio == null){
      this.ejercicioSrv.getEjercicioByFecha(this.datepipe.transform(new Date(), 'yyyy-MM-dd')).subscribe(result => {
        this.ejercicioSrv.setEjercicioActivo(result.data.id);
      })
    }
  }

 
}
