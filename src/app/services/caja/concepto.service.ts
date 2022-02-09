import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpConfigService } from '../http-config.service';

@Injectable({
  providedIn: 'root'
})
export class ConceptoService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService
  ) { }

  getConceptos(): Observable<any>{
    return this.http.get<any>(
      this.config.getBaseUrl() + 'ConceptoCaja',
      { headers: this.config.getHeaders() }
    );
  }

  updateConcepto(request: any): Observable<any>{
    return this.http.put<any>(
      this.config.getBaseUrl() + 'ConceptoCaja',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  createConcepto(request: any): Observable<any>{
    return this.http.post<any>(
      this.config.getBaseUrl() + 'ConceptoCaja',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  deleteConcepto(concepto: number): Observable<any>{
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'ConceptoCaja/' + concepto.toString(),
      { headers: this.config.getHeaders() }
    );
  }


}
