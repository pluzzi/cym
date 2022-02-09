import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { UsuarioFondoFijoService } from 'src/app/services/caja/usuario-fondo-fijo.service';
import { ToastrService } from 'ngx-toastr';
import { TarjetaService } from 'src/app/services/caja/tarjeta.service';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { MonedaService } from 'src/app/services/caja/moneda.service';
import * as  printJS from 'print-js';
import { PrintService } from 'src/app/services/print.service';
import { ExcelService } from 'src/app/services/excel.service';

@Component({
  selector: 'app-usuario-fondo-fijo',
  templateUrl: './usuario-fondo-fijo.component.html',
  styleUrls: ['./usuario-fondo-fijo.component.css']
})
export class UsuarioFondoFijoComponent implements OnInit {
  usuarios: any[];
  gridUsuarios: any;
  gridTarjetasApi: any;
  gridTarjetas: any;
  selectedRowUsuario: any;
  selectedRowTarjeta: any;
  tarjetas: any[];
  gridColumnUsuarios: any;
  gridColumnTarjetas: any;
  searchValue: string = '';
  usuarioForm: FormGroup;
  isNewUsuario: boolean;
  @ViewChild('modalUsuario') modalUsuario: ElementRef;
  tarjetaForm: FormGroup;
  isNewTarjeta: boolean;
  @ViewChild('modalTarjeta') modalTarjeta: ElementRef;
  monedas: any[];
  fechaEmision: Date = new Date();
  dataPrintTarjetas: any[];
  dataPrintUsuarios: any[];
  

  columnDefsUsuarios = [
    { 
      field: 'codigo', 
      headerName: 'Código',
      filter: true
    },
    { 
      field: 'nombre', 
      headerName: 'Nombre de Usuario',
      filter: true
    }
  ];

  defaultColDefUsuarios = {
    editable: false,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'}
  };

  columnDefsTarjetas = [
    { 
      field: 'moneda', 
      headerName: 'Código',
      filter: true
    },
    { 
      field: 'nombreMoneda', 
      headerName: 'Moneda',
      filter: true
    },
    { 
      field: 'numero', 
      headerName: 'Nro Tarjeta',
      filter: true,
      cellStyle: {
        'text-align': 'center'
      }
    },
    { 
      field: 'vencimiento', 
      headerName: 'Vencimiento',
      filter: true,
      cellRenderer: params => {
        return this.datepipe.transform(params.data.vencimiento, 'dd/MM/yyyy') 
      },
      cellStyle: {
        'text-align': 'center'
      },
    }
  ];

  defaultColDefTarjetas = {
    editable: false,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'}
  };

  constructor(
    private route: Router,
    private userFondoFijoSrv: UsuarioFondoFijoService,
    private toastr: ToastrService,
    private tarjetaSrv: TarjetaService,
    private datepipe: DatePipe,
    private modalSrv: NgbModal,
    private monedaSrv: MonedaService,
    private printSrv: PrintService,
    private excelSrv: ExcelService, 
  ) { }

  ngOnInit(): void {
    this.getUsuarios();
    this.getMonedas();
  }

  home(){
    this.route.navigate(['/home'], {  });
  }

  onGridReadyUsuarios(params) {
    this.gridUsuarios = params.api;
    this.gridColumnUsuarios = params.columnApi;

    setTimeout(()=>{
      this.gridUsuarios.sizeColumnsToFit();
      this.gridUsuarios.setHeaderHeight(20);
    }, 250)
    
  }

  onGridReadyTarjetas(params) {
    this.gridTarjetas = params;
    this.gridTarjetasApi = params.api;
    this.gridColumnTarjetas = params.columnApi;

    setTimeout(()=>{
      this.gridTarjetasApi.sizeColumnsToFit();
      this.gridTarjetasApi.setHeaderHeight(20);
    }, 250)
    
  }


  onSelectionChangedUsuarios(event) {
    const selectedRows = this.gridUsuarios.getSelectedRows();
    if(selectedRows.length != 0){
      this.selectedRowUsuario = selectedRows[0];
      this.getTarjetas();
    }
  }

  onSelectionChangedTarjetas(event) {
    const selectedRows = this.gridTarjetasApi.getSelectedRows();
    if(selectedRows.length != 0){
      this.selectedRowTarjeta = selectedRows[0];
    }
  }

  getTarjetas(){
    this.tarjetaSrv.getTarjetas(this.selectedRowUsuario.codigo).subscribe(result => {
      this.tarjetas = result.data;
    })
  }

  onCellKeyPressUsuarios(event){
    if(event.event.charCode == 13){
      if(event.colDef.field == 'nombre'){
        let data = {
          codigo: this.selectedRowUsuario.codigo,
          nombre: event.data.nombre
        }
  
        this.userFondoFijoSrv.updateUsuarioPromise(data).then( (result) => {
          this.toastr.success("Se actulaizó correctamente.", 'Usuario Fondo Fijo', { closeButton: true, timeOut: 3000 });
          this.moveNextCell(this.gridUsuarios, this.columnDefsUsuarios, event);
        }).catch( error => {
          this.toastr.error(error.error.message, 'Usuario Fondo Fijo', { closeButton: true, timeOut: 3000 });
          this.editCurrentCell(this.gridUsuarios, this.columnDefsUsuarios, event);
        })

      }else{
        this.moveNextCell(this.gridUsuarios, this.columnDefsUsuarios, event);
      }      
    }
  }
  
