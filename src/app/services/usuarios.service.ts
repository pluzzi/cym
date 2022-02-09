import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpConfigService } from './http-config.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  user: any;

  constructor(
    private http: HttpClient,
    private config: HttpConfigService
  ) { }

  isLogin(){
    return this.getUser() != undefined;
  }

  getUser(): any {
    if(this.user){
      return this.user;
    } else{
      let usr = localStorage.getItem('cym-user');

      if(usr){
        return JSON.parse(usr);
      }else{
        return null;
      }
    }
  }

  setUser(user: any): void {
    this.user = user;
    
    if(!this.user){
      localStorage.removeItem('cym-user');
    }else{
      localStorage.setItem('cym-user', JSON.stringify(user));
    }
  }

  setDatabaseData(data: any): void {
      localStorage.removeItem('cym-db_conn');
      localStorage.setItem('cym-db_conn', JSON.stringify(data));
  }

  getDatabaseData() {
    let data = localStorage.getItem('cym-db_conn');

    if(data){
      return JSON.parse(data);
    }else{
      return null;
    }
  }

  auth(request: any): Observable<any>{
    var headers = new HttpHeaders();

    headers = headers.append('server', request.server);
    headers = headers.append('gestion', request.gestion);
    headers = headers.append('contabilidad', request.contabilidad);

    return this.http.post<any>(
      this.config.getBaseUrl() + 'Usuario/auth',
      request,
      { headers: headers }
    );
  }

  getUsuarios(): Observable<any> {
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Usuario/', 
      {headers: this.config.getHeaders()}
    );
  }

  getUsuario(usuario: string): Observable<any> {
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Usuario/'+ usuario, 
      {headers: this.config.getHeaders()}
    );
  }
}
