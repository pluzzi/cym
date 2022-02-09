import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BancoService } from 'src/app/services/caja/banco.service';
import { CuentaService } from 'src/app/services/contabilidad/cuenta.service';
import { MonedaService } from 'src/app/services/caja/moneda.service';
import Swal from 'sweetalert2';
import * as  printJS from 'print-js';
import { PrintService } from 'src/app/services/print.service';
import { ExcelService } from 'src/app/services/excel.service';

@Component({
  selector: 'app-monedas',
  templateUrl: './monedas.component.html',
  styleUrls: ['./monedas.component.css']
})
export class MonedasComponent implements OnInit {

  @ViewChild('modal') modal: ElementRef;
  monedas: any[];
  tipos: any[];
  bancos: any[];
  monedaForm: FormGroup;
  cuentas: any[];
  grid: any;
  gridColumn: any;
  selectedRow: any;
  isNew: boolean = false;
  searchValue: string = '';
  disabled: boolean = true;
  fechaEmision: Date = new Date();
  dataPrint: any[];

  columnDefs = [
    { 
      field: 'codigo', 
      headerName: 'Código',
      filter: true,
      cellStyle: {
        'text-align': 'center'
      }, 
    },
    { field: 'nombre', 
      headerName: 'Nombre',
      filter: true
     },
    { 
      field: 'cambioCotizacion', 
      headerName: 'Cambio Cotización',
      filter: true,
      cellStyle: {
        'text-align': 'center'
      }, 
      cellRenderer: params => {
        return `<input disabled type='checkbox' ${params.value ? 'checked' : ''} />`;
      }
    },
    { 
      field: 'cotizacion',
      headerName: 'Cotización',
      filter: true,
      cellStyle: {
        'text-align': 'center'
      },
      
      valueFormatter: params => params.data.cotizacion.toFixed(3),
    },
    { field: 'tipo', 
      headerName: 'Tipo',
      filter: true,
      cellStyle: {
        'text-align': 'center'
      },
    },
    { field: 'banco', 
      headerName: 'Banco',
      filter: true,
      cellStyle: {
        'text-align': 'center'
      },
    },
    { field: 'nombreBanco', 
      headerName: 'Nombre del Banco',
      filter: true
    },
    { 
      field: 'verFondoFijo', 
      headerName: 'Ver Fondo Fijo',
      filter: true,
      cellStyle: {
        'text-align': 'center'
      },
      cellRenderer: params => {
        return `<input disabled type='checkbox' ${params.value ? 'checked' : ''} />`;
      }
    },
    { 
      field: 'estado',
      headerName: 'Inactivo',
      filter: true,
      cellStyle: {
        'text-align': 'center'
      },
      cellRenderer: params => {
        return `<input disabled type='checkbox' ${params.value ? 'checked' : ''} />`;
      }
    },
    { field: 'cp', 
      headerName: 'Plaza',
      filter: true,
      cellStyle: {
        'text-align': 'center'
      },
    },
    { field: 'sucursal', 
      headerName: 'Sucursal',
      filter: true,
      cellStyle: {
        'text-align': 'center'
      },
    },
    { field: 'cuit', 
      headerName: 'CUIT',
      filter: true,
      cellStyle: {
        'text-align': 'center'
      },
    },
    { field: 'cuenta', 
      headerName: 'Cuenta Contable',
      filter: true
    },
    { field: 'cuentaContableNombre', 
      headerName: 'Nombre Cuenta Contable',
      filter: true
    },
  ]

  defaultColDef = {
    width: 100,
    editable: false,
    resizable: true,
    cellStyle: {fontSize: '11px', lineHeight: 'unset'}
  };

  constructor(
    private route: Router,
    private modalSrv: NgbModal,
    private monedaSrv: MonedaService,
    private spinner: NgxSpinnerService,
    private bacoSrv: BancoService,
    private cuentaSrv: CuentaService,
    private printSrv: PrintService,
    private excelSrv: ExcelService,    
    private toastr: ToastrService
  ) {
    
  }

  ngOnInit(): void {
    this.tipos = this.monedaSrv.getTiposMoneda();

    this.getBancos();

    this.getCuentas();
  }

