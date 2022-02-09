import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpConfigService } from './http-config.service';
import { Observable } from 'rxjs';
import { UsuariosService } from './usuarios.service';

@Injectable({
  providedIn: 'root'
})
export class SeguridadService {

  user: any;

  constructor(
    private http: HttpClient,
    private config: HttpConfigService,
    private userSrv: UsuariosService
  ) { 
    this.user = this.userSrv.getUser();
  }

  getPermiso(path: string){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Seguridad/' + this.user.usuario + '/' + path,
      { headers: this.config.getHeaders() }
    );
  }

  getPermisos(){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Seguridad/' + this.user.usuario,
      { headers: this.config.getHeaders() }
    );
  }

  getMenuConPermisos(usuario: string){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Seguridad/menu/' + usuario,
      { headers: this.config.getHeaders() }
    );
  }

  setPermisos(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Seguridad/menu',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  copyPermisos(usuarioOrigen: string, usuario: string){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Seguridad/copy/' + usuarioOrigen + '/' + usuario,
      { headers: this.config.getHeaders() }
    );
  }

  
}
