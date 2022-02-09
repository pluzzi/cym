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
import Swal from 'sweetalert2';
import { Data } from '@syncfusion/ej2-angular-grids';
import { nodeModuleNameResolver } from 'typescript';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

@Component({
  selector: 'app-conciliaciones-bancarias',
  templateUrl: './conciliaciones-bancarias.component.html',
  styleUrls: ['./conciliaciones-bancarias.component.css']
})
export class ConciliacionesBancariasComponent implements OnInit {

  
  desde: Date = new Date();
  hasta: Date = new Date();
  fechaCheque: Date;
  fechaMov: Date;  
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
  nuevoResumenForm: FormGroup;
  bancos: any[];
  dataPrint: any[];
  ValoresParaModificar: any[];
  resumenes: any[];
  resumenSelected: any = 0;
  grid1: any;
  grid2: any;
  conciliados: any[] = [];
  noConciliados: any[];
  saldoAnterior: any;
  columns2: any;
  saldo: number = 0;
  item: number = 1;
  excelStyles: any[];

  options = {
    style: "currency"
  }

  columnDefsGrilla1 = [
    { 
      field: 'fecha', 
      headerName: 'Fecha',
      filter: true,
      cellStyle: {
        'text-align': 'center'
      },
      width: 110,
      cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      }
    },
    { 
      field: 'descripcion', 
      headerName: 'Egresos/Acreditaciones',
      filter: true,
    },
    { 
      field: 'debe', 
      headerName: 'Debe',
      filter: true,
      cellStyle: {
        'text-align': 'right'
      },
      width: 120,
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
      field: 'nombreProveedor', 
      headerName: 'Destino',
      filter: true,
    },
    { 
      field: 'numeroDeposito', 
      headerName: 'N° Depósito',
      filter: true,
    },
    { 
      field: 'numeroMovimiento', 
      headerName: 'N° Movimiento',
      filter: true,
    },
    { 
      field: 'numeroTransferencia', 
      headerName: 'N° Transferencia',
      filter: true,
    },
    { 
      field: 'asiento', 
      headerName: 'N° Asiento',
      filter: true,
      width: 110,
      cellStyle: {
        'text-align': 'center'
      }
    }
  ];

  columnDefsGrilla2 = [
    { 
      field: 'itemResumen', 
      headerName: 'Item',
      width: 110,
      cellRenderer: params => {
        return params.rowIndex != 0 ? params.rowIndex : null; 
      },
      suppressMenu: true,
           

      //valueGetter: 'node.rowIndex != 0 ? node.rowIndex : null'
    },
    { 
      field: 'fechaConciliacion', 
      headerName: 'F.Conciliacion',
      editable: true,
      width: 150,
      suppressMenu: true,
            
      /*cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      },*/
      cellStyle: {
        'text-align': 'center'
      }
    },
    { 
      field: 'fechaAcreditacion', 
      headerName: 'F.Acreditación',
      cellClass: 'fechaExcel',
      width: 150,
      suppressMenu: true,
      cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      },
      cellStyle: {
        'text-align': 'center'
      }
    },
    { 
      field: 'descripcion', 
      headerName: 'Egresos/Acreditaciones',
      suppressMenu: true,
      
    },
    { 
      field: 'debe', 
      headerName: 'Debe',
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
      cellStyle: {
        'text-align': 'right'
      },
      width: 120,
      suppressMenu: true,
    },
    { 
      field: 'haber', 
      headerName: 'Haber',
      suppressMenu: true,
      width: 120,
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
      cellStyle: {
        'text-align': 'right'
      }
    },
    { 
      field: 'saldo', 
      headerName: 'Saldo',
      suppressMenu: true,
      width: 130,
      cellRenderer: params => {
        return (params.value == undefined || params.value == 0) ? null : Number(params.value).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
      },
      cellStyle: {
        'text-align': 'right'
      }
    },
    { 
      field: 'nombreProveedor', 
      headerName: 'Destino',
      suppressMenu: true,
    },
    { 
      field: 'asiento', 
      headerName: 'Asiento',
      suppressMenu: true,
      width: 110,
      cellStyle: {
        'text-align': 'center'
      }
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
    this.excelStyles = [
      {
        id: 'fechaExcel',
        dataType: 'DateTime',
        numberFormat: { format: 'dd/mm/yy' },
      }
    ]
   }

  ngOnInit(): void {
    this.getMonedas();
    this.valores = this.informeSrv.getValores();
  }

  home(){
    this.route.navigate(['/home'], {  });
  }


  onGridReadyGrilla1(params) {
    this.grid1 = params.api;

    setTimeout(()=>{
      this.grid1.sizeColumnsToFit();
      this.grid1.setHeaderHeight(20);
    }, 250)
    
  }

  onGridReadyGrilla2(params) {
    this.grid2 = params.api;
    this.columns2 = params.columnApi;

    setTimeout(()=>{
      this.grid2.sizeColumnsToFit();
      this.grid2.setHeaderHeight(20);
    }, 280)
    
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
  
  setFechaCheque(event: any){
    if(event && event != ''){
      this.fechaCheque = event;
    }
  }
  
  setFechaMov(event: any){
    if(event && event != ''){
      this.fechaMov = event;
    }
  }

   
  getMonedas(){
    this.monedaSrv.getMonedas(0,1).subscribe(result => {
      this.tipos_moneda_banco_propio = result.data;
    })
    
  }

  getNoConciliados(){
    this.spinner.show();
    
    this.bancoSrv.getMovimientosNoConciliados(this.monedaSelected).subscribe(result => {
      this.noConciliados = result.data;
     
    
      this.spinner.hide();

    }, error => {
      this.spinner.hide();
    })
    
  }

  getConciliados(){
    this.spinner.show();
    let request = {
      codigoMoneda: this.monedaSelected,
      resumen: this.resumenSelected.resumen,
    }
    
    this.bancoSrv.getMovimientosConciliados(request).toPromise().then(result => {
        this.bancoSrv.getSaldoAnterior(request).toPromise().then(async resultSaldoAnterior => {
        
          result.data.unshift({descripcion:'Saldo Anterior:',  saldo: resultSaldoAnterior.data.saldoAnterior})
          this.conciliados = await result.data.map((elt, index, data) => {
            if(index == 0){
              return elt;
            } else{
              
              elt.fechaConciliacion = this.datepipe.transform(elt.fechaConciliacion, 'dd/MM/yyyy')
              elt.saldo = elt.debe - elt.haber + data[index - 1].saldo;
              if(index == data.length - 1){
                this.saldo = elt.saldo;
                let pinnedBottomRowData = {
                  descripcion: 'Saldo:',
                  saldo: elt.saldo
                  
                }
            
                this.grid2.setPinnedBottomRowData([pinnedBottomRowData]);
              }
              return elt;
            }

            
            
          })
        })

        

      this.spinner.hide();

    }, error => {
      this.spinner.hide();
    })
    
  }

  saveNuevoResumen(){
    let formObj = this.nuevoResumenForm.getRawValue();
  
    let request = {
        codigoMoneda: this.monedaSelected,
        nuevoResumenFechaDesde: formObj.nuevoResumenFechaDesde,
        nuevoResumenFechaHasta: formObj.nuevoResumenFechaHasta,
      }
  
      this.bancoSrv.getNuevoResumenValidaFechas(request).subscribe(result => {
        this.saldoAnterior = result.data;
  
        this.toastr.success("Se creó correctamente.", 'Nuevo Resumen', { closeButton: true, timeOut: 5000 });
        
        this.getNoConciliadosNuevoResumen();
          
      }, error => {
        this.toastr.error(error.error.message, 'Nuevo Resumen', { closeButton: true, timeOut: 5000 });
        
      })
    
  }

  getNoConciliadosNuevoResumen(){
    
    let formObj = this.nuevoResumenForm.getRawValue();
    let resumen = {
      resumen: formObj.nuevoResumen,
      hasta: formObj.nuevoResumenFechaHasta,
      desde: formObj.nuevoResumenFechaDesde
    }
    

    this.resumenes.unshift(resumen);
    this.resumenSelected = resumen;


    this.conciliados = [{descripcion:'Saldo Anterior:',  saldo: this.saldoAnterior.saldoAnterior}];

        
  }

    
  
  insertar(){
    
    if(this.grid1.getSelectedRows().length == 0){
      this.toastr.error('Debe Seleccionar una fila de la Grilla', 'Conciliaciones:', { closeButton: true, timeOut: 4000 });
      return    
    }
    debugger
    let data = this.grid1.getSelectedRows()[0];
    this.saldo = data.debe - data.haber + this.conciliados[this.conciliados.length - 1].saldo;
    let dataConciliada = {    
      itemResumen: null,
      fechaConciliacion: this.datepipe.transform(new Date(), 'dd/MM/yyyy'),
      fechaAcreditacion: data.fecha,
      descripcion: data.descripcion,
      debe: data.debe,
      haber: data.haber,
      saldo: this.saldo,
      nombreProveedor: data.nombreProveedor,
      idChequera: data.idChequera,
      numeroCheque: data.numeroCheque,
      idExtraccion: data.idExtraccion,
      numeroDeposito: data.numeroDeposito,
      itemNumeroDeposito: data.item,
      asiento: data.asiento,


    }

    this.grid2.applyTransaction({add: [ dataConciliada]});

    this.grid1.applyTransaction({ remove: this.grid1.getSelectedRows() });

    let pinnedBottomRowData = {
      descripcion: 'Saldo:',
      saldo: this.saldo,
      
    }

    this.grid2.setPinnedBottomRowData([pinnedBottomRowData]);

    this.conciliados.push(dataConciliada);
    
  }
  
  desconciliar(){

    if(this.grid2.getSelectedRows().length == 0){
      this.toastr.error('Debe Seleccionar una fila de la Grilla', 'Conciliaciones:', { closeButton: true, timeOut: 4000 });
      return
    }
    
    if(this.grid2.getSelectedRows().rowIndex == 0){
      this.toastr.error('No se puede desconciliar el Saldo Anterior', 'Conciliaciones:', { closeButton: true, timeOut: 4000 });
      return
    }

    let data = this.grid2.getSelectedRows()[0];
    
    this.grid1.applyTransaction({add: [{    
      
      fecha: data.fechaAcreditacion,
      descripcion: data.descripcion,
      debe: data.debe,
      haber: data.haber,
      nombreProveedor: data.nombreProveedor,
      idChequera: data.idChequera,
      numeroCheque: data.numeroCheque,
      idExtraccion: data.idExtraccion,
      numeroDeposito: data.numeroDeposito,
      itemNumeroDeposito: data.item,
      asiento: data.asiento,


    }]});
    this.grid2.applyTransaction({ remove: this.grid2.getSelectedRows() });
    
    let saldo = 0;
    this.grid2.forEachNode((rowNode, index) => {
      if(index == 0){
        saldo = rowNode.data.saldo;
      }
      if(index != 0){
        rowNode.data.saldo = rowNode.data.debe - rowNode.data.haber + saldo;
        saldo = rowNode.data.saldo
      }
    })  
    
    
    let pinnedBottomRowData = {
      descripcion: 'Saldo:',
      saldo: saldo,
      
    }

    this.grid2.setPinnedBottomRowData([pinnedBottomRowData]);
    this.grid2.redrawRows();

    

  }

    
  getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return { 
        'font-weight': 'bold'
      };
    }else{
      if(Object.keys(params.data).length == 0 || params.data?.descripcion?.includes('Saldo Anterior:') ){
        return {
          'font-weight': 'bold'
        };
      }else{
        return {};
      }
    }

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
  this.grid2.forEachNodeAfterFilterAndSort((rowNode, index)=>{
    if(rowNode.data.fechaAcreditacion != undefined){
      
      rowNode.data.fechaAcreditacion = this.datepipe.transform(new Date(rowNode.data.fechaAcreditacion), 'dd/MM/yyyy')
      this.dataPrint.push(rowNode.data)
    } else {
      this.dataPrint.push(rowNode.data)
    }
  })
  setTimeout(()=>{
    printJS({
      printable: 'print_conciliaciones',
      type: 'html',
      style: this.printSrv.getTableStyle(),
      scanStyles: false
    })
  }, 250)

  this.conciliados = [];
  
   this.searchTardio(); 

}


