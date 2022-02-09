import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EjercicioService } from '../ejercicio.service';
import { HttpConfigService } from '../http-config.service';

@Injectable({
  providedIn: 'root'
})
export class CuentaService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService,
    private ejercicioSrv: EjercicioService
  ) { }

  getCuentas(): Observable<any>{
    let ejercicio = this.ejercicioSrv.getEjercicioActivo();
    return this.http.get<any>(
      this.config.getBaseUrlContabilidad() + 'cuenta/' + ejercicio.toString(),
      { headers: this.config.getHeadersContabilidad() }
    );
  }

  getCuentaImputable(id: string): Observable<any>{
    let ejercicio = this.ejercicioSrv.getEjercicioActivo();
    return this.http.get<any>(
      this.config.getBaseUrlContabilidad() + 'cuenta/' + ejercicio.toString() + '/' + id.trim(),
      { headers: this.config.getHeadersContabilidad() }
    );
  }
}
