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

@Component({
  selector: 'app-cheques-emitidos-extracciones',
  templateUrl: './cheques-emitidos-extracciones.component.html',
  styleUrls: ['./cheques-emitidos-extracciones.component.css']
})
export class ChequesEmitidosExtraccionesComponent implements OnInit {

  grid: any;
  desde: Date = new Date();
  hasta: Date = new Date();
  informeChequesExtracciones: any[];
  searchValue: string = '';
  monedaSelected: any = 0;
  tipos_moneda_banco_propio: any[];
  informeForm: FormGroup; 
  estado: boolean;
  fechaEmision: Date = new Date();  
  estadoCheque: any[];
  movimientos: any[];
  datosForm: FormGroup;
  @ViewChild('modal') modal: ElementRef;
  tipo: string = "1";
  detallado: number;
  detalladoSelected: any = 0;
  estadoChequeSelected: any = 0;
  movimientoSelected: any = 0;
  column: any;
  total: any;
  dataPrint: any[];

  columnDefs: any[];

  defaultColDef = {
    editable: false,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'},
    headerStyle: {fontSize: '5px !important'}
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
    private modalService: NgbModal,
    ) { }

  ngOnInit(): void {
    this.getMonedas();
    this.estadoCheque = this.informeSrv.getEstados();
  }

  home(){
    this.route.navigate(['/home'], {  });
  }


  onGridReady(params) {
    this.grid = params.api;
    this.column = params.columnApi;

    setTimeout(()=>{
      this.grid.sizeColumnsToFit();
      //this.autoSizeAll(false, params.columnApi);
      this.grid.setHeaderHeight(18);
    }, 400)
    
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
    this.monedaSrv.getMonedas(1,0).subscribe(result => {
      this.tipos_moneda_banco_propio = result.data;
    })
  }

  getTotal(){
    this.total = this.informeChequesExtracciones.reduce((sum, current) => {
      return sum + current.importeDebe;
    },0).toFixed(2)
  }

  getInformes(){
    
    this.spinner.show();
    let request = {
      tipo: Number(this.tipo),
      codigo: this.monedaSelected == 0 ? null : this.monedaSelected,
      desde: this.datepipe.transform(this.desde, 'yyyy-MM-dd'),
      hasta: this.datepipe.transform(this.hasta, 'yyyy-MM-dd'),
      estado: this.estadoChequeSelected == 0 ? null : this.estadoChequeSelected,
      detallado: this.detalladoSelected ? 1 : 0
      
    }
    
    this.informeSrv.getInformesChequesExtracciones(request).subscribe(result => {
      this.informeChequesExtracciones = result.data;
      
      let pinnedBottomRowData = {
        estado: 'Total:',
        importeDebe: this.informeChequesExtracciones.reduce((sum, current) => {
          return sum + current.importeDebe;
        },0).toFixed(2)
      }
  
      this.grid.setPinnedBottomRowData([pinnedBottomRowData]);
      this.getDetallado();
      this.getTotal();
      this.grid.sizeColumnsToFit();
      this.spinner.hide();

    }, error => {
      this.spinner.hide();
    })
    
  }