  onCellKeyPressTarjetas(event){
    if(event.event.charCode == 13){
      //if(event.colDef.field == 'vencimiento'){
        this.moveNextCell(this.gridTarjetasApi, this.columnDefsTarjetas, event);
        //this.editCurrentCell(this.gridUsuarios, this.columnDefsTarjetas, event);
      //}
    }
  }

  moveNextCell(grid, columns, event){
    let colIndex = columns.findIndex(elt => elt.field == event.colDef.field);
    let rowIndex = event.rowIndex;

    if(colIndex <= columns.length-1){
      colIndex++;
      grid.tabToNextCell();
    }

    if(colIndex > columns.length-1){
      colIndex = 0;
      rowIndex++;
      //grid.tabToNextCell();
    }
    
    grid.startEditingCell({
      rowIndex: rowIndex,
      colKey: columns[colIndex].field
    });
  }

  editCurrentCell(grid, columns, event){
    let colIndex = columns.findIndex(elt => elt.field == event.colDef.field);
    let rowIndex = event.rowIndex;

    grid.startEditingCell({
      rowIndex: rowIndex,
      colKey: columns[colIndex].field
    });
  }

  getUsuarios(){
    this.userFondoFijoSrv.getUsuarios().subscribe(result => {
      this.usuarios = result.data;
    })
  }

  search(){
    this.gridUsuarios.setQuickFilter(this.searchValue);
  }

  keyDown(event: any){
    if(event.keyCode == 13){
      this.search();
    }
  }

