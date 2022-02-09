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
  selector: 'app-informe-usuarios',
  templateUrl: './informe-usuarios.component.html',
  styleUrls: ['./informe-usuarios.component.css']
})
export class InformeUsuariosComponent implements OnInit {

  grid: any;
  desde: Date = new Date();
  hasta: Date = new Date();
  InformeUsuarios: any[];
  searchValue: string = '';
  tipos_moneda_banco_propio: any[];
  fechaEmision: Date = new Date();
  dataPrint: any[];
  tipos: any[];
  tipoSelected: any;
  usuarios: any[];
  usuarioSelected: any;
  total: any;
  
  columnDefs = [
    { 
      field: 'usuario', 
      headerName: 'Usuario',
      filter: true
    },
    
    { 
      field: 'codigo', 
      headerName: 'Código',
      filter: true
    },
    { 
      field: 'descripcion', 
      headerName: 'Descripción',
      filter: true
    },
    { 
      field: 'importe', 
      headerName: 'Importe',
      filter: true,
      width: 130,
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
      cellStyle: {
        'text-align': 'right'
      }
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
    private UsuarioFFSrv: UsuarioFondoFijoService,
  ) { }

  ngOnInit(): void {
    
    this.tipos = this.UsuarioFFSrv.getTipos();  
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

   
  getUsuarios(){
    this.UsuarioFFSrv.getUsuarios().subscribe(result => {
      this.usuarios = result.data;
    })
  }

  getInformesUsuarios(){
    this.spinner.show();
    let request;
    if(this.tipoSelected < 3){
      request = {
        tipo: Number(this.tipoSelected),
        codigoUsuario: this.usuarioSelected == undefined ? null : this.usuarioSelected,
        desde: this.datepipe.transform(this.desde, 'yyyy-MM-dd'),
        hasta: this.datepipe.transform(this.hasta, 'yyyy-MM-dd')
      }
    }else{
        request = {
          tipo: Number(this.tipoSelected),
          codigoUsuario: null,
          desde: this.datepipe.transform(this.desde, 'yyyy-MM-dd'),
          hasta: this.datepipe.transform(this.hasta, 'yyyy-MM-dd')
        }
    }
    
    this.UsuarioFFSrv.getInformeUsuario(request).subscribe(result => {
      this.InformeUsuarios = result.data;

      let pinnedBottomRowData = {
        descripcion: 'Total:',
        importe: this.InformeUsuarios.reduce((sum, current) => {
          return sum + current.importe;
        },0)
      }
  
      this.grid.setPinnedBottomRowData([pinnedBottomRowData]);
      
            
      this.grid.sizeColumnsToFit();
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
      return {};
    }

  }

  print(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
     this.dataPrint.push(rowNode.data)
    })
    setTimeout(()=>{
      printJS({
        printable: 'print_informe_usuarios_fondo',
        type: 'html',
        style: this.printSrv.getTableStyle(),
        scanStyles: false
      })
    }, 250)
  
  }
  
  exportar(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      this.dataPrint.push(rowNode.data)
     })
     setTimeout(()=>{
      this.excelSrv.export(this.dataPrint) 
     }, 250)
  
    
  }

  getTotal(){
    this.total = this.InformeUsuarios.reduce((sum, current) => {
      return sum + current.importe;
    },0).toFixed(2)
  }

  getUsuariosNombre(){
    return this.usuarioSelected == null ? '' : this.usuarios.find(elt => elt.codigo == this.usuarioSelected).nombre
  }

  getTipoNombre(){
    return this.tipoSelected == null ? '' : this.tipos.find(elt => elt.tipo == this.tipoSelected).descripcion
  }

}