  getMonedas(){
    this.spinner.show();
    this.monedaSrv.getMonedas(1,0).subscribe(result => {
      this.monedas = result.data.map(x => {
        x.verFondoFijo = x.verFondoFijo == 1 ? true : false;
        x.estado = x.estado == 1 ? true : false;
        
        let cuenta = this.cuentas.filter(elt => elt.id.trim() == x.cuenta?.trim())

        if(cuenta.length != 0){
          x.cuentaContableNombre = cuenta[0].nombre;
        }

        return x;
      });

      this.spinner.hide();
    }, error => {
      this.spinner.hide();
    })
  }

  getBancos(){
    this.bacoSrv.getBancos().subscribe(result => {
      this.bancos = result.data;
    })
  }

  home(){
    this.route.navigate(['/home'], {  });
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

  save(){
    let formObj = this.monedaForm.getRawValue();

    let data = {
      codigo: Number(formObj.codigo),
      nombre: formObj.nombre,
      tipo: formObj.tipo,
      cambioCotizacion: formObj.cambioCotizacion,
      banco: formObj.banco,
      nombreBanco: formObj.nombreBanco,
      cp: formObj.cp,
      sucursal: formObj.sucursal,
      cuenta: formObj.cuenta,
      cuit: formObj.cuit,
      cotizacion: Number(formObj.cotizacion),
      verFondoFijo: formObj.verFondoFijo ? 1 : 0,
      estado: formObj.estado ? 1 : 0,
    }

    if(this.isNew){
      this.monedaSrv.createMoneda(data).subscribe(result =>{
        this.getMonedas();
        this.toastr.success("Se agregó correctamente.", 'Monedas', { closeButton: true, timeOut: 3000 });
      }, error => {
        this.toastr.error(error.error.message, 'Monedas', { closeButton: true, timeOut: 3000 });
      })
    }else{
      this.monedaSrv.updateMoneda(data).subscribe(result =>{
        this.getMonedas();
        this.toastr.success("Se actualizó correctamente.", 'Monedas', { closeButton: true, timeOut: 3000 });
      }, error => {
        this.toastr.error(error.error.message, 'Monedas', { closeButton: true, timeOut: 3000 });
      })
    }
  }

  getTipo(tipo: number){
    if(tipo==1){
      return "Banco propio";
    }
    if(tipo==2){
      return "Valores en cartera";
    }
    if(tipo==3){
      return "Efectivo";
    }
    if(tipo==4){
      return "Tarjetas";
    }
    return ""
  }

  search(){
    this.grid.setQuickFilter(this.searchValue);
  }

  getNombreCuetanContable(){
    if(this.monedaForm.controls['cuenta'].value !=null){
      let cuenta = this.cuentas.filter(elt => elt.id.trim() == this.monedaForm.controls['cuenta'].value.trim())
      if(cuenta.length != 0){
        this.monedaForm.controls['cuentaContableNombre'].setValue(cuenta[0].nombre);
      }else{
        this.monedaForm.controls['cuentaContableNombre'].setValue("");
        this.toastr.error("La cuenta ingresada no existe.", 'Monedas', { closeButton: true, timeOut: 4000 });
      }
    }
  }

  onGridReady(params) {
    this.grid = params.api;
    this.gridColumn = params.columnApi;

    setTimeout(()=>{
      this.autoSizeAll(false);
      this.grid.setHeaderHeight(20);
    }, 250)
    
  }

  autoSizeAll(skipHeader) {
    const allColumnIds = [];
    this.gridColumn.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });
    this.gridColumn.autoSizeColumns(allColumnIds, skipHeader);
  }

  add(){
    this.isNew = true;

    this.monedaForm = new FormGroup({
      codigo: new FormControl(null),
      nombre: new FormControl(null),
      cambioCotizacion: new FormControl(null),
      cotizacion: new FormControl(null),
      tipo: new FormControl(null),
      banco: new FormControl(null),
      verFondoFijo: new FormControl(null),
      estado: new FormControl(null),
      cp: new FormControl(null),
      sucursal: new FormControl(null),
      cuenta: new FormControl(null),
      nombreCuenta: new FormControl(null),
      cuentaContable: new FormControl(null),
      cuentaContableNombre: new FormControl(null)
    });

    this.open(this.modal);
  }

  edit(){
    this.isNew = false;

    this.monedaForm = new FormGroup({
      codigo: new FormControl(this.selectedRow.codigo),
      nombre: new FormControl(this.selectedRow.nombre),
      cambioCotizacion: new FormControl(this.selectedRow.cambioCotizacion),
      cotizacion: new FormControl(this.selectedRow.cotizacion),
      tipo: new FormControl(this.selectedRow.tipo),
      banco: new FormControl(this.selectedRow.banco),
      verFondoFijo: new FormControl(this.selectedRow.verFondoFijo),
      estado: new FormControl(this.selectedRow.estado),
      cp: new FormControl(this.selectedRow.cp),
      sucursal: new FormControl(this.selectedRow.sucursal),
      cuit: new FormControl(this.selectedRow.cuit),
      cuenta: new FormControl(this.selectedRow.cuenta),
      cuentaContableNombre: new FormControl(null)
    });

    this.getNombreCuetanContable();

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
        this.monedaSrv.deleteMoneda(this.selectedRow.codigo).subscribe(result =>{
          this.getMonedas();
          this.toastr.success("Se borró correctamente.", 'Monedas', { closeButton: true, timeOut: 4000 });
        }, error => {
          this.toastr.error(error.error.message, 'Monedas', { closeButton: true, timeOut: 4000 });
        })
      }else{
        this.getMonedas();
      }
    })
  }

  onSelectionChanged(event) {
    const selectedRows = this.grid.getSelectedRows();
    if(selectedRows.length != 0){
      this.selectedRow = selectedRows[0];
    }
  }

  keyDown(event: any){
    if(event.keyCode == 13){
      this.search();
    }
  }

  getModalTitle(){
    if(this.isNew){
      return 'Agregar';
    }
    return 'Editar';
  }

  isDisabled(){
   return this.monedaForm.controls['tipo']?.value == 1
  }

  /* BUCAR CUENTA */
  getCuentas(){
    this.cuentaSrv.getCuentas().subscribe(result => {
      this.cuentas = result.data;
      this.getMonedas();
    })
  }

  cuentaKeyDown(event){
    if(event.keyCode == 13){
      this.cuentaSrv.getCuentaImputable(event.target.value).subscribe(result => {
        this.getNombreCtaContable(event.target.value);
      }, error => {
        this.toastr.error(error.error.message, 'Tipo de Retenciones', { closeButton: true, timeOut: 3000 });
        this.monedaForm.controls['cuenta'].setValue('');
        this.monedaForm.controls['cuentaContableNombre'].setValue('');
      })
    }
  }

  getNombreCtaContable(codigo: string){
    let index = this.cuentas.findIndex(elt => elt.id.trim() == codigo.trim())

    if(index != -1){
      if(this.monedaForm){
        this.monedaForm.controls['cuentaContableNombre'].setValue(this.cuentas[index].nombre);
      }
      
      return this.cuentas[index].nombre;
    }else{
      this.toastr.error('La cuenta no existe.', 'Tipo de Retenciones', { closeButton: true, timeOut: 3000 });
      
      if(this.monedaForm){
        this.monedaForm.controls['cuentaContableNombre'].setValue('');
      }

      return '';
    }
  }

  /* FIN BUSCAR CUENTA */

  
 
  print(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
     this.dataPrint.push(rowNode.data)
    })
    setTimeout(()=>{
      printJS({
        printable: 'print_monedas',
        type: 'html',
        style: this.printSrv.getTableStyle(),
        scanStyles: false
      })
    }, 250)
  
  }
  
  exportar(){
    this.dataPrint = [];
    this.grid.forEachNodeAfterFilterAndSort((rowNode, index)=>{
      this.dataPrint.push(rowNode.data)
     })
     setTimeout(()=>{
      this.excelSrv.export(this.dataPrint) 
     }, 250)
  
    
  }


}
