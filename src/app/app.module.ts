import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, forwardRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './components/common/footer/footer.component';
import { NavbarComponent } from './components/common/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GridModule, CommandColumnService,  AggregateService, PagerModule, ExcelExportService, PageService, SortService, FilterService, EditService, ToolbarService, GroupService, PdfExportService, LazyLoadGroupService, SearchService, ResizeService  } from '@syncfusion/ej2-angular-grids';
import { TiposMovimientosComponent } from './components/caja/archivos/tipos-movimientos/tipos-movimientos.component';
import { BancosComponent } from './components/caja/archivos/bancos/bancos.component';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DropDownListAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { MaskedTextBoxModule, NumericTextBoxModule  } from '@syncfusion/ej2-angular-inputs';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { TiposRetencionComponent } from './components/caja/archivos/tipos-retencion/tipos-retencion.component';
import { MonedasComponent } from './components/caja/archivos/monedas/monedas.component';
import { ChequerasComponent } from './components/caja/archivos/chequeras/chequeras.component';
import { SeguridadComponent } from './components/seguridad/seguridad.component';
import { UsuarioFondoFijoComponent } from './components/caja/fondo-fijo/usuario-fondo-fijo/usuario-fondo-fijo.component';
import { ConceptosCajaComponent } from './components/caja/fondo-fijo/conceptos-caja/conceptos-caja.component';
import { TableComponent } from './components/common/table/table.component';
import { AgGridModule } from 'ag-grid-angular';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { IngresosEgresosComponent } from './components/caja/movimientos/ingresos-egresos/ingresos-egresos.component';
import { DepositosAcreditacionesComponent } from './components/caja/informes/depositos-acreditaciones/depositos-acreditaciones.component';
import { InformeValoresComponent } from './components/caja/informes/informe-valores/informe-valores.component';
import { InformePlanillaCajaComponent } from './components/caja/informes/informe-planilla-caja/informe-planilla-caja.component';
import { InformeRetencionesComponent } from './components/caja/informes/informe-retenciones/informe-retenciones.component';
import { ChequesEmitidosExtraccionesComponent } from './components/caja/informes/cheques-emitidos-extracciones/cheques-emitidos-extracciones.component';
import { AuxiliarBancoComponent } from './components/caja/informes/auxiliar-banco/auxiliar-banco.component';
import { DepositosBancariosComponent } from './components/caja/movimientos/depositos-bancarios/depositos-bancarios.component';
import { TransferenciasFondosComponent } from './components/caja/movimientos/transferencias-fondos/transferencias-fondos.component';
import { AperturaFondoFijoComponent } from './components/caja/apertura-fondo-fijo/apertura-fondo-fijo.component';
import { InformePlanillasComponent } from './components/caja/fondo-fijo/informe-planillas/informe-planillas.component';
import { InformeUsuariosComponent } from './components/caja/fondo-fijo/informe-usuarios/informe-usuarios.component';
import { InformeUsuariosMonedasProveedorComponent } from './components/caja/fondo-fijo/informe-usuarios-monedas-proveedor/informe-usuarios-monedas-proveedor.component';
import { ConciliacionesBancariasComponent } from './components/caja/bancos/conciliaciones-bancarias/conciliaciones-bancarias.component';
import { PlanillaFondoFijoComponent } from './components/caja/fondo-fijo/planilla-fondo-fijo/planilla-fondo-fijo.component';
import { TestComponent } from './components/caja/fondo-fijo/test/test.component';



@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    NavbarComponent,
    HomeComponent,
    LoginComponent,
    TiposMovimientosComponent,
    BancosComponent,
    TiposRetencionComponent,
    MonedasComponent,
    ChequerasComponent,
    SeguridadComponent,
    UsuarioFondoFijoComponent,
    ConceptosCajaComponent,
    TableComponent,
    InformeRetencionesComponent,
    IngresosEgresosComponent,
    DepositosAcreditacionesComponent,
    InformeValoresComponent,
    InformePlanillaCajaComponent,
    ChequesEmitidosExtraccionesComponent,
    AuxiliarBancoComponent,
    DepositosBancariosComponent,
    TransferenciasFondosComponent,
    AperturaFondoFijoComponent,
    InformePlanillasComponent,
    InformeUsuariosComponent,
    InformeUsuariosMonedasProveedorComponent,
    ConciliacionesBancariasComponent,
    PlanillaFondoFijoComponent,
    TestComponent,
    
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    GridModule,
    FormsModule,
    NgbModule,
    DropDownListAllModule,
    MaskedTextBoxModule,
    NumericTextBoxModule,
    TreeViewModule,
    AgGridModule.withComponents([SetFilterModule]),
    
    
  ],
  providers: [
    PageService,
    SortService,
    FilterService,
    EditService,
    ToolbarService,
    ExcelExportService,
    PdfExportService,
    AggregateService,
    GroupService,
    LazyLoadGroupService,
    SearchService,
    CommandColumnService,
    ResizeService, 
    DatePipe,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ],
  bootstrap: [AppComponent],
  
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
