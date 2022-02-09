import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpConfigService } from '../http-config.service';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService
  ) { }

  getMovimientos(numero: number){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Movimiento/' + numero.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  createMovimiento(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Movimiento/',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  createMovimientoCuenta(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Movimiento/cuenta',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getMovimientosCuenta(numero: number){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Movimiento/cuenta/' + numero.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  getMovimientosRetencion(numero: number){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Movimiento/retencion/' + numero.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  createMovimientoRetencion(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Movimiento/retencion',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getMovimientosMoneda(numero: number){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Movimiento/moneda/' + numero.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  createMovimientoMoneda(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Movimiento/moneda',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  createMovimientoMonedaBanco(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Movimiento/moneda/banco',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  createMovimientoMonedaValores(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Movimiento/moneda/valores',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  validaMovimientoMonedaValores(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Movimiento/valida/moneda/valores',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  deleteMovimiento(movimiento: number){
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'Movimiento/' + movimiento.toString(),
      { headers: this.config.getHeaders() }
    );
  }

}
