import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EjercicioService } from '../ejercicio.service';
import { HttpConfigService } from '../http-config.service';

@Injectable({
  providedIn: 'root'
})
export class AsientoService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService,
    private ejercicioSrv: EjercicioService
  ) { }

  getAsientos(id: number): Observable<any>{
    let ejercicio = this.ejercicioSrv.getEjercicioActivo();
    return this.http.get<any>(
      this.config.getBaseUrlContabilidad() + 'asiento/' + ejercicio.toString() + '/' + id.toString(),
      { headers: this.config.getHeadersContabilidad() }
    );
  }

  getAsientoNumeracion(): Observable<any>{
    let ejercicio = this.ejercicioSrv.getEjercicioActivo();
    return this.http.get<any>(
      this.config.getBaseUrlContabilidad() + 'asiento/numeracion/' + ejercicio.toString(),
      { headers: this.config.getHeadersContabilidad() }
    );
  }

  getAsientosByEjercicio(): Observable<any>{
    let ejercicio = this.ejercicioSrv.getEjercicioActivo();
    return this.http.get<any>(
      this.config.getBaseUrlContabilidad() + 'asiento/' + ejercicio.toString(),
      { headers: this.config.getHeadersContabilidad() }
    );
  }
          
  add(request: any): Promise<any>{
    return this.http.post<any>(
      this.config.getBaseUrlContabilidad() + 'asiento/',
      request,
      { headers: this.config.getHeadersContabilidad() }
    ).toPromise();
  }
  
  update(request: any): Observable<any>{
    return this.http.put<any>(
      this.config.getBaseUrlContabilidad() + 'asiento/',
      request,
      { headers: this.config.getHeadersContabilidad() }
    );
  }
  
  delete(request: any): Observable<any>{
    let ejercicio = this.ejercicioSrv.getEjercicioActivo();
    return this.http.delete<any>(
      this.config.getBaseUrlContabilidad() + 'asiento/' + ejercicio.toString() + '/' + request.id + '/' + request.it,
      { headers: this.config.getHeadersContabilidad() }
    );
  }
  
}
