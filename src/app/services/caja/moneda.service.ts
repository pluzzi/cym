import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpConfigService } from '../http-config.service';

@Injectable({
  providedIn: 'root'
})
export class MonedaService {
  
  constructor(
    private http: HttpClient,
    private config: HttpConfigService
  ) { }

  getMonedas(estado: number, tipo: number){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Moneda/' + estado.toString() + '/' + tipo.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  createMoneda(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Moneda',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  updateMoneda(request: any){
    return this.http.put<any>(
      this.config.getBaseUrl() + 'Moneda',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  deleteMoneda(codigo: string){
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'Moneda/' + codigo,
      { headers: this.config.getHeaders() }
    );
  }

  getTiposMoneda(){
    return [
      { codigo: 1, nombre: 'Banco Propio'},
      { codigo: 2, nombre: 'Valores en Carteras'},
      { codigo: 3, nombre: 'Efectivo'},
      { codigo: 4, nombre: 'Tarjetas'},
    ]
  }

  validaMoneda(codigo: string){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Moneda/' + codigo,
      { headers: this.config.getHeaders() }
    );
  }
}
