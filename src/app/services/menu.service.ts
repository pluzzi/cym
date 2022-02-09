import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpConfigService } from './http-config.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService
  ) { }

  getMenues(){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Menu',
      { headers: this.config.getHeaders() }
    );
  }

  getMenuPrincipal(){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Menu/principal',
      { headers: this.config.getHeaders() }
    );
  }

  getSubMenu(menu: number){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Menu/submenu/' + menu.toString(),
      { headers: this.config.getHeaders() }
    );
  }
}
