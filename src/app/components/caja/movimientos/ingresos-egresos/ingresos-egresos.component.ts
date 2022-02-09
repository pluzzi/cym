import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, SelectMultipleControlValueAccessor } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TiposMovimientosService } from 'src/app/services/caja/tipos-movimientos.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { TipoRetencionService } from 'src/app/services/caja/tipo-retencion.service';
import { ExcelService } from 'src/app/services/excel.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CuentaService } from 'src/app/services/contabilidad/cuenta.service';
import { MovimientoService } from 'src/app/services/caja/movimiento.service';
import { MonedaService } from 'src/app/services/caja/moneda.service';
import { ChequeraService } from 'src/app/services/caja/chequera.service';
import { EjercicioService } from 'src/app/services/ejercicio.service';
import { AsientoService } from 'src/app/services/contabilidad/asiento.service';
import { CellEditingStartedEvent, CellValueChangedEvent } from 'ag-grid-community';
import { BancoService } from 'src/app/services/caja/banco.service';
import * as  printJS from 'print-js';
import { PrintService } from 'src/app/services/print.service';
import { getAllJSDocTagsOfKind } from 'typescript';


@Component({
  selector: 'app-ingresos-egresos',
  templateUrl: './ingresos-egresos.component.html',
  styleUrls: ['./ingresos-egresos.component.css']
})
export class IngresosEgresosComponent implements OnInit {

  dataForm: FormGroup;
  gridCuentasApi: any;
  gridRetencionesApi: any;
  gridMonedasApi: any;
  gridCuentas: any;
  gridRetenciones: any;
  gridMonedas: any;
  tipos: any[];
  movimiento: any;
  movimientosCuenta: any[] = [];
  movimientosRetencion: any[] = [];
  movimientosMoneda: any[] = [];
  cuentas: any[];
  cheques: any[] = [];
  monedas: any[];
  bancos: any[];
  dataPrintCuentas: any[];
  dataPrintRetenciones: any[] = [];
  dataPrintMonedas: any[];
  nombreMovimiento: string;
  total: number;
  totalCuentas: number;
  totalRetenciones: number;
  ejercicio: number;

  columnDefs: any[];

  defaultColDef = {
    editable: true,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'},
    suppressKeyboardEvent: params => {
      if (!params.editing) {
          let isDeleteKey = params.event.keyCode === 46;
      
          if(isDeleteKey){
            this.removeSelected(this.gridCuentasApi);
            return true
          }
      }
      
      return false;
    }
  };

  columnDefs1 = [
    { 
      field: 'codigo', 
      headerName: 'Código',
      filter: true
    },
    { 
      field: 'retencion', 
      headerName: 'Nombre',
      cellStyle: {'pointer-events': 'none'}
    },
    { 
      field: 'comprobante', 
      headerName: 'N° Retención'
    },
    { 
      field: 'fecha', 
      headerName: 'Fecha',
      /*
      cellRenderer: params => {
        return params.value instanceof Date ? this.datepipe.transform(params.value, 'dd/MM/yyyy') : this.datepipe.transform(new Date(params?.value), 'dd/MM/yyyy')
      }
      */
    },
    { 
      field: 'razonSocial', 
      headerName: 'Razón Social'
    },
    { 
      field: 'cuit', 
      headerName: 'CUIT'
    },
    { 
      field: 'debe', 
      headerName: 'Debe',
      filter: true,
      cellRenderer: params => {
        return this.formatNumber(params.value);
      }
    },
    { 
      field: 'haber', 
      headerName: 'Haber',
      cellRenderer: params => {
        return this.formatNumber(params.value);
      }
    },
    { 
      field: 'cuenta', 
      headerName: 'Cta Contable',
      cellStyle: {'pointer-events': 'none'}
    }
  ];

  defaultColDef1 = {
    editable: true,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'},
    suppressKeyboardEvent: params => {
      if (!params.editing) {
          let isDeleteKey = params.event.keyCode === 46;
      
          if(isDeleteKey){
            this.removeSelected(this.gridRetencionesApi, true);
            return true
          }
      }
      
      return false;
    }
  };

  columnDefs2: any[];

  defaultColDef2 = {
    editable: true,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'},
    suppressKeyboardEvent: params => {
      if (!params.editing) {
          let isDeleteKey = params.event.keyCode === 46;
      
          if(isDeleteKey){
            this.removeSelected(this.gridMonedasApi, true);
            return true
          }
      }
      
      return false;
    }
  };


  constructor(
    private route: Router,
    private toastr: ToastrService,
    private modalSrv: NgbModal,
    private datepipe: DatePipe,
    private reteSrv: TipoRetencionService,
    private excelSrv: ExcelService,    
    private spinner: NgxSpinnerService,
    private tipoMovSrv: TiposMovimientosService,
    private moviSrv: MovimientoService,
    private cuentaSrv: CuentaService,
    private monedaSrv: MonedaService,
    private chequeSrv: ChequeraService,
    private ejercicioSrv: EjercicioService,
    private asientoSrv: AsientoService,
    private bancoSrv: BancoService,
    private printSrv: PrintService,
  ) { }

  ngOnInit(): void {
    this.getTipoMov();
    this.getCuentas();
    this.newData();
    this.createColumns();
    this.getMonedas();
    this.getBancos();
  }

  getBancos(){
    this.bancoSrv.getBancos().subscribe(result => {
      this.bancos = result.data;
    })
  }

  getMonedas(){
    this.monedaSrv.getMonedas(1, 0).subscribe(result => {
      this.monedas = result.data;
    })
  }

