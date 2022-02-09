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

@Component({
  selector: 'app-tipos-movimientos',
  templateUrl: './tipos-movimientos.component.html',
  styleUrls: ['./tipos-movimientos.component.css']
})
export class TiposMovimientosComponent implements OnInit {

  isNew: boolean = false;
  movimientos: any[];
  grid: any;
  searchValue: string = '';
  gridColumn: any;
  selectedRow: any;
  movimientoForm: FormGroup;
  @ViewChild('modal') modal: ElementRef;

  columnDefs = [
    { 
      field: 'nombre', 
      headerName: 'Nombre'
    }
  ];

  defaultColDef = {
    width: 100,
    editable: false,
    resizable: false,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'}
  };

  constructor(
    private route: Router,
    private tipos_movimientosSrv: TiposMovimientosService,
    private toastr: ToastrService,
    private modalSrv: NgbModal
  ) { }

  ngOnInit(): void {
    this.getMovimientos();
  }

  home(){
    this.route.navigate(['/home'], {  });
  }

  getMovimientos(){
    this.tipos_movimientosSrv.getMovimientos().subscribe(result => {
      this.movimientos = result.data;
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
      size: 'md',
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

    this.movimientoForm = new FormGroup({
      nombre: new FormControl(null)
    });

    this.open(this.modal);
  }

  edit(){
    this.isNew = false;

    this.movimientoForm = new FormGroup({
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
        this.tipos_movimientosSrv.deleteMovimiento(this.selectedRow.codigo).subscribe(result => {
          this.getMovimientos();
          this.toastr.success("El registro fue borrado correctamente.", 'Movimiento', { closeButton: true, timeOut: 3000 });
        })
      }else{
        this.getMovimientos();
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
        codigo: null,
        nombre: this.movimientoForm.controls['nombre'].value
      }

      this.tipos_movimientosSrv.createMovimiento(data).subscribe(result => {
        this.toastr.success("Se agregó correctamente.", 'Movimientos', { closeButton: true, timeOut: 3000 });
        this.getMovimientos();
      }, error => {
        this.toastr.error(error.error.message, 'Movimientos', { closeButton: true, timeOut: 3000 });
        this.getMovimientos();
      })
    }else{
      let data = {
        codigo: this.selectedRow.codigo,
        nombre: this.movimientoForm.controls['nombre'].value
      }
      this.tipos_movimientosSrv.updateMovimiento(data).subscribe(result => {
        this.toastr.success("Se actualizó correctamente.", 'Movimientos', { closeButton: true, timeOut: 3000 });
        this.getMovimientos();
      }, error => {
        this.toastr.error(error.error.message, 'Movimientos', { closeButton: true, timeOut: 3000 });
        this.getMovimientos();
      })
    }
  }
}
