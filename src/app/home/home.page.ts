import { Component, OnInit } from '@angular/core';
import { ServicioFotosService, Foto } from '../servicios/servicio-fotos.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {

  constructor(public fotosService: ServicioFotosService) {}
  //Cuando empezamos llamamos al metodo cargar fotos
  ngOnInit() {
    this.fotosService.cargarFotos();
  }
  //Tenemos los metodos que se usan en los botones de la aplicacion
  async tomarFoto() {
    await this.fotosService.tomarFoto();
  }

  async eliminar(foto: Foto, i: number) {
    await this.fotosService.borrarFoto(foto, i);
  }
}

