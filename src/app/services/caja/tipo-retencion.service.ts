import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpConfigService } from '../http-config.service';

@Injectable({
  providedIn: 'root'
})
export class TipoRetencionService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService
  ) { }

  getRetenciones(){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Retencion/tipos',
      { headers: this.config.getHeaders() }
    );
  }

  createRetencion(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Retencion/tipos',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  updateRetencion(request: any){
    return this.http.put<any>(
      this.config.getBaseUrl() + 'Retencion/tipos',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  deleteRetencion(codigo: number){
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'Retencion/tipos/' + codigo.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  validaTipoRetencion(codigo: number){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Retencion/tipos/' + codigo.toString(),
      { headers: this.config.getHeaders() }
    );
  }
}
