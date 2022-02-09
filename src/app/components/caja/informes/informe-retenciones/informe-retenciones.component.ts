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
import * as  printJS from 'print-js';
import { PrintService } from 'src/app/services/print.service';

import {AgGridEvent} from 'ag-grid-community';

@Component({
  selector: 'app-informe-retenciones',
  templateUrl: './informe-retenciones.component.html',
  styleUrls: ['./informe-retenciones.component.css']
})
export class InformeRetencionesComponent implements OnInit {

  isNew: boolean = false;
  grid: any;
  searchValue: string = '';
  gridColumn: any;
  fechaInicio: Date = new Date();
  fechaFin: Date = new Date();
  retencionSelected: any = 0;
  tipos_retenciones: any[];
  retenciones: any[];
  fechaEmision: Date = new Date();
  totalDebe: any;
  totalHaber: any;
  dataPrint: any[];

  columnDefs = [
    { 
      field: 'movimiento', 
      headerName: 'N° Movimiento',
      filter: true
    },
    { 
      field: 'retencionNombre', 
      headerName: 'Retención',
      filter: true
    },
    { 
      field: 'fecha', 
      headerName: 'Fecha',
      filter: true,
      cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      }
    },
    { 
      field: 'comprobante', 
      headerName: 'N° Comprobante',
      filter: true
    },
    { 
      field: 'debe', 
      headerName: 'Importe Debe',
      filter: true,
      cellStyle: {
        'text-align': 'right'
      },
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
    },
    { 
      field: 'haber', 
      headerName: 'Importe haber',
      filter: true,
      cellStyle: {
        'text-align': 'right'
      },
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
    },
    { 
      field: 'razon', 
      headerName: 'Razón Social',
      filter: true
    },
    { 
      field: 'cuit', 
      headerName: 'CUIT',
      filter: true
    },
    { 
      field: 'regimen', 
      headerName: 'Regimen',
      filter: true
    }
  ];

  defaultColDef = {
    editable: false,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'}
  };

  constructor(
    private route: Router,
    private tipos_movimientosSrv: TiposMovimientosService,
    private toastr: ToastrService,
    private modalSrv: NgbModal,
    private informeSrv: InformeCajaService,
    private datepipe: DatePipe,
    private reteSrv: TipoRetencionService,
    private excelSrv: ExcelService,    
    private spinner: NgxSpinnerService,
    private printSrv: PrintService,
  ) { }

  ngOnInit(): void {
    this.getRetenciones();
  }

  home(){
    this.route.navigate(['/home'], {  });
  }

  getInformes(){
    this.spinner.show();
    let request = {
      desde: this.datepipe.transform(this.fechaInicio, 'yyyy-MM-dd'),
      hasta: this.datepipe.transform(this.fechaFin, 'yyyy-MM-dd'),
      retencion: this.retencionSelected  
    }
    
    this.informeSrv.getInformes(request).subscribe(result => {
      this.retenciones = result.data;

      let pinnedBottomRowData = {
        comprobante: 'Total:',
        debe: this.retenciones.reduce((sum, current) => {
          return sum + current.debe;
        },0),
        haber: this.retenciones.reduce((sum, current) => {
          return sum + current.haber;
        },0)
      }
        
      this.grid.setPinnedBottomRowData([pinnedBottomRowData]);
      this.getTotal();
      this.spinner.hide();
    }
    , error => {
      this.spinner.hide();
     })
    
  }

  getTotal(){
    this.totalDebe = this.retenciones.reduce((sum, current) => {
      return sum + current.debe;
    },0).toFixed(2),
    this.totalHaber = this.retenciones.reduce((sum, current) => {
      return sum + current.haber;
    },0).toFixed(2)
  }

  getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return { 
        'font-weight': 'bold'
      };
    }else{
      return {};
    }

  };

  keyDown(event: any){
    if(event.keyCode == 13){
      this.search();
    }
  }

  search(){
    this.grid.setQuickFilter(this.searchValue);
  }

  onGridReady(params) {
    this.grid = params.api;
    this.gridColumn = params.columnApi;

    setTimeout(()=>{
      this.grid.sizeColumnsToFit();
      //this.autoSizeAll(false);
      this.grid.setHeaderHeight(20);
    }, 250)
    
  }

  autoSizeAll(skipHeader) {
    const allColumnIds = [];
    this.gridColumn.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });
    this.gridColumn.autoSizeColumns(allColumnIds, skipHeader);
  }

  getRetenciones(){
    this.reteSrv.getRetenciones().subscribe(result => {
      this.tipos_retenciones = result.data;
    })
  }

  setDesde(event: any){
    if(event && event != ''){
      this.fechaInicio = event;
    }
  }

  setHasta(event: any){
    if(event && event != ''){
      this.fechaFin = event;
    }
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
        printable: 'print_reporte_retenciones',
        type: 'html',
        style: this.printSrv.getTableStyle(),
        scanStyles: false
      })
    }, 250)

    this.retenciones = [];
  
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

     this.retenciones = [];
  
     this.searchTardio();  
  }

  getRetencionNombre(){
  
    return this.retencionSelected == 0 ? 'Todas' : this.tipos_retenciones.find(elt => elt.codigo == this.retencionSelected).retencion
  }

  searchTardio(){
    setTimeout(()=>{
      this.getInformes();
    }, 100)
  }

}
