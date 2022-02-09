import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class PrintService {

  HEADER_STYLE: string = `
    .header{
      font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: black; 
      text-align: center; 
      font-weight: bold; 
      font-size: 18px; 
      margin-bottom: 20px;
    }

  `;

  TABLE_STYLE: string = `
    
    table {
      width: 100% !important;
      font-size: 12px;
      font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      border-collapse: collapse;
    }
    thead {
      font-weight: 900;
    }
    table, td, th {
      padding-bottom: 5px;
    }

    

    .font{
      font-size: 11px;
    }

    .fontSmall{
      font-size: 10px;
    }

    .fontLarge{
      font-size: 12px;
    }
   
    .text-align-center{
      text-align: center !important;
    }
    .text-align-right{
      text-align: right !important;
    }
    .text-align-left{
      text-align: left !important;
    }
    .margin-right{
      margin-right: 450px !important;
    }
    .margin-right2{
      margin-right: 400px !important;
    }
    .margin-right3{
      margin-right: 530px !important;
    }
    .margin-right4{
      margin-right: 250px !important;
    }
    .margin-right5{
      margin-right: 300px !important;
    }

    .margin-left{
      margin-left: 525px !important;
    }

    .margin-right80{
      margin-right: 80px !important;
    }

    .negrita{
      font-weight: 900;
    }

    .footerClass{
      position:absolute; 
      bottom: 0; 
      right:0; 
      width: 100%;
    }

    
    .wrapper {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-gap: 10px;
    }
    
    .wrapper2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-gap: 5px;
    }


    .mt-5{
      margin-top: 5px;
    }

    .mt-10{
      margin-top: 10px;
    }

    .mb-5{
      margin-bottom: 5px;
    }

    .p-5{
      padding: 5px;
    }

    .m-5{
      margin: 5px;
    }

    .p-10{
      padding: 10px;
    }

    .m-10{
      margin: 10px;
    }

    .border{
      border: 1pt solid grey;
    }

    .border-bottom{
      border-bottom: 1px solid grey;
    }

    .ml-10{
      margin-left: 10px;
    }

    .ml-50{
      margin-left: 50px;
    }

    .ml-100{
      margin-left: 100px;
    }

    .ml-150{
      margin-left: 150px;
    }

    .ml-200{
      margin-left: 200px;
    }

    .mr-10{
      margin-right: 10px;
    }

    .mr-50{
      margin-right: 50px;
    }

    .mr-100{
      margin-right: 100px;
    }

    .mr-150{
      margin-right: 150px;
    }

    .mr-200{
      margin-right: 200px;
    }

    .ml-0{
      margin-left: 0px;
    }

    .mr-0{
      margin-right: 0px;
    }

    
    

     

  `

  TABLE_BALANCE_ANUAL_STYLE: string = `
    
    table {
      width: 100% !important;
      font-size: 10px;
      font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      border-collapse: collapse;
    }
    thead {
      font-weight: 900;
    }
    table, td, th {
      border: 1px solid gray;
      padding-bottom: 5px;
    }
   

    border{
      border: 2px solid black;
    }
    
    .fondo{
      background-color: red;
    }

    .text-align-center{
      text-align: center !important;
    }
    .text-align-right{
      text-align: right !important;
    }
    .text-align-left{
      text-align: left !important;
    }
  `

  CHART_STYLE: string = `
    .modal-body{ 
      width: 60%;
      padding: 0px;
      margin: 0px;
    }
    
    @page{
      size: 100%; 
      margin: 0px;
    }
  `

  DATA_STYLE: string = `
    .form-control{
      border: transparent;
      font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 16px;
      font-weight: bold;
      display: inline-block;
    }

    .control-label{
      font-size: 16px;
      font-weight: bold;
      float: left;
    }

    .form-horizontal{
      display: block;
    }

    .m-t{
      margin-top: 15px;
    }

    .pull-right{
      position: absolute;
      bottom: 35px;
      right: 35px;
    }

    .my-label{
      font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 16px;
      font-weight: bold;
    }

    .m-b{
      margin-bottom: 15px;
    }
  `

  DATA_LIBRO_STYLE: string = `
  .form-control{
    border: transparent;
    font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 16px;
    font-weight: bold;
    display: inline-block;
  }

  .control-label{
    font-size: 16px;
    font-weight: bold;
    float: left;
  }

  .form-horizontal{
    display: block;
  }

  .m-t{
    margin-top: 45px;
  }

  .pull-right{
    position: absolute;
    bottom: 35px;
    right: 35px;
  }

  .pull-left{
    position: absolute;
    bottom: 35px;
    left: 35px;
  }

  .my-label{
    font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 16px;
    font-weight: bold;
  }

  .m-b{
    margin-bottom: 15px;
  }
  .border-bottom{
    border-bottom: 2px solid black;
  }

  .float-right{
    float: right;
    margin-bottom: 15px;
    margin-top: 15px;

  }
  .float-left{
      float: left;
      margin-bottom: 15px;
      margin-top: 15px;
  }
  .content{
    margin: 40px !important;
    
  }

  .header{
    text-align: center;
    margin: 0px;
    padding: 0px;
    border-bottom: 4px solid #f3f3f4;
    border-top: 4px solid #f3f3f4;
    margin-bottom: 5px;
    font-size: 22px;
    color: #363636;
  }

  .text-align-center{
    text-align: center;
  }


  .mb-0{
    margin-bottom: 0px !important;
  }

  .mb-1{
    margin-bottom: 5px !important;
  }

  .mb-2{
    margin-bottom: 10px !important;
  }

  .mb-3{
    margin-bottom: 15px !important;
  }

  .mb-4{
    margin-bottom: 20px !important;
  }

  .mb-5{
    margin-bottom: 25px !important;
  }

  .mb-6{
    margin-bottom: 30px !important;
  }

  .mt-0{
    margin-top: 0px !important;
  }

  .mt-1{
    margin-top: 5px !important;
  }

  .mt-2{
    margin-top: 10px !important;
  }

  .mt-3{
    margin-top: 15px !important;
  }

  .mt-4{
    margin-top: 20px !important;
  }

  .mt-5{
    margin-top: 25px !important;
  }

  .mt-6{
    margin-top: 30px !important;
  }

  .mr-1{
    margin-right: 5px;
  }

  .mr-2{
    margin-right: 10px;
  }
  .mr-3{
    margin-right: 15px !important;
  }
  .mr-4{
    margin-right: 20px !important;
  }
  .mr-5{
    margin-right: 25px !important;
  }
  .mr-6{
    margin-right: 30px;
  }

  .ml-1{
    margin-left: 5px;
  }

  .ml-2{
    margin-left: 10px;
  }
  .ml-3{
    margin-left: 15px;
  }
  .ml-4{
    margin-left: 20px;
  }
  .ml-5{
    margin-left: 25px !important;
  }
  .ml-6{
    margin-left: 30px;
  }

  .pr-1{
    padding-right: 5px;
  }

  .pr-2{
    padding-right: 10px;
  }
  .pr-3{
    padding-right: 15px;
  }
  .pr-4{
    padding-right: 20px;
  }
  .pr-5{
    padding-right: 25px;
  }
  .pr-6{
    padding-right: 30px;
  }

  .pl-1{
    padding-left: 5px;
  }

  .pl-2{
    padding-left: 10px;
  }
  .pl-3{
    padding-left: 15px;
  }
  .pl-4{
    padding-left: 20px;
  }
  .pl-5{
    padding-left: 25px;
  }
  .pl-6{
    padding-left: 30px;
  }

  .fuente{
    font-size: 13px;
    font-family: Arial, Helvetica, sans-serif;
  }

  .btn-size{
    width: 40px;
  }

  .group-label{
    font-size: 10px;
    color:gray;
    margin-bottom: 5px;
    font-weight: 700;
  }

  .title{
    font-size: 15px;
    font-weight: bold;
  }
`

  constructor() { }

  getTableStyle(): string{
    return this.TABLE_STYLE;
  }

  getTableBalanceStyle(): string{
    return this.TABLE_BALANCE_ANUAL_STYLE;
  }

  getHeaderStyle(): string{
    return this.HEADER_STYLE;
  }

  getChartStyle(): string{
    return this.CHART_STYLE;
  }

  getDataStyle(): string{
    return this.DATA_STYLE;
  }

  getLibroDiarioClases(): string{
    return this.DATA_LIBRO_STYLE;
  }

}