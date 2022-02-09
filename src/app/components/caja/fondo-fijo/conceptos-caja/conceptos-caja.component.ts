import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EditSettingsModel, QueryCellInfoEventArgs } from '@syncfusion/ej2-grids';
import { ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConceptoService } from 'src/app/services/caja/concepto.service';
import { CuentaService } from 'src/app/services/contabilidad/cuenta.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import * as  printJS from 'print-js';
import { PrintService } from 'src/app/services/print.service';
import { ExcelService } from 'src/app/services/excel.service';

@Component({
  selector: 'app-conceptos-caja',
  templateUrl: './conceptos-caja.component.html',
  styleUrls: ['./conceptos-caja.component.css']
})
export class ConceptosCajaComponent implements OnInit {
  datosForm: FormGroup;
  @ViewChild('modal') modal: ElementRef; 
  conceptos: any[];
  isNew: boolean;
  grid: any;
  selectedRow: any;
  searchValue: string = '';
  cuentas: any[];
  fechaEmision: Date = new Date();
  dataPrint: any[];

  columnDefs = [
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
      field: 'cuenta', 
      headerName: 'Cuenta',
      filter: true
    },
    { 
      field: 'estado', 
      headerName: 'Inactivo',
      cellRenderer: params => {
        return `<input disabled type='checkbox' ${params.value ? 'checked' : ''} />`;
      },
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
    private modalService: NgbModal,
    private conceptoSrv: ConceptoService,
    private cuentaSrv: CuentaService,
    private toastr: ToastrService,
    private printSrv: PrintService,
    private excelSrv: ExcelService, 
  ) { }

  ngOnInit(): void {
    this.getConceptos();
    this.getCuentas();
  }

  getConceptos(){
    this.conceptoSrv.getConceptos().subscribe(result => {
      this.conceptos = result.data;
    })
  }

  getCuentas(){
    this.cuentaSrv.getCuentas().subscribe(result => {
      this.cuentas = result.data;
    })
  }

  home(){
    this.route.navigate(['/home'], {  });
  }

  open(content) {
    let options: NgbModalOptions = {
      size: 'lg',
      centered: true,
      backdrop : 'static',
      keyboard : false
    }
    this.modalService.open(content, options).result.then((result) => {
      console.log(`Closed with: ${result}`);      
    }, (reason) => {
      console.log(reason);
    });
  }

  getModalTitle(){
    if(this.isNew){
      return 'Agregar'
    }else{
      return 'Editar'
    }
  }

  onGridReady(params) {
    this.grid = params.api;

    setTimeout(()=>{
      this.grid.sizeColumnsToFit();
      this.grid.setHeaderHeight(20);
    }, 250)
  }

  onSelectionChanged(event) {
    const selectedRows = this.grid.getSelectedRows();
    if(selectedRows.length != 0){
      this.selectedRow = selectedRows[0];
    }
  }

  edit(){
    this.isNew = false;

    this.datosForm = new FormGroup({
      codigo: new FormControl(this.selectedRow.codigo),
      descripcion: new FormControl(this.selectedRow.descripcion),
      cuenta: new FormControl(this.selectedRow.cuenta),
      estado: new FormControl(this.selectedRow.estado),
      nombreCuenta: new FormControl(this.getNombreCuenta(this.selectedRow.cuenta))
    });

    this.open(this.modal);
  }

  new(){
    this.isNew = false;

    this.datosForm = new FormGroup({
      codigo: new FormControl(null),
      descripcion: new FormControl(null),
      cuenta: new FormControl(null),
      estado: new FormControl(null),
      nombreCuenta: new FormControl(null)
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
        this.conceptoSrv.deleteConcepto(this.selectedRow.codigo).subscribe(result =>{
          this.getConceptos();
          this.toastr.success("Se borró correctamente.", 'Conceptos Caja', { closeButton: true, timeOut: 3000 });
        }, error => {
          this.toastr.error(error.error.message, 'Conceptos Caja', { closeButton: true, timeOut: 3000 });
        })
      }
    })
  }

  save(){
    let formObj = this.datosForm.getRawValue();

    let data = {
      codigo: Number(formObj.codigo),
      descripcion: formObj.descripcion,
      cuenta: formObj.cuenta,
      estado: formObj.estado ? 1 : 0
    }

    if(this.isNew){
      this.conceptoSrv.createConcepto(data).subscribe(result =>{
        this.getConceptos();
        this.toastr.success("Se agregó correctamente.", 'Conceptos Caja', { closeButton: true, timeOut: 3000 });
      }, error => {
        this.toastr.error(error.error.message, 'Conceptos Caja', { closeButton: true, timeOut: 3000 });
      })
    }else{
      this.conceptoSrv.updateConcepto(data).subscribe(result =>{
        this.getConceptos();
        this.toastr.success("Se actualizó correctamente.", 'Conceptos Caja', { closeButton: true, timeOut: 3000 });
      }, error => {
        this.toastr.error(error.error.message, 'Conceptos Caja', { closeButton: true, timeOut: 3000 });
      })
    }
  }

  search(){
    this.grid.setQuickFilter(this.searchValue);
  }

  searchKeyDown(event: any){
    if(event.keyCode == 13){
      this.search();
    }
  }

  cuentaKeyDown(event){
    if(event.keyCode == 13){
      this.cuentaSrv.getCuentaImputable(event.target.value).subscribe(result => {
        this.getNombreCuenta(event.target.value);
      }, error => {
        this.toastr.error(error.error.message, 'Tipo de Retenciones', { closeButton: true, timeOut: 3000 });
        this.datosForm.controls['cuenta'].setValue('');
        this.datosForm.controls['cuentaContableNombre'].setValue('');
      })
    }
  }

  getNombreCuenta(codigo: string){
    let index = this.cuentas.findIndex(elt => elt.id.trim() == codigo.trim())

    if(index != -1){
      if(this.datosForm){
        this.datosForm.controls['nombreCuenta'].setValue(this.cuentas[index].nombre);
      }
      
      return this.cuentas[index].nombre;
    }else{
      this.toastr.error('La cuenta no existe.', 'Tipo de Retenciones', { closeButton: true, timeOut: 3000 });
      
      if(this.datosForm){
        this.datosForm.controls['nombreCuenta'].setValue('');
        this.datosForm.controls['cuenta'].setValue('');
      }

      return '';
    }
  }

  
  printUsuarios(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
     this.dataPrint.push(rowNode.data)
    })
    setTimeout(()=>{
      printJS({
        printable: 'print_conceptos_caja',
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
