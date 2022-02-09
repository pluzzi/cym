import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BancosComponent } from './components/caja/archivos/bancos/bancos.component';
import { DepositosAcreditacionesComponent } from './components/caja/informes/depositos-acreditaciones/depositos-acreditaciones.component';
import { InformePlanillaCajaComponent } from './components/caja/informes/informe-planilla-caja/informe-planilla-caja.component';
import { InformeValoresComponent } from './components/caja/informes/informe-valores/informe-valores.component';
import { IngresosEgresosComponent } from './components/caja/movimientos/ingresos-egresos/ingresos-egresos.component';
import { ConceptosCajaComponent } from './components/caja/fondo-fijo/conceptos-caja/conceptos-caja.component';
import { LoginComponent } from './components/login/login.component';
import { MonedasComponent } from './components/caja/archivos/monedas/monedas.component';
import { SeguridadComponent } from './components/seguridad/seguridad.component';
import { TiposMovimientosComponent } from './components/caja/archivos/tipos-movimientos/tipos-movimientos.component';
import { TiposRetencionComponent } from './components/caja/archivos/tipos-retencion/tipos-retencion.component';
import { UsuarioFondoFijoComponent } from './components/caja/fondo-fijo/usuario-fondo-fijo/usuario-fondo-fijo.component';
import { HomeComponent } from './components/home/home.component';
import { ChequerasComponent } from './components/caja/archivos/chequeras/chequeras.component';
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

const routes: Routes = [
  {path:'login', component: LoginComponent},
  {path: '', component: LoginComponent},
  {path: 'home', component: HomeComponent},
  {path: 'bancos', component: BancosComponent},
  {path: 'retenciones', component: TiposRetencionComponent},
  {path: 'monedas', component: MonedasComponent},
  {path: 'chequeras', component: ChequerasComponent},
  {path: 'movimientos', component: TiposMovimientosComponent},
  {path: 'seguridad', component: SeguridadComponent},
  {path: 'usuarios_fondo_fijo', component: UsuarioFondoFijoComponent},
  {path: 'conceptos_caja', component: ConceptosCajaComponent},
  {path: 'informe_listado_retenciones', component: InformeRetencionesComponent},
  {path: 'ingresos_egresos', component: IngresosEgresosComponent},
  {path: 'depositos_acreditaciones', component: DepositosAcreditacionesComponent},
  {path: 'informe_valores', component: InformeValoresComponent}, 
  {path: 'planilla_caja', component: InformePlanillaCajaComponent},
  {path: 'cheques_emitidos_extracciones', component: ChequesEmitidosExtraccionesComponent},
  {path: 'auxiliar_banco', component: AuxiliarBancoComponent},
  {path: 'depositos', component: DepositosBancariosComponent},
  {path: 'transferencias', component: TransferenciasFondosComponent},
  {path: 'apertura_planilla', component: AperturaFondoFijoComponent},
  {path: 'informe_planillas', component: InformePlanillasComponent}, 
  {path: 'informe_usuarios', component: InformeUsuariosComponent},
  {path: 'informe_usuarios_moneda_proveedor', component: InformeUsuariosMonedasProveedorComponent}, 
  {path: 'conciliaciones_bancarias', component: ConciliacionesBancariasComponent},
  {path: 'planillas', component: PlanillaFondoFijoComponent},
  {path: 'test', component: TestComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
