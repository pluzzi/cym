import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  public navchange: EventEmitter<boolean> = new EventEmitter();

  constructor() { }
}