  print(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.fechaEmitido != undefined){
        rowNode.data.fechaEmitido = this.datepipe.transform(new Date(rowNode.data.fechaEmitido), 'dd/MM/yyyy');
        rowNode.data.fechaCheque = this.datepipe.transform(new Date(rowNode.data.fechaCheque), 'dd/MM/yyyy');
        this.dataPrint.push(rowNode.data)
      } else {
        this.dataPrint.push(rowNode.data)
      }
    })
    setTimeout(()=>{
      printJS({
        printable: 'print_reporte_cheques_emitidos',
        type: 'html',
        style: this.printSrv.getTableStyle(),
        scanStyles: false
      })
    }, 250)

    this.informeChequesExtracciones = [];
  
    this.searchTardio();
  
  }
  
  exportar(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.fechaEmitido != undefined){
        rowNode.data.fechaEmitido = this.datepipe.transform(new Date(rowNode.data.fechaEmitido), 'dd/MM/yyyy');
        rowNode.data.fechaCheque = this.datepipe.transform(new Date(rowNode.data.fechaCheque), 'dd/MM/yyyy');
        this.dataPrint.push(rowNode.data)
      } else {
        this.dataPrint.push(rowNode.data)
      }
     })
     setTimeout(()=>{
      this.excelSrv.export(this.dataPrint)
     }, 250)

     this.informeChequesExtracciones = [];
  
     this.searchTardio();
  
    
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

  save(){
    
  }

  getDetallado(){
    
    if (this.detalladoSelected == false) {
      this.columnDefs = [
        { 
          field: 'fechaEmitido', 
          headerName: 'F.Mov.',
          filter: true,
          cellRenderer: params => {
            return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
          }
        },
        { 
          field: 'fechaCheque', 
          headerName: 'F.Cheque',
          filter: true,
          cellRenderer: params => {
            return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
          }
        },
        { 
          field: 'extraccion', 
          headerName: 'Extracción',
          filter: true
        },
        { 
          field: 'chequera', 
          headerName: 'Chequera',
          filter: true,
        },
        { 
          field: 'numeroCheque', 
          headerName: 'Número',
          filter: true,
        },
        { 
          field: 'estado', 
          headerName: 'Estado',
          filter: true,
        },
        { 
          field: 'importeDebe', 
          headerName: 'Importe',
          filter: true,
          cellStyle: {
            'text-align': 'right'
          }
        },
        { 
          field: 'codigoProveedor', 
          headerName: 'Cód.Prov.',
          filter: true,
        },
        { 
          field: 'nombreProveedor', 
          headerName: 'Proveedor',
          filter: true,
        },
        { 
          field: 'observaciones', 
          headerName: 'Observaciones',
          filter: true,
        }
      ]
    }else{
      this.columnDefs = [
        { 
          field: 'fechaEmitido', 
          headerName: 'F.Mov.',
          filter: true,
          cellRenderer: params => {
            return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
          }
        },
        { 
          field: 'fechaCheque', 
          headerName: 'F.Cheque',
          filter: true,
          cellRenderer: params => {
            return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
          }
        },
        { 
          field: 'extraccion', 
          headerName: 'Extracción',
          filter: true
        },
        { 
          field: 'chequera', 
          headerName: 'Chequera',
          filter: true,
        },
        { 
          field: 'numeroCheque', 
          headerName: 'Número',
          filter: true,
        },
        { 
          field: 'estado', 
          headerName: 'Estado',
          filter: true,
        },
        { 
          field: 'importeDebe', 
          headerName: 'Importe',
          filter: true,
          cellStyle: {
            'text-align': 'right'
          }
        },
        { 
          field: 'codigoProveedor', 
          headerName: 'Cód.Prov.',
          filter: true,
        },
        { 
          field: 'nombreProveedor', 
          headerName: 'Proveedor',
          filter: true,
        },
        { 
          field: 'observaciones', 
          headerName: 'Observaciones',
          filter: true,
        },
        
        { 
          field: 'numeroOp', 
          headerName: 'N° OP',
          filter: true,
        },
        { 
          field: 'numeroFactura', 
          headerName: 'N° Factura',
          filter: true,
          
        },
        { 
          field: 'fechaFactura', 
          headerName: 'Fecha Fact.',
          filter: true,
          cellRenderer: params => {
            return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
          }
        }
      ];
          
    }
  }

  getMonedaNombre(){
  
    return this.monedaSelected == 0 ? '' : this.tipos_moneda_banco_propio.find(elt => elt.codigo == this.monedaSelected).nombre
  }

  getEstadoNombre(){
  
    return this.estadoChequeSelected == 0 ? 'Todos' : this.estadoCheque.find(elt => elt.id == this.estadoChequeSelected).descripcion
  }

  searchTardio(){
    setTimeout(()=>{
      this.getInformes();
    }, 100)
  }
    
}
