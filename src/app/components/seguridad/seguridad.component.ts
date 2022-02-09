import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { Modal } from 'bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seguridad',
  templateUrl: './seguridad.component.html',
  styleUrls: ['./seguridad.component.css']
})
export class SeguridadComponent implements OnInit {

  usuarios?: any[];
  usuariosCopy?: any[];
  menu?: any[];
  usuarioSelected: string = "";
  
  filterSettings?: Object;
  field?: Object;
  showCheckBox: boolean = true;

  @ViewChild('grid') public grid?: GridComponent;

  constructor(
    private usrSrv: UsuariosService,
    private segSrv: SeguridadService,
    private route: Router,
  ) { }
  
  ngOnInit(): void {
    this.getUsuarios();
    
    this.filterSettings = {
      type: 'Excel'
    };
  }

  getUsuarios(){
    
    this.usrSrv.getUsuarios().subscribe(result =>{
      this.usuarios = result.data.filter(x => x.usuario != 'sa');
      this.usuariosCopy = this.usuarios;

      this.usuariosCopy?.forEach(elt =>{
        elt.copy = false;
      })

    })
  }

  getMenu(usuario: string){
    this.segSrv.getMenuConPermisos(usuario).subscribe(result =>{
      this.menu = result.data;

      this.menu?.forEach(elt =>{
        if(elt.hasChild){
          elt.expanded = true;
        }
      });

      this.field = {
        dataSource: this.menu,
        id: 'id',
        parentID: 'id_padre',
        text: 'titulo',
        hasChildren: 'hasChild'
      };

    })
  }

  onRowClick(event: any){
    this.usuarioSelected = event.target.innerText;
    this.getMenu(event.target.innerText);
  }

  nodeChecked(args): void{
    let menu = args.data[0]
    
    if(menu.hasChildren){
      this.menu?.filter(elt => elt.id_padre == menu.id).forEach(elt => {
        this.setPermiso(elt.id, menu.isChecked.toLowerCase() == 'true')
      })
    }else{
      this.setPermiso(Number(menu.parentID), menu.isChecked.toLowerCase() == 'true')
    }

    this.setPermiso(Number(menu.id), menu.isChecked.toLowerCase() == 'true')
  }

  setPermiso(menu: number, isChecked: boolean){
    let request = {
      usuario: this.usuarioSelected,
      menu: menu,
      permiso: isChecked
    }

    this.segSrv.setPermisos(request).subscribe(result =>{
      console.log(result.data)
    })
  }

  copy(){
    this.grid?.getSelectedRowIndexes().forEach(i => {
      let usuario = this.usuariosCopy[i].usuario;

      this.segSrv.copyPermisos(this.usuarioSelected, usuario).subscribe(result =>{
        this.usuariosCopy?.forEach(elt =>{
          elt.copy = false;
        })
        this.grid.refresh();
      })

    })
  }

  home(){
    this.route.navigate(['/home'], {  });
  }

}
