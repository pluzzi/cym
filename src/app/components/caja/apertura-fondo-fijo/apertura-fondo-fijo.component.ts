import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
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
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { BancoService } from 'src/app/services/caja/banco.service';
import { RowNode } from 'ag-grid-community';
import { UsuarioFondoFijoService } from 'src/app/services/caja/usuario-fondo-fijo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-apertura-fondo-fijo',
  templateUrl: './apertura-fondo-fijo.component.html',
  styleUrls: ['./apertura-fondo-fijo.component.css']
})
export class AperturaFondoFijoComponent implements OnInit {


  grid: any;
  fecha: Date = new Date();
  fechaCheque: Date;
  fechaMov: Date;
  planillas: any[];
  searchValue: string = '';
  monedaSelected: any = 0;
  tipos_moneda_banco_propio: any[];
  tipo: string = "2";
  estado: boolean;
  fechaEmision: Date = new Date();
  estadoSelected: any = 1;
  valores: any[];
  @ViewChild('modal') modal: ElementRef;
  total: any;
  planillaForm: FormGroup;
  selectedRow: any;
  bancos: any[];
  dataPrint: any[];  
  numeroPlanilla: number;
  usuarios: any[];
  usuarioSelected: any;
  planillaSelected: any;
  columnDefs : any;
  dataGrid: any[];
  

  defaultColDef = {
    editable: false,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'}
  };

  constructor(
    private route: Router,
    private toastr: ToastrService,
    private datepipe: DatePipe,
    private spinner: NgxSpinnerService,
    private monedaSrv: MonedaService,
    private informeSrv: InformeCajaService,
    private modalService: NgbModal,
    private userFondoFijoSrv: UsuarioFondoFijoService
  ) { }

