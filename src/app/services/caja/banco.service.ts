import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MonedasComponent } from 'src/app/components/caja/archivos/monedas/monedas.component';
import { HttpConfigService } from '../http-config.service';

@Injectable({
  providedIn: 'root'
})
export class BancoService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService
  ) { }

  getBancos(){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Banco',
      { headers: this.config.getHeaders() }
    );
  }

  createBanco(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Banco',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  updateBanco(request: any){
    return this.http.put<any>(
      this.config.getBaseUrl() + 'Banco',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  

  getResumenes(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Banco/resumen',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getMovimientosNoConciliados(moneda: number){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Banco/' + moneda.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  getMovimientosConciliados(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Banco/conciliados',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getSaldoAnterior(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Banco/saldoAnterior',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getNuevoResumenValidaFechas(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Banco/nuevoResumen',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  deleteBanco(codigo: string){
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'Banco/' + codigo,
      { headers: this.config.getHeaders() }
    );
  }

  deleteResumen(codigo: number, resumen: string){
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'Banco/deleteResumen/' + codigo.toString()+ '/' + resumen,
      { headers: this.config.getHeaders() }
    );
  }

  grabarCabeceraResumen(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Banco/cabecera',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  grabarDetalleResumen(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Banco/detalle',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  
}