getMonedaNombre(){
  
  return this.monedaSelected == 0 ? 'Todas' : this.tipos_moneda_banco_propio.find(elt => elt.codigo == this.monedaSelected).nombre
}

getValores(){
  
  return this.estadoSelected == 0 ? 'Todos' : this.valores.find(elt => elt.id == this.estadoSelected).descripcion
}

getResumenes(){
  
  let request = {
    
    codigoMoneda: this.monedaSelected == 0 ? null : this.monedaSelected,
    resumen: null,
    
  }
  
  this.bancoSrv.getResumenes(request).subscribe(result => {
    if(result.data.length != 0){
      this.resumenSelected = result.data[0].resumen
    }
    this.resumenes = result.data;
    
    
  })
}

add(){
  
  this.nuevoResumenForm = new FormGroup({
    nuevoResumen: new FormControl(null),
    nuevoResumenFechaDesde: new FormControl(null),
    nuevoResumenFechaHasta:  new FormControl(null),
  });

  this.open(this.modal);
}

open(content) {
  let options: NgbModalOptions = {
    size: '',
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

get nuevoResumen() { 

  return this.nuevoResumenForm.get('nuevoResumen');
  

}

get nuevoResumenFechaHasta() { 

  return this.nuevoResumenForm.get('nuevoResumenFechaHasta');
  

}

get nuevoResumenFechaDesde() { 

  return this.nuevoResumenForm.get('nuevoResumenFechaDesde');
  

}

eliminarResumen(){
  
  let codigo = this.monedaSelected;
  let resumen = this.resumenSelected.resumen;
  
  Swal.fire({
    text: '¿Desea borrar el Resumen?',
    showCancelButton: true,
    confirmButtonText: 'Si',
    customClass: {
      confirmButton: 'btn btn-danger btn-sm mr-2',
      cancelButton: 'btn btn-secondary btn-sm mr-2'
    },
    buttonsStyling: false
  }).then((result) => {
    if (result.isConfirmed) {
      
      this.bancoSrv.deleteResumen(codigo, resumen).subscribe(result => {
        
        this.getResumenes();
        
        this.toastr.success("El Resumen fue borrado correctamente.", 'Banco', { closeButton: true, timeOut: 4000 });
        this.conciliados = [];
      }, error => {
        this.toastr.error(error.error.message, 'Banco', { closeButton: true, timeOut: 4000 });
        
      })
    }
  })
}

eliminarParaGuardar(){
  let codigo = this.monedaSelected;
  let resumen = this.resumenSelected.resumen;

  this.bancoSrv.deleteResumen(codigo, resumen).subscribe(result => {
    console.log(result)
  }, error => {
    this.toastr.error(error.error.message, 'Conciliaciones Bancarias', { closeButton: true, timeOut: 4000 });
  })
}

preguntarGuardar(){
  Swal.fire({
    text: '¿Desea Guardar el Resumen?',
    showCancelButton: true,
    confirmButtonText: 'Si',
    customClass: {
      confirmButton: 'btn btn-danger btn-sm mr-2',
      cancelButton: 'btn btn-secondary btn-sm mr-2'
    },
    buttonsStyling: false
  }).then((result) => {
    if (result.isConfirmed) {
      this.validatePromise().then(result => {
        this.deletePromise().then(result => {
          this.savePromise().then(result => {
            if(result){
              this.toastr.success("El resumen se grabó con éxito.", 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
              this.getConciliados();
            }
            
          }).catch(error => {
            this.toastr.error(error.Message, 'Conciliaciones Bancarias', { closeButton: true, timeOut: 4000 });
          })
        })
      })
    }
  })
}

savePromise(): Promise<boolean>{
  return new Promise<boolean>((resolve, reject) => {
    this.save();

    setTimeout( () => {
      resolve(true);
    }, 250);
  })
}

deletePromise(): Promise<boolean>{
  return new Promise<boolean>((resolve, reject) => {
    this.eliminarParaGuardar();

    setTimeout( () => {
      resolve(true);
    }, 250);
  })
}

validatePromise(): Promise<boolean>{
  return new Promise<boolean>((resolve, reject) => {
    let validaFecha = true;

    this.grid2.forEachNode((rowNode, index) => {
      if(!rowNode.data.descripcion.includes('Saldo Anterior')){
        let fecha = new Date(this.toSqlDate(rowNode.data.fechaConciliacion)+'T00:00:00');
        if(!(fecha.getTime() >= (new Date(this.resumenSelected.desde)).getTime() && fecha.getTime() <= (new Date(this.resumenSelected.hasta)).getTime())){
          validaFecha = false;
        }
      }
    })
    
    if(!validaFecha){
      this.toastr.error('No se puede guardar el Resumen, hay una o más fechas de Conciliación fuera de rango.', 'Conciliaciones', { closeButton: true, timeOut: 6000 })
      reject(false);
    }

    setTimeout( () => {
      resolve(true);
    }, 250);
  })
}

async save(){
  let cabecera = {
    codigoMoneda: this.monedaSelected,
    resumen: this.resumenSelected.resumen,
    desde: this.resumenSelected.desde,
    hasta: this.resumenSelected.hasta,
  }
  
  await this.bancoSrv.grabarCabeceraResumen(cabecera).toPromise().then(result => {
    console.log(result)
  }).catch(error => {
    this.toastr.error(error.error.message, 'Conciliaciones Bancarias', { closeButton: true, timeOut: 4000 });
  });

  this.grid2.forEachNode(async (rowNode, index)=>{
    if(!rowNode.data.descripcion.includes('Saldo Anterior')){
      let detalle = {
        codigoMoneda: this.monedaSelected,
        resumen: this.resumenSelected.resumen,
        itemResumen: rowNode.rowIndex,
        fechaConciliada: this.toSqlDate(rowNode.data.fechaConciliacion),
        idChequera: rowNode.data.idChequera,
        numeroCheque: rowNode.data.numeroCheque,
        idExtraccion: rowNode.data.idExtraccion,
        numeroDeposito: rowNode.data.numeroDeposito,
        itemNumeroDeposito: rowNode.data.itemNumeroDeposito == undefined ? null : rowNode.data.itemNumeroDeposito,
      }
      
      await this.bancoSrv.grabarDetalleResumen(detalle).toPromise().then(result => {
        console.log(result);
        /*
        if(index == this.grid2.getDisplayedRowCount() -1){
          this.toastr.success("El Resumen fue guardado con éxito.", 'Conciliaciones', { closeButton: true, timeOut: 4000 });
          this.getConciliados();
        }
        */
      }).catch( error => {
        console.log(error)
        this.toastr.error(error.error.message, 'Conciliaciones', { closeButton: true, timeOut: 4000 });
      })
    }
  })
  
}
  
toSqlDate(dateStr: string): string{
  let arr = dateStr.split('/'); // dd/MM/yyyy
  return arr[2] + '-' + arr[1] + '-' + arr[0]; // yyyy-MM-dd
}

onCellKeyPressConciliaciones(event){
  
  if(event.event.charCode == 13){
    
    if(event.colDef.field == 'fechaConciliacion'){
      let fecha = new Date(this.toSqlDate(event.data.fechaConciliacion)+'T00:00:00');
      if(!(fecha.getTime() >= (new Date(this.resumenSelected.desde)).getTime() && fecha.getTime() <= (new Date(this.resumenSelected.hasta)).getTime())){
        this.toastr.error('Fecha de Conciliación fuera de rango', 'Conciliaciones', { closeButton: true, timeOut: 4000 })
        this.editCurrentCell(this.grid2, this.columnDefsGrilla2, event )
      }
    }

        
  }
}

editCurrentCell(grid, columns, event){
  let colIndex = columns.findIndex(elt => elt.field == event.colDef.field);
  let rowIndex = event.rowIndex;

  grid.startEditingCell({
    rowIndex: rowIndex,
    colKey: columns[colIndex].field
  });
}

refreshGrillas(){
  this.conciliados = [];
  this.noConciliados =[];
  this.getNoConciliados();
}

exportar(){ 
  this.dataPrint = [];
  let cabecera = {
    Codigo: this.monedaSelected,
    Resumen: this.resumenSelected.resumen,
    Desde: this.datepipe.transform(this.resumenSelected.desde, 'dd/MM/yyyy'),
    Hasta: this.datepipe.transform(this.resumenSelected.hasta, 'dd/MM/yyyy')
  }

  //this.dataPrint.push(cabecera);

  this.grid2.forEachNode((rowNode, index)=>{
    this.dataPrint.push(this.getNewDataRow(rowNode.data))
  })   
   
  setTimeout(()=>{
    this.excelSrv.exportWithHeader(this.dataPrint, cabecera); 
  }, 500)

   this.conciliados = [];
  
   this.searchTardio(); 
}

getNewDataRow(data: any){
  let row = {
    Item: data.itemResumen,
    FechaConciliacion: data.fechaConciliacion,
    FechaAcreditacion: data.fechaAcreditacion != undefined ? this.datepipe.transform(new Date(data.fechaAcreditacion), 'dd/MM/yyyy') : null,
    Descripcion: data.descripcion,
    Debe: data.debe,
    Haber: data.haber,
    Saldo: data.saldo, 
    NombreProveedor: data.nombreProveedor,
    Asiento: data.asiento,
  }
  return row;
}

searchTardio(){
  setTimeout(()=>{
    this.getConciliados();
  }, 100)
}

   

}



