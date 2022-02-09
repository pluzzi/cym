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
import { Fields } from '@syncfusion/ej2-angular-dropdowns';

@Component({
  selector: 'app-planilla-fondo-fijo',
  templateUrl: './planilla-fondo-fijo.component.html',
  styleUrls: ['./planilla-fondo-fijo.component.css']
})
export class PlanillaFondoFijoComponent implements OnInit {

  gridMovimientos: any;
  gridSaldos: any;
  fechaApertura: Date = new Date();
  fechaCierre: Date;  
  searchValue: string = '';
  tipos_moneda: any[];
  fechaEmision: Date = new Date();
  dataPrint: any[];
  dataPrintSaldos: any[];
  tipos: any[];
  tipoSelected: any;
  usuarios: any[];
  usuarioSelected: any;
  total: any;
  monedaSelected: any = 0;
  proveedores: any[];
  proveedorSelected: any;
  nombreProveedor: string;
  numeroPlanilla: number;
  movimiento: number;
  destino: string;
  archivoPfd: string;
  estado: any;
  grillaDetalleSaldos: any[];
  grillaMovimientos: any[];
  grillaDetalleMovimientos: any[];
  @ViewChild('modal') modal: ElementRef;
  movimientosForm: FormGroup;
  selectedRow: any;
  condicion: string = "1";
  asiento: number;
  

