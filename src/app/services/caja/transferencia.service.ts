import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpConfigService } from '../http-config.service';

@Injectable({
  providedIn: 'root'
})
export class TransferenciaService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService
  ) { }

  getTransferencia(transferencia: number): Observable<any>{
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Transferencia/' + transferencia.toString(),
      { headers: this.config.getHeaders() }
    )
  }

  getNumeracion(): Observable<any>{
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Transferencia/numeracion',
      { headers: this.config.getHeaders() }
    )
  }

  deleteTransferencia(transferencia: number): Observable<any>{
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'Transferencia/' + transferencia.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  registroTransferencia(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Transferencia/',
      request,
      { headers: this.config.getHeaders() }
    );
  }


}
