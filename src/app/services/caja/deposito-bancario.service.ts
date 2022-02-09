import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpConfigService } from '../http-config.service';

@Injectable({
  providedIn: 'root'
})
export class DepositoBancarioService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService
  ) { }

  getDepositos(deposito: number): Observable<any>{
    return this.http.get<any>(
      this.config.getBaseUrl() + 'DepositoBancario/' + deposito.toString(),
      { headers: this.config.getHeaders() }
    )
  }

  getNumeracion(): Observable<any>{
    return this.http.get<any>(
      this.config.getBaseUrl() + 'DepositoBancario/numeracion',
      { headers: this.config.getHeaders() }
    )
  }

  createDeposito(request: any): Observable<any>{
    return this.http.post<any>(
      this.config.getBaseUrl() + 'DepositoBancario',
      request,
      { headers: this.config.getHeaders() }
    )
  }

  deleteDeposito(deposito: number): Observable<any>{
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'DepositoBancario/' + deposito.toString(),
      { headers: this.config.getHeaders() }
    )
  }
}
