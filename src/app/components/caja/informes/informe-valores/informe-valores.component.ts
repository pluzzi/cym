import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { InformeCajaService } from 'src/app/services/caja/informe-caja.service';
import { DatePipe } from '@angular/common';
import { ExcelService } from 'src/app/services/excel.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MonedaService } from 'src/app/services/caja/moneda.service';
import { PrintService } from 'src/app/services/print.service';
import * as  printJS from 'print-js';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { BancoService } from 'src/app/services/caja/banco.service';
import { RowNode } from 'ag-grid-community';


@Component({
  selector: 'app-informe-valores',
  templateUrl: './informe-valores.component.html',
  styleUrls: ['./informe-valores.component.css']
})
export class InformeValoresComponent implements OnInit {

  grid: any;
  desde: Date = new Date();
  hasta: Date = new Date();
  fechaCheque: Date;
  fechaMov: Date;
  informeValores: any[];
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
  valoresForm: FormGroup;
  selectedRow: any;
  bancos: any[];
  dataPrint: any[];
  ValoresParaModificar: any[];
  

  columnDefs = [
    { 
      field: 'codigo', 
      headerName: 'Mon',
      filter: true,
      width: 80,
    },
    { 
      field: 'fechaEmitido', 
      headerName: 'F.Mov.',
      width: 90,
      filter: true,
      cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      }
    },
    { 
      field: 'fechaCheque', 
      headerName: 'F.Cheque',
      width: 90,
      filter: true,
      cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      }
    },
    { 
      field: 'interno', 
      headerName: 'Int.',
      width: 80,
      filter: true
    },
    { 
      field: 'banco', 
      headerName: 'Banco',
      filter: true,
      width: 130,
    },
    { 
      field: 'sucursal', 
      headerName: 'Suc.',
      filter: true,
      width: 80,
    },
    { 
      field: 'cp', 
      headerName: 'Plaza',
      filter: true,
      width: 90,
    },
    { 
      field: 'cheque', 
      headerName: 'Número',
      filter: true,
      width: 90,
    },
    { 
      field: 'cuentaCc', 
      headerName: 'Cta',
      filter: true,
      width: 105,
    },
    { 
      field: 'importe', 
      headerName: 'Importe',
      filter: true,
      width: 105,
      cellStyle: {
        'text-align': 'right'
      },
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
    },
    { 
      field: 'estado', 
      headerName: 'Estado',
      filter: true,
      width: 90,
    },
    { 
      field: 'codigoCliente', 
      headerName: 'Cód.Cliente',
      filter: true,
      width: 100,
    },
    { 
      field: 'cliente', 
      headerName: 'Ingreso',
      filter: true,
      width: 130,
    },
    { 
      field: 'codigoProveedor', 
      headerName: 'Cód.Prov.',
      filter: true,
      width: 100,
    },
    { 
      field: 'proveedor', 
      headerName: 'Egreso',
      filter: true,
      width: 130,
    },
    { 
      field: 'observaciones', 
      headerName: 'Observaciones',
      filter: true,
      width: 130,
    }
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
    private datepipe: DatePipe,
    private excelSrv: ExcelService,    
    private spinner: NgxSpinnerService,
    private monedaSrv: MonedaService,
    private informeSrv: InformeCajaService,
    private printSrv: PrintService,
    private modalService: NgbModal,
    private bancoSrv: BancoService
  ) {
    
  }

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
      //this.grid.sizeColumnsToFit();
      this.autoSizeAll(false, params.columnApi);
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
    this.monedaSrv.getMonedas(0,2).subscribe(result => {
      this.tipos_moneda_banco_propio = result.data;
    })
  }

  getInformes(){
    this.spinner.show();
    let request = {
      codigo: this.monedaSelected == 0 ? null : this.monedaSelected,
      tipo: Number(this.tipo),
      desde: this.datepipe.transform(this.desde, 'yyyy-MM-dd'),
      hasta: this.datepipe.transform(this.hasta, 'yyyy-MM-dd'),
      estado: this.estadoSelected == 0 ? null : this.estadoSelected,
      
    }
    
    this.informeSrv.getInformesValores(request).subscribe(result => {
      this.informeValores = result.data;
      
      let pinnedBottomRowData = {
        cuentaCc: 'Total:',
        importe: this.informeValores.reduce((sum, current) => {
          return sum + current.importe;
        },0)
      }
  
      this.grid.setPinnedBottomRowData([pinnedBottomRowData]);
      this.getTotal();
      //this.grid.sizeColumnsToFit();  
      this.spinner.hide();

    }, error => {
      this.spinner.hide();
    })
    
  }

  getTotal(){
    this.total = this.informeValores.reduce((sum, current) => {
      return sum + current.importe;
    },0).toFixed(2)
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

  
  edit(){
    
    this.valoresForm = new FormGroup({
      interno: new FormControl(this.selectedRow.interno),
      importe: new FormControl(this.selectedRow.importe),
      codigoCliente: new FormControl(this.selectedRow.codigoCliente),
      cliente: new FormControl(this.selectedRow.cliente),
      fechaCheque: new FormControl(this.formatDate(this.selectedRow.fechaCheque)),
      sucursal: new FormControl(this.selectedRow.sucursal),
      cp: new FormControl(this.selectedRow.cp),
      cheque: new FormControl(this.selectedRow.cheque),
      banco: new FormControl(this.selectedRow.codigo_banco),    
      fechaEmitido: new FormControl(this.formatDate(this.selectedRow.fechaEmitido)),
      numeroCupon: new FormControl(this.selectedRow.numeroCupon),
      turno: new FormControl(null),
      codigo: new FormControl(this.selectedRow.codigo),
    });

    this.open(this.modal),
    this.getBancos();

    
  }

  onSelectionChanged(event) {
    const selectedRows = this.grid.getSelectedRows();
    if(selectedRows.length != 0){
      this.selectedRow = selectedRows[0];
    }
  }

  save(){
    let formObj = this.valoresForm.getRawValue();

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
      this.getInformes();
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

  getBancos(){
    this.bancoSrv.getBancos().subscribe(result => {
      this.bancos = result.data;
    })
  }

  
print(){
  this.dataPrint = [];
  this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
    if(rowNode.data.fechaEmitido != undefined){
      rowNode.data.fechaEmitido = this.datepipe.transform(new Date(rowNode.data.fechaEmitido), 'dd/MM/yyyy');
      rowNode.data.fechaCheque = this.datepipe.transform(new Date(rowNode.data.fechaCheque), 'dd/MM/yyyy')
      this.dataPrint.push(rowNode.data)
    } else {
      this.dataPrint.push(rowNode.data)
    }
   
    
  })
  setTimeout(()=>{
    printJS({
      printable: 'print_reporte_valores',
      type: 'html',
      style: this.printSrv.getTableStyle(),
      scanStyles: false
    })
  }, 250)
  
  this.informeValores = [];
  
 this.searchTardio();  

}

