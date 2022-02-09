import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { TransferenciaService } from 'src/app/services/caja/transferencia.service';
import Swal from 'sweetalert2';
import { AsientoService } from 'src/app/services/contabilidad/asiento.service';
import { EjercicioService } from 'src/app/services/ejercicio.service';
import { MonedaService } from 'src/app/services/caja/moneda.service';
import { PrintService } from 'src/app/services/print.service';
import { ChequeraService } from 'src/app/services/caja/chequera.service';
import { MovimientoService } from 'src/app/services/caja/movimiento.service';
import { CuentaService } from 'src/app/services/contabilidad/cuenta.service';
import { BancoService } from 'src/app/services/caja/banco.service';

@Component({
  selector: 'app-transferencias-fondos',
  templateUrl: './transferencias-fondos.component.html',
  styleUrls: ['./transferencias-fondos.component.css']
})
export class TransferenciasFondosComponent implements OnInit {
  dataForm: FormGroup;
  gridIngresos: any;
  gridEgresos: any;
  ingresos: any[] = [];
  egresos: any[] = [];
  cheques: any[] = [];
  monedas: any[];
  cuentas: any[];
  bancos: any[];
  ingreso: number;
  egreso: number;
  ejercicio: number;
  
  columnDefsIngresos: any[] = [
    { 
      field: 'interno', 
      headerName: 'Interno',
      filter: true,
      
    },
    { 
      field: 'moneda', 
      headerName: 'Código',
      filter: true,
      
    },
    { 
      field: 'nombreMoneda', 
      headerName: 'Moneda',
      filter: true,
      
    },
    { 
      field: 'fecha', 
      headerName: 'Fecha',
      filter: true
    },
    
    { 
      field: 'banco', 
      headerName: 'Banco',
      filter: true,
      
    },
    { 
      field: 'sucursal', 
      headerName: 'Sucursal',
      filter: true,
    },
    { 
      field: 'cp', 
      headerName: 'Plaza',
      filter: true,
    },
    { 
      field: 'cheque', 
      headerName: 'N° Cheque',
      filter: true,
    },
    { 
      field: 'cuit', 
      headerName: 'CUIT',
      filter: true,
    },
    { 
      field: 'importe', 
      headerName: 'Debe',
      filter: true,
    },
    { 
      field: 'observaciones', 
      headerName: 'Observaciones',
      filter: true,
    },
    
  ];
  
  columnDefsEgresos: any[] = [
    { 
      field: 'interno', 
      headerName: 'Interno',
      filter: true,
      
    },
    { 
      field: 'moneda', 
      headerName: 'Código',
      filter: true,
      
    },
    { 
      field: 'nombreMoneda', 
      headerName: 'Moneda',
      filter: true,
      
    },
    { 
      field: 'fecha', 
      headerName: 'Fecha',
      filter: true
    },
    
    { 
      field: 'banco', 
      headerName: 'Banco',
      filter: true,
      
    },
    { 
      field: 'sucursal', 
      headerName: 'Sucursal',
      filter: true,
    },
    { 
      field: 'cp', 
      headerName: 'Plaza',
      filter: true,
    },
    { 
      field: 'numeroCheque', 
      headerName: 'N° Cheque',
      filter: true,
    },
    { 
      field: 'cuenta', 
      headerName: 'CUIT',
      filter: true,
    },
    { 
      field: 'importe', 
      headerName: 'Haber',
      filter: true,
    },
    { 
      field: 'observaciones', 
      headerName: 'Observaciones',
      filter: true,
    },
    
  ];

  defaultColDefIngresos = {
    editable: true,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'},
    headerStyle: {fontSize: '5px !important'},
    suppressKeyboardEvent: params => {
      if (!params.editing) {
          let isDeleteKey = params.event.keyCode === 46;
      
          if(isDeleteKey){
            this.removeSelected(this.gridIngresos.api, true);
            return true
          }
      }
      
      return false;
    }
  };

  defaultColDefEgresos = {
    editable: true,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'},
    headerStyle: {fontSize: '5px !important'},
    suppressKeyboardEvent: params => {
      if (!params.editing) {
          let isDeleteKey = params.event.keyCode === 46;
      
          if(isDeleteKey){
            this.removeSelected(this.gridEgresos.api, true);
            return true
          }
      }
      
      return false;
    }
  };

  constructor(
    private route: Router,
    private datepipe: DatePipe,
    private tranferSrv: TransferenciaService,
    private asientoSrv: AsientoService,
    private toastr: ToastrService,
    private ejercicioSrv: EjercicioService,
    private monedaSrv: MonedaService,
    private printSrv: PrintService,
    private chequeSrv: ChequeraService,    
    private moviSrv: MovimientoService,
    private cuentaSrv: CuentaService,
    private bancoSrv: BancoService,
  ) { }

  ngOnInit(): void {
    this.newDataForm();
    this.getMonedas();
    this.getCuentas();    
    this.getBancos();
  }

  home(){
    this.route.navigate(['/home'], {  });
  }

  getMonedas(){
    this.monedaSrv.getMonedas(1,0).subscribe(result => {
      this.monedas = result.data;
    })
  }

  getCuentas(){
    this.cuentaSrv.getCuentas().subscribe(result => {
      this.cuentas = result.data;
    })
  }

  onGridReadyIngresos(params) {
    this.gridIngresos = params;

    setTimeout(()=>{
      this.gridIngresos.api.sizeColumnsToFit();
      //this.autoSizeAll(false, params.columnApi);
      this.gridIngresos.api.setHeaderHeight(18);
    }, 250)
    
  }

  onGridReadyEgresos(params) {
    this.gridEgresos = params;

    setTimeout(()=>{
      this.gridEgresos.api.sizeColumnsToFit();
      //this.autoSizeAll(false, params.columnApi);
      this.gridEgresos.api.setHeaderHeight(18);
    }, 250)
    
  }

