import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpConfigService {

  constructor() { }

  getBaseUrl(){
    return environment.apiUrl;
  }

  getBaseUrlContabilidad(){
    return environment.apiContabilidadUrl;
  }

  setToken(token: string){
    localStorage.setItem('token', JSON.stringify(token));
  }

  getHeaders(){
    var headers = new HttpHeaders();
    const token = localStorage.getItem('cym-token');

    if(token){
      headers = headers.append('token', `${token}`);
    }

    const db = localStorage.getItem('cym-db_conn');

    if(db){
      let data = JSON.parse(db)
      headers = headers.append('server', `${data.server}`);
      headers = headers.append('gestion', `${data.gestion}`);
      headers = headers.append('contabilidad', `${data.contabilidad}`);
    }

    return headers;
  }

  getHeadersContabilidad(){
    var headers = new HttpHeaders();
    const token = localStorage.getItem('cym_contabilidad_token');

    if(token){
      headers = headers.append('token', `${token}`);
    }

    const db = localStorage.getItem('cym-db_conn');

    if(db){
      let data = JSON.parse(db)
      headers = headers.append('db_server', `${data.server}`);
      headers = headers.append('db_name', `${data.contabilidad}`);
    }

    return headers;
  }
}
