import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  isLogin: boolean;

  constructor(
    private usrSrv: UsuariosService,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {
    let db_data = this.usrSrv.getDatabaseData();

    this.loginForm = new FormGroup({          
      'usuario': new FormControl(db_data?.usuario),
      'password': new FormControl(""),
      'server': new FormControl(db_data?.server),
      'gestion': new FormControl(db_data?.gestion),
      'contabilidad': new FormControl(db_data?.contabilidad),
      'advanced': new FormControl(false)
    });

    this.isLogin = this.usrSrv.isLogin();

  }

  ngOnInit(): void {
    
  }

  login(){
    this.spinner.show();

    if(this.loginForm.controls['advanced'].value){
      this.usrSrv.setDatabaseData({
        usuario: this.loginForm.controls['usuario'].value,
        server: this.loginForm.controls['server'].value,
        gestion: this.loginForm.controls['gestion'].value,
        contabilidad: this.loginForm.controls['contabilidad'].value
      });
      
    }

    let request = {
      usuario: this.loginForm.controls['usuario'].value,
      password: this.loginForm.controls['password'].value,
      server: this.loginForm.controls['server'].value,
      gestion: this.loginForm.controls['gestion'].value,
      contabilidad: this.loginForm.controls['contabilidad'].value
    }
    
    this.usrSrv.auth(request).subscribe(result => {
      this.spinner.hide();
      if(result.statusCode == 200){
        this.usrSrv.setUser(result.data);
        this.router.navigate(['home'], {  });
      }else{
        this.toastr.error(result.message, 'Login', { closeButton: true, timeOut: 3000 });
      }
      
    }, error =>{
      this.toastr.error(error.message, 'Login', { closeButton: true, timeOut: 3000 });
      this.spinner.hide();      
    })
  }


}
