import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EditSettingsModel, QueryCellInfoEventArgs } from '@syncfusion/ej2-grids';
import { ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { MonedaService } from 'src/app/services/caja/moneda.service';
import { ChequeraService } from 'src/app/services/caja/chequera.service';
import { DatePipe } from '@angular/common';
import { CellValueChangedEvent } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import * as  printJS from 'print-js';
import { PrintService } from 'src/app/services/print.service';
import { ExcelService } from 'src/app/services/excel.service';

@Component({
  selector: 'app-chequeras',
  templateUrl: './chequeras.component.html',
  styleUrls: ['./chequeras.component.css']
})
export class ChequerasComponent implements OnInit {
  
  datosForm: FormGroup;
  @ViewChild('modal') modal: ElementRef;
  chequeras: any[];
  gridChequeras: any;
  gridColumnChequeras: any;
  detalles: any[];
  gridDetalles: any;
  gridColumnDetalles: any;
  selectedRow: any;
  monedas: any[];
  moneda: any;
  isNew: boolean;
  fechaImpresion: Date = new Date();
  dataPrint: any[];

  columnDefsChequeras = [
    { 
      field: 'codigo', 
      headerName: 'Código',
      filter: true,
      
    },
    { 
      field: 'numeroInicial', 
      headerName: 'Nro Inicial',
      filter: true,
    },
    { 
      field: 'cantidad', 
      headerName: 'Cantidad',
      filter: true,
    },
    { 
      field: 'numeroFinal', 
      headerName: 'Nro Final',
      filter: true,
    },
    { 
      field: 'esElectronico', 
      headerName: 'Chequera Electrónica',
      filter: true,
      cellRenderer: params => {
        return `<input disabled type='checkbox' ${params.value==1 ? 'checked' : ''} />`;
      },
      cellStyle: {
        'text-align': 'center'
      },
      editable: true
    }
  ];

  defaultColDefChequeras = {
    editable: false,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'},
    
  };

  columnDefsDetalles = [
    { 
      field: 'cheque', 
      headerName: 'Número',
      filter: true,
    },
    { 
      field: 'fechaEmision', 
      headerName: 'Fecha',
      filter: true,
      valueFormatter: params => this.datepipe.transform(params.data.fechaEmision, 'dd/MM/yyyy')
    },
    { 
      field: 'fechaCheque', 
      headerName: 'Fecha Cheque',
      filter: true,
      valueFormatter: params => this.datepipe.transform(params.data.fechaCheque, 'dd/MM/yyyy')
    },
    { 
      field: 'proveedor', 
      headerName: 'Cód.Prov',
      filter: true,
    },
    { 
      field: 'nombreProveedor', 
      headerName: 'Nombre Prov.',
      filter: true,
    },
    { 
      field: 'importe', 
      headerName: 'Importe',
      filter: true,
      valueFormatter: params => params?.data?.importe?.toFixed(2),
      cellStyle: {
        'text-align': 'right'
      },
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
    }
  ];

  defaultColDefDetalles = {
    editable: false,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'},
    
  };

  constructor(
    private route: Router,
    private modalService: NgbModal,
    private monedaSrv: MonedaService,
    private chequeraSrv: ChequeraService,
    private datepipe: DatePipe,
    private printSrv: PrintService,
    private excelSrv: ExcelService,  
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getMonedas();
  }

  getMonedas(){
    this.monedaSrv.getMonedas(0, 1).subscribe(result => {
      this.monedas = result.data;
    })
  }

  home(){
    this.route.navigate(['/home'], {  });
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

  getDetalles(){
    this.chequeraSrv.getDetalles(this.moneda, this.selectedRow.codigo).subscribe( result => {
      this.detalles = result.data;
    })
  }

  onGridReadyDetalles(params) {
    this.gridDetalles = params.api;
    this.gridColumnDetalles = params.columnApi;

    setTimeout(()=>{
      this.gridDetalles.sizeColumnsToFit();
      this.gridDetalles.setHeaderHeight(20);
    }, 250)
    
  }

  onGridReadyChequeras(params) {
    this.gridChequeras = params.api;
    this.gridColumnChequeras = params.columnApi;

    setTimeout(()=>{
      this.gridChequeras.sizeColumnsToFit();
      this.gridChequeras.setHeaderHeight(20);
    }, 250)
    
  }

  

  onSelectionChangedChequeras(event) {
    const selectedRows = this.gridChequeras.getSelectedRows();
    if(selectedRows.length != 0){
      this.selectedRow = selectedRows[0];
      this.getDetalles();
    }
  }

  search(){
    this.getChequeras();
  }

  getChequeras(){
    this.chequeraSrv.getChequeras(this.moneda).subscribe(result => {
      this.chequeras = result.data;
      this.gridChequeras.sizeColumnsToFit();
    })
  }

  onCellKeyPress(event){
    if(event.event.charCode == 13){
      if(event.colDef.field == 'esElectronico'){
        let data = {
          moneda: this.moneda,
          codigo: event.data.codigo,
          numeroInicial: event.data.numeroInicial,
          cantidad: event.data.cantidad,
          esElectronico: event.data.esElectronico == '1' ? 1 : 0
        }
  
        this.chequeraSrv.updateChequeraPromise(data).then( (result) => {
          this.toastr.success("Se actulaizó correctamente.", 'Chequeras', { closeButton: true, timeOut: 3000 });
          this.moveNextCell(event);
        }).catch( error => {
          this.toastr.error(error.error.message, 'Chequeras', { closeButton: true, timeOut: 3000 });
          this.editCurrentCell(event);
        })

      }else{
        this.moveNextCell(event);
      }      
    }
    

  }

  moveNextCell(event){
    let colIndex = this.columnDefsChequeras.findIndex(elt => elt.field == event.colDef.field);
    let rowIndex = event.rowIndex;

    if(colIndex <= this.columnDefsChequeras.length-1){
      colIndex++;
      this.gridChequeras.tabToNextCell();
    }

    if(colIndex > this.columnDefsChequeras.length-1){
      colIndex = 0;
      rowIndex++;
      //this.gridChequeras.tabToNextCell();
    }
    
    this.gridChequeras.startEditingCell({
      rowIndex: rowIndex,
      colKey: this.columnDefsChequeras[colIndex].field
    });
  }

  editCurrentCell(event){
    let colIndex = this.columnDefsChequeras.findIndex(elt => elt.field == event.colDef.field);
    let rowIndex = event.rowIndex;

    this.gridChequeras.startEditingCell({
      rowIndex: rowIndex,
      colKey: this.columnDefsChequeras[colIndex].field
    });
  }

  checkValue(event){
    event.target.checked
    let data = {
      moneda: this.moneda,
      codigo: this.selectedRow.codigo,
      numeroInicial: this.selectedRow.numeroInicial,
      cantidad: this.selectedRow.cantidad,
      esElectronico: event.data.esElectronico != undefined ? event.data.esElectronico : 0
    }

    this.chequeraSrv.updateChequera(data).subscribe(result => {
      this.toastr.success("Se actulaizó correctamente.", 'Chequeras', { closeButton: true, timeOut: 3000 });
    }, error => {
      this.toastr.error(error.error.message, 'Chequeras', { closeButton: true, timeOut: 3000 });
    })
  }

  getModalTitle(){
    if(this.isNew){
      return "Agregar Chequera";
    }else{
      return "Editar Chequera";
    }
  }

  save(){
    let dataObj = this.datosForm.getRawValue();

    let data = {
      moneda: this.moneda,
      codigo: dataObj.codigo,
      numeroInicial: dataObj.numeroInicial,
      cantidad: dataObj.cantidad,
      esElectronico: dataObj.esElectronico ? 1 : 0
    }

    this.chequeraSrv.createChequera(data).subscribe( result => {
      this.toastr.success("Se agregó correctamente.", 'Chequeras', { closeButton: true, timeOut: 3000 });
      this.getChequeras();
    }, error => {
      this.toastr.error(error.error.message, 'Chequeras', { closeButton: true, timeOut: 3000 });
    })
    
  }

  new(){
    this.isNew = true;

    this.datosForm = new FormGroup({
      moneda: new FormControl(this.moneda),
      codigo: new FormControl(null),
      numeroInicial: new FormControl(0),
      cantidad: new FormControl(0),
      numeroFinal: new FormControl(0),
      esElectronico: new FormControl(false)
    });

    this.open(this.modal);
  }

  edit(){
    this.isNew = false;

    this.datosForm = new FormGroup({
      moneda: new FormControl(this.moneda),
      codigo: new FormControl(this.selectedRow.codigo),
      numeroInicial: new FormControl(this.selectedRow.numeroInicial),
      cantidad: new FormControl(this.selectedRow.cantidad),
      numeroFinal: new FormControl(this.selectedRow.numeroFinal),
      esElectronico: new FormControl(this.selectedRow.esElectronico)
    });

    this.open(this.modal);
  }

  calcularFinal(){
    let final = this.datosForm.controls['numeroInicial'].value + this.datosForm.controls['cantidad'].value - 1;
    this.datosForm.controls['numeroFinal'].setValue(final);
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
        this.chequeraSrv.deleteChequera(this.moneda, this.selectedRow.codigo).subscribe(result =>{
          this.getChequeras();
          this.detalles = [];
          this.toastr.success("Se borró correctamente.", 'Chequeras', { closeButton: true, timeOut: 4000 });
        }, error => {
          this.toastr.error(error.error.message, 'Chequeras', { closeButton: true, timeOut: 4000 });
        })
      }
    })
  }

  print(){
    this.dataPrint = [];
    this.gridDetalles.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.fechaEmision != undefined){
        rowNode.data.fechaEmision = this.datepipe.transform(new Date(rowNode.data.fechaEmision), 'dd/MM/yyyy');
        rowNode.data.fechaCheque = this.datepipe.transform(new Date(rowNode.data.fechaCheque), 'dd/MM/yyyy')
        this.dataPrint.push(rowNode.data)
      } else {
        this.dataPrint.push(rowNode.data)
      }
    })
    setTimeout(()=>{
      printJS({
        printable: 'print_chequeras',
        type: 'html',
        style: this.printSrv.getTableStyle(),
        scanStyles: false
      })
    }, 150)

    this.detalles = [];
  
    this.searchTardio();  
  
  }
  
  exportar(){
    this.dataPrint = [];
    this.gridDetalles.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      
      if(rowNode.data.fechaEmision != undefined){
        rowNode.data.fechaEmision = this.datepipe.transform(new Date(rowNode.data.fechaEmision), 'dd/MM/yyyy');
        rowNode.data.fechaCheque = this.datepipe.transform(new Date(rowNode.data.fechaCheque), 'dd/MM/yyyy')
        this.dataPrint.push(rowNode.data)
      } else {
        this.dataPrint.push(rowNode.data)
      }
     })
     setTimeout(()=>{
      this.excelSrv.export(this.dataPrint) 
     }, 200)

    this.detalles = [];
  
    this.searchTardio();    
  
    
  }

  searchTardio(){
    setTimeout(()=>{
      //this.getChequeras();
      this.getDetalles();
    }, 300)
  }


}
