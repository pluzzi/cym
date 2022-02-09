import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { ExcelService } from 'src/app/services/excel.service';
import { MonedaService } from 'src/app/services/caja/moneda.service';
import { PrintService } from 'src/app/services/print.service';
import { DepositoBancarioService } from 'src/app/services/caja/deposito-bancario.service';
import { ChequeraService } from 'src/app/services/caja/chequera.service';
import { EjercicioService } from 'src/app/services/ejercicio.service';
import { AsientoService } from 'src/app/services/contabilidad/asiento.service';
import { MovimientoService } from 'src/app/services/caja/movimiento.service';
import { CuentaService } from 'src/app/services/contabilidad/cuenta.service';
import { BancoService } from 'src/app/services/caja/banco.service';
import Swal from 'sweetalert2';
import * as  printJS from 'print-js';

@Component({
  selector: 'app-depositos-bancarios',
  templateUrl: './depositos-bancarios.component.html',
  styleUrls: ['./depositos-bancarios.component.css']
})
export class DepositosBancariosComponent implements OnInit {

  monedas: any[];
  grid: any;
  depositos: any[] = [];
  dataForm: FormGroup;
  cheques: any[] = [];
  cuentas: any[];
  ingreso: number;
  egreso: number;
  bancos: any[];
  dataPrint: any[];
  ejercicio: number;
  monedasBancos: any[];

