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
import { UsuarioFondoFijoService } from 'src/app/services/caja/usuario-fondo-fijo.service';

@Component({
  selector: 'app-informe-planillas',
  templateUrl: './informe-planillas.component.html',
  styleUrls: ['./informe-planillas.component.css']
})
export class InformePlanillasComponent implements OnInit {

  grid: any;
  desde: Date = new Date();
  hasta: Date = new Date();
  informePlanillaFondo: any[];
  searchValue: string = '';
  monedaSelected: any;
  tipos_moneda_banco_propio: any[];
  informeForm: FormGroup;
  tipo: string = "0";
  estado: boolean;
  fechaEmision: Date = new Date();
  dataPrint: any[];
  estadoSelected: any = 0;
  estados: any[];
  usuarios: any[];
  usuarioSelected: any = 0;

  columnDefs = [
    { 
      field: 'usuario', 
      headerName: 'Usuario',
      filter: true
    },
    { 
      field: 'numeroPlanilla', 
      headerName: 'N° Planilla',
      filter: true
    },
    { 
      field: 'fechaApertura', 
      headerName: 'Fecha Apertura',
      filter: true,
      cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      }
    },
    { 
      field: 'fechaCierre', 
      headerName: 'Fecha Cierre',
      filter: true,
      cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      }
    },
    { 
      field: 'total', 
      headerName: 'Total',
      filter: true,
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
      width: 130,
      cellStyle: {
        'text-align': 'right'
      }
    },
    { 
      field: 'estado', 
      headerName: 'Estado',
      filter: true
    },
    { 
      field: 'numeroMovimiento', 
      headerName: 'N° Movimiento',
      filter: true
    },
    { 
      field: 'destino', 
      headerName: 'Destino',
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
    private usuarioFondoFijoSrv: UsuarioFondoFijoService,
    private userFondoFijoSrv: UsuarioFondoFijoService,

  ) { }

  ngOnInit(): void {
    this.getMonedas();
    this.estados = this.usuarioFondoFijoSrv.getEstados();   
    this.getUsuarios();  
    
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
      usuario: this.usuarioSelected == 0 ? null : this.usuarioSelected,
      desde: this.datepipe.transform(this.desde, 'yyyy-MM-dd'),
      hasta: this.datepipe.transform(this.hasta, 'yyyy-MM-dd'),
      estado: this.estadoSelected == 2 ? null : this.estadoSelected,
      
    }
    
    this.informeSrv.getInformePlanillaFondo(request).subscribe(result => {
      this.informePlanillaFondo = result.data;
      this.spinner.hide();

    }, error => {
      this.spinner.hide();
    })
    
  }

  getUsuarios(){
    this.userFondoFijoSrv.getUsuarios().subscribe(result => {
      this.usuarios = result.data;
    })
  }



  print(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.fechaCierre != undefined){
        rowNode.data.fechaCierre = this.datepipe.transform(new Date(rowNode.data.fechaCierre), 'dd/MM/yyyy')
        rowNode.data.fechaApertura = this.datepipe.transform(new Date(rowNode.data.fechaApertura), 'dd/MM/yyyy')
        this.dataPrint.push(rowNode.data)
      } 
      else {
        rowNode.data.fechaApertura = this.datepipe.transform(new Date(rowNode.data.fechaApertura), 'dd/MM/yyyy')
        this.dataPrint.push(rowNode.data)
      }
    })
    setTimeout(()=>{
      printJS({
        printable: 'print_informe_planillaFF',
        type: 'html',
        style: this.printSrv.getTableStyle(),
        scanStyles: false
      })
    }, 250)

    this.informePlanillaFondo = [];
  
     this.searchTardio(); 
  
  }

  searchTardio(){
    setTimeout(()=>{
      this.getInformes();
    }, 100)
  }
  
  exportar(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.fechaCierre != undefined){
        rowNode.data.fechaCierre = this.datepipe.transform(new Date(rowNode.data.fechaCierre), 'dd/MM/yyyy')
        rowNode.data.fechaApertura = this.datepipe.transform(new Date(rowNode.data.fechaApertura), 'dd/MM/yyyy')
        this.dataPrint.push(rowNode.data)
      } 
      else {
        rowNode.data.fechaApertura = this.datepipe.transform(new Date(rowNode.data.fechaApertura), 'dd/MM/yyyy')
        this.dataPrint.push(rowNode.data)
      }
     })
     setTimeout(()=>{
      this.excelSrv.export(this.dataPrint)
     }, 250)

     this.informePlanillaFondo = [];
  
     this.searchTardio(); 
  
    
  }

}
