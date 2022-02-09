import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpConfigService } from '../http-config.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioFondoFijoService {

  constructor(
    private http: HttpClient,
    private config: HttpConfigService
  ) { }

  getUsuarios(){
    return this.http.get<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo',
      { headers: this.config.getHeaders() }
    );
  }

  updateUsuario(request: any){
    return this.http.put<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  updateUsuarioPromise(request: any): Promise<number>{
    return new Promise<number>((resolve, reject) => {
      const result = this.http.put<any>(
        this.config.getBaseUrl() + 'UsuarioFondoFijo',
        request,
        { headers: this.config.getHeaders() }
      );

      setTimeout( () => {
        resolve(result.toPromise());
      }, 250);

    })
  }

  createUsuario(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  deleteUsuario(usuario: number){
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/' + usuario.toString(),
      { headers: this.config.getHeaders() }
    );
  }  

  
  getEstados(){
    return [
      {
        id: 2,
        descripcion: "Todas",
      },
      {
        id: 0,
        descripcion: "Abiertas",
      },
      {
        id: 1,
        descripcion: "Cerradas",
      }
    ]
  }

  getPlanillaFondoCabecera(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/planillaCabecera',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getPlanillaDetalle(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/planillaDetalle',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getPlanillaMonedaDetalle(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/planillaMonedaDetalle',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getAperturaCabecera(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/aperturaCabecera',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getAperturaDetalle(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/aperturaDetalle',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  deletePlanilla(planilla: number): Observable<any>{
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/planilla/' + planilla.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  deletePlanillaCompleta(planilla: number): Observable<any>{
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/deletePlanilla/' + planilla.toString(),
      { headers: this.config.getHeaders() }
    );
  }

  deletePlanillaFondoFijo(planilla: number): Observable<any>{
    return this.http.delete<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/borrarPlanillaFondoFijo/' + planilla.toString(),
      { headers: this.config.getHeaders() }
    );
  }


  

  getTipos(){
    return [
      {
        tipo: 1,
        descripcion: "Usuario",
      },
      {
        tipo: 2,
        descripcion: "Usuario Detalle",
      },
      {
        tipo: 3,
        descripcion: "Conceptos",
      },
      {
        tipo: 4,
        descripcion: "Conceptos Detalle",
      }
    ]
  }

  getOpciones(){
    return [
      {
        tipo: 1,
        descripcion: "Monedas",
      },
      {
        tipo: 2,
        descripcion: "Proveedor",
      }
    ]
  }

  getInformeUsuario(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/informeUsuario',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getProveedor(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/proveedor',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getInformeUsuarioMonedaProveedor(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/informeUsuarioMonedaProveedor',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getGrillaMovimientos(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/planillaFondoFijo',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  getPlanillaConsultaCabecera(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/consultaCabecera',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  grabarDestino(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/destino',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  reAperturaPlanilla(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/reApertura',
      request,
      { headers: this.config.getHeaders() }
    );
  }

  consultaPlanillaCerrada(request: any){
    return this.http.post<any>(
      this.config.getBaseUrl() + 'UsuarioFondoFijo/consultaPlanilla',
      request,
      { headers: this.config.getHeaders() }
    );
  }

}
