import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { CommandModel, EditSettingsModel, TextWrapSettingsModel, ToolbarItems } from '@syncfusion/ej2-grids';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { ToastrService } from 'ngx-toastr';
import { TiposMovimientosService } from 'src/app/services/caja/tipos-movimientos.service';
import Swal from 'sweetalert2';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { InformeCajaService } from 'src/app/services/caja/informe-caja.service';
import { DatePipe } from '@angular/common';
import { TipoRetencionService } from 'src/app/services/caja/tipo-retencion.service';
import { ExcelService } from 'src/app/services/excel.service';
import { GridOptions } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { MonedaService } from 'src/app/services/caja/moneda.service';
import { PrintService } from 'src/app/services/print.service';
import * as  printJS from 'print-js';

@Component({
  selector: 'app-depositos-acreditaciones',
  templateUrl: './depositos-acreditaciones.component.html',
  styleUrls: ['./depositos-acreditaciones.component.css']
})
export class DepositosAcreditacionesComponent implements OnInit {

  grid: any;
  desde: Date = new Date();
  hasta: Date = new Date();
  depositosAcreditaciones: any[];
  searchValue: string = '';
  monedaSelected: any = 0;
  tipos_moneda_banco_propio: any[];
  informeForm: FormGroup;
  tipo: string = "2";
  estado: boolean;
  fechaEmision: Date = new Date();
  total: any;
  dataPrint: any[];
  
  columnDefs = [
    { 
      field: 'numero', 
      headerName: 'N° Depósito',
      filter: true
    },
    { 
      field: 'fecha_deposito', 
      headerName: 'Fecha',
      filter: true,
      cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      }
    },
    { 
      field: 'fecha_acreditacion', 
      headerName: 'Acreditación',
      filter: true,
      cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      }
    },
    { 
      field: 'comprobante', 
      headerName: 'Comprobante',
      filter: true
    },
    { 
      field: 'detalle', 
      headerName: 'Detalle del Depósito',
      filter: true
    },
    { 
      field: 'importe', 
      headerName: 'Importe',
      filter: true,
      width: 120,
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
      cellStyle: {
        'text-align': 'right'
      }
    },
    { 
      field: 'estado', 
      headerName: 'Estado',
      filter: true
    }
  ];

  defaultColDef = {
    editable: false,
    resizable: false,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'}
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
    this.getMonedas();
    this.informeForm = new FormGroup({
      codigo: new FormControl(null),
      nombre: new FormControl(null),
      cambioCotizacion: new FormControl(null),
      cotizacion: new FormControl(null),
      
    });
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

  getMonedas(){
    this.monedaSrv.getMonedas(0,1).subscribe(result => {
      this.tipos_moneda_banco_propio = result.data;
    })
  }

  getInformes(){
    this.spinner.show();
    let request = {
      codigo: this.monedaSelected == 0 ? null : this.monedaSelected,
      tipo: Number(this.tipo),
      desde: this.datepipe.transform(this.desde, 'yyyy-MM-dd'),
      hasta: this.datepipe.transform(this.hasta, 'yyyy-MM-dd'),
      estado: this.estado == true ? 3 : null,
      
    }
    
    this.informeSrv.getInformesDepositosAcreditaciones(request).subscribe(result => {
      this.depositosAcreditaciones = result.data;

      let pinnedBottomRowData = {
        detalle: 'Total:',
        importe: this.depositosAcreditaciones.reduce((sum, current) => {
          return sum + current.importe;
        },0)
      }
  
      this.grid.setPinnedBottomRowData([pinnedBottomRowData]);
      this.getTotal();
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
      if(Object.keys(params.data).length == 0 || params.data?.descripcion?.includes('Saldo Anterior:') ){
        return {
          'font-weight': 'bold'
        };
      }else{
        return {};
      }
    }

  }



  print(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.fecha_deposito != undefined){
        rowNode.data.fecha_deposito = this.datepipe.transform(new Date(rowNode.data.fecha_deposito), 'dd/MM/yyyy')
        rowNode.data.fecha_acreditacion = this.datepipe.transform(new Date(rowNode.data.fecha_acreditacion), 'dd/MM/yyyy')
        this.dataPrint.push(rowNode.data)
      } else {
        this.dataPrint.push(rowNode.data)
      }
    })
    setTimeout(()=>{
      printJS({
        printable: 'print_reporte_depositos_acreditaciones',
        type: 'html',
        style: this.printSrv.getTableStyle(),
        scanStyles: false
      })
    }, 250)

    this.depositosAcreditaciones = [];
  
    this.searchTardio(); 
  
  }
  
  exportar(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.fecha_deposito != undefined){
        rowNode.data.fecha_deposito = this.datepipe.transform(new Date(rowNode.data.fecha_deposito), 'dd/MM/yyyy')
        rowNode.data.fecha_acreditacion = this.datepipe.transform(new Date(rowNode.data.fecha_acreditacion), 'dd/MM/yyyy')
        this.dataPrint.push(rowNode.data)
      } else {
        this.dataPrint.push(rowNode.data)
      }
     })
     setTimeout(()=>{
      this.excelSrv.export(this.dataPrint)
     }, 250)

     this.depositosAcreditaciones = [];
  
     this.searchTardio(); 
  
    
  }

  getMonedaNombre(){
  
    return this.monedaSelected == 0 ? '' : this.tipos_moneda_banco_propio.find(elt => elt.codigo == this.monedaSelected).nombre
  }

  getTotal(){
    this.total = this.depositosAcreditaciones.reduce((sum, current) => {
      return sum + current.importe;
    },0).toFixed(2)
  }

  searchTardio(){
    setTimeout(()=>{
      this.getInformes();
    }, 100)
  }

}
