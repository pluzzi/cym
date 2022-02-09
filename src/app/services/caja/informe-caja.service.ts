import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpConfigService } from '../http-config.service';

@Injectable({
  providedIn: 'root'
})
export class InformeCajaService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService
  ) { }


  getInformes(request: any): Observable<any>{
    return this.http.post<any>(
      this.config.getBaseUrl() + 'InformeCaja/retenciones',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getInformesDepositosAcreditaciones(request: any): Observable<any>{
    return this.http.post<any>(
      this.config.getBaseUrl() + 'InformeCaja/depositosAcreditaciones',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getInformesValores(request: any): Observable<any>{
    return this.http.post<any>(
      this.config.getBaseUrl() + 'InformeCaja/valores',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getValores(){
    return [
      {
        id: 0,
        descripcion: "Todos",
      },
      {
        id: 1,
        descripcion: "En Cartera",
      },
      {
        id: 2,
        descripcion: "Egresados",
      }
    ]
  }
  getMovimientos(){
    return [
      {
        id: 0,
        descripcion: "Todos",
      },
      {
        id: 1,
        descripcion: "Cheques",
      },
      {
        id: 2,
        descripcion: "Extracciones",
      }
    ]
  }

  getEstados(){
    return [
      {
        id: 0,
        descripcion: "Todos",
      },
      {
        id: 3,
        descripcion: "Conciliados",
      },
      {
        id: 1,
        descripcion: "No Conciliados",
      }
    ]
  }

  getInformesPlanillaCaja(request: any): Observable<any>{
    return this.http.post<any>(
      this.config.getBaseUrl() + 'InformeCaja/planillaCaja',
      request,
      { headers: this.config.getHeaders() }
    );
  }


  getInformesChequesExtracciones(request: any): Observable<any>{
    return this.http.post<any>(
      this.config.getBaseUrl() + 'InformeCaja/chequesExtracciones',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getInformesAuxiliarBanco(request: any): Observable<any>{
    return this.http.post<any>(
      this.config.getBaseUrl() + 'InformeCaja/auxiliarBanco',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getUpdateValores(request: any): Observable<any>{
    return this.http.put<any>(
      this.config.getBaseUrl() + 'InformeCaja/valores',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getValoresCheque(request: any): Observable<any>{
    return this.http.post<any>(
      this.config.getBaseUrl() + 'InformeCaja/valoresCheque',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getInformePlanillaFondo(request: any): Observable<any>{
    return this.http.post<any>(
      this.config.getBaseUrl() + 'InformeCaja/informePlanillas',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  
  
}
