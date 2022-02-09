import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  @Input('columns') columns: any[];
  @Input('data') data: any[];

  constructor() { }

  ngOnInit(): void {
    this.columns = [
      { name: 'nombre', align: "l"},
      { name: 'apellido', align: "r"},
      { name: 'edad', align: "c"}
    ]

    this.data = [
      { nombre: 'patricio', apellido: 'luzzi', edad: 35 },
      { nombre: 'andres', apellido: 'luzzi', edad: 38 },
      { nombre: 'joaquin', apellido: 'luzzi', edad: 6 },
      { nombre: 'lara', apellido: 'luzzi', edad: 2 },
      { nombre: 'patricio', apellido: 'luzzi', edad: 35 },
      { nombre: 'andres', apellido: 'luzzi', edad: 38 },
      { nombre: 'joaquin', apellido: 'luzzi', edad: 6 },
      { nombre: 'lara', apellido: 'luzzi', edad: 2 },
      { nombre: 'patricio', apellido: 'luzzi', edad: 35 },
      { nombre: 'andres', apellido: 'luzzi', edad: 38 },
      { nombre: 'joaquin', apellido: 'luzzi', edad: 6 },
      { nombre: 'lara', apellido: 'luzzi', edad: 2 },
      { nombre: 'patricio', apellido: 'luzzi', edad: 35 },
      { nombre: 'andres', apellido: 'luzzi', edad: 38 },
      { nombre: 'joaquin', apellido: 'luzzi', edad: 6 },
      { nombre: 'lara', apellido: 'luzzi', edad: 2 },
      { nombre: 'patricio', apellido: 'luzzi', edad: 35 },
      { nombre: 'andres', apellido: 'luzzi', edad: 38 },
      { nombre: 'joaquin', apellido: 'luzzi', edad: 6 },
      { nombre: 'lara', apellido: 'luzzi', edad: 2 },
      { nombre: 'patricio', apellido: 'luzzi', edad: 35 },
      { nombre: 'andres', apellido: 'luzzi', edad: 38 },
      { nombre: 'joaquin', apellido: 'luzzi', edad: 6 },
      { nombre: 'lara', apellido: 'luzzi', edad: 2 },
      { nombre: 'patricio', apellido: 'luzzi', edad: 35 },
      { nombre: 'andres', apellido: 'luzzi', edad: 38 },
      { nombre: 'joaquin', apellido: 'luzzi', edad: 6 },
      { nombre: 'lara', apellido: 'luzzi', edad: 2 },
      { nombre: 'patricio', apellido: 'luzzi', edad: 35 },
      { nombre: 'andres', apellido: 'luzzi', edad: 38 },
      { nombre: 'joaquin', apellido: 'luzzi', edad: 6 },
      { nombre: 'lara', apellido: 'luzzi', edad: 2 },
      { nombre: 'patricio', apellido: 'luzzi', edad: 35 },
      { nombre: 'andres', apellido: 'luzzi', edad: 38 },
      { nombre: 'joaquin', apellido: 'luzzi', edad: 6 },
      { nombre: 'lara', apellido: 'luzzi', edad: 2 },
      { nombre: 'patricio', apellido: 'luzzi', edad: 35 },
      { nombre: 'andres', apellido: 'luzzi', edad: 38 },
      { nombre: 'joaquin', apellido: 'luzzi', edad: 6 },
      { nombre: 'lara', apellido: 'luzzi', edad: 2 },

    ]
  }

  updateList(id: number, property: string, event: any) {
    const editField = event.target.textContent;
    this.data[id][property] = editField;
  }

  changeValue(id: number, property: string, event: any) {
    this.data = event.target.textContent;
  }

}