  trashUsuario(){
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
        this.userFondoFijoSrv.deleteUsuario(this.selectedRowUsuario.codigo).subscribe(result =>{
          this.getUsuarios();
          this.toastr.success("Se borró correctamente.", 'Usuario Fondo Fijo', { closeButton: true, timeOut: 4000 });
        }, error => {
          this.toastr.error(error.error.message, 'Usuario Fondo Fijo', { closeButton: true, timeOut: 4000 });
        })
      }else{
        this.getUsuarios();
      }
    })
  }

  addUsuario(){
    this.isNewUsuario = true;

    this.usuarioForm = new FormGroup({
      codigo: new FormControl(null),
      nombre: new FormControl(null)
    });

    this.open(this.modalUsuario);
  }

  saveUsuario(){
    let formObj = this.usuarioForm.getRawValue();

    let data = {
      codigo: Number(formObj.codigo),
      nombre: formObj.nombre
    }

    if(this.isNewUsuario){
      this.userFondoFijoSrv.createUsuario(data).subscribe(result =>{
        this.getUsuarios();
        this.toastr.success("Se agregó correctamente.", 'Usuario Fondo Fijo', { closeButton: true, timeOut: 3000 });
      }, error => {
        this.toastr.error(error.error.message, 'Usuario Fondo Fijo', { closeButton: true, timeOut: 3000 });
      })
    }else{
      this.userFondoFijoSrv.updateUsuario(data).subscribe(result =>{
        this.getUsuarios();
        this.toastr.success("Se actualizó correctamente.", 'Usuario Fondo Fijo', { closeButton: true, timeOut: 3000 });
      }, error => {
        this.toastr.error(error.error.message, 'Usuario Fondo Fijo', { closeButton: true, timeOut: 3000 });
      })
    }
  }

  editUsuario(){
    this.isNewUsuario = false;

    this.usuarioForm = new FormGroup({
      codigo: new FormControl(this.selectedRowUsuario.codigo),
      nombre: new FormControl(this.selectedRowUsuario.nombre)
    });

    this.open(this.modalUsuario);
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
  

  getModalUsuarioTitle(){
    if(this.isNewUsuario){
      return 'Agregar';
    }
    return 'Editar';
  }

  getModalTarjetaTitle(){
    if(this.isNewTarjeta){
      return 'Agregar';
    }
    return 'Editar';
  }

  saveTarjeta(){
    let formObj = this.tarjetaForm.getRawValue();

    let data = {
      moneda: Number(formObj.moneda),
      nombreMoneda: formObj.nombreMoneda,
      numero: formObj.numero,
      vencimiento: this.datepipe.transform(formObj.vencimiento, 'yyyy-MM-dd')
    }

    if(this.isNewTarjeta){
      this.tarjetas.push(data);
    }else{
      let index = this.tarjetas.findIndex(elt => {
        return elt.moneda == this.selectedRowTarjeta.moneda &&
        elt.nombreMoneda == this.selectedRowTarjeta.nombreMoneda &&
        elt.numero == this.selectedRowTarjeta.numero &&
        elt.vencimiento == this.selectedRowTarjeta.vencimiento
      })
      this.tarjetas[index] = data;
    }

    this.gridTarjetasApi.setRowData(this.tarjetas);
  }

  saveTarjetas(){
    this.tarjetaSrv.deleteTarjeta(this.selectedRowUsuario.codigo).subscribe(result => {
      this.tarjetas.forEach((value, index) => {
        let data = {
          usuario: this.selectedRowUsuario.codigo,
          moneda: value.moneda,
          numero: value.numero,
          vencimiento: this.datepipe.transform(value.vencimiento, 'yyyy-MM-dd')
        }

        this.tarjetaSrv.createTarjeta(data).subscribe(result => {
          if(this.tarjetas.length == index +1){
            this.toastr.success("Las tarjetas se guardaron correctamente.", 'Usuario Fondo Fijo', { closeButton: true, timeOut: 3000 });
          }
        }, error => {
          this.toastr.error(error.error.message, 'Usuario Fondo Fijo', { closeButton: true, timeOut: 3000 });
        })
      })
    }, error => {
      this.toastr.error(error.error.message, 'Usuario Fondo Fijo', { closeButton: true, timeOut: 3000 });
    })
  }

  trashTarjeta(){
    let index = this.tarjetas.findIndex(elt => {
      return elt.moneda == this.selectedRowTarjeta.moneda &&
      elt.nombreMoneda == this.selectedRowTarjeta.nombreMoneda &&
      elt.numero == this.selectedRowTarjeta.numero &&
      elt.vencimiento == this.selectedRowTarjeta.vencimiento
    })

    this.tarjetas.splice(index, 1)
    this.gridTarjetasApi.setRowData(this.tarjetas);
  }

  addTarjeta(){
    this.isNewTarjeta = true;

    this.tarjetaForm = new FormGroup({
      moneda: new FormControl(null),
      nombreMoneda: new FormControl(null),
      numero: new FormControl(null),
      vencimiento: new FormControl(null),
    });

    this.open(this.modalTarjeta);
  }

  editTarjeta(){
    this.isNewTarjeta = false;

    this.tarjetaForm = new FormGroup({
      moneda: new FormControl(this.selectedRowTarjeta.moneda),
      nombreMoneda: new FormControl(this.selectedRowTarjeta.nombreMoneda),
      numero: new FormControl(this.selectedRowTarjeta.numero),
      vencimiento: new FormControl(this.formatDate(this.selectedRowTarjeta.vencimiento)),
    });

    this.open(this.modalTarjeta);
  }

  private formatDate(date) {
    if(date == null){
      return null
    }
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  monedaKeyDown(event){
    if(event.keyCode == 13){
      let index = this.monedas.findIndex(elt => elt.codigo == Number(event.target.value));

      if(index != -1){
        this.tarjetaForm.controls['nombreMoneda'].setValue(this.monedas[index].nombre);
      }else{
        this.toastr.error('La moneda ' + event.target.value + ' no existe. O no es del tipo correcto.', 'Usuario Fondo Fijo', { closeButton: true, timeOut: 3000 });
        this.tarjetaForm.controls['moneda'].setValue('');
        this.tarjetaForm.controls['nombreMoneda'].setValue('');
      }

    }
  }

  getMonedas(){
    this.monedaSrv.getMonedas(0, 4).subscribe(result => {
      this.monedas = result.data;
    })
  }

  setVencimiento(event: any){
    if(event && event != ''){
      this.tarjetaForm.controls['vencimiento'].setValue(event);
    }
  }

  

  printUsuarios(){
    this.dataPrintUsuarios = [];
    this.gridUsuarios.forEachNodeAfterFilterAndSort((rowNode, index)=>{
     this.dataPrintUsuarios.push(rowNode.data)
    })
    setTimeout(()=>{
      printJS({
        printable: 'print_usuarios',
        type: 'html',
        style: this.printSrv.getTableStyle(),
        scanStyles: false
      })
    }, 250)
  
  }
  
  exportarUsuarios(){
    this.dataPrintUsuarios = [];
    this.gridUsuarios.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      this.dataPrintUsuarios.push(rowNode.data)
     })
     setTimeout(()=>{
      this.excelSrv.export(this.dataPrintUsuarios) 
     }, 250)
  
    
  }

  printTarjetas(){
    this.dataPrintTarjetas = [];
    this.gridTarjetasApi.forEachNodeAfterFilterAndSort((rowNode, index)=>{
     this.dataPrintTarjetas.push(rowNode.data)
    })
    setTimeout(()=>{
      printJS({
        printable: 'print_tarjetas',
        type: 'html',
        style: this.printSrv.getTableStyle(),
        scanStyles: false
      })
    }, 400)
  
  }
  
  exportarTarjetas(){
    this.dataPrintTarjetas = [];
    this.gridTarjetasApi.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.vencimiento != undefined){
        rowNode.data.vencimiento = this.datepipe.transform(new Date(rowNode.data.vencimiento), 'dd/MM/yyyy')
        this.dataPrintTarjetas.push(rowNode.data)
      } else {
        this.dataPrintTarjetas.push(rowNode.data)
      }
     })
     setTimeout(()=>{
      this.excelSrv.export(this.dataPrintTarjetas) 
     }, 400)
  
    
  }

}
