import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EditSettingsModel, QueryCellInfoEventArgs } from '@syncfusion/ej2-grids';
import { ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup } from '@angular/forms';
import { TipoRetencionService } from 'src/app/services/caja/tipo-retencion.service';
import { CuentaService } from 'src/app/services/contabilidad/cuenta.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import 'ag-grid-enterprise';
import * as  printJS from 'print-js';
import { PrintService } from 'src/app/services/print.service';
import { ExcelService } from 'src/app/services/excel.service';


@Component({
  selector: 'app-tipos-retencion',
  templateUrl: './tipos-retencion.component.html',
  styleUrls: ['./tipos-retencion.component.css']
})
export class TiposRetencionComponent implements OnInit {

  datosForm: FormGroup;
  retenciones: any[];
  grid: any;
  gridColumn: any;
  selectedRow: any;
  cuentas: any[];
  isNew: boolean;
  @ViewChild('modal') modal: ElementRef;
  searchValue: string = '';
  fechaEmision: Date = new Date();
  dataPrint: any[];

  columnDefs = [
    { 
      field: 'codigo', 
      headerName: 'Código',
      filter: true

    },
    { 
      field: 'retencion', 
      headerName: 'Nombre',
      filter: true
    },
    { 
      field: 'verCompras', 
      headerName: 'Ver Compras',
      filter: true,
      cellStyle: {
        'text-align': 'center'
      },
      cellRenderer: params => {
        return `<input disabled type='checkbox' ${params.value ? 'checked' : ''} />`;
      }
    },
    { 
      field: 'ivaVentaCompra',
      headerName: 'IVA',
      filter: true,
      cellRenderer: params => {
        return `${params.value == '0' ? '' : (params.value == '1' ? 'IVA Ventas' : 'IVA Compras')}`;
      }
    },
    { 
      field: 'signoIva', 
      headerName: 'Signo',
      filter: true,
      cellRenderer: params => {
        return `${params.value == 0 ? '' : (params.value == 1 ? '(+)' : '(-)')}`;
      }
    },
    { 
      field: 'iva', 
      headerName: 'Columna',
      filter: true,
      cellRenderer: params => {
        return `${params.value == null ? '' : (params.value == 'I' ? 'IVA' : 'Retención')}`;
      }
    },
    { 
      field: 'cuenta', 
      headerName: 'Cta Contable',
      filter: true
    },
    { 
      field: 'cuenta', 
      headerName: 'Nombre Cta Contable',
      filter: true,
      cellRenderer: params => {
        return this.getNombreCtaContable(params.value);
      }
    },
    { 
      field: 'jurisdiccion', 
      headerName: 'Jurisdiccion',
      filter: true
    }
  ]

  defaultColDef = {
    editable: false,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'}
  };

  constructor(
    private route: Router,
    private modalService: NgbModal,
    private reteSrv: TipoRetencionService,
    private cuentaSrv: CuentaService,
    private toastr: ToastrService,
    private printSrv: PrintService,
    private excelSrv: ExcelService, 
  ) { }

  ngOnInit(): void {
    this.getCuentas();   
  }

  getRetenciones(){
    this.reteSrv.getRetenciones().subscribe(result => {
      this.retenciones = result.data;
    })
  }

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

  onSelectionChanged(event) {
    const selectedRows = this.grid.getSelectedRows();
    if(selectedRows.length != 0){
      this.selectedRow = selectedRows[0];
    }
  }

