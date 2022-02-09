import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpConfigService } from '../http-config.service';

@Injectable({
  providedIn: 'root'
})
export class ChequeraService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService
  ) { }

  getChequeras(moneda: number): Observable<any>{
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Chequera/' + moneda.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  getDetalles(moneda: number, chequera: number): Observable<any>{
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Chequera/detalle/' + moneda.toString() + '/' + chequera.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  validaCheque(interno: number, turno: number): Observable<any>{
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Chequera/' + interno.toString() + '/' + turno.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  validaBancoCheque(moneda: number, cheque: number): Observable<any>{
    return this.http.get<any>(
      this.config.getBaseUrl() + 'Chequera/cheque/banco/' + moneda.toString() + '/' + cheque.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  updateChequera(request: any): Observable<any>{
    return this.http.put<any>(
      this.config.getBaseUrl() + 'Chequera',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  createChequera(request: any): Observable<any>{
    return this.http.post<any>(
      this.config.getBaseUrl() + 'Chequera',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  updateChequeraPromise(request: any): Promise<number>{
    return new Promise<number>((resolve, reject) => {
      const result = this.http.put<any>(
        this.config.getBaseUrl() + 'Chequera',
        request,
        { headers: this.config.getHeaders() }
      );

      setTimeout( () => {
        resolve(result.toPromise());
      }, 250);

    })
  }

  deleteChequera(moneda: number, codigo: number): Observable<any>{
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'Chequera/' + moneda.toString() + '/' + codigo.toString(),
      { headers: this.config.getHeaders() }
    );
  }
  
}