  newData(){
    this.dataForm = new FormGroup({
      numero: new FormControl(0),
      fecha: new FormControl(this.formatDate(new Date())),
      turno: new FormControl(1),
      asiento: new FormControl(null),
      ingresoEgreso: new FormControl("2"),
      tipo: new FormControl(null),
      concepto: new FormControl(null),
      importeCuentas: new FormControl(0),
      importeRetencionesDebe: new FormControl(0),
      importeRetencionesHaber: new FormControl(0),
      importeMonedas: new FormControl(0),
      diferencia: new FormControl(0)
    })
  }

  createColumns(){
    this.columnDefs = [
      { 
        field: 'cuenta', 
        headerName: 'Código Cuenta',
        filter: true
      },
      { 
        field: 'nombre', 
        headerName: 'Nombre Cuenta',
        filter: true,
        cellStyle: {'pointer-events': 'none'}
      },
      { 
        field: 'importe', 
        headerName: this.dataForm.controls['ingresoEgreso'].value == "1" ? "Haber" : "Debe",
        filter: true,
        cellRenderer: params => {
          return this.formatNumber(params.value);
        }
        
      },
      { 
        field: 'observaciones', 
        headerName: 'Observaciones',
        filter: true
      }
    ];

    this.columnDefs2 = [
      { 
        field: 'interno', 
        headerName: 'N° Interno',
        filter: true
      },
      { 
        field: 'codigo', 
        headerName: 'Código'
      },
      { 
        field: 'nombre', 
        headerName: 'Nombre',
        cellStyle: {'pointer-events': 'none'}
      },
      { 
        field: 'fecha', 
        headerName: 'Fecha',
        /*
        cellRenderer: params => {
          return params.value instanceof Date ? this.datepipe.transform(params.value, 'dd/MM/yyyy') : this.datepipe.transform(new Date(params?.value), 'dd/MM/yyyy')
        }
        */
      },
      { 
        field: 'banco', 
        headerName: 'Banco'
      },
      { 
        field: 'sucursal', 
        headerName: 'Sucursal'
      },
      { 
        field: 'cp', 
        headerName: 'Plaza'
      },
      { 
        field: 'cheque', 
        headerName: 'N° Cheque'
      },
      { 
        field: 'cuit', 
        headerName: 'CUIT'
      },
      { 
        field: 'importe', 
        headerName: this.dataForm.controls['ingresoEgreso'].value == "1" ? "Debe" : "Haber",
        cellRenderer: params => {
          return this.formatNumber(params.value);
        },
        /*
        editable: params => {
          return !(params.node.data.interno != undefined && params.node.data.interno != '');
        }
        */
      },
      { 
        field: 'observaciones', 
        headerName: 'Observaciones'
      }
    ];
  }

  formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  getTipoMov(){
    this.tipoMovSrv.getMovimientos().subscribe(result => {
      this.tipos = result.data;
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

  onGridReadyCuentas(params) {
    this.gridCuentasApi = params.api;
    this.gridCuentas = params;

    if(this.dataForm.controls['numero'].value == 0){
      this.gridCuentasApi.applyTransaction({add: [{}]});
    }

    setTimeout(()=>{
      this.gridCuentasApi.sizeColumnsToFit();
      //this.autoSizeAll(false, params.columnApi);
      this.gridCuentasApi.setHeaderHeight(16);
    }, 250)
    
  }

  onGridReadyRetenciones(params) {
    this.gridRetencionesApi = params.api;
    this.gridRetenciones = params;

    if(this.dataForm.controls['numero'].value == 0){
      this.gridRetencionesApi.applyTransaction({add: [{fecha: this.datepipe.transform(new Date(), 'dd/MM/yyyy')}]});
    }

    setTimeout(()=>{
      this.gridRetencionesApi.sizeColumnsToFit();
      //this.autoSizeAll(false, params.columnApi);
      this.gridRetencionesApi.setHeaderHeight(16);
    }, 250)
    
  }
  
  onGridReadyMonedas(params) {
    this.gridMonedasApi = params.api;
    this.gridMonedas = params;

    if(this.dataForm.controls['numero'].value == 0){
      this.gridMonedasApi.applyTransaction({add: [{fecha: this.datepipe.transform(new Date(),'dd/MM/yyyy')}]});
    }

    setTimeout(()=>{
      //this.grid.sizeColumnsToFit();
      this.autoSizeAll(false, params.columnApi);
      this.gridMonedasApi.setHeaderHeight(16);
    }, 250)
    
  }

  autoSizeAll(skipHeader, column) {
    const allColumnIds = [];
    column.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });
    column.autoSizeColumns(allColumnIds, skipHeader);
  }

  numeroKeyDown(event){
    if(event.keyCode==13){
      if(event.target.value == "0"){
        this.newData()
      }
      
      this.search(event.target.value);
    }
  }

  search(numero: number){
    this.searchMovimiento(numero);
    this.searchMovimientosCuenta(numero);
    this.searchMovimientosRetencion(numero);
    this.searchMovimientosMoneda(numero);
  }

  clear(){
    this.newData()
    this.searchMovimiento(0);
    this.searchMovimientosCuenta(0);
    this.searchMovimientosRetencion(0);
    this.searchMovimientosMoneda(0);
    this.cheques = [];
  }

  searchMovimiento(numero: number){
    this.moviSrv.getMovimientos(numero).subscribe(result => {
      this.movimiento = result.data;

      if(result.data){
        this.dataForm = new FormGroup({
          numero: new FormControl(this.movimiento.numero),
          fecha: new FormControl(this.formatDate(this.movimiento.fecha)),
          turno: new FormControl(this.movimiento.turno),
          asiento: new FormControl(this.movimiento.asiento),
          concepto: new FormControl(this.movimiento.concepto),
          ingresoEgreso: new FormControl(this.movimiento.movimiento.toString()),
          tipo: new FormControl(this.movimiento.tipo),
          importeCuentas: new FormControl(this.formatNumber(this.movimiento.importeCuentas)),
          importeRetencionesDebe: new FormControl(this.formatNumber(this.movimiento.importeRetencionesDebe)),
          importeRetencionesHaber: new FormControl(this.formatNumber(this.movimiento.importeRetencionesHaber)),
          importeMonedas: new FormControl(this.formatNumber(this.movimiento.importeMonedas)),
          diferencia: new FormControl(this.calcularDiferencia())
        })
      }

      this.createColumns();

    })
  }

  searchMovimientosCuenta(numero: number){
    this.moviSrv.getMovimientosCuenta(numero).subscribe(result => {
      this.movimientosCuenta = result.data.map(elt => {
        elt.observaciones = '';
        elt.nombre = this.getNombreCuenta(elt.cuenta);
        //elt.importe = this.formatNumber(elt.importe);
        return elt;
      });
      this.movimientosCuenta.push({});
      //this.gridCuentasApi.applyTransaction({add: [{}]});
    })
  }

  searchMovimientosMoneda(numero: number){
    this.moviSrv.getMovimientosMoneda(numero).subscribe(result => {
      this.movimientosMoneda = result.data.map(elt => {
        elt.fecha = this.datepipe.transform(new Date(elt.fecha),'dd/MM/yyyy');
        return elt;
      });

      this.movimientosMoneda.push({fecha: this.datepipe.transform(new Date(),'dd/MM/yyyy')});
      //this.gridMonedasApi.applyTransaction({add: [{fecha: new Date()}]});
    })
  }

  searchMovimientosRetencion(numero: number){
    this.moviSrv.getMovimientosRetencion(numero).subscribe(result => {
      this.movimientosRetencion = result.data.map(elt => {
        elt.fecha = this.datepipe.transform(new Date(elt.fecha),'dd/MM/yyyy');
        return elt;
      });
      this.movimientosRetencion.push({fecha: this.datepipe.transform(new Date(),'dd/MM/yyyy')});
      //this.gridRetencionesApi.applyTransaction({add: [{fecha: new Date()}]});
    })
  }

  formatNumber(numero: any){
    return numero == null ? '' : Number(numero).toFixed(2);
  }

  calcularDiferencia(){
    let data = this.dataForm.getRawValue();
    if(data.ingresoEgreso == "1"){ // Ingreso
      return this.formatNumber(Number(data.importeCuentas) + Number(data.importeRetencionesHaber) - Number(data.importeRetencionesDebe) - Number(data.importeMonedas));
    } else { // Egreso
      return this.formatNumber(Number(data.importeCuentas) - Number(data.importeRetencionesHaber) + Number(data.importeRetencionesDebe) - Number(data.importeMonedas));
    }
  }

  getNombreCuenta(codigo){
    let index = this.cuentas.findIndex(elt => elt.id.trim() == codigo.trim());

    if(index != -1){
      return this.cuentas[index].nombre;
    }else{
      return '';
    }
  }

  async onCellKeyPressCuentas(event){
    if(event.event.charCode == 13){
      if(event.colDef.field == 'observaciones'){
        this.gridCuentasApi.applyTransaction({add: [{}]});
        this.moveNextCell(this.gridCuentasApi, this.columnDefs, event);
      }

      if(event.colDef.field == 'cuenta'){
        if(event.data.cuenta == undefined){
          this.editCurrentCell(this.gridCuentasApi, this.columnDefs, event);
          return;
        }
        await this.cuentaSrv.getCuentaImputable(event.data.cuenta).toPromise().then(result => {
          this.onBtStartEditing(this.gridCuentasApi, 'nombre', event.rowIndex, result.data.nombre )
          this.moveCellByField(this.gridCuentasApi, this.columnDefs, event, 'importe');
        }).catch(error => {
          event.data.cuenta = '';
          this.onBtStartEditing(this.gridCuentasApi, 'cuenta', event.rowIndex, '' )
          this.editCurrentCell(this.gridCuentasApi, this.columnDefs, event);
          this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
        })
      }

      if(event.colDef.field == 'nombre'){
        this.moveNextCell(this.gridCuentasApi, this.columnDefs, event);
      }

      if(event.colDef.field == 'importe'){
        this.moveNextCell(this.gridCuentasApi, this.columnDefs, event);
      }

      this.sumarImportes();
      
    }
  }

  async onCellKeyPressRetenciones(event){
    if(event.event.charCode == 13){
      if(event.colDef.field == 'haber'){
        this.gridRetencionesApi.applyTransaction({add: [{fecha: this.datepipe.transform(new Date(), 'dd/MM/yyyy')}]});
        this.moveNextRowCell(this.gridRetencionesApi, this.columnDefs1, event);
      }

      if(event.colDef.field == 'codigo'){
        if(event.data.codigo == undefined){
          this.editCurrentCell(this.gridRetencionesApi, this.columnDefs1, event);
          return;
        }
        await this.reteSrv.validaTipoRetencion(event.data.codigo).toPromise().then(result => {
          if(result.data){
            this.onBtStartEditing(this.gridRetencionesApi, 'retencion', event.rowIndex, result.data.retencion )
            this.onBtStartEditing(this.gridRetencionesApi, 'cuenta', event.rowIndex, result.data.cuenta )
            this.moveNextCell(this.gridRetencionesApi, this.columnDefs1, event);
          }else{
            this.editCurrentCell(this.gridRetencionesApi, this.columnDefs1, event);
          this.toastr.error("Tipo de Retención no encontrada.", 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
          }
          
        }).catch(error => {
          this.editCurrentCell(this.gridRetencionesApi, this.columnDefs1, event);
          this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
        })
      }

      if(event.colDef.field == 'fecha'){
        const lang = navigator.language
        if(lang.includes('en')){
          this.toastr.error('La fecha no es válida.', 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
          return;
        }

        var timestamp = Date.parse(this.toSqlDate(event.data.fecha));

        if (isNaN(timestamp)) {
          console.log('Invalida')
          event.data.fecha = '';
          this.onBtStartEditing(this.gridRetencionesApi, 'fecha', event.rowIndex, '' )
          this.editCurrentCell(this.gridRetencionesApi, this.columnDefs1, event);
          this.toastr.error('La fecha no es válida.', 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
          return;
        }else{
          console.log('valida')
        }
      }

      if(event.colDef.field != 'haber' && event.colDef.field != 'codigo'){
        this.moveNextCell(this.gridRetencionesApi, this.columnDefs1, event);
      }

      this.sumarImportes();
      
    }
  }

  async onCellKeyPressMonedas(event){
    if(event.event.charCode == 13){
      if(event.colDef.field == 'observaciones'){
        this.gridMonedasApi.applyTransaction({add: [{fecha: this.datepipe.transform(new Date(), 'dd/MM/yyyy')}]});
        this.moveNextCell(this.gridMonedasApi, this.columnDefs2, event);
      }

      if(event.colDef.field == 'interno'){
        if(event.data.interno == undefined || event.data.interno == ''){
          this.moveNextCell(this.gridMonedasApi, this.columnDefs2, event);
          return;
        }
        await this.chequeSrv.validaCheque(event.data.interno, this.dataForm.controls['turno'].value).toPromise().then(result => {
          if(result.data){
            this.onBtStartEditing(this.gridMonedasApi, 'codigo', event.rowIndex, result.data.moneda )
            this.onBtStartEditing(this.gridMonedasApi, 'nombre', event.rowIndex, result.data.nombreMoneda )
            this.onBtStartEditing(this.gridMonedasApi, 'fecha', event.rowIndex, this.datepipe.transform(new Date(result.data.fechaCheque), 'dd/MM/yyyy') )
            this.onBtStartEditing(this.gridMonedasApi, 'banco', event.rowIndex, result.data.banco )
            this.onBtStartEditing(this.gridMonedasApi, 'sucursal', event.rowIndex, result.data.sucursal )
            this.onBtStartEditing(this.gridMonedasApi, 'cp', event.rowIndex, result.data.cp )
            this.onBtStartEditing(this.gridMonedasApi, 'cheque', event.rowIndex, result.data.cheque )
            this.onBtStartEditing(this.gridMonedasApi, 'cuit', event.rowIndex, result.data.cuentaCc )
            this.onBtStartEditing(this.gridMonedasApi, 'importe', event.rowIndex, result.data.importe )
            this.onBtStartEditing(this.gridMonedasApi, 'observaciones', event.rowIndex, result.data.observaciones )
            //this.moveCellByField(this.gridMonedasApi, this.columnDefs2, event, 'nombre');
            this.gridMonedasApi.stopEditing();
          }else{
            this.editCurrentCell(this.gridMonedasApi, this.columnDefs2, event);
            this.toastr.error("Cheque no encontrada.", 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
          }
          
        }).catch(error => {
          this.editCurrentCell(this.gridMonedasApi, this.columnDefs2, event);
          this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
        })
      }

      if(event.colDef.field == 'codigo'){
        if(event.data.codigo == undefined){
          this.editCurrentCell(this.gridMonedasApi, this.columnDefs2, event);
          return;
        }

        await this.monedaSrv.validaMoneda(event.data.codigo).toPromise().then(result => {
          if(result.data){
            this.onBtStartEditing(this.gridMonedasApi, 'interno', event.rowIndex, '' )
            this.onBtStartEditing(this.gridMonedasApi, 'nombre', event.rowIndex, result.data.nombre )
            this.onBtStartEditing(this.gridMonedasApi, 'fecha', event.rowIndex, this.datepipe.transform(new Date(),'dd/MM/yyyy'))
            this.onBtStartEditing(this.gridMonedasApi, 'banco', event.rowIndex, result.data.banco )
            this.onBtStartEditing(this.gridMonedasApi, 'sucursal', event.rowIndex, result.data.sucursal )
            this.onBtStartEditing(this.gridMonedasApi, 'cp', event.rowIndex, result.data.cp )
            this.onBtStartEditing(this.gridMonedasApi, 'cheque', event.rowIndex, result.data.cheque )
            this.onBtStartEditing(this.gridMonedasApi, 'cuit', event.rowIndex, result.data.cuit )
            this.onBtStartEditing(this.gridMonedasApi, 'importe', event.rowIndex, null )
            this.onBtStartEditing(this.gridMonedasApi, 'observaciones', event.rowIndex, '' )

            this.gridMonedasApi.stopEditing();
            
            if(result.data.tipo == 3){
              this.moveCellByField(this.gridMonedasApi, this.columnDefs2, event, 'importe');
            }else{
              this.moveNextCell(this.gridMonedasApi, this.columnDefs2, event);
            }
          }
          
        }).catch(error => {
          this.editCurrentCell(this.gridMonedasApi, this.columnDefs2, event);
          this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
        })
      }

      if(event.colDef.field == 'cheque'){
        if(event.data.cheque == undefined || event.data.cheque == ''){
          this.moveNextCell(this.gridMonedasApi, this.columnDefs2, event);
          return;
        }

        await this.monedaSrv.validaMoneda(event.data.codigo).toPromise().then(moneda => {
          if(moneda.data){
            if(moneda.data.tipo != 1){
              this.moveNextCell(this.gridMonedasApi, this.columnDefs2, event);
              return;
            }

            this.chequeSrv.validaBancoCheque(moneda.data.codigo, event.data.cheque).toPromise().then(result => {
              console.log(result);
              let i = this.cheques.findIndex(elt => elt.cheque == event.data.cheque);

              if(i != -1){
                this.cheques[i] = { cheque: event.data.cheque, id: result.data.id };
              }else{
                this.cheques.push({ cheque: event.data.cheque, id: result.data.id });
              }

              this.moveNextCell(this.gridMonedasApi, this.columnDefs2, event);

            }).catch(error => {
              event.data.cheque = '';
              this.onBtStartEditing(this.gridMonedasApi, 'cheque', event.rowIndex, '' )
              this.editCurrentCell(this.gridMonedasApi, this.columnDefs2, event);
              if(error.status == 400){
                this.toastr.error('El número de cheque no es correcto.', 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
              }else{
                this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
              }
              
            })

          }
          
        }).catch(error => {
          this.moveNextCell(this.gridMonedasApi, this.columnDefs2, event);
          this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
        })

      }

      if(event.colDef.field == 'banco'){
        if(event.data.banco == undefined){
          this.moveNextCell(this.gridMonedasApi, this.columnDefs2, event);
          return;
        }
        
        let bancoIndex = this.bancos.findIndex(elt => elt.codigo.trim() == event.data.banco.trim())

        if(bancoIndex == -1){
          this.onBtStartEditing(this.gridMonedasApi, 'banco', event.rowIndex, '' )
          this.editCurrentCell(this.gridMonedasApi, this.columnDefs2, event);
          this.toastr.error("El código de banco "+event.data.banco.trim()+" no existe.", 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
          return;
        }else{
          this.moveNextCell(this.gridMonedasApi, this.columnDefs2, event);
        }

      }

      if(event.colDef.field == 'fecha'){
        const lang = navigator.language
        if(lang.includes('en')){
          this.toastr.error('La fecha no es válida.', 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
          return;
        }

        var timestamp = Date.parse(this.toSqlDate(event.data.fecha));

        if (isNaN(timestamp)) {
          console.log('Invalida')
          event.data.fecha = '';
          this.onBtStartEditing(this.gridMonedasApi, 'fecha', event.rowIndex, '' )
          this.editCurrentCell(this.gridMonedasApi, this.columnDefs2, event);
          this.toastr.error('La fecha no es válida.', 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
          return;
        }else{
          console.log('valida')
        }
      }

      if(event.colDef.field != 'banco' && event.colDef.field != 'cheque' && event.colDef.field != 'interno' && event.colDef.field != 'observaciones' && event.colDef.field != 'codigo'){
        this.moveNextCell(this.gridMonedasApi, this.columnDefs2, event);
      }

      this.sumarImportes();
      
    }
  }

  removeSelected(grid, withDate = false) {
    const selectedData = grid.getSelectedRows();
    const res = grid.applyTransaction({ remove: selectedData });

    let i = this.cheques.findIndex(elt => elt.cheque == selectedData.cheque);

    if(i != -1){
      this.cheques.splice(i, 1);
    }

    this.sumarImportes();

    if(grid.getDisplayedRowCount()==0){
      if(withDate){
        grid.applyTransaction({add: [{fecha: new Date()}]});
      }else{
        grid.applyTransaction({add: [{}]});
      }
      
    }

  }

  onBtStartEditing(grid, column, row, key) {    
    grid.startEditingCell({
      rowIndex: row,
      colKey: column,
      keyPress: key,
      charPress: key
    });
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

  moveCellByField(grid, columns, event, field){
    let colIndex = columns.findIndex(elt => elt.field == field);
    let rowIndex = event.rowIndex;

    grid.startEditingCell({
      rowIndex: rowIndex,
      colKey: columns[colIndex].field
    });
  }

  moveNextRowCell(grid, columns, event){
    let colIndex = 0;
    let rowIndex = event.rowIndex +1;
    
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

  sumarImportes(){
    // Cuenta
    let sumImporteCuenta = 0;
    this.gridCuentasApi.forEachNode((rowNode, index) => {
      sumImporteCuenta += rowNode.data.importe == undefined ? 0 : Number(rowNode.data.importe);
    });

    let importeCuenta = Number(isNaN(sumImporteCuenta) ? 0 : sumImporteCuenta);

    this.dataForm.controls['importeCuentas'].setValue(importeCuenta.toFixed(2));

    // retenciones debe
    let sumImporteRetencionDebe = 0;
    this.gridRetencionesApi.forEachNode((rowNode, index) => {
      sumImporteRetencionDebe += rowNode.data.debe == undefined ? 0 : Number(rowNode.data.debe);
    });

    let importeRetDebe = Number(isNaN(sumImporteRetencionDebe) ? 0 : sumImporteRetencionDebe);

    this.dataForm.controls['importeRetencionesDebe'].setValue(importeRetDebe.toFixed(2));

    // retenciones haber
    let sumImporteRetencionHaber = 0;
    this.gridRetencionesApi.forEachNode((rowNode, index) => {
      sumImporteRetencionHaber += rowNode.data.haber == undefined ? 0 : Number(rowNode.data.haber);
    });

    let importeRetHaber = Number(isNaN(sumImporteRetencionHaber) ? 0 : sumImporteRetencionHaber);

    this.dataForm.controls['importeRetencionesHaber'].setValue(importeRetHaber.toFixed(2));

    // monedas
    let sumImporteMonedas = 0;
    this.gridMonedasApi.forEachNode((rowNode, index) => {
      sumImporteMonedas += rowNode.data.importe == undefined ? 0 : Number(rowNode.data.importe);
    });

    let importeMonedas = Number(isNaN(sumImporteMonedas) ? 0 : sumImporteMonedas);

    this.dataForm.controls['importeMonedas'].setValue(importeMonedas.toFixed(2));

    this.dataForm.controls['diferencia'].setValue(this.calcularDiferencia());
    
  }

  async save(){
    // datos
    let dataObj = this.dataForm.getRawValue();
    let asientoId = dataObj.asiento;
    let ejercicio = this.ejercicio;
    let it = 0;

    // obtengo numeracion del asiento
    if(dataObj.asiento && dataObj.asiento != null){
      asientoId = dataObj.asiento;
    }else{
      await this.asientoSrv.getAsientoNumeracion().toPromise().then(result =>{
        asientoId = result.data.id;
        this.dataForm.controls['asiento'].setValue(asientoId);
      })
    }

    // grabo la cabecera del movimiento
    let request = {
      numero: dataObj.numero ? dataObj.numero : null,
      fecha: dataObj.fecha,
      movimiento: Number(dataObj.ingresoEgreso),
      tipo: dataObj.tipo,
      concepto: dataObj.concepto,
      observaciones: dataObj.observaciones,
      asiento: asientoId,
      turno: dataObj.turno,
      importeCuentas: Number(dataObj.importeCuentas),
      importeRetencionesDebe: Number(dataObj.importeRetencionesDebe),
      importeRetencionesHaber: Number(dataObj.importeRetencionesHaber),
      importeMonedas: Number(dataObj.importeMonedas)
    }

    await this.moviSrv.createMovimiento(request).toPromise().then(result => {
      this.dataForm.controls['numero'].setValue(result.data.id);
    })

    // grabar asiento y movimiento cuentas
    await this.gridCuentasApi.forEachNode(async (rowNode, index) => {
      if(rowNode.data.cuenta){
        let asiento = {
          ejercicio: ejercicio,
          id: asientoId,
          it: it++,
          fecha: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
          concepto: dataObj.concepto,
          cuenta: rowNode.data.cuenta.trim(),
          debe: dataObj.ingresoEgreso == '2' ? Number(rowNode.data.importe) : 0, 
          haber: dataObj.ingresoEgreso == '1' ? Number(rowNode.data.importe) : 0,
          costo: null,
          comprobante: null,
          observaciones: null,
          generado: 'CAJ'
        }
  
        await this.asientoSrv.add(asiento).then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
        });

        let movimiento = {
          numero: this.dataForm.controls['numero'].value,
          it: index+1,
          cuenta: rowNode.data.cuenta,
          nombreCuenta: rowNode.data.nombre,
          importe: Number(rowNode.data.importe)
        }

        await this.moviSrv.createMovimientoCuenta(movimiento).toPromise().then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
        });
      }

    })

    // grabar asiento y movimiento retenciones
    await this.gridRetencionesApi.forEachNode(async (rowNode, index) => {
      if(rowNode.data.retencion){
        let asiento = {
          ejercicio: ejercicio,
          id: asientoId,
          it: it++,
          fecha: dataObj.fecha,
          concepto: dataObj.concepto,
          cuenta: rowNode.data.cuenta.trim(),
          debe: rowNode.data.debe != null ? Number(rowNode.data.debe) : 0, 
          haber: rowNode.data.haber != null ? Number(rowNode.data.haber) : 0,
          costo: null,
          comprobante: 'Nro Ret. ' + rowNode.data.comprobante,
          observaciones: null,
          generado: 'CAJ'
        }
  
        await this.asientoSrv.add(asiento).then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
        });

        let movimiento = {
          numero: this.dataForm.controls['numero'].value,
          it: index+1,
          codigo: Number(rowNode.data.codigo),
          comprobante: rowNode.data.comprobante,
          fecha: this.toSqlDate(rowNode.data.fecha),
          debe: rowNode.data.debe != null ? Number(rowNode.data.debe) : 0,
          haber: rowNode.data.haber != null ? Number(rowNode.data.haber) : 0,
          razonSocial: rowNode.data.razonSocial,
          cuit: rowNode.data.cuit
        }

        await this.moviSrv.createMovimientoRetencion(movimiento).toPromise().then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
        });
      }      

    })

    // grabar asiento y movimientos monedas
    await this.gridMonedasApi.forEachNode(async (rowNode, index) => {
      if(rowNode.data.codigo || rowNode.data.interno ){
        // asiento
        let monedaRow = this.monedas.find(elt => elt.codigo == rowNode.data.codigo);
        let cuentaRow = this.cuentas.find(elt => elt.id.trim() == monedaRow.cuenta.trim());

        let asiento = {
          ejercicio: ejercicio,
          id: asientoId,
          it: it++,
          fecha: dataObj.fecha,
          concepto: dataObj.concepto,
          cuenta: cuentaRow.id,
          debe: dataObj.ingresoEgreso == '1' ? Number(rowNode.data.importe) : 0, 
          haber: dataObj.ingresoEgreso == '2' ? Number(rowNode.data.importe) : 0,
          costo: null,
          comprobante: this.getComprobante(rowNode.data.cheque, rowNode.data.interno),
          observaciones: rowNode.data.observacion,
          generado: 'CAJ'
        }
  
        await this.asientoSrv.add(asiento).then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
        });

        // movimiento banco
        let chequeraIndex = this.cheques.findIndex(elt => elt.cheque == rowNode.data.cheque);
        let extraccion = null;

        if(monedaRow.tipo == 1){
          let movimientoBanco = {
            codigo: Number(rowNode.data.codigo),
            chequera: chequeraIndex != -1 ? this.cheques[chequeraIndex].id : null,
            extraccion: null,
            cheque: (rowNode.data.cheque == undefined || rowNode.data.cheque == '') ? null : Number(rowNode.data.cheque),
            fechaEmision: dataObj.fecha,
            fecha: this.toSqlDate(rowNode.data.fecha),
            observacion: rowNode.data.observaciones ? rowNode.data.observaciones : '',
            proveedor: null,
            nombreProveedor: null,
            debe: dataObj.ingresoEgreso == '2' ? Number(rowNode.data.importe) : 0, 
            haber: dataObj.ingresoEgreso == '1' ? Number(rowNode.data.importe) : 0
          }
  
          await this.moviSrv.createMovimientoMonedaBanco(movimientoBanco).toPromise().then(result => {
            console.log(result)
            extraccion = result.data.id;
          }).catch( error => {
            console.log(error)
            this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
          });
        }

        // movimiento valores
        let interno = null;

        if(monedaRow.tipo == 2){
          let movimientoValores = {
            codigo: Number(rowNode.data.codigo),
            turno: dataObj.turno,
            movimiento: Number(dataObj.ingresoEgreso),
            interno: rowNode.data.interno ? Number(rowNode.data.interno) : null,
            banco: rowNode.data.banco,
            sucursal: rowNode.data.sucursal,
            cp: rowNode.data.cp,
            cheque: Number(rowNode.data?.cheque),
            cuit: rowNode.data?.cuit,
            fechaEmision: dataObj.fecha,
            fecha: this.toSqlDate(rowNode.data.fecha),
            importe: Number(rowNode.data.importe),
            observaciones: rowNode.data.observaciones,
            cliente: null,
            nombreCliente: null,
            proveedor: null,
            nombreProveedor: null
          }
  
          await this.moviSrv.createMovimientoMonedaValores(movimientoValores).toPromise().then(result => {
            console.log(result)
            interno = result.data.id;
            rowNode.data.interno = interno;
          }).catch( error => {
            console.log(error)
            this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
          });
        }
        
        // movimiento
        let movimiento = {
          numero: this.dataForm.controls['numero'].value,
          it: index+1,
          fecha: this.toSqlDate(rowNode.data.fecha),
          movimiento: Number(dataObj.ingresoEgreso),
          turno: dataObj.turno,
          moneda: Number(rowNode.data.codigo),
          chequera: chequeraIndex != -1 ? this.cheques[chequeraIndex].id : null,
          extraccion: extraccion,
          interno: interno,
          cheque: Number(rowNode.data?.cheque),
          cotizacion: 1,
          importe: Number(rowNode.data?.importe),
          observaciones: rowNode.data?.observaciones
        }

        await this.moviSrv.createMovimientoMoneda(movimiento).toPromise().then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
        });

      }
    })

  }

  getComprobante(cheque: string, interno: string){
    let ch = cheque == undefined ? '' : 'Ch. ' + cheque;
    let int = interno == undefined ? '' : 'Int. ' + interno;
    let sep = ch == '' ? '' : ' - ';

    return ch + sep + int;
  }

  savePromise(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.save();

      setTimeout( () => {
        resolve(true);
      }, 250);
    })
  }

  saveClick(){
    this.validatePromise().then(async result => {
      await this.savePromise().then(result => {
        this.toastr.success("Los datos se grababaron con exito.", 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
      }).catch(error => {
        this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
      })

      this.search(this.dataForm.controls['numero'].value);

    }).catch(error => {
      //this.toastr.error(error, 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
    })
  }

  validatePromise(): Promise<boolean>{
    return new Promise<boolean>(async (resolve, reject) => {
      // valida fecha del ejercicio
      await this.ejercicioSrv.getEjercicioByFecha(this.dataForm.controls['fecha'].value).toPromise().then(result => {
        this.ejercicio = result.data.id;
      }).catch(error => {
        this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
        reject(false);
      })

      // valida cierre mes
      await this.ejercicioSrv.validaCierreMes(this.dataForm.controls['fecha'].value).toPromise().then(result => {
        
      }).catch(error => {
        this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
        reject(false);
      })

      // valida existencia de datos
      let count = 0;

      this.gridCuentasApi.forEachNode((rowNode, index) => {
        if(rowNode.data.cuenta != undefined && rowNode.data.cuenta != '' ){
          count++;
        }
      })

      this.gridRetencionesApi.forEachNode((rowNode, index) => {
        if(rowNode.data.codigo != undefined && rowNode.data.codigo != '' ){
          count++;
        }
      })

      this.gridMonedasApi.forEachNode((rowNode, index) => {
        if((rowNode.data.codigo != undefined && rowNode.data.codigo != '') || (rowNode.data.interno != undefined && rowNode.data.interno != '') ){
          count++;
        }
      })

      if(count==0){
        this.toastr.error('Debe ingresar datos.', 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
        reject(false);
      }

      // valida diferencia
      if(Number(this.dataForm.controls['diferencia'].value != 0)){
        this.toastr.error('La diferencia debe ser 0.', 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
        reject(false);
      }

      // valida concepto
      if(this.dataForm.controls['concepto'].value == undefined || this.dataForm.controls['concepto'].value == ''){
        this.toastr.error('Debe ingresar un concepto.', 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
        reject(false);
      }

      // valida cheque
      let dataObj = this.dataForm.getRawValue();
      
      await this.gridMonedasApi.forEachNode(async (rowNode, index) => {
        if(rowNode.data.codigo || rowNode.data.interno ){
          // asiento
          let monedaRow = this.monedas.find(elt => elt.codigo == rowNode.data.codigo);
          let cuentaRow = this.cuentas.find(elt => elt.id.trim() == monedaRow.cuenta.trim());

          if(monedaRow.tipo == 2){
            let movimiento = {
              codigo: Number(rowNode.data.codigo),
              turno: dataObj.turno,
              movimiento: Number(dataObj.ingresoEgreso),
              interno: rowNode.data.interno ? Number(rowNode.data.interno) : null,
              banco: rowNode.data.banco,
              sucursal: rowNode.data.sucursal,
              cp: rowNode.data.cp,
              cheque: Number(rowNode.data?.cheque),
              cuenta: cuentaRow.id,
              fechaEmision: dataObj.fecha,
              fecha: this.toSqlDate(rowNode.data.fecha),
              importe: Number(rowNode.data.importe),
              observaciones: rowNode.data.observaciones,
              cliente: null,
              nombreCliente: null,
              proveedor: null,
              nombreProveedor: null
            }
    
            await this.moviSrv.validaMovimientoMonedaValores(movimiento).toPromise().then(result => {
              debugger
              console.log(result)
            }).catch( error => {
              console.log(error)
              this.toastr.error("Nro de cheque: " + rowNode.data?.cheque + ". " + error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
              reject(false);
            });
          }
        }
      })

      setTimeout( () => {
        resolve(true);
      }, 500);
    })
  }

  toSqlDate(dateStr: string): string{
    let arr = dateStr.split('/'); // dd/MM/yyyy
    return arr[2] + '-' + arr[1] + '-' + arr[0]; // yyyy-MM-dd
  }

  trash(){
    Swal.fire({
      text: '¿Desea borrar el movimiento?',
      showCancelButton: true,
      confirmButtonText: 'Si',
      customClass: {
        confirmButton: 'btn btn-danger btn-sm mr-2',
        cancelButton: 'btn btn-secondary btn-sm mr-2'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.moviSrv.deleteMovimiento(this.dataForm.controls['numero'].value).toPromise().then(result =>{
          let data = {
            id: this.dataForm.controls['asiento'].value,
            it: 0
          }
          this.asientoSrv.delete(data).subscribe(result => {
            this.toastr.success("Se borró correctamente.", 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
            this.clear();
          }, error => {
            this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
          })          
        }, error => {
          this.toastr.error(error.error.message, 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
        })
      }
    })
  }
  
  print(){
    this.dataPrintCuentas = [];
    this.gridCuentasApi.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.cuenta != undefined && rowNode.data.cuenta != ''){
      this.dataPrintCuentas.push(rowNode.data)
      }
    })
    this.dataPrintRetenciones = [];
    this.gridRetencionesApi.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.codigo != undefined && rowNode.data.codigo != ''){
        this.dataPrintRetenciones.push(rowNode.data)
      }
      
    })
    this.dataPrintMonedas = [];  
    this.gridMonedasApi.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      if(rowNode.data.codigo != undefined && rowNode.data.codigo != ''){
        this.dataPrintMonedas.push(rowNode.data)
      }
    })

    

  setTimeout(()=>{
    printJS({
      printable: 'print_depositos',
      type: 'html',
      style: this.printSrv.getTableStyle(),
      scanStyles: false
    })
  }, 350)
  
  this.getTotalCuentas();
  this.getTotalRetenciones();
  this.getTotal();

  }


  getTipoNombre(){
    
    if(this.dataForm.controls['tipo'].value != undefined && this.dataForm.controls['tipo'].value != 0 ){
      return this.tipos.find(elt => elt.codigo == this.dataForm.controls['tipo'].value).nombre
    }else{
      return ''
    }
    
  }

  getMovimientoNombre(){
    
    if(this.dataForm.controls['ingresoEgreso'].value == 1){
      return this.nombreMovimiento = 'Ingreso'
    }else{
      return 'Egreso'
    }
    
  }

  getTotalCuentas(){
    
    this.totalCuentas = Number(this.dataForm.controls['importeCuentas'].value)
  }

  getTotalRetenciones(){
    this.totalRetenciones = Number(this.dataForm.controls['importeRetencionesDebe'].value) - Number(this.dataForm.controls['importeRetencionesHaber'].value)
  }

   
  getTotal(){
    
    this.total = Number(this.dataForm.controls['importeCuentas'].value) + this.totalRetenciones
  }


}
