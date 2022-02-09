import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmpresaService } from './empresa.service';
import { HttpConfigService } from './http-config.service';

@Injectable({
  providedIn: 'root'
})
export class EjercicioService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService,
    private empresaSrv: EmpresaService,
    private datepipe: DatePipe
  ) { }

  getEjercicioByFecha(fecha: string){
    let empresa = this.empresaSrv.getEmpresaActiva();
    return this.http.get<any>(
      this.config.getBaseUrlContabilidad() + 'Ejercicio/' + empresa + '/' + fecha,
      { headers: this.config.getHeadersContabilidad() }
    );
  }

  validaCierreMes(fecha: Date){
    let yyyyMM = this.datepipe.transform(fecha, 'yyyyMM');
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Ejercicio/valida/cierre/' + yyyyMM,
      { headers: this.config.getHeaders() }
    );
  }

  getEjercicioActivo(){
    return JSON.parse(localStorage.getItem('cym-ejercicio-activo'));
  }

  setEjercicioActivo(ejercicio: number){
    return localStorage.setItem('cym-ejercicio-activo', ejercicio.toString());
  }


}