  autoSizeAll(skipHeader, column) {
    const allColumnIds = [];
    column.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });
    column.autoSizeColumns(allColumnIds, skipHeader);
  }

  newDataForm(data: any = null){
    if(data == null){
      this.dataForm = new FormGroup({
        transferencia: new FormControl(0),
        fecha: new FormControl(this.formatDate(new Date())),
        turno: new FormControl(1),
        concepto: new FormControl(null),
        asiento: new FormControl(null),
        totalIngresos: new FormControl(this.formatNumber(0)),
        totalEgresos: new FormControl(this.formatNumber(0)),
        diferencia: new FormControl(this.formatNumber(0)),
      })

      this.ingresos.push({fecha: this.datepipe.transform(new Date(), 'dd/MM/yyyy')});
      this.egresos.push({fecha: this.datepipe.transform(new Date(), 'dd/MM/yyyy')});

    }else{
      this.dataForm = new FormGroup({
        transferencia: new FormControl(this.dataForm.controls['transferencia'].value),
        fecha: new FormControl(this.formatDate(data.fecha)),
        turno: new FormControl(data.turno),
        concepto: new FormControl(data.concepto),
        asiento: new FormControl(data.asiento),
        totalIngresos: new FormControl(this.formatNumber(data.totalIngresos)),
        totalEgresos: new FormControl(this.formatNumber(data.totalEgresos)),
        diferencia: new FormControl(this.formatNumber(Number(data.totalIngresos) - Number(data.totalEgreso)))
      })      
    }
    
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

  formatNumber(numero: any){
    return numero == null ? '' : Number(numero).toFixed(2);
  }

  transferenciaKeyDown(event){
    if(event.keyCode == 13){
      this.getTransferencias();
    }
  }

  getTransferencias(){
    this.tranferSrv.getTransferencia(this.dataForm.controls['transferencia'].value).toPromise().then(result => {
      if(result.data.cabecera){
        this.newDataForm(result.data.cabecera);
        this.ingresos = result.data.ingresos.map(elt =>{
          elt.fecha = this.datepipe.transform(new Date(elt.fecha), 'dd/MM/yyyy');
          return elt;
        });
        this.egresos = result.data.egresos.map(elt =>{
          elt.fecha = this.datepipe.transform(new Date(elt.fecha), 'dd/MM/yyyy');
          return elt;
        });

        setTimeout(()=>{
          this.sumarImportes();
        }, 500)
      }
    })

    
  }

  removeSelected(grid, withDate = false) {
    const selectedData = grid.getSelectedRows();
    const res = grid.applyTransaction({ remove: selectedData });

    let i = this.cheques.findIndex(elt => elt.cheque == Number(selectedData.cheque));

    if(i != -1){
      this.cheques.splice(i, 1);
    }

    this.sumarImportes();

    if(grid.getDisplayedRowCount()==0){
      if(withDate){
        grid.applyTransaction({add: [{fecha: this.datepipe.transform(new Date(), 'dd/MM/yyyy')}]});
      }else{
        grid.applyTransaction({add: [{}]});
      }
      
    }

  }

  sumarImportes(){
    let totalIngresos = 0;

    this.gridIngresos.api.forEachNode(async (rowNode, index) => {
      totalIngresos += Number(rowNode.data.importe == undefined ? 0 : rowNode.data.importe);
    })
    
    this.dataForm.controls['totalIngresos'].setValue(totalIngresos.toFixed(2));

    let totalEgresos = 0;

    this.gridEgresos.api.forEachNode(async (rowNode, index) => {
      totalEgresos += Number(rowNode.data.importe == undefined ? 0 : rowNode.data.importe);
    })
    
    this.dataForm.controls['totalEgresos'].setValue(totalEgresos.toFixed(2));

    let diferencia = totalIngresos - totalEgresos;

    this.dataForm.controls['diferencia'].setValue(diferencia.toFixed(2));

  }

  limpiar(){
    this.ingresos = [];
    this.egresos = [];
    this.newDataForm();
  }

  trash(){
    Swal.fire({
      text: '¿Desea borrar la Transferencia?',
      showCancelButton: true,
      confirmButtonText: 'Si',
      customClass: {
        confirmButton: 'btn btn-danger btn-sm mr-2',
        cancelButton: 'btn btn-secondary btn-sm mr-2'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.tranferSrv.deleteTransferencia(this.dataForm.controls['transferencia'].value).toPromise().then(result =>{
          let data = {
            id: this.dataForm.controls['asiento'].value,
            it: 0
          }
          this.asientoSrv.delete(data).subscribe(result => {
            this.toastr.success("Se borró correctamente.", 'Transferencias', { closeButton: true, timeOut: 4000 });
            this.limpiar();
          }, error => {
            this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
          })          
        }, error => {
          this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
        })
      }
    })
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

  onBtStartEditing(grid, column, row, key) {    
    grid.startEditingCell({
      rowIndex: row,
      colKey: column,
      keyPress: key,
      charPress: key
    });
  }

  validatePromise(): Promise<boolean>{
    return new Promise<boolean>(async (resolve, reject) => {
      // valida fecha del ejercicio
      await this.ejercicioSrv.getEjercicioByFecha(this.dataForm.controls['fecha'].value).toPromise().then(result => {
        this.ejercicio = result.data.id;
      }).catch(error => {
        this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
        reject(false);
      })

      // valida cierre mes
      await this.ejercicioSrv.validaCierreMes(this.dataForm.controls['fecha'].value).toPromise().then(result => {

      }).catch(error => {
        this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
        reject(false);
      })

      // diferencia
      if(Number(this.dataForm.controls['diferencia'].value != 0)){
        this.toastr.error('La diferencia debe ser 0.', 'Transferencias', { closeButton: true, timeOut: 3000 });
        reject(false);
      }

      // valida existencia de datos
      let count = 0;

      await this.gridIngresos.api.forEachNode(async (rowNode, index) => {
        if(rowNode.data.moneda || rowNode.data.interno){
          count++;
        }
      })

      if(count == 0){
        this.toastr.error('No hay datos de ingresos para guardar.', 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
        reject(false);
      }

      count = 0;

      await this.gridEgresos.api.forEachNode(async (rowNode, index) => {
        if(rowNode.data.moneda || rowNode.data.interno){
          count++;
        }
      })

      if(count == 0){
        this.toastr.error('No hay datos de egresos para guardar.', 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
        reject(false);
      }

      // valida cheques
      let dataObj = this.dataForm.getRawValue();
      
      await this.gridIngresos.api.forEachNode(async (rowNode, index) => {
        if(rowNode.data.moneda || rowNode.data.interno ){
          let monedaRow = this.monedas.find(elt => elt.codigo == rowNode.data.moneda);
          let cuentaRow = this.cuentas.find(elt => elt.id.trim() == monedaRow.cuenta.trim());

          if(monedaRow.tipo == 2){
            let movimiento = {
              codigo: Number(rowNode.data.moneda),
              turno: dataObj.turno,
              movimiento: 1,
              interno: Number(rowNode.data.interno),
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
              console.log(result)
            }).catch( error => {
              console.log(error)
              reject("Nro de cheque: " + rowNode.data?.cheque + ". " + error.error.message);
            });
          }
        }
      })

      await this.gridEgresos.api.forEachNode(async (rowNode, index) => {
        if(rowNode.data.moneda || rowNode.data.interno ){
          let monedaRow = this.monedas.find(elt => elt.codigo == rowNode.data.moneda);
          let cuentaRow = this.cuentas.find(elt => elt.id.trim() == monedaRow.cuenta.trim());

          if(monedaRow.tipo == 2){
            let movimiento = {
              codigo: Number(rowNode.data.moneda),
              turno: dataObj.turno,
              movimiento: 2,
              interno: Number(rowNode.data.interno),
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
              console.log(result)
            }).catch( error => {
              console.log(error)
              reject("Nro de cheque: " + rowNode.data?.cheque + ". " + error.error.message);
            });
          }
        }
      })

      
      
      setTimeout( () => {
        resolve(true);
      }, 500);
    })
  }

  async onCellKeyPressIngresos(event){
    if(event.event.charCode == 13){
      if(event.colDef.field == 'observaciones'){
        this.gridIngresos.api.applyTransaction({add: [{fechaCheque: this.datepipe.transform(new Date(), 'dd/MM/yyyy')}]});
        this.moveNextCell(this.gridIngresos.api, this.columnDefsIngresos, event);22
      }

      if(event.colDef.field == 'interno'){
        if(event.data.interno == undefined){
          this.editCurrentCell(this.gridIngresos.api, this.columnDefsIngresos, event);
          return;
        }

        await this.chequeSrv.validaCheque(event.data.interno, this.dataForm.controls['turno'].value).toPromise().then(result => {
          if(result.data){
            this.onBtStartEditing(this.gridIngresos.api, 'moneda', event.rowIndex, result.data.moneda )
            this.onBtStartEditing(this.gridIngresos.api, 'nombreMoneda', event.rowIndex, result.data.nombreMoneda )
            this.onBtStartEditing(this.gridIngresos.api, 'fecha', event.rowIndex, this.datepipe.transform(new Date(result.data.fechaCheque), 'dd/MM/yyyy') )
            this.onBtStartEditing(this.gridIngresos.api, 'banco', event.rowIndex, result.data.banco )
            this.onBtStartEditing(this.gridIngresos.api, 'sucursal', event.rowIndex, result.data.sucursal )
            this.onBtStartEditing(this.gridIngresos.api, 'cp', event.rowIndex, result.data.cp )
            this.onBtStartEditing(this.gridIngresos.api, 'cheque', event.rowIndex, result.data.cheque )
            this.onBtStartEditing(this.gridIngresos.api, 'cuit', event.rowIndex, result.data.cuenta )
            this.onBtStartEditing(this.gridIngresos.api, 'importe', event.rowIndex, result.data.importe )
            this.onBtStartEditing(this.gridIngresos.api, 'observaciones', event.rowIndex, result.data.observaciones )

            this.gridIngresos.api.stopEditing();
            this.moveCellByField(this.gridIngresos.api, this.columnDefsIngresos, event, 'fechaAcreditacion');

          }else{
            this.editCurrentCell(this.gridIngresos.api, this.columnDefsIngresos, event);
            this.toastr.error("Cheque no encontrada.", 'Transferencias', { closeButton: true, timeOut: 3000 });
          }
          
        }).catch(error => {
          event.data.interno = '';
          event.data.moneda = '';
          event.data.nombreMoneda = '';
          event.data.fecha = '';
          event.data.banco = '';
          event.data.sucursal = '';
          event.data.cp = '';
          event.data.cheque = '';
          event.data.cuit = '';
          event.data.importe = '';
          event.data.observaciones = '';
          this.onBtStartEditing(this.gridIngresos.api, 'interno', event.rowIndex, '' )
          this.onBtStartEditing(this.gridIngresos.api, 'moneda', event.rowIndex, '' )
          this.onBtStartEditing(this.gridIngresos.api, 'nombreMoneda', event.rowIndex, '' )
          this.onBtStartEditing(this.gridIngresos.api, 'fecha', event.rowIndex, '' )
          this.onBtStartEditing(this.gridIngresos.api, 'banco', event.rowIndex, '' )
          this.onBtStartEditing(this.gridIngresos.api, 'sucursal', event.rowIndex, '' )
          this.onBtStartEditing(this.gridIngresos.api, 'cp', event.rowIndex, '' )
          this.onBtStartEditing(this.gridIngresos.api, 'cheque', event.rowIndex, '' )
          this.onBtStartEditing(this.gridIngresos.api, 'cuit', event.rowIndex, '' )
          this.onBtStartEditing(this.gridIngresos.api, 'importe', event.rowIndex, '' )
          this.onBtStartEditing(this.gridIngresos.api, 'observaciones', event.rowIndex, '' )

          this.editCurrentCell(this.gridIngresos.api, this.columnDefsIngresos, event);
          this.gridIngresos.api.stopEditing();
          this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 3000 });
        })
      }

      if(event.colDef.field == 'moneda'){
        if(event.data.moneda == undefined){
          this.editCurrentCell(this.gridIngresos.api, this.columnDefsIngresos, event);
          return;
        }

        await this.monedaSrv.validaMoneda(event.data.moneda).toPromise().then(result => {
          if(result.data){
            this.onBtStartEditing(this.gridIngresos.api, 'interno', event.rowIndex, '' )
            this.onBtStartEditing(this.gridIngresos.api, 'nombreMoneda', event.rowIndex, result.data.nombre )
            this.onBtStartEditing(this.gridIngresos.api, 'fecha', event.rowIndex, this.datepipe.transform(new Date(), 'dd/MM/yyyy'))
            this.onBtStartEditing(this.gridIngresos.api, 'banco', event.rowIndex, result.data.banco )
            this.onBtStartEditing(this.gridIngresos.api, 'sucursal', event.rowIndex, result.data.sucursal )
            this.onBtStartEditing(this.gridIngresos.api, 'cp', event.rowIndex, result.data.cp )
            this.onBtStartEditing(this.gridIngresos.api, 'cheque', event.rowIndex, result.data.cheque )
            this.onBtStartEditing(this.gridIngresos.api, 'cuenta', event.rowIndex, result.data.cuenta )
            this.onBtStartEditing(this.gridIngresos.api, 'importe', event.rowIndex, null )
            this.onBtStartEditing(this.gridIngresos.api, 'observaciones', event.rowIndex, '' )
            
            this.gridIngresos.api.stopEditing();
            
            if(result.data.tipo == 3){
              this.moveCellByField(this.gridIngresos.api, this.columnDefsIngresos, event, 'importe');
            }else{
              this.moveNextCell(this.gridIngresos.api, this.columnDefsIngresos, event);
            }
          }
          
        }).catch(error => {
          this.editCurrentCell(this.gridIngresos.api, this.columnDefsIngresos, event);
          this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 3000 });
        })
      }

      if(event.colDef.field == 'cheque'){
        if(event.data.cheque == undefined || event.data.cheque == ''){
          this.moveNextCell(this.gridIngresos.api, this.columnDefsIngresos, event);
          return;
        }

        await this.monedaSrv.validaMoneda(event.data.moneda).toPromise().then(moneda => {
          if(moneda.data){
            if(moneda.data.tipo != 1){
              this.moveNextCell(this.gridIngresos.api, this.columnDefsIngresos, event);
              return;
            }

            this.chequeSrv.validaBancoCheque(moneda.data.codigo, event.data.cheque).toPromise().then(result => {
              console.log(result);
              let i = this.cheques.findIndex(elt => elt.cheque == Number(event.data.cheque));

              if(i != -1){
                this.cheques[i] = { cheque: event.data.cheque, id: result.data.id };
              }else{
                this.cheques.push({ cheque: event.data.cheque, id: result.data.id });
              }

              this.moveNextCell(this.gridIngresos.api, this.columnDefsIngresos, event);

            }).catch(error => {
              event.data.cheque = '';
              this.onBtStartEditing(this.gridIngresos.api, 'cheque', event.rowIndex, '' )
              this.editCurrentCell(this.gridIngresos.api, this.columnDefsIngresos, event);
              if(error.status == 400){
                this.toastr.error('El número de cheque no es correcto.', 'Transferencias', { closeButton: true, timeOut: 4000 });
              }else{
                this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
              }
            })

          }
          
        }).catch(error => {
          this.moveNextCell(this.gridIngresos.api, this.columnDefsIngresos, event);
          this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 3000 });
        })

      }

      if(event.colDef.field == 'banco'){
        if(event.data.banco == undefined || event.data.banco == ''){
          this.moveNextCell(this.gridIngresos.api, this.columnDefsIngresos, event);
          return;
        }
        
        let bancoIndex = this.bancos.findIndex(elt => elt.codigo.trim() == event.data.banco.trim())

        if(bancoIndex == -1){
          this.onBtStartEditing(this.gridIngresos.api, 'banco', event.rowIndex, '' )
          this.editCurrentCell(this.gridIngresos.api, this.columnDefsIngresos, event);
          this.toastr.error("El código de banco "+event.data.banco.trim()+" no existe.", 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
          return;
        }else{
          this.moveNextCell(this.gridIngresos.api, this.columnDefsIngresos, event);
        }

      }

      if(event.colDef.field == 'fecha'){
        var timestamp = Date.parse(this.toSqlDate(event.data.fecha));

        if (isNaN(timestamp)) {
          console.log('Invalida')
          event.data.fecha = '';
          this.onBtStartEditing(this.gridIngresos.api, 'fecha', event.rowIndex, '' )
          this.editCurrentCell(this.gridIngresos.api, this.columnDefsIngresos, event);
          this.toastr.error('La fecha no es válida.', 'Transferencias', { closeButton: true, timeOut: 4000 });
          return;
        }else{
          console.log('valida')
        }
      }

      if(event.colDef.field != 'banco' && event.colDef.field != 'cheque' && event.colDef.field != 'interno' && event.colDef.field != 'observaciones' && event.colDef.field != 'moneda'){
        this.moveNextCell(this.gridIngresos.api, this.columnDefsIngresos, event);
      }

      this.sumarImportes();
      
    }
  }

  async onCellKeyPressEgresos(event){
    if(event.event.charCode == 13){
      if(event.colDef.field == 'observaciones'){
        this.gridEgresos.api.applyTransaction({add: [{fechaCheque: this.datepipe.transform(new Date(), 'dd/MM/yyyy')}]});
        this.moveNextCell(this.gridEgresos.api, this.columnDefsEgresos, event);22
      }

      if(event.colDef.field == 'interno'){
        if(event.data.interno == undefined){
          this.editCurrentCell(this.gridEgresos.api, this.columnDefsEgresos, event);
          return;
        }

        await this.chequeSrv.validaCheque(event.data.interno, this.dataForm.controls['turno'].value).toPromise().then(result => {
          if(result.data){
            this.onBtStartEditing(this.gridEgresos.api, 'moneda', event.rowIndex, result.data.moneda )
            this.onBtStartEditing(this.gridEgresos.api, 'nombreMoneda', event.rowIndex, result.data.nombreMoneda )
            this.onBtStartEditing(this.gridEgresos.api, 'fecha', event.rowIndex, this.datepipe.transform(new Date(result.data.fechaCheque), 'dd/MM/yyyy') )
            this.onBtStartEditing(this.gridEgresos.api, 'banco', event.rowIndex, result.data.banco )
            this.onBtStartEditing(this.gridEgresos.api, 'sucursal', event.rowIndex, result.data.sucursal )
            this.onBtStartEditing(this.gridEgresos.api, 'cp', event.rowIndex, result.data.cp )
            this.onBtStartEditing(this.gridEgresos.api, 'cheque', event.rowIndex, result.data.cheque )
            this.onBtStartEditing(this.gridEgresos.api, 'cuit', event.rowIndex, result.data.cuenta )
            this.onBtStartEditing(this.gridEgresos.api, 'importe', event.rowIndex, result.data.importe )
            this.onBtStartEditing(this.gridEgresos.api, 'observaciones', event.rowIndex, result.data.observaciones )

            this.gridEgresos.api.stopEditing();
            this.moveCellByField(this.gridEgresos.api, this.columnDefsEgresos, event, 'fechaAcreditacion');

          }else{
            this.editCurrentCell(this.gridEgresos.api, this.columnDefsEgresos, event);
            this.toastr.error("Cheque no encontrada.", 'Transferencias', { closeButton: true, timeOut: 3000 });
          }
          
        }).catch(error => {
          event.data.interno = '';
          event.data.moneda = '';
          event.data.nombreMoneda = '';
          event.data.fecha = '';
          event.data.banco = '';
          event.data.sucursal = '';
          event.data.cp = '';
          event.data.cheque = '';
          event.data.cuit = '';
          event.data.importe = '';
          event.data.observaciones = '';
          this.onBtStartEditing(this.gridEgresos.api, 'interno', event.rowIndex, '' )
          this.onBtStartEditing(this.gridEgresos.api, 'moneda', event.rowIndex, '' )
          this.onBtStartEditing(this.gridEgresos.api, 'nombreMoneda', event.rowIndex, '' )
          this.onBtStartEditing(this.gridEgresos.api, 'fecha', event.rowIndex, '' )
          this.onBtStartEditing(this.gridEgresos.api, 'banco', event.rowIndex, '' )
          this.onBtStartEditing(this.gridEgresos.api, 'sucursal', event.rowIndex, '' )
          this.onBtStartEditing(this.gridEgresos.api, 'cp', event.rowIndex, '' )
          this.onBtStartEditing(this.gridEgresos.api, 'cheque', event.rowIndex, '' )
          this.onBtStartEditing(this.gridEgresos.api, 'cuit', event.rowIndex, '' )
          this.onBtStartEditing(this.gridEgresos.api, 'importe', event.rowIndex, '' )
          this.onBtStartEditing(this.gridEgresos.api, 'observaciones', event.rowIndex, '' )

          this.editCurrentCell(this.gridEgresos.api, this.columnDefsEgresos, event);
          this.gridEgresos.api.stopEditing();
          this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 3000 });
        })
      }

      if(event.colDef.field == 'moneda'){
        if(event.data.moneda == undefined){
          this.editCurrentCell(this.gridEgresos.api, this.columnDefsEgresos, event);
          return;
        }

        await this.monedaSrv.validaMoneda(event.data.moneda).toPromise().then(result => {
          if(result.data){
            this.onBtStartEditing(this.gridEgresos.api, 'interno', event.rowIndex, '' )
            this.onBtStartEditing(this.gridEgresos.api, 'nombreMoneda', event.rowIndex, result.data.nombre )
            this.onBtStartEditing(this.gridEgresos.api, 'fecha', event.rowIndex, this.datepipe.transform(new Date(), 'dd/MM/yyyy'))
            this.onBtStartEditing(this.gridEgresos.api, 'banco', event.rowIndex, result.data.banco )
            this.onBtStartEditing(this.gridEgresos.api, 'sucursal', event.rowIndex, result.data.sucursal )
            this.onBtStartEditing(this.gridEgresos.api, 'cp', event.rowIndex, result.data.cp )
            this.onBtStartEditing(this.gridEgresos.api, 'cheque', event.rowIndex, result.data.cheque )
            this.onBtStartEditing(this.gridEgresos.api, 'cuenta', event.rowIndex, result.data.cuenta )
            this.onBtStartEditing(this.gridEgresos.api, 'importe', event.rowIndex, null )
            this.onBtStartEditing(this.gridEgresos.api, 'observaciones', event.rowIndex, '' )
            
            this.gridEgresos.api.stopEditing();
            
            if(result.data.tipo == 3){
              this.moveCellByField(this.gridEgresos.api, this.columnDefsEgresos, event, 'importe');
            }else{
              this.moveNextCell(this.gridEgresos.api, this.columnDefsEgresos, event);
            }
          }
          
        }).catch(error => {
          this.editCurrentCell(this.gridEgresos.api, this.columnDefsEgresos, event);
          this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 3000 });
        })
      }

      if(event.colDef.field == 'cheque'){
        if(event.data.cheque == undefined || event.data.cheque == ''){
          this.moveNextCell(this.gridEgresos.api, this.columnDefsEgresos, event);
          return;
        }

        await this.monedaSrv.validaMoneda(event.data.moneda).toPromise().then(moneda => {
          if(moneda.data){
            if(moneda.data.tipo != 1){
              this.moveNextCell(this.gridEgresos.api, this.columnDefsEgresos, event);
              return;
            }

            this.chequeSrv.validaBancoCheque(moneda.data.codigo, event.data.cheque).toPromise().then(result => {
              console.log(result);
              let i = this.cheques.findIndex(elt => elt.cheque == Number(event.data.cheque));

              if(i != -1){
                this.cheques[i] = { cheque: event.data.cheque, id: result.data.id };
              }else{
                this.cheques.push({ cheque: event.data.cheque, id: result.data.id });
              }

              this.moveNextCell(this.gridEgresos.api, this.columnDefsEgresos, event);

            }).catch(error => {
              event.data.cheque = '';
              this.onBtStartEditing(this.gridEgresos.api, 'cheque', event.rowIndex, '' )
              this.editCurrentCell(this.gridEgresos.api, this.columnDefsEgresos, event);
              if(error.status == 400){
                this.toastr.error('El número de cheque no es correcto.', 'Transferencias', { closeButton: true, timeOut: 4000 });
              }else{
                this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
              }
            })

          }
          
        }).catch(error => {
          this.moveNextCell(this.gridEgresos.api, this.columnDefsEgresos, event);
          this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 3000 });
        })

      }

      if(event.colDef.field == 'banco'){
        if(event.data.banco == undefined || event.data.banco == ''){
          this.moveNextCell(this.gridEgresos.api, this.columnDefsEgresos, event);
          return;
        }
        
        let bancoIndex = this.bancos.findIndex(elt => elt.codigo.trim() == event.data.banco.trim())

        if(bancoIndex == -1){
          this.onBtStartEditing(this.gridEgresos.api, 'banco', event.rowIndex, '' )
          this.editCurrentCell(this.gridEgresos.api, this.columnDefsEgresos, event);
          this.toastr.error("El código de banco "+event.data.banco.trim()+" no existe.", 'Ingresos y Egresos', { closeButton: true, timeOut: 3000 });
          return;
        }else{
          this.moveNextCell(this.gridEgresos.api, this.columnDefsEgresos, event);
        }

      }

      if(event.colDef.field == 'fecha'){
        var timestamp = Date.parse(this.toSqlDate(event.data.fecha));

        if (isNaN(timestamp)) {
          console.log('Invalida')
          event.data.fecha = '';
          this.onBtStartEditing(this.gridEgresos.api, 'fecha', event.rowIndex, '' )
          this.editCurrentCell(this.gridEgresos.api, this.columnDefsEgresos, event);
          this.toastr.error('La fecha no es válida.', 'Transferencias', { closeButton: true, timeOut: 4000 });
          return;
        }else{
          console.log('valida')
        }
      }

      if(event.colDef.field != 'banco' && event.colDef.field != 'cheque' && event.colDef.field != 'interno' && event.colDef.field != 'observaciones' && event.colDef.field != 'moneda'){
        this.moveNextCell(this.gridEgresos.api, this.columnDefsEgresos, event);
      }

      this.sumarImportes();
      
    }
  }

  async getCantidadDatos(){
    let datosCount = 0;

    await this.gridIngresos.api.forEachNode(async (rowNode, index) => {
      if(rowNode.data.moneda || rowNode.data.interno){
        datosCount++;
      }
    })

    return datosCount;
  }

  async save(){
   
    // ------------------------
    // --------- datos --------
    // ------------------------
    let dataObj = this.dataForm.getRawValue();
    let asientoId = dataObj.asiento;
    let ejercicio = this.ejercicio;
    let it = 0;
    

    // ---------------------------------
    // ----- numeracion de asiento -----
    // ---------------------------------
    if(dataObj.asiento && dataObj.asiento != null){
      asientoId = dataObj.asiento;
    }else{
      await this.asientoSrv.getAsientoNumeracion().toPromise().then(result =>{
        asientoId = result.data.id;
        this.dataForm.controls['asiento'].setValue(asientoId);
      })
    }

    // -------------------------------------
    // ----- grabar movimiento ingreso -----
    // -------------------------------------
    await this.gridIngresos.api.forEachNode(async (rowNode, index) => {      
      if(rowNode.data.moneda || rowNode.data.interno ){
        let monedaRow = this.monedas.find(elt => elt.codigo == rowNode.data.moneda);
        let cuentaRow = this.cuentas.find(elt => elt.id.trim() == monedaRow.cuenta.trim());

        let asiento = {
          ejercicio: ejercicio,
          id: asientoId,
          it: it++,
          fecha: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
          concepto: "Transferencia de Fondos",
          cuenta: cuentaRow.id,
          debe: Number(rowNode.data.importe), 
          haber: 0,
          costo: null,
          comprobante: dataObj.concepto,
          observaciones: rowNode.data.observaciones,
          generado: 'CAJ'
        }

        await this.asientoSrv.add(asiento).then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
        });
      }
    })

    // ------------------------------------
    // ----- grabar asiento egreso -----
    // ------------------------------------
    await this.gridEgresos.api.forEachNode(async (rowNode, index) => {      
      if(rowNode.data.moneda || rowNode.data.interno ){
        let monedaRow = this.monedas.find(elt => elt.codigo == rowNode.data.moneda);
        let cuentaRow = this.cuentas.find(elt => elt.id.trim() == monedaRow.cuenta.trim());

        let asiento = {
          ejercicio: ejercicio,
          id: asientoId,
          it: it++,
          fecha: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
          concepto: 'Transferencia de Fondos',
          cuenta: cuentaRow.id,
          debe: 0, 
          haber: Number(rowNode.data.importe),
          costo: null,
          comprobante: dataObj.concepto,
          observaciones: rowNode.data.observaciones,
          generado: 'CAJ'
        }

        await this.asientoSrv.add(asiento).then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
        });
      }
    })

    // ------------------------------------
    // ----- grabar movimiento egreso -----
    // ------------------------------------
    let movimientoEgreso = null;

    // grabo la cabecera del movimiento de egreso
    let requestEgreso = {
      numero: null,
      fecha: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
      movimiento: 2, // egreso
      tipo: null,
      concepto: 'Transferencia de Fondos',
      observaciones: null,
      asiento: asientoId,
      turno: dataObj.turno,
      importeCuentas: Number(dataObj.totalIngresos),
      importeRetencionesDebe: 0,
      importeRetencionesHaber: 0,
      importeMonedas: Number(dataObj.totalEgresos)
    }

    await this.moviSrv.createMovimiento(requestEgreso).toPromise().then(result => {
      movimientoEgreso = result.data.id;
      this.egreso = movimientoEgreso;
    }).catch(error => {
      this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
      return;
    });

    // movimientos de egreso
    this.gridEgresos.api.forEachNode(async (rowNode, index) => {
      if(rowNode.data.moneda || rowNode.data.interno){
        let monedaRow = this.monedas.find(elt => elt.codigo == rowNode.data.moneda);
        let cuentaRow = this.cuentas.find(elt => elt.id.trim() == monedaRow.cuenta.trim());
        let chequeraIndex = this.cheques.findIndex(elt => elt.cheque == Number(rowNode.data.cheque));
      
        // cuenta
        let movimientoCta = {
          numero: movimientoEgreso,
          it: index,
          cuenta: cuentaRow.id,
          nombreCuenta: cuentaRow.nombre,
          importe: Number(rowNode.data.importe)
        }
      
        await this.moviSrv.createMovimientoCuenta(movimientoCta).toPromise().then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
        });

        // banco
        if(monedaRow.tipo == 1){
          let movimientoBanco = {
            codigo: Number(rowNode.data.moneda),
            chequera: chequeraIndex != -1 ? this.cheques[chequeraIndex].id : null,
            extraccion: null,
            cheque: Number(rowNode.data.cheque),
            fechaEmision: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
            fecha: rowNode.data.fecha ? this.toSqlDate(rowNode.data.fecha) : null,
            observacion: rowNode.data.observaciones,
            proveedor: null,
            nombreProveedor: null,
            debe: Number(rowNode.data.importe), 
            haber: 0
          }

          await this.moviSrv.createMovimientoMonedaBanco(movimientoBanco).toPromise().then(result => {
            console.log(result)
            rowNode.data.extraccion = result.data.id;
          }).catch( error => {
            console.log(error)
            this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
          });
        }

        // valores
        if(monedaRow.tipo == 2){
          let movimientoValores = {
            codigo: Number(rowNode.data.moneda),
            turno: dataObj.turno,
            movimiento: 2,
            interno: rowNode.data.interno ? Number(rowNode.data.interno) : null,
            banco: rowNode.data.banco,
            sucursal: rowNode.data.sucursal,
            cp: rowNode.data.cp,
            cheque: Number(rowNode.data?.cheque),
            cuit: rowNode.data.cuit,
            fechaEmision: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
            fecha: rowNode.data.fecha ? this.toSqlDate(rowNode.data.fecha) : null,
            importe: Number(rowNode.data.importe),
            observaciones: rowNode.data.observaciones,
            cliente: null,
            nombreCliente: null,
            proveedor: null,
            nombreProveedor: null
          }
  
          await this.moviSrv.createMovimientoMonedaValores(movimientoValores).toPromise().then(result => {
            console.log(result)
            rowNode.data.interno = result.data.id;
            this.onBtStartEditing(this.gridEgresos.api, 'interno', index, rowNode.data.interno )
          }).catch( error => {
            console.log(error)
            this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
          });
        }

        // moneda
        let movimiento = {
          numero: movimientoEgreso,
          it: index,
          fecha: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
          movimiento: 2,
          turno: dataObj.turno,
          moneda: Number(rowNode.data.moneda),
          chequera: chequeraIndex != -1 ? this.cheques[chequeraIndex].id : null,
          extraccion: rowNode.data.extraccion,
          interno: Number(rowNode.data?.interno),
          cheque: Number(rowNode.data?.cheque),
          cotizacion: 1,
          importe: Number(rowNode.data?.importe),
          observaciones: rowNode.data?.observaciones
        }

        await this.moviSrv.createMovimientoMoneda(movimiento).toPromise().then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
        });
      }
    })    

    // -------------------------------------
    // ----- grabar movimiento ingreso -----
    // -------------------------------------
    let movimientoIngreso = null;

    // grabo la cabecera del movimiento
    let requestIngreso = {
      numero: null,
      fecha: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
      movimiento: 1, // ingreso
      tipo: null,
      concepto: 'Transferencia de Fondos',
      observaciones: null,
      asiento: asientoId,
      turno: dataObj.turno,
      importeCuentas: Number(dataObj.totalEgresos),
      importeRetencionesDebe: 0,
      importeRetencionesHaber: 0,
      importeMonedas: Number(dataObj.totalIngresos)
    }

    await this.moviSrv.createMovimiento(requestIngreso).toPromise().then(result => {
      movimientoIngreso = result.data.id;
      this.ingreso = movimientoIngreso;
    });

    // movimientos de ingreso
    await this.gridIngresos.api.forEachNode(async (rowNode, index) => {
      if(rowNode.data.moneda || rowNode.data.interno){
        let monedaRow = this.monedas.find(elt => elt.codigo == rowNode.data.moneda);
        let cuentaRow = this.cuentas.find(elt => elt.id.trim() == monedaRow.cuenta.trim());
        let chequeraIndex = this.cheques.findIndex(elt => elt.cheque == Number(rowNode.data.cheque));

        // movimiento ingreso de cuenta
        let movimientoCta = {
          numero: movimientoIngreso,
          it: index,
          cuenta: cuentaRow.id,
          nombreCuenta: cuentaRow.nombre,
          importe: Number(rowNode.data.importe)
        }

        await this.moviSrv.createMovimientoCuenta(movimientoCta).toPromise().then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
        });

        // banco    
        if(monedaRow.tipo == 1){
          let movimientoBanco = {
            codigo: Number(rowNode.data.moneda),
            chequera: chequeraIndex != -1 ? this.cheques[chequeraIndex].id : null,
            extraccion: null,
            cheque: Number(rowNode.data.cheque),
            fechaEmision: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
            fecha: rowNode.data.fecha ? this.toSqlDate(rowNode.data.fecha) : null,
            observacion: rowNode.data?.observaciones,
            proveedor: null,
            nombreProveedor: null,
            debe: 0, 
            haber: Number(rowNode.data.importe)
          }

          await this.moviSrv.createMovimientoMonedaBanco(movimientoBanco).toPromise().then(result => {
            console.log(result)
            rowNode.data.extraccion = result.data.id;
          }).catch( error => {
            console.log(error)
            this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
          });
        }

        // valores      
        if(monedaRow.tipo == 2){
          let movimientoValores = {
            codigo: Number(rowNode.data.moneda),
            turno: dataObj.turno,
            movimiento: 1,
            interno: rowNode.data.interno ? Number(rowNode.data.interno) : null,
            banco: rowNode.data.banco,
            sucursal: rowNode.data.sucursal,
            cp: rowNode.data.cp,
            cheque: Number(rowNode.data?.cheque),
            cuit: rowNode.data.cuit,
            fechaEmision: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
            fecha: rowNode.data.fecha ? this.toSqlDate(rowNode.data.fecha) : null,
            importe: Number(rowNode.data.importe),
            observaciones: rowNode.data.observaciones,
            cliente: null,
            nombreCliente: null,
            proveedor: null,
            nombreProveedor: null
          }
  
          await this.moviSrv.createMovimientoMonedaValores(movimientoValores).toPromise().then(result => {
            console.log(result)
            rowNode.data.interno = result.data.id;
            this.onBtStartEditing(this.gridIngresos.api, 'interno', index, rowNode.data.interno )
          }).catch( error => {
            console.log(error)
            this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
          });
        }

        // movimiento
        let movimiento = {
          numero: movimientoIngreso,
          it: index,
          fecha: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
          movimiento: 1,
          turno: dataObj.turno,
          moneda: Number(rowNode.data.moneda),
          chequera: chequeraIndex != -1 ? this.cheques[chequeraIndex].id : null,
          extraccion: rowNode.data?.extraccion,
          interno: Number(rowNode.data?.interno),
          cheque: Number(rowNode.data?.cheque),
          cotizacion: 1,
          importe: Number(rowNode.data?.importe),
          observaciones: rowNode.data?.observaciones
        }

        await this.moviSrv.createMovimientoMoneda(movimiento).toPromise().then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
        });
      }
    });

    // -------------------------------------
    // ----- Registro de transferencia -----
    // -------------------------------------
    
    // obtengo numeracion de la transferencia
    let transferenciaId = null;
    it = 0;

    await this.tranferSrv.getNumeracion().toPromise().then(result => {
      transferenciaId = result.data.id;
      this.dataForm.controls['transferencia'].setValue(transferenciaId)
    }).catch( error => {
      console.log(error)
      this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
      return;
    });

    await this.gridIngresos.api.forEachNode(async (rowNode, index) => {
      if(rowNode.data.moneda || rowNode.data.interno ){
        let chequeraIndex = this.cheques.findIndex(elt => elt.cheque == Number(rowNode.data.cheque));
        
        let transferencia = {
          transferencia: transferenciaId,
          it: it++,
          fecha: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
          turno: dataObj.turno,
          asiento: asientoId,
          concepto: dataObj.concepto,
          tipo: 'I',
          moneda: Number(rowNode.data.moneda),
          chequera: chequeraIndex != -1 ? this.cheques[chequeraIndex].id : null,
          extraccion: rowNode.data?.extraccion,
          interno: rowNode.data?.interno,
          cheque: Number(rowNode.data?.cheque),
          importe: Number(rowNode.data?.importe),
          ingreso: this.ingreso,
          egreso: this.egreso
        }

        console.log(transferencia)

        await this.tranferSrv.registroTransferencia(transferencia).toPromise().then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
        });

      }
    });
    
    await this.gridIngresos.api.forEachNode(async (rowNode, index) => {
      if(rowNode.data.moneda || rowNode.data.interno ){
        let chequeraIndex = this.cheques.findIndex(elt => elt.cheque == Number(rowNode.data.cheque));
        
        let transferencia = {
          transferencia: transferenciaId,
          it: it++,
          fecha: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
          turno: dataObj.turno,
          asiento: asientoId,
          concepto: dataObj.concepto,
          tipo: 'E',
          moneda: Number(rowNode.data.moneda),
          chequera: chequeraIndex != -1 ? this.cheques[chequeraIndex].id : null,
          extraccion: rowNode.data?.extraccion,
          interno: rowNode.data?.interno,
          cheque: Number(rowNode.data?.cheque),
          importe: Number(rowNode.data?.importe),
          ingreso: this.ingreso,
          egreso: this.egreso
        }

        console.log(transferencia)

        await this.tranferSrv.registroTransferencia(transferencia).toPromise().then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Transferencias', { closeButton: true, timeOut: 4000 });
        });

      }
    });
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
    this.validatePromise().then(result =>{
      this.savePromise().then(result => {
        //this.searchMovimientosMoneda(this.dataForm.controls['numero'].value);
        this.toastr.success("Los datos se grababaron con exito.", 'Ingresos y Egresos', { closeButton: true, timeOut: 4000 });
      }).catch(error => {
        this.toastr.success(error.Message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
      })
    })
    
  }

  getBancos(){
    this.bancoSrv.getBancos().subscribe(result => {
      this.bancos = result.data;
    })
  }

  toSqlDate(dateStr: string): string{
    if(!dateStr){
      return null;
    }
    let arr = dateStr.split('/'); // dd/MM/yyyy
    return arr[2] + '-' + arr[1] + '-' + arr[0]; // yyyy-MM-dd
  }

 


  
}
