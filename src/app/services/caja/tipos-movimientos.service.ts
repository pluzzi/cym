import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpConfigService } from '../http-config.service';

@Injectable({
  providedIn: 'root'
})
export class TiposMovimientosService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService
  ) { }


  getMovimientos(){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Movimiento/tipos',
      { headers: this.config.getHeaders() }
    );
  }

  createMovimiento(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Movimiento/tipos',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  updateMovimiento(request: any){
    return this.http.put<any>(
      this.config.getBaseUrl() + 'Movimiento/tipos',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  deleteMovimiento(codigo: string){
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'Movimiento/tipos/' + codigo,
      { headers: this.config.getHeaders() }
    );
  }
}