searchTardio(){
  setTimeout(()=>{
    this.getInformes();
  }, 100)
}



exportar(){
 this.dataPrint = [];
  this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
    if(rowNode.data.fechaEmitido != undefined){
      rowNode.data.fechaEmitido = this.datepipe.transform(new Date(rowNode.data.fechaEmitido), 'dd/MM/yyyy');
      rowNode.data.fechaCheque = this.datepipe.transform(new Date(rowNode.data.fechaCheque), 'dd/MM/yyyy')
      this.dataPrint.push(rowNode.data)
    } else {
      this.dataPrint.push(rowNode.data)
    }
    
            
   })
   setTimeout(()=>{
    this.excelSrv.export(this.dataPrint) 
   }, 250)

   this.informeValores = [];

   this.searchTardio();

  
}

toSqlDate(dateStr: string): string{
  let arr = dateStr.split('/'); // dd/MM/yyyy
  return arr[2] + '-' + arr[1] + '-' + arr[0]; // yyyy-MM-dd
}

getMonedaNombre(){
  
  return this.monedaSelected == 0 ? 'Todas' : this.tipos_moneda_banco_propio.find(elt => elt.codigo == this.monedaSelected).nombre
}

getValores(){
  
  return this.estadoSelected == 0 ? 'Todos' : this.valores.find(elt => elt.id == this.estadoSelected).descripcion
}


}  
  