  columnDefs1 = [
    { 
      field: 'codigoConcepto', 
      headerName: 'Código',
      filter: true,
      width: 90,
      cellStyle: {
        'text-align': 'center'
      },
    },
    
    { 
      field: 'descripcionConcepto', 
      headerName: 'Concepto',
      filter: true
    },
    { 
      field: 'idCuenta', 
      headerName: 'Cuenta',
      filter: true,
      width: 110,
    },
    { 
      field: 'moneda', 
      headerName: 'Moneda',
      filter: true
    },
    { 
      field: 'codigoProveedor', 
      headerName: 'Cod.Prov.',
      filter: true
    },
    { 
      field: 'tipo',
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : (params.data.tipo + '-' + params.data.letra + '-' + params.data.codigo + '-' + params.data.numero)  
      },
      headerName: 'Tipo',
      filter: true
    },
    { 
      field: 'importeCotizacion', 
      headerName: 'Importe Moneda',
      filter: true,
      cellStyle: {
        'text-align': 'right'
      }
    },
    { 
      field: 'cotizacion', 
      headerName: 'Cotización',
      filter: true,
      editable: true,
      width: 130,
      valueFormatter: params => params.data.cotizacion.toFixed(3),
      cellStyle: {
        'text-align': 'center'
      },
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
    },
    { 
      field: 'fechaTarjeta', 
      headerName: 'Fecha Tarjeta',
      filter: true,
      width: 100,
      cellStyle: {
        'text-align': 'right'
      },
      cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      }
    }
  ];

  columnDefs2 = [
    { 
      field: 'codigoMoneda', 
      headerName: 'Código',
      filter: true
    },
    
    { 
      field: 'nombreMoneda', 
      headerName: 'Moneda',
      filter: true
    },
    { 
      field: 'importeFondo', 
      headerName: 'Importe',
      filter: true
    },
    { 
      field: 'comprobante', 
      headerName: 'Importe Gasto',
      filter: true,
      width: 130,
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
      cellStyle: {
        'text-align': 'right'
      }
    },
    { 
      field: 'nombre', 
      headerName: 'Saldo',
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

  columnDefs3 = [
    { 
      field: 'percepcion', 
      headerName: 'Percepción',
      filter: true
    },
    
    { 
      field: 'importe', 
      headerName: 'Importe',
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
    private UsuarioFFSrv: UsuarioFondoFijoService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.tipos = this.UsuarioFFSrv.getOpciones();  
    this.getUsuarios();
    this.getMonedas();
  }

  home(){
    this.route.navigate(['/home'], {  });
  }


  onGridReadyMovimientos(params) {
    this.gridMovimientos = params.api;

    setTimeout(()=>{
      this.gridMovimientos.sizeColumnsToFit();
      //this.autoSizeAll(false, params.columnApi);
      this.gridMovimientos.setHeaderHeight(18);
    }, 250)
    
  }

  onGridReadySaldos(params) {
    this.gridSaldos = params.api;

    setTimeout(()=>{
      this.gridSaldos.sizeColumnsToFit();
      //this.autoSizeAll(false, params.columnApi);
      this.gridSaldos.setHeaderHeight(18);
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
      this.fechaApertura = event;
    }
  }

  setHasta(event: any){
    if(event && event != ''){
      this.fechaCierre = event;
    }
  }

  
  proveedorKeydown(event){
    if(event.keyCode == 13){
      let data = {
        codigoProveedor: this.proveedorSelected,
          
      }
      this.UsuarioFFSrv.getProveedor(data).subscribe(result => {
        if(result.data){
          this.nombreProveedor = result.data.nombreProveedor
        } else{
          this.nombreProveedor = ''
        }
      },error => {
        this.toastr.error(error.error.message, 'Informe Usuario Proveedor', { closeButton: true, timeOut: 4000 });
      })
    }
    
  }

  
   
  getUsuarios(){
    this.UsuarioFFSrv.getUsuarios().subscribe(result => {
      this.usuarios = result.data;
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
    this.dataPrintSaldos = [];
    this.dataPrint = [];
    
    this.getTotal();

    this.gridSaldos.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      this.dataPrintSaldos.push(rowNode.data)
     });
     
    this.gridMovimientos.forEachNodeAfterFilterAndSort((rowNode, index)=>{
     this.dataPrint.push(rowNode.data)
    });
   

    setTimeout(()=>{
      printJS({
        printable: 'print_informe_fondo_fijo',
        type: 'html',
        style: this.printSrv.getTableStyle(),
        scanStyles: false
      })
    }, 250)
  
  }
  
  exportar(){
    this.dataPrint = [];
    this.gridMovimientos.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      this.dataPrint.push(rowNode.data)
     })
     setTimeout(()=>{
      this.excelSrv.export(this.dataPrint) 
     }, 250)
  
    
  }

  getTotal(){
    this.total = this.grillaMovimientos.reduce((sum, current) => {
      return sum + current.importe;
    },0).toFixed(2)
  }

  getUsuariosNombre(){
    return this.usuarioSelected == null ? '' : this.usuarios.find(elt => elt.codigo == this.usuarioSelected).nombre
  }

  getTipoNombre(){
    return this.tipoSelected == null ? '' : this.tipos.find(elt => elt.tipo == this.tipoSelected).descripcion
  }

  getMonedaNombre(){
    return this.monedaSelected == null ? '' : this.tipos_moneda.find(elt => elt.codigo == this.monedaSelected).nombre
  }

  getMonedas(){
    this.monedaSrv.getMonedas(0,4).subscribe(result => {
      this.tipos_moneda = result.data;
    })
  }

  getProveedor(){
    let request = {
      codigoProveedor: Number(this.proveedorSelected),      
    }

    this.UsuarioFFSrv.getProveedor(request).subscribe(result => {
      this.proveedores = result.data;
    })
  }

  limpiar(){
    this.usuarioSelected = 0;
    this.fechaApertura = new Date();
    this.fechaCierre = new Date();
    this.archivoPfd = '';
    this.destino = '';
    this.numeroPlanilla = null;
    this.grillaDetalleSaldos = [];
    this.grillaMovimientos = [];
  }

  getDatos(){
    
    this.getGrillaSaldos();
    this.getCabeceraDetalle();
  }

  async getCabeceraDetalle(){
    
    let requestCabecera = {
      codigoUsuario: this.usuarioSelected == 0 ? null : this.usuarioSelected,
      
    }
    
    await this.UsuarioFFSrv.getPlanillaConsultaCabecera(requestCabecera).toPromise().then(result => {
      this.fechaApertura = result.data.fechaApertura;
      this.fechaCierre = result.data.fechaCierre;
      this.numeroPlanilla = result.data.planilla;
      this.movimiento = result.data.movimiento;
      this.estado = result.data.estado;
      this.destino = result.data.destino;
      this.archivoPfd = result.data.archivo_pdf;

      let requestDetalle = {
        planilla: this.numeroPlanilla,
        
      }
      
      this.UsuarioFFSrv.getGrillaMovimientos(requestDetalle).toPromise().then(result => {
        this.grillaMovimientos = result.data;
        this.gridMovimientos.sizeColumnsToFit();          
      })       
    }).catch( error => {
      console.log(error)
      this.toastr.error(error.error.message, 'Planilla Fondo Fijo', { closeButton: true, timeOut: 4000 });
      this.grillaDetalleSaldos = [];
      this.grillaMovimientos = [];
      this.fechaApertura = new Date();;
      this.fechaCierre = new Date();;
      this.numeroPlanilla = 0;
      this.archivoPfd = '';
      this.destino = '';
      this.movimiento = 0;
    });        
  }

  getGrillaSaldos(){
    this.spinner.show();
    let request = {
      codigoUsuario: this.usuarioSelected == 0 ? null : this.usuarioSelected,
      
    }
    
    this.UsuarioFFSrv.getPlanillaDetalle(request).subscribe(result => {
      this.grillaDetalleSaldos = result.data;

       
    })

    this.gridSaldos.sizeColumnsToFit(); 
    this.spinner.hide();
  }


  open(content) {
    let options: NgbModalOptions = {
      size: 'xl',
      centered: true,
      backdrop : 'static',
      keyboard : false
    }
    this.modalService.open(content, options).result.then((result) => {
      console.log(result);      
    }, (reason) => {
      console.log(reason);
    });
  }
  
  edit(){
    
    this.movimientosForm = new FormGroup({
      factura: new FormControl(),
      proveedor: new FormControl(),
      fecha: new FormControl(),
      cuit: new FormControl(),
      nombre: new FormControl(),
      iva: new FormControl(),
      archivoPdf: new FormControl(),
      neto21: new FormControl(),
      iva21: new FormControl(),    
      neto27: new FormControl(),
      iva27: new FormControl(),
      neto10: new FormControl(),
      iva10: new FormControl(),
      noGrav: new FormControl(),
      percepcion: new FormControl(),
      total: new FormControl(),
    });

    this.open(this.modal),
    this.getMovimientos();
    //getMovimientos o alguna variable o array de datos, para llenar un input o select.
    
  }

  private formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  getMovimientos(){

  }

  saveModal(){
    let formObj = this.movimientosForm.getRawValue();

    let data = {
      interno: Number(formObj.interno),
      codigoMoneda: Number(formObj.codigo),
      turno: null,
      banco: formObj.banco,
      fechaMov: formObj.fechaEmitido,
      cp: formObj.cp,
      sucursal: formObj.sucursal,
      fechaCheque: formObj.fechaCheque,
      numeroCheque: Number(formObj.cheque),
      numeroCupon: formObj.numeroCupon,
    }

    this.informeSrv.getUpdateValores(data).subscribe(result =>{
      this.getMovimientos();
      this.toastr.success("Se modificó correctamente.", 'Editar Valores', { closeButton: true, timeOut: 4000 });
    }, error => {
      this.toastr.error(error.error.message, 'Editar Valores', { closeButton: true, timeOut: 4000 });
    })
  }

  onSelectionChanged(event) {
    const selectedRows = this.gridMovimientos.getSelectedRows();
    if(selectedRows.length != 0){
      this.selectedRow = selectedRows[0];
    }
  }

  grabarDestino(){
    if(this.numeroPlanilla != 0){
      this.spinner.show();
    let request = {
      destino: this.destino == undefined ? null : this.destino,
      planilla: this.numeroPlanilla
      
    }
    
    this.UsuarioFFSrv.grabarDestino(request).subscribe(result => {
      this.toastr.success("Destino se grabó correctamente.", 'Planilla Fondo Fijo', { closeButton: true, timeOut: 4000 });
      this.spinner.hide();      
    })
    
  }else[
    this.toastr.error('No se puede grabar Destino sin una Planilla Abierta.', 'Planilla Fondo Fijo' , {closeButton: true, timeOut: 4000})
  ]
  }

  trash(){
    Swal.fire({
      text: '¿Desea borrar la Planilla?',
      showCancelButton: true,
      confirmButtonText: 'Si',
      customClass: {
        confirmButton: 'btn btn-danger btn-sm mr-2',
        cancelButton: 'btn btn-secondary btn-sm mr-2'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.UsuarioFFSrv.deletePlanillaFondoFijo(this.numeroPlanilla).subscribe(result =>{
          
          this.toastr.success("Se borró correctamente.", 'Apertura Fondo Fijo', { closeButton: true, timeOut: 4000 });
          
        }, error => {
          this.toastr.error(error.error.message, 'Planilla Fondo Fijo', { closeButton: true, timeOut: 4000 });
        })
      }
    })
  }

  reApertura(){
    this.spinner.show();
    let request = {
      planilla: this.numeroPlanilla == 0 ? null : this.numeroPlanilla,
      
    }
    
    this.UsuarioFFSrv.reAperturaPlanilla(request).subscribe(result => {
      this.toastr.success("Se reabrió la Planilla correctamente.", 'Planilla Fondo Fijo', { closeButton: true, timeOut: 4000 });
       
    }, error => {
      this.toastr.error(error.error.message, 'Planilla Fondo Fijo', { closeButton: true, timeOut: 4000 });
    })

    this.gridMovimientos.sizeColumnsToFit(); 
    this.spinner.hide();

  }

  keyDown(event: any){
    
    if(event.keyCode == 13){
      this.validaPlanillaCerrada();
    }
  }

  validaPlanillaCerrada(){
    this.spinner.show();
    let request = {
      planilla: Number(this.numeroPlanilla == 0 ? null : this.numeroPlanilla),
      
    }
    
    this.UsuarioFFSrv.consultaPlanillaCerrada(request).subscribe(result => {
      
      this.numeroPlanilla = result.data.planilla;
      this.usuarioSelected = result.data.codigoUsuario;
      this.fechaApertura = result.data.fechaApertura;
      this.fechaCierre = result.data.fechaCierre;      
      this.movimiento = result.data.movimiento;
      this.estado = result.data.estado;
      this.destino = result.data.destino;
      this.archivoPfd = result.data.archivo_pdf;
      this.asiento = result.data.asiento;
       
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.message, 'Planilla Fondo Fijo', { closeButton: true, timeOut: 4000 });
    })
    
    this.gridMovimientos.sizeColumnsToFit(); 
    this.gridSaldos.sizeColumnsToFit();
    this.spinner.hide();
  }

    

  

}