  ngOnInit(): void {
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
      this.grid.setHeaderHeight(20);
    }, 250)
    
  }

  autoSizeAll(skipHeader, column) {
    const allColumnIds = [];
    column.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });
    column.autoSizeColumns(allColumnIds, skipHeader);
  }

  setFecha(event: any){
    if(event && event != ''){
      this.fecha = event;
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

 
  getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return { 
        'font-weight': 'bold'
      };
    }else{
      return {};
    }

  };

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

  
  
  onSelectionChanged(event) {
    const selectedRows = this.grid.getSelectedRows();
    if(selectedRows.length != 0){
      this.selectedRow = selectedRows[0];
    }
  }

  save(){
    let formObj = this.planillaForm.getRawValue();

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
      this.getPlanilla();
      this.toastr.success("Se modificó correctamente.", 'Editar Valores', { closeButton: true, timeOut: 4000 });
    }, error => {
      this.toastr.error(error.error.message, 'Editar Valores', { closeButton: true, timeOut: 4000 });
    })

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

  getUsuarios(){
    this.userFondoFijoSrv.getUsuarios().subscribe(result => {
      this.usuarios = result.data;
    })
  }
   
  
  getPlanilla(){
    this.spinner.show();
    let request = {
      codigoUsuario: this.usuarioSelected == 0 ? null : this.usuarioSelected,
      
    }
    
    this.userFondoFijoSrv.getPlanillaFondoCabecera(request).subscribe(result => {
      debugger
      
      if(result.data){
        this.columnDefs = [
          { 
            field: 'codigoMoneda', 
            headerName: 'Código',
            filter: true,
            cellStyle: {
              'text-align': 'center'
            }
          },
          { 
            field: 'nombreMoneda', 
            headerName: 'Nombre',
            filter: true,
            
          },
          { 
            field: 'nombreTipo', 
            headerName: 'Tipo',
            filter: true
            
          },
          { 
            field: 'importeFondo', 
            headerName: 'Importe',
            filter: true,
            width: 120,
            editable: true,
            cellStyle: {
              'text-align': 'right'
            },
            cellRenderer: params => {
              return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
            },
          },
          { 
            field: 'tarjeta', 
            headerName: 'Tarjeta',
            filter: true,
            cellStyle: {
              'text-align': 'right'
            }
            
          },
          { 
            field: 'fechaVencimiento', 
            headerName: 'Fecha Vto',
            filter: true,
            cellStyle: {
              'text-align': 'right'
            },
            cellRenderer: params => {
              return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
            }
          }
          
          
        ];
          
          this.fecha = result.data.fechaApertura;
          this.numeroPlanilla = result.data.planilla;
          this.userFondoFijoSrv.getPlanillaDetalle(request).subscribe(result => {
            
            this.planillas = result.data;
            this.grid.sizeColumnsToFit(); 
            this.spinner.hide();
          })

        } else{
          this.columnDefs = [
            { 
              field: 'codigoMoneda', 
              headerName: 'Código',
              filter: true,
              cellStyle: {
                'text-align': 'center'
              }
            },
            { 
              field: 'nombreMoneda', 
              headerName: 'Nombre',
              filter: true,
              
            },
            { 
              field: 'nombreTipo', 
              headerName: 'Tipo',
              filter: true
              
            },
            { 
              field: 'importeFondo', 
              headerName: 'Importe',
              filter: true,
              editable: true,
              width: 120,
              cellRenderer: params => {
                return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
              },
              cellStyle: params => {
                if(params.data.tipoMoneda != 3){
                  return {
                    'pointer-events': 'none'
                  }
                }else{ 
                  return{
                   'font-size' : '11px',
                   'line-height': 'unset',
                   'text-align': 'right'
                  }
                }
              }
              
            },
            { 
              field: 'tarjeta', 
              headerName: 'Tarjeta',
              filter: true,
              cellStyle: {
                'text-align': 'right'
              }
              
            },
            { 
              field: 'fechaVencimiento', 
              headerName: 'Fecha Vto',
              filter: true,
              cellRenderer: params => {
                return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
              },
              cellStyle: {
                'text-align': 'right'
              }
            }

            
          ];
          this.userFondoFijoSrv.getPlanillaMonedaDetalle(request).subscribe(result => {
            this.fecha = new Date();
            this.numeroPlanilla = 0;
            this.planillas = result.data;
            this.grid.sizeColumnsToFit(); 
          })
  
          
        }
      
     
      this.grid.sizeColumnsToFit();  
      this.spinner.hide();

    }, error => {
      this.spinner.hide();
    })
    
  }

  getApertura(){
    this.spinner.show();
    if(this.numeroPlanilla == 0){
      let request = {
        planilla: null,
        codigoUsuario: this.usuarioSelected == 0 ? null : this.usuarioSelected,
        fechaApertura: this.datepipe.transform(this.fecha, 'yyyy-MM-dd'),
      }
      this.userFondoFijoSrv.getAperturaCabecera(request).subscribe(result => {
        this.numeroPlanilla = result.data.id;
        debugger
        
        this.grid.forEachNode((rowNode, index)=>{
          let request = {
            planilla: this.numeroPlanilla,
            codigoMoneda: rowNode.data.codigoMoneda, 
            importeFondo: Number(rowNode.data.importeFondo),
          }
    
          this.userFondoFijoSrv.getAperturaDetalle(request).subscribe(result =>{
            
            if(index == this.planillas.length -1){
              this.toastr.success("Se grabó correctamente.", 'Apertura', { closeButton: true, timeOut: 4000 });
              this.spinner.hide();
              this.getPlanilla();
            }

          }, error => {
            this.toastr.error(error.error.message, 'Apertura Fondo Fijo', { closeButton: true, timeOut: 4000 });
            this.spinner.hide();
          })
    
        })
      })
    }else{
      this.toastr.error('El Usuario ya tiene una Planilla abierta', 'Apertura Fondo Fijo', { closeButton: true, timeOut: 4000 });
      this.spinner.hide();
    } 
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
        this.userFondoFijoSrv.deletePlanillaCompleta(this.numeroPlanilla).subscribe(result =>{
          this.getPlanilla();
          this.toastr.success("Se borró correctamente.", 'Apertura Fondo Fijo', { closeButton: true, timeOut: 4000 });
        }, error => {
          this.toastr.error("Nro. de Planilla de Fondo Fijo con Movimientos.", 'Apertura Fondo Fijo', { closeButton: true, timeOut: 4000 });
        })
      }
    })
  }
  
  edit(){
    this.spinner.show();
    if(this.numeroPlanilla == 0){
      this.toastr.error('El usuario no tiene una planilla abierta', 'Apertura Fondo Fijo', { closeButton: true, timeOut: 4000 });
      this.spinner.hide();
      return
    }
    this.userFondoFijoSrv.deletePlanilla(this.numeroPlanilla).toPromise().then(result =>
      {
        this.grid.forEachNode((rowNode, index)=>{
      
          debugger
    
          let request = {
            planilla: this.numeroPlanilla,
            codigoMoneda: rowNode.data.codigoMoneda,
            importeFondo: Number(rowNode.data.importeFondo),
          }
    
          this.userFondoFijoSrv.getAperturaDetalle(request).subscribe(result =>{
            debugger
            if(index == this.planillas.length -1){
              this.toastr.success("Se modificó correctamente.", 'Apertura', { closeButton: true, timeOut: 4000 });
              this.spinner.hide();
            }
          }, error => {
            this.toastr.error(error.error.message, 'Apertura Fondo Fijo', { closeButton: true, timeOut: 4000 });
            this.spinner.hide();
          })
    
        })
      })
    
  }

  limpiar(){
    this.fecha = new Date();
    this.numeroPlanilla = 0;
    this.usuarioSelected = 0;

    this.planillas = [];
  }
 
   
}