  columnDefs = [
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
      field: 'fechaCheque', 
      headerName: 'Fecha',
      filter: true,
      /*
      cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      }
      */
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
      cellRenderer: params => {
        return this.formatNumber(params.value);
      }
    },
    { 
      field: 'fechaAcreditacion', 
      headerName: 'F. Acred.',
      filter: true,
      /*
      cellRenderer: params => {
        return this.datepipe.transform(params.value, 'dd/MM/yyyy') 
      }
      */
    },
    { 
      field: 'observaciones', 
      headerName: 'Observaciones',
      filter: true,
    }
    
  ];

  defaultColDef = {
    editable: true,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'},
    headerStyle: {fontSize: '5px !important'},
    suppressKeyboardEvent: params => {
      if (!params.editing) {
          let isDeleteKey = params.event.keyCode === 46;
      
          if(isDeleteKey){
            this.removeSelected(this.grid.api, true);
            return true
          }
      }
      
      return false;
    }
  };
  

  constructor(
    private route: Router,
    private toastr: ToastrService,
    private datepipe: DatePipe,
    private excelSrv: ExcelService,
    private monedaSrv: MonedaService,
    private printSrv: PrintService,
    private depBancSrv: DepositoBancarioService,
    private chequeSrv: ChequeraService,
    private ejercicioSrv: EjercicioService,
    private asientoSrv: AsientoService,
    private moviSrv: MovimientoService,
    private cuentaSrv: CuentaService,
    private bancoSrv: BancoService
  ) { }

  ngOnInit(): void {
    this.getMonedas();
    this.getMonedasBanco();
    this.getCuentas();
    this.newDataForm();
    this.getBancos();
  }

  getBancos(){
    this.bancoSrv.getBancos().subscribe(result => {
      this.bancos = result.data;
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
        grid.applyTransaction({add: [{fechaCheque: this.datepipe.transform(new Date(), 'dd/MM/yyyy')}]});
      }else{
        grid.applyTransaction({add: [{}]});
      }
      
    }

  }

  newDataForm(data: any = null){
    if(data == null){
      this.dataForm = new FormGroup({
        deposito: new FormControl(0),
        fecha: new FormControl(this.formatDate(new Date())),
        moneda: new FormControl(-1),
        turno: new FormControl(1),
        comprobante: new FormControl(null),
        asiento: new FormControl(null),
        total: new FormControl(this.formatNumber(0))
      })

      this.depositos.push({fechaCheque: this.datepipe.transform(new Date(), 'dd/MM/yyyy')});

    }else{
      this.dataForm = new FormGroup({
        deposito: new FormControl(data.deposito),
        fecha: new FormControl(this.formatDate(data.fecha)),
        moneda: new FormControl(data.moneda),
        turno: new FormControl(data.turno),
        comprobante: new FormControl(data.comprobante),
        asiento: new FormControl(data.asiento),
        total: new FormControl(this.formatNumber(data.importe))
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

  home(){
    this.route.navigate(['/home'], {  });
  }

  onGridReady(params) {
    this.grid = params;

    setTimeout(()=>{
      this.grid.api.sizeColumnsToFit();
      //this.autoSizeAll(false, params.columnApi);
      this.grid.api.setHeaderHeight(18);
    }, 250)
  }

  autoSizeAll(skipHeader, column) {
    const allColumnIds = [];
    column.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });
    column.autoSizeColumns(allColumnIds, skipHeader);
  }

  exportar(){
    this.excelSrv.export(this.depositos)
  }

  getMonedas(){
    this.monedaSrv.getMonedas(1,0).subscribe(result => {
      this.monedas = result.data;
    })
  }

  getMonedasBanco(){
    this.monedaSrv.getMonedas(0,1).subscribe(result => {
      this.monedasBancos = result.data;
    })
  }

  getCuentas(){
    this.cuentaSrv.getCuentas().subscribe(result => {
      this.cuentas = result.data;
    })
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

 

  trash(){
    Swal.fire({
      text: '¿Desea borrar el depósito?',
      showCancelButton: true,
      confirmButtonText: 'Si',
      customClass: {
        confirmButton: 'btn btn-danger btn-sm mr-2',
        cancelButton: 'btn btn-secondary btn-sm mr-2'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.depBancSrv.deleteDeposito(this.dataForm.controls['deposito'].value).toPromise().then(result =>{
          let data = {
            id: this.dataForm.controls['asiento'].value,
            it: 0
          }
          this.asientoSrv.delete(data).subscribe(result => {
            this.toastr.success("Se borró correctamente.", 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
            this.clear();
          }, error => {
            this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
          })          
        }, error => {
          this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
        })
      }
    })
  }

  clear(){
    this.newDataForm();
    this.getDepositos();
    this.cheques = [];
  }

  async save(){
    // ----------------------------------
    // --------- asiento moneda ---------
    // ----------------------------------
    let dataObj = this.dataForm.getRawValue();
    let asientoId = dataObj.asiento;
    let ejercicio = this.ejercicio;
    let it = 0;
    let moneda = this.monedas.find(elt => elt.codigo == dataObj.moneda);
    let cuenta = this.cuentas.find(elt => elt.id.trim() == moneda.cuenta.trim());

    // obtengo numeracion del asiento
    if(dataObj.asiento && dataObj.asiento != null){
      asientoId = dataObj.asiento;
    }else{
      await this.asientoSrv.getAsientoNumeracion().toPromise().then(result =>{
        asientoId = result.data.id;
        this.dataForm.controls['asiento'].setValue(asientoId);
      })
    }

    // grabar asiento monedas
    await this.grid.api.forEachNode(async (rowNode, index) => {      
      if(rowNode.data.moneda || rowNode.data.interno ){
        let monedaRow = this.monedas.find(elt => elt.codigo == rowNode.data.moneda);
        let cuentaRow = this.cuentas.find(elt => elt.id.trim() == monedaRow.cuenta.trim());

        let asiento = {
          ejercicio: ejercicio,
          id: asientoId,
          it: it++,
          fecha: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
          concepto: 'Depositos Bancarios',
          cuenta: cuentaRow.id,
          debe: 0, 
          haber: Number(rowNode.data.importe),
          costo: null,
          comprobante: dataObj.comprobante,
          observaciones: rowNode.data.observaciones,
          generado: 'CAJ'
        }

        await this.asientoSrv.add(asiento).then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
        });
      }
    })

    // ----------------------------------
    // -- grabar asiento contrapartida --
    // ----------------------------------
    let asientoContrapartida = {
      ejercicio: ejercicio,
      id: asientoId,
      it: it,
      fecha: this.datepipe.transform(dataObj.fecha, 'yyyy-MM-dd'),
      concepto: 'Depositos Bancarios',
      cuenta: cuenta.id,
      debe: Number(dataObj.total), 
      haber: 0,
      costo: null,
      comprobante: dataObj.comprobante,
      observaciones: null,
      generado: 'CAJ'
    }

    await this.asientoSrv.add(asientoContrapartida).then(result => {
      console.log(result)
    }).catch( error => {
      console.log(error)
      this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
    });

    // ------------------------------------
    // ----- grabar movimiento egreso -----
    // ------------------------------------
    let extraccion = null;
    let interno = null;
    let movimientoEgreso = null;

    // grabo la cabecera del movimiento de egreso
    let requestEgreso = {
      numero: null,
      fecha: dataObj.fecha,
      movimiento: 2, // egreso
      tipo: null,
      concepto: 'Depósito',
      observaciones: null,
      asiento: asientoId,
      turno: dataObj.turno,
      importeCuentas: Number(dataObj.total),
      importeRetencionesDebe: 0,
      importeRetencionesHaber: 0,
      importeMonedas: Number(dataObj.total)
    }

    await this.moviSrv.createMovimiento(requestEgreso).toPromise().then(result => {
      movimientoEgreso = result.data.id;
      this.egreso = movimientoEgreso;
    });

    // movimiento de egreso de cuenta
    let movimientoCta = {
      numero: movimientoEgreso,
      it: 1,
      cuenta: cuenta.id,
      nombreCuenta: cuenta.nombre,
      importe: Number(dataObj.total)
    }

    await this.moviSrv.createMovimientoCuenta(movimientoCta).toPromise().then(result => {
      console.log(result)
    }).catch( error => {
      console.log(error)
      this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
    });

    // movimientos de egreso
    await this.grid.api.forEachNode(async (rowNode, index) => {
      if(rowNode.data.moneda || rowNode.data.interno ){
        let monedaRow = this.monedas.find(elt => elt.codigo == rowNode.data.moneda);
        let chequeraIndex = this.cheques.findIndex(elt => elt.cheque == Number(rowNode.data.cheque));
        let cuentaRow = this.cuentas.find(elt => elt.id.trim() == monedaRow.cuenta.trim());

        // banco
        if(monedaRow.tipo == 1){
          let movimientoBanco = {
            codigo: Number(rowNode.data.moneda),
            chequera: chequeraIndex != -1 ? this.cheques[chequeraIndex].id : null,
            extraccion: null,
            cheque: Number(rowNode.data.cheque),
            fechaEmision: dataObj.fecha,
            fecha: rowNode.data.fechaCheque ? this.toSqlDate(rowNode.data.fechaCheque) : null,
            observacion: rowNode.data.observaciones ? rowNode.data.observaciones : '',
            proveedor: null,
            nombreProveedor: null,
            debe: Number(rowNode.data.importe), 
            haber: 0
          }

          await this.moviSrv.createMovimientoMonedaBanco(movimientoBanco).toPromise().then(result => {
            console.log(result)
            extraccion = result.data.id;
            rowNode.data.extraccion = extraccion;
          }).catch( error => {
            console.log(error)
            this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
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
            fechaEmision: dataObj.fecha,
            fecha: rowNode.data.fechaCheque ? this.toSqlDate(rowNode.data.fechaCheque) : null,
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
          }).catch( error => {
            console.log(error)
            this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
          });
        }

        // movimiento
        let movimiento = {
          numero: movimientoEgreso,
          it: index,
          fecha: dataObj.fecha,
          movimiento: 2,
          turno: dataObj.turno,
          moneda: Number(rowNode.data.moneda),
          chequera: chequeraIndex != -1 ? this.cheques[chequeraIndex].id : null,
          extraccion: extraccion,
          interno: Number(interno),
          cheque: Number(rowNode.data?.cheque),
          cotizacion: 1,
          importe: Number(rowNode.data?.importe),
          observaciones: rowNode.data?.observaciones
        }

        await this.moviSrv.createMovimientoMoneda(movimiento).toPromise().then(result => {
          console.log(result)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
        });
      }
    });

    // -------------------------------------
    // ----- grabar movimiento ingreso -----
    // -------------------------------------
    let movimientoIngreso = null;

    // grabo la cabecera del movimiento
    let requestIngreso = {
      numero: null,
      fecha: dataObj.fecha,
      movimiento: 1, // ingreso
      tipo: null,
      concepto: 'Depósito',
      observaciones: null,
      asiento: asientoId,
      turno: dataObj.turno,
      importeCuentas: Number(dataObj.total),
      importeRetencionesDebe: 0,
      importeRetencionesHaber: 0,
      importeMonedas: Number(dataObj.total)
    }

    await this.moviSrv.createMovimiento(requestIngreso).toPromise().then(result => {
      movimientoIngreso = result.data.id;
      this.ingreso = movimientoIngreso;
    });

    await this.grid.api.forEachNode(async (rowNode, index) => {
      if(rowNode.data.moneda || rowNode.data.interno){
        let monedaRow = this.monedas.find(elt => elt.codigo == rowNode.data.moneda);
        let cuentaRow = this.cuentas.find(elt => elt.id.trim() == monedaRow.cuenta.trim());

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
          this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
        });
      }
    });

    // movimiento de ingreso moneda
    let movimiento = {
      numero: movimientoIngreso,
      it: 1,
      fecha: dataObj.fecha,
      movimiento: 1,
      turno: dataObj.turno,
      moneda: moneda.codigo,
      chequera: null,
      extraccion: null,
      interno: null,
      cheque: null,
      cotizacion: 1,
      importe: Number(dataObj.total),
      observaciones: dataObj.comprobante
    }

    await this.moviSrv.createMovimientoMoneda(movimiento).toPromise().then(result => {
      console.log(result)
    }).catch( error => {
      console.log(error)
      this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
    });

    // -------------------------------------
    // ---------- grabar deposito ----------
    // -------------------------------------
    let idDeposito = null;
    await this.depBancSrv.getNumeracion().toPromise().then(result => {
      idDeposito = result.data.id;
    })

    await this.grid.api.forEachNode(async (rowNode, index) => {
      if(rowNode.data.moneda || rowNode.data.interno ){
        let chequeraIndex = this.cheques.findIndex(elt => elt.cheque == Number(rowNode.data.cheque));
        
        let deposito = {
          deposito: idDeposito,
          moneda: moneda.codigo,
          fecha: dataObj.fecha,
          comprobante: dataObj.comprobante,
          monedaDeposito: Number(rowNode.data.moneda),
          interno: Number(rowNode.data.interno),
          chequera: chequeraIndex != -1 ? this.cheques[chequeraIndex].id : null,
          cheque: Number(rowNode.data.cheque),
          extraccion: rowNode.data.extraccion,
          observacion: rowNode.data.observacion,
          importe: Number(rowNode.data.importe),
          fechaAcreditacion: this.toSqlDate(rowNode.data.fechaAcreditacion),
          ingreso: this.ingreso,
          egreso: this.egreso,
          it: index
        }

        await this.depBancSrv.createDeposito(deposito).toPromise().then(result => {
          this.dataForm.controls['deposito'].setValue(result.data.id)
        }).catch( error => {
          console.log(error)
          this.toastr.error(error.error.message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
        });

      }
    });

    return true;
  }

  savePromise(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.save();

      setTimeout( () => {
        resolve(true);
      }, 250);
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

      await this.grid.api.forEachNode(async (rowNode, index) => {
        if(rowNode.data.moneda || rowNode.data.interno){
          count++;
        }
      })

      if(count == 0){
        this.toastr.error('No hay datos para guardar.', 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
        reject(false);
      }

      // valida la fecha de acreditacion
      this.grid.api.forEachNode((rowNode, index) => {
        if(rowNode.data.moneda || rowNode.data.interno ){
          if(!rowNode.data.fechaAcreditacion){
            this.toastr.error('Debe ingresar todas las fechas de acreditación.', 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
            reject(false);
          }
          let monedaRow = this.monedas.find(elt => elt.codigo == rowNode.data.moneda);
          if(monedaRow.tipo == 2 && (rowNode.data.interno == undefined || rowNode.data.interno == '')){
            this.toastr.error('La moneda '+rowNode.data.moneda+' debe tener un número de interno.', 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
            reject(false);
          }
        }
        
      })

      // valida comprobante
      if(this.dataForm.controls['comprobante'].value == undefined || this.dataForm.controls['comprobante'].value == ''){
        this.toastr.error('Debe ingresar un comprobante.', 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
        reject(false);
      }

      // valida moneda banco
      if(this.dataForm.controls['moneda'].value == -1){
        this.toastr.error('Debe seleccionar un banco.', 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
        reject(false);
      }

      // valida cheque
      let dataObj = this.dataForm.getRawValue();
      
      await this.grid.api.forEachNode(async (rowNode, index) => {
        if(rowNode.data.moneda || rowNode.data.interno ){
          // asiento
          let monedaRow = this.monedas.find(elt => elt.codigo == rowNode.data.moneda);
          let cuentaRow = this.cuentas.find(elt => elt.id.trim() == monedaRow.cuenta.trim());

          if(monedaRow.tipo == 2){
            let movimiento = {
              codigo: Number(rowNode.data.moneda),
              turno: dataObj.turno,
              movimiento: 2,
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
              console.log(result)
            }).catch( error => {
              console.log(error)
              reject("Nro de cheque: " + rowNode.data?.cheque + ". " + error.error.message);
              //return;
            });
          }
        }
      })

      setTimeout( () => {
        resolve(true);
      }, 500);
    })
  }

  saveClick(){
    this.validatePromise().then( valid => {
      this.savePromise().then(result => {
        if(result){
          this.toastr.success("Los datos se grababaron con exito.", 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
        }
        
      }).catch(error => {
        this.toastr.error(error.Message, 'Depósitos Bancarios', { closeButton: true, timeOut: 4000 });
      })
    })
    
  }

  toSqlDate(dateStr: string): string{
    if(!dateStr){
      return null;
    }
    let arr = dateStr.split('/'); // dd/MM/yyyy
    return arr[2] + '-' + arr[1] + '-' + arr[0]; // yyyy-MM-dd
  }

  movKeyDown(event){
    if(event.keyCode == 13){
      this.getDepositos();
    }
  }

  getDepositos(){
    this.depBancSrv.getDepositos(this.dataForm.controls['deposito'].value).subscribe(result => {
      let data = result.data;

      if(data.cabecera){
        data.cabecera.deposito = this.dataForm.controls['deposito'].value;
        data.cabecera.importe = data.detalle.reduce((sum, current) => {
          return sum + current.importe;
        }, 0);
  
        this.newDataForm(data.cabecera);
        this.depositos = data.detalle.map(elt => {
          elt.fechaAcreditacion = this.datepipe.transform(new Date(elt.fechaAcreditacion), 'dd/MM/yyyy');
          elt.fechaCheque = this.datepipe.transform(new Date(elt.fechaCheque), 'dd/MM/yyyy');
          return elt;
        });
      }else{
        this.depositos = [];
        this.depositos.push({fechaCheque: this.datepipe.transform(new Date(), 'dd/MM/yyyy')})
      }
      
    })
  }

  async onCellKeyPress(event){
    if(event.event.charCode == 13){
      if(event.colDef.field == 'observaciones'){
        this.grid.api.applyTransaction({add: [{fecha: this.datepipe.transform(new Date(), 'dd/MM/yyyy')}]});
        this.moveNextCell(this.grid.api, this.columnDefs, event);
      }

      if(event.colDef.field == 'interno'){
        if(event.data.interno == undefined || event.data.interno == ''){
          this.moveNextCell(this.grid.api, this.columnDefs, event);
          return;
        }
        await this.chequeSrv.validaCheque(event.data.interno, this.dataForm.controls['turno'].value).toPromise().then(result => {
          if(result.data){
            this.onBtStartEditing(this.grid.api, 'moneda', event.rowIndex, result.data.moneda )
            this.onBtStartEditing(this.grid.api, 'nombreMoneda', event.rowIndex, result.data.nombreMoneda )
            this.onBtStartEditing(this.grid.api, 'fechaCheque', event.rowIndex, this.datepipe.transform(new Date(result.data.fechaCheque), 'dd/MM/yyyy') )
            this.onBtStartEditing(this.grid.api, 'banco', event.rowIndex, result.data.banco )
            this.onBtStartEditing(this.grid.api, 'sucursal', event.rowIndex, result.data.sucursal )
            this.onBtStartEditing(this.grid.api, 'cp', event.rowIndex, result.data.cp )
            this.onBtStartEditing(this.grid.api, 'cheque', event.rowIndex, result.data.cheque )
            this.onBtStartEditing(this.grid.api, 'cuit', event.rowIndex, result.data.cuentaCc )
            this.onBtStartEditing(this.grid.api, 'importe', event.rowIndex, result.data.importe )
            this.onBtStartEditing(this.grid.api, 'observaciones', event.rowIndex, result.data.observaciones )
            
            this.grid.api.stopEditing();

            this.moveCellByField(this.grid.api, this.columnDefs, event, 'fechaAcreditacion');
          }else{
            this.editCurrentCell(this.grid.api, this.columnDefs, event);
            this.toastr.error("Cheque no encontrado.", 'Depósitos', { closeButton: true, timeOut: 3000 });
          }
          
        }).catch(error => {
          event.data.interno = '';
          event.data.moneda = '';
          event.data.nombreMoneda = '';
          event.data.fechaCheque = '';
          event.data.banco = '';
          event.data.sucursal = '';
          event.data.cp = '';
          event.data.cheque = '';
          event.data.cuit = '';
          event.data.importe = '';
          event.data.observaciones = '';
          this.onBtStartEditing(this.grid.api, 'interno', event.rowIndex, '' )
          this.onBtStartEditing(this.grid.api, 'moneda', event.rowIndex, '' )
          this.onBtStartEditing(this.grid.api, 'nombreMoneda', event.rowIndex, '' )
          this.onBtStartEditing(this.grid.api, 'fechaCheque', event.rowIndex, '' )
          this.onBtStartEditing(this.grid.api, 'banco', event.rowIndex, '' )
          this.onBtStartEditing(this.grid.api, 'sucursal', event.rowIndex, '' )
          this.onBtStartEditing(this.grid.api, 'cp', event.rowIndex, '' )
          this.onBtStartEditing(this.grid.api, 'cheque', event.rowIndex, '' )
          this.onBtStartEditing(this.grid.api, 'cuit', event.rowIndex, '' )
          this.onBtStartEditing(this.grid.api, 'importe', event.rowIndex, '' )
          this.onBtStartEditing(this.grid.api, 'observaciones', event.rowIndex, '' )

          this.editCurrentCell(this.grid.api, this.columnDefs, event);
          this.grid.api.stopEditing();
          this.toastr.error(error.error.message, 'Depósitos', { closeButton: true, timeOut: 3000 });
        })
      }

      if(event.colDef.field == 'moneda'){
        if(event.data.moneda == undefined){
          this.editCurrentCell(this.grid.api, this.columnDefs, event);
          return;
        }

        await this.monedaSrv.validaMoneda(event.data.moneda).toPromise().then(result => {
          if(result.data){
            this.onBtStartEditing(this.grid.api, 'interno', event.rowIndex, '' )
            this.onBtStartEditing(this.grid.api, 'nombreMoneda', event.rowIndex, result.data.nombre )
            this.onBtStartEditing(this.grid.api, 'fecha', event.rowIndex, this.datepipe.transform(new Date(),'dd/MM/yyyy'))
            this.onBtStartEditing(this.grid.api, 'banco', event.rowIndex, result.data.banco )
            this.onBtStartEditing(this.grid.api, 'sucursal', event.rowIndex, result.data.sucursal )
            this.onBtStartEditing(this.grid.api, 'cp', event.rowIndex, result.data.cp )
            this.onBtStartEditing(this.grid.api, 'cheque', event.rowIndex, result.data.cheque )
            this.onBtStartEditing(this.grid.api, 'cuit', event.rowIndex, result.data.cuit )
            this.onBtStartEditing(this.grid.api, 'importe', event.rowIndex, null )
            this.onBtStartEditing(this.grid.api, 'observaciones', event.rowIndex, '' )

            this.grid.api.stopEditing();
            
            if(result.data.tipo == 3){
              this.moveCellByField(this.grid.api, this.columnDefs, event, 'importe');
            }else{
              this.moveNextCell(this.grid.api, this.columnDefs, event);
            }
          }
          
        }).catch(error => {
          this.editCurrentCell(this.grid.api, this.columnDefs, event);
          this.toastr.error(error.error.message, 'Depósitos', { closeButton: true, timeOut: 3000 });
        })
      }

      if(event.colDef.field == 'cheque'){
        if(event.data.cheque == undefined || event.data.cheque == ''){
          this.moveNextCell(this.grid.api, this.columnDefs, event);
          return;
        }

        await this.monedaSrv.validaMoneda(event.data.moneda).toPromise().then(moneda => {
          if(moneda.data){
            if(moneda.data.tipo != 1){
              this.moveNextCell(this.grid.api, this.columnDefs, event);
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

              this.moveNextCell(this.grid.api, this.columnDefs, event);

            }).catch(error => {
              event.data.cheque = '';
              this.onBtStartEditing(this.grid.api, 'cheque', event.rowIndex, '' )
              this.editCurrentCell(this.grid.api, this.columnDefs, event);
              if(error.status == 400){
                this.toastr.error('El número de cheque no es correcto.', 'Depósitos', { closeButton: true, timeOut: 3000 });
              }else{
                this.toastr.error(error.error.message, 'Depósitos', { closeButton: true, timeOut: 3000 });
              }
              
            })

          }
          
        }).catch(error => {
          this.moveNextCell(this.grid.api, this.columnDefs, event);
          this.toastr.error(error.error.message, 'Depósitos', { closeButton: true, timeOut: 3000 });
        })

      }

      if(event.colDef.field == 'banco'){
        if(event.data.banco == undefined){
          this.moveNextCell(this.grid.api, this.columnDefs, event);
          return;
        }
        
        let bancoIndex = this.bancos.findIndex(elt => elt.codigo.trim() == event.data.banco.trim())

        if(bancoIndex == -1){
          this.onBtStartEditing(this.grid.api, 'banco', event.rowIndex, '' )
          this.editCurrentCell(this.grid.api, this.columnDefs, event);
          this.toastr.error("El código de banco "+event.data.banco.trim()+" no existe.", 'Depósitos', { closeButton: true, timeOut: 3000 });
          return;
        }else{
          this.moveNextCell(this.grid.api, this.columnDefs, event);
        }

      }

      if(event.colDef.field == 'fecha'){
        var timestamp = Date.parse(this.toSqlDate(event.data.fecha));

        if (isNaN(timestamp)) {
          console.log('Invalida')
          event.data.fecha = '';
          this.onBtStartEditing(this.grid.api, 'fecha', event.rowIndex, '' )
          this.editCurrentCell(this.grid.api, this.columnDefs, event);
          this.toastr.error('La fecha no es válida.', 'Depósitos', { closeButton: true, timeOut: 3000 });
          return;
        }else{
          console.log('valida')
        }
      }

      if(event.colDef.field == 'fechaAcreditacion'){
        var timestamp = Date.parse(this.toSqlDate(event.data.fechaAcreditacion));

        if (isNaN(timestamp)) {
          console.log('Invalida')
          event.data.fechaAcreditacion = '';
          this.onBtStartEditing(this.grid.api, 'fechaAcreditacion', event.rowIndex, '' )
          this.editCurrentCell(this.grid.api, this.columnDefs, event);
          this.toastr.error('La fecha no es válida.', 'Depósitos', { closeButton: true, timeOut: 4000 });
          return;
        }else{
          console.log('valida')
        }
      }

      if(event.colDef.field != 'banco' && event.colDef.field != 'cheque' && event.colDef.field != 'interno' && event.colDef.field != 'observaciones' && event.colDef.field != 'codigo'){
        this.moveNextCell(this.grid.api, this.columnDefs, event);
      }

      this.sumarImportes();
      
    }
  }

  sumarImportes(){
    let sum = 0;

    this.grid.api.forEachNode(async (rowNode, index) => {
      sum += Number(rowNode.data.importe == undefined ? 0 : rowNode.data.importe);
    })
    
    this.dataForm.controls['total'].setValue(sum.toFixed(2));
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

  print(){
    this.dataPrint = [];
    this.grid.api.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      this.dataPrint.push(rowNode.data)
    })

    setTimeout(()=>{
      printJS({
        printable: 'print_depositos',
        type: 'html',
        style: this.printSrv.getTableStyle(),
        scanStyles: false
      })
    }, 250)
  }

  getMonedaNombre(){
    if(this.dataForm.controls['moneda'].value != -1){
      return this.monedas.find(elt => elt.codigo == this.dataForm.controls['moneda'].value).nombre
    }else{
      return ''
    }
  }

}
