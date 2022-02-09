import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpConfigService } from '../http-config.service';

@Injectable({
  providedIn: 'root'
})
export class TarjetaService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService
  ) { }

  getTarjetas(usuario: number){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Tarjeta/' + usuario.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  createTarjeta(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Tarjeta/' + request.usuario.toString(),
      request,
      { headers: this.config.getHeaders() }
    );
  }

  deleteTarjeta(usuario: number){
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'Tarjeta/' + usuario.toString(),
      { headers: this.config.getHeaders() }
    );
  }
}
