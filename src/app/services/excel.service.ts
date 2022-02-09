import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  export(datos: any[]){
    const fileName = 'informe.xlsx';

		const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'informe');

		XLSX.writeFile(wb, fileName);
    
  }

  exportWithHeader(datos: any[], cabecera: any){
    debugger
    const fileName = 'informe.xlsx';

		const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([cabecera]);

    XLSX.utils.sheet_add_json(ws, datos, {skipHeader: false, origin: "A4"});


		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'informe');

		XLSX.writeFile(wb, fileName);
    
  }

}
