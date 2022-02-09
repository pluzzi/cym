import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { EditSettingsModel, ToolbarItems } from '@syncfusion/ej2-grids';
import { ToastrService } from 'ngx-toastr';
import { BancoService } from 'src/app/services/caja/banco.service';
import Swal from 'sweetalert2';
import * as  printJS from 'print-js';
import { PrintService } from 'src/app/services/print.service';
import { ExcelService } from 'src/app/services/excel.service';

@Component({
  selector: 'app-bancos',
  templateUrl: './bancos.component.html',
  styleUrls: ['./bancos.component.css']
})
export class BancosComponent implements OnInit {

  bancos: any[];
  isNew: boolean = false;
  bancoForm: FormGroup;
  grid: any;
  searchValue: string = '';
  gridColumn: any;
  selectedRow: any;
  @ViewChild('modal') modal: ElementRef;
  fechaEmision: Date = new Date();
  dataPrint: any[];

  columnDefs = [
    { 
      field: 'codigo', 
      headerName: 'Código',
      width: 80,
      filter: true
    },
    { 
      field: 'nombre', 
      headerName: 'Nombre',
      filter: true,
    }
  ];

  defaultColDef = {
    
    editable: false,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'}
  };

  constructor(
    private route: Router,
    private bancoSrv: BancoService,
    private toastr: ToastrService,
    private modalSrv: NgbModal,
    private printSrv: PrintService,
    private excelSrv: ExcelService, 
  ) { }

  ngOnInit(): void {
    this.getBancos();
  }

  home(){
    this.route.navigate(['/home'], {  });
  }

  getBancos(){
    this.bancoSrv.getBancos().subscribe(result => {
      this.bancos = result.data;
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

  open(content) {
    let options: NgbModalOptions = {
      size: 'lg',
      centered: true,
      backdrop : 'static',
      keyboard : false
    }

    this.modalSrv.open(content, options).result.then((result) => {
      console.log(`Closed with: ${result}`);
    }, (reason) => {
      console.log(reason);
    });
  }

  add(){
    this.isNew = true;

    this.bancoForm = new FormGroup({
      codigo: new FormControl(null),
      nombre: new FormControl(null)
    });

    this.open(this.modal);
  }

  edit(){
    this.isNew = false;

    this.bancoForm = new FormGroup({
      codigo: new FormControl(this.selectedRow.codigo),
      nombre: new FormControl(this.selectedRow.nombre)
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
        this.bancoSrv.deleteBanco(this.selectedRow.codigo).subscribe(result => {
          this.getBancos();
          this.toastr.success("El registro fue borrado correctamente.", 'Banco', { closeButton: true, timeOut: 3000 });
        }, error => {
          this.toastr.error(error.error.message, 'Banco', { closeButton: true, timeOut: 3000 });
        })
      }else{
        this.getBancos();
      }
    })
  }

  onGridReady(params) {
    this.grid = params.api;
    this.gridColumn = params.columnApi;

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

  getModalTitle(){
    if(this.isNew){
      return 'Agregar';
    }
    return 'Editar';
  }

  save(){
    if(this.isNew){
      let data = {
        codigo: this.bancoForm.controls['codigo'].value,
        nombre: this.bancoForm.controls['nombre'].value
      }

      this.bancoSrv.createBanco(data).subscribe(result => {
        this.toastr.success("Se agregó correctamente.", 'Banco', { closeButton: true, timeOut: 3000 });
        this.getBancos();
      }, error => {
        this.toastr.error(error.error.message, 'Banco', { closeButton: true, timeOut: 3000 });
        this.getBancos();
      })
    }else{
      let data = {
        codigo: this.selectedRow.codigo,
        nombre: this.bancoForm.controls['nombre'].value
      }
      this.bancoSrv.updateBanco(data).subscribe(result => {
        this.toastr.success("Se actualizó correctamente.", 'Banco', { closeButton: true, timeOut: 3000 });
        this.getBancos();
      }, error => {
        this.toastr.error(error.error.message, 'Banco', { closeButton: true, timeOut: 3000 });
        this.getBancos();
      })
    }
  }

  print(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
     this.dataPrint.push(rowNode.data)
    })
    setTimeout(()=>{
      printJS({
        printable: 'print_bancos',
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
