import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal,  } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { InformeCajaService } from 'src/app/services/caja/informe-caja.service';
import { DatePipe } from '@angular/common';
import { TipoRetencionService } from 'src/app/services/caja/tipo-retencion.service';
import { ExcelService } from 'src/app/services/excel.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MonedaService } from 'src/app/services/caja/moneda.service';
import { PrintService } from 'src/app/services/print.service';
import * as  printJS from 'print-js';
import { isThisTypeNode } from 'typescript';


@Component({
  selector: 'app-informe-planilla-caja',
  templateUrl: './informe-planilla-caja.component.html',
  styleUrls: ['./informe-planilla-caja.component.css']
})
export class InformePlanillaCajaComponent implements OnInit {

  grid: any;
  desde: Date = new Date();
  hasta: Date = new Date();
  informeCaja: any[];
  searchValue: string = '';
  tipo: string = "1";
  fechaEmision: Date = new Date();
  turnoSelected: any = 0;
  dataPrint: any[];

  columnDefs = [
    { 
      field: 'fecha', 
      headerName: 'Fecha',
      filter: true,
      width: 120,
      suppressSizeToFit: true,
      cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      }
    },
    { 
      field: 'numero', 
      headerName: 'N°',
      filter: true,
      width: 90,
      suppressSizeToFit: true
    },
    { 
      field: 'turno', 
      headerName: 'Turno',
      filter: true,
      width: 90,
      suppressSizeToFit: true
      
    },
    { 
      field: 'concepto', 
      headerName: 'Concepto',
      filter: true,
      width: 150,
      suppressSizeToFit: true
    },
    { 
      field: 'moneda', 
      headerName: 'Monedas / Retenciones',
      filter: true,
      flex: 1
    },
    { 
      field: 'debe', 
      headerName: 'Debe',
      filter: true,
      width: 150,
      suppressSizeToFit: true,
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
      cellStyle: {
        'text-align': 'right'
      }
    },
    { 
      field: 'haber', 
      headerName: 'Haber',
      filter: true,
      width: 150,
      suppressSizeToFit: true,
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
      cellStyle: {'text-align': 'right'}
    },
    { 
      field: 'asiento', 
      headerName: 'N° Asiento',
      filter: true,
      
    }
  ];

  defaultColDef = {
    editable: false,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'},
    headerStyle: {fontSize: '5px !important'},
    
   
  };

  constructor(
    private route: Router,
    private toastr: ToastrService,
    private modalSrv: NgbModal,
    private datepipe: DatePipe,
    private reteSrv: TipoRetencionService,
    private excelSrv: ExcelService,    
    private spinner: NgxSpinnerService,
    private monedaSrv: MonedaService,
    private informeSrv: InformeCajaService,
    private printSrv: PrintService,
  ) { }

  ngOnInit(): void {
    
  }

  home(){
    this.route.navigate(['/home'], {  });
  }


  onGridReady(params) {
    this.grid = params.api;

    setTimeout(()=>{
      this.grid.sizeColumnsToFit();
      //this.autoSizeAll(false, params.columnApi);
      this.grid.setHeaderHeight(18);
    }, 250)
    
  }

  autoSizeAll(skipHeader, column) {
    const allColumnIds = [];
    column.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });
    column.autoSizeColumns(allColumnIds, skipHeader);
  }

  setDesde(event: any){
    if(event && event != ''){
      this.desde = event;
    }
  }

  setHasta(event: any){
    if(event && event != ''){
      this.hasta = event;
    }
  }

  
  keyDown(event: any){
    if(event.keyCode == 13){
      this.search();
    }
  }

  search(){
    this.grid.setQuickFilter(this.searchValue);
  }

  getInformes(){
    this.spinner.show();

    let request = {
      desde: this.datepipe.transform(this.desde, 'yyyy-MM-dd'),
      hasta: this.datepipe.transform(this.hasta, 'yyyy-MM-dd'),
      turno: this.turnoSelected == 0 ? null : this.turnoSelected
    }
    
    this.informeSrv.getInformesPlanillaCaja(request).subscribe(result => {
      this.informeCaja = result.data;
      
      let pinnedBottomRowData = {
        moneda: 'Totales:',
        debe: this.informeCaja.slice().reduce((sum, current) => {
          return sum + current.debe;
        },0),
        haber: this.informeCaja.slice().reduce((sum, current) => {
          return sum + current.haber;
        },0)
      }

      this.grid.setPinnedBottomRowData([pinnedBottomRowData]);

      this.procesarDatos(result.data.slice());    
      this.grid.sizeColumnsToFit();  

      this.spinner.hide();

    }, error => {
      this.spinner.hide();
    })
    
  }

  getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return { 
        'font-weight': 'bold'
      };
    }else{
      if(Object.keys(params.data).length == 1 || params.data?.moneda?.includes('Total') ){
        return {
          'font-weight': 'bold'
        };
      }else{
        return {};
      }
    }

  };

  procesarDatos(data: any[]){
    let offset = 0;
    let total = 0;
    let movimiento: any;
    let posFinal = data.length -1;

    data.forEach((elt, index) => {
      if(index == 0){
        movimiento = elt;
      }

      if(movimiento.numero == elt.numero){
        if(index != 0){
          elt.fecha = null;
          elt.numero = null;
          elt.turno = null;
          elt.concepto = null;
          elt.asiento = null;
        }

        if(elt.tipo == 1){
          total += elt.debe
        }else{
          total += elt.haber
        }
        
      }else{

        if(movimiento.tipo == 1){
          this.informeCaja.splice(index + offset, 0, { debe: total })
          offset++;
        }else{
          this.informeCaja.splice(index + offset, 0, { haber: total })
          offset++;          
        }

        if(elt.tipo != movimiento.tipo){
          let totales = data.reduce((sum, current) => {
            return sum + current.debe
          }, 0)
          this.informeCaja.splice(index + offset, 0, { moneda: 'Total Ingresos:', debe: totales })
          offset++;
        }
        
        movimiento = elt

        if(elt.tipo == 1){
          total = elt.debe
        }else{
          total = elt.haber
        }
      }

      if(index == posFinal){
        offset++;

        if(elt.tipo == 1){
          this.informeCaja.splice(index + offset, 0, { debe: total })
          offset++;

          let totales = data.reduce((sum, current) => {
            return sum + current.debe
          }, 0)
          this.informeCaja.splice(index + offset, 0, { moneda: 'Total Ingresos:', debe: totales })

        }else{
          this.informeCaja.splice(index + offset, 0, { haber: total })
          offset++;

          let totales = data.reduce((sum, current) => {
            return sum + current.haber
          }, 0)
          this.informeCaja.splice(index + offset, 0, { moneda: 'Total Egresos:', haber: totales })
        }
      }
      
    })

  }

  
  print(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.fecha != undefined){
        rowNode.data.fecha = this.datepipe.transform(new Date(rowNode.data.fecha), 'dd/MM/yyyy');
        this.dataPrint.push(rowNode.data)
      } else {
        this.dataPrint.push(rowNode.data)
      }
    })
    setTimeout(()=>{
      printJS({
        printable: 'print_reporte_caja',
        type: 'html',
        style: this.printSrv.getTableStyle(),
        scanStyles: false
      })
    }, 250)

    this.informeCaja = [];
  
    this.searchTardio(); 
  
  }
  
  exportar(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.fecha != undefined){
        rowNode.data.fecha = this.datepipe.transform(new Date(rowNode.data.fecha), 'dd/MM/yyyy');
        this.dataPrint.push(rowNode.data)
      } else {
        this.dataPrint.push(rowNode.data)
      }
     })
     setTimeout(()=>{
      this.excelSrv.export(this.dataPrint) 
     }, 250)

     this.informeCaja = [];
  
     this.searchTardio();  
  
    
  }

  searchTardio(){
    setTimeout(()=>{
      this.getInformes();
    }, 100)
  }

  
}
