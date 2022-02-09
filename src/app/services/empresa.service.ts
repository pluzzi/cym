import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  constructor() { }

  getEmpresaActiva(){
    return localStorage.getItem('cym-empresa');
  }

  setEmpresaActiva(empresa: number){
    return localStorage.setItem('cym-empresa', empresa.toString());
  }
}