  open(content) {
    let options: NgbModalOptions = {
      size: 'lg',
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

  home(){
    this.route.navigate(['/home'], {  });
  }

  edit(){
    this.isNew = false;

    this.datosForm = new FormGroup({
      retencion: new FormControl(this.selectedRow.retencion),
      codigo: new FormControl(this.selectedRow.codigo),
      cuenta: new FormControl(this.selectedRow.cuenta),
      verCompras: new FormControl(this.selectedRow.verCompras),
      ivaVentaCompra: new FormControl(this.selectedRow.ivaVentaCompra?.toString()),
      signoIva: new FormControl(this.selectedRow.signoIva?.toString()),
      iva: new FormControl(this.selectedRow.iva?.toString()),
      jurisdiccion: new FormControl(this.selectedRow.jurisdiccion),
      cuentaContableNombre: new FormControl(this.getNombreCtaContable(this.selectedRow.codigo.toString()))
    });

    this.open(this.modal);
  }

  new(){
    this.isNew = true;

    this.datosForm = new FormGroup({
      retencion: new FormControl(null),
      codigo: new FormControl(null),
      cuenta: new FormControl(null),
      verCompras: new FormControl(null),
      ivaVentaCompra: new FormControl(null),
      signoIva: new FormControl(null),
      iva: new FormControl(null),
      jurisdiccion: new FormControl(null),
      cuentaContableNombre: new FormControl(null)
    });

    this.open(this.modal);
  }

  trash(){
    Swal.fire({
      text: '¿Desea borrar el registro?',
      showCancelButton: true,
      confirmButtonText: 'Si',
      customClass: {
        confirmButton: 'btn btn-danger btn-sm mr-2',
        cancelButton: 'btn btn-secondary btn-sm mr-2'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.reteSrv.deleteRetencion(this.selectedRow.codigo).subscribe(result =>{
          this.getRetenciones();
          this.toastr.success("Se borró correctamente.", 'Tipo de Retenciones', { closeButton: true, timeOut: 3000 });
        }, error => {
          this.toastr.error(error.error.message, 'Tipo de Retenciones', { closeButton: true, timeOut: 3000 });
        })
      }else{
        this.getRetenciones();
      }
    })
  }

  save(){
    let formObj = this.datosForm.getRawValue();

    let data = {
      retencion: formObj.retencion,
      codigo: Number(formObj.codigo),
      cuenta: formObj.cuenta,
      verCompras: formObj.verCompras ? 1 : 0,
      ivaVentaCompra: Number(formObj.ivaVentaCompra),
      signoIva: Number(formObj.signoIva),
      iva: formObj.iva,
      jurisdiccion: formObj.jurisdiccion
    }

    if(this.isNew){
      this.reteSrv.createRetencion(data).subscribe(result =>{
        this.getRetenciones();
        this.toastr.success("Se agregó correctamente.", 'Tipo Retenciones', { closeButton: true, timeOut: 3000 });
      }, error => {
        this.toastr.error(error.error.message, 'Tipo Retenciones', { closeButton: true, timeOut: 3000 });
      })
    }else{
      this.reteSrv.updateRetencion(data).subscribe(result =>{
        this.getRetenciones();
        this.toastr.success("Se actualizó correctamente.", 'Tipo Retenciones', { closeButton: true, timeOut: 3000 });
      }, error => {
        this.toastr.error(error.error.message, 'Tipo Retenciones', { closeButton: true, timeOut: 3000 });
      })
    }
  }

  getModalTitle(){
    if(this.isNew){
      return 'Agregar';
    }
    return 'Editar';
  }

  /* BUCAR CUENTA */
  getCuentas(){
    this.cuentaSrv.getCuentas().subscribe(result => {
      this.cuentas = result.data;
      this.getRetenciones();
    })
  }

  cuentaKeyDown(event){
    if(event.keyCode == 13){
      this.cuentaSrv.getCuentaImputable(event.target.value).subscribe(result => {
        this.getNombreCtaContable(event.target.value);
      }, error => {
        this.toastr.error(error.error.message, 'Tipo de Retenciones', { closeButton: true, timeOut: 3000 });
        this.datosForm.controls['cuenta'].setValue('');
        this.datosForm.controls['cuentaContableNombre'].setValue('');
      })
    }
  }

  getNombreCtaContable(codigo: string){
    let index = this.cuentas.findIndex(elt => elt.id.trim() == codigo.trim())

    if(index != -1){
      if(this.datosForm){
        this.datosForm.controls['cuentaContableNombre'].setValue(this.cuentas[index].nombre);
      }
      
      return this.cuentas[index].nombre;
    }else{
      this.toastr.error('La cuenta no existe.', 'Tipo de Retenciones', { closeButton: true, timeOut: 3000 });
      
      if(this.datosForm){
        this.datosForm.controls['cuentaContableNombre'].setValue('');
      }

      return '';
    }
  }

  /* FIN BUSCAR CUENTA */

  print(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
     this.dataPrint.push(rowNode.data)
    })
    setTimeout(()=>{
      printJS({
        printable: 'print_retenciones',
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

}
