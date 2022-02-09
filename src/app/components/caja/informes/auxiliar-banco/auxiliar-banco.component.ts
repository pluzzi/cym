import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-auxiliar-banco',
  templateUrl: './auxiliar-banco.component.html',
  styleUrls: ['./auxiliar-banco.component.css']
})
export class AuxiliarBancoComponent implements OnInit {

  grid: any;
  desde: Date = new Date();
  hasta: Date = new Date();
  auxiliarBanco: any[];
  searchValue: string = '';
  monedaSelected: any = 0;
  tipos_moneda: any[];
  informeForm: FormGroup;
  tipo: string = "2";
  estado: boolean;
  fechaEmision: Date = new Date();
  estadoSelected: any = 1;
  valores: any[];
  datosForm: FormGroup;
  @ViewChild('modal') modal: ElementRef;
  total: any;
  dataPrint: any[];

  columnDefs = [
    { 
      field: 'fecha', 
      headerName: 'Fecha',
      filter: true,
      cellStyle: {
        'text-align': 'center'
      },      
      cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      }
    },
    { 
      field: 'egresos', 
      headerName: 'Egresos / Acreditaciones',
      filter: true,
      
    },
    { 
      field: 'debe', 
      headerName: 'Debe',
      filter: true,
      width: 120,
      cellStyle: {
        'text-align': 'right'
      },
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
    },
    { 
      field: 'haber', 
      headerName: 'Haber',
      filter: true,
      width: 120,
      cellStyle: {
        'text-align': 'right'
      },
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
    },
    
    { 
      field: 'saldo', 
      headerName: 'Saldo',
      filter: true,
      width: 130,
      cellStyle: {
        'text-align': 'right'
      },
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
    },
    { 
      field: 'nombreProveedor', 
      headerName: 'Destino',
      filter: true,
    },
    { 
      field: 'nro_movi', 
      headerName: 'N° Mov.',
      filter: true,
    },
    { 
      field: 'nro_deposito', 
      headerName: 'N° Depósito',
      filter: true,
    },
    { 
      field: 'nro_transf', 
      headerName: 'N° Transf.',
      filter: true,
    },
    
  ];

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
    this.valores = this.informeSrv.getValores();
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
    this.monedaSrv.getMonedas(0,1).subscribe(result => {
      this.tipos_moneda = result.data;
    })
  }

  getInformes(){
    this.spinner.show();
    let request = {
      codigo: this.monedaSelected,
      hasta: this.datepipe.transform(this.hasta, 'yyyy-MM-dd')
      
    }
    
    this.informeSrv.getInformesAuxiliarBanco(request).subscribe(result => {
      this.auxiliarBanco = result.data.map((elt, index, data) => {
        if(index == 0){
          return { 
            egresos: elt.egresos, saldo: elt.debe ? elt.debe : elt.haber};
        }else{
          if(index == 1){
            elt.saldo = elt.debe - elt.haber + (data[index-1].debe ? data[index-1].debe : data[index-1].haber) ;
          }else{
            elt.saldo = elt.debe - elt.haber + data[index-1].saldo;
          }
          
          return elt;
        }
      })
      
      let pinnedBottomRowData = {
        egresos: 'Total:',
        saldo: this.auxiliarBanco[this.auxiliarBanco.length-1].saldo
      }
  
      this.grid.setPinnedBottomRowData([pinnedBottomRowData]);

      this.grid.sizeColumnsToFit();
      this.getTotal();

      this.spinner.hide();

    }, error => {
      this.spinner.hide();
    })
    
  }

  getTotal(){
    this.total = this.auxiliarBanco[this.auxiliarBanco.length-1].saldo
  }

 print(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.fecha != undefined){
        rowNode.data.fecha = this.datepipe.transform(new Date(rowNode.data.fecha), 'dd/MM/yyyy');
        this.dataPrint.push(rowNode.data)
      } else {
        this.dataPrint.push(rowNode.data)
      }
    })
    setTimeout(()=>{
      printJS({
        printable: 'print_reporte_auxiliar_banco',
        type: 'html',
        style: this.printSrv.getTableStyle(),
        scanStyles: false
      })
    }, 250)

    this.auxiliarBanco = [];
  
    this.searchTardio();
  
  }
  
  exportar(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.fecha != undefined){
        rowNode.data.fecha = this.datepipe.transform(new Date(rowNode.data.fecha), 'dd/MM/yyyy');
        this.dataPrint.push(rowNode.data)
      } else {
        this.dataPrint.push(rowNode.data)
      }
     })
     setTimeout(()=>{
      this.excelSrv.export(this.dataPrint)
     }, 250)

     this.auxiliarBanco = [];
  
     this.searchTardio();
  
    
  }

  getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return { 
        'font-weight': 'bold'
      };
    }else{
      if(Object.keys(params.data).length == 1 || params.data?.egresos?.includes('Saldo Anterior Conciliado:') ){
        return {
          'font-weight': 'bold'
        };
      }else{
        return {};
      }
    }

  }

  getMonedaNombre(){
  
    return this.monedaSelected == 0 ? '' : this.tipos_moneda.find(elt => elt.codigo == this.monedaSelected).nombre
  }

  searchTardio(){
    setTimeout(()=>{
      this.getInformes();
    }, 100)
  }

  
}
