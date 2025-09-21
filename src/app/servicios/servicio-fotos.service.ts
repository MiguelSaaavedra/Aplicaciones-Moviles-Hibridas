import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

//Definimos el objeto Foto
export interface Foto {
  filepath: string;     
  webviewPath?: string; 
}

//Utilizamos el servicio en toda la aplicacion
@Injectable({
  providedIn: 'root'
})

//Declaramos el servicio que contiene la logica de negocio
export class ServicioFotosService {
  
  //Array para las fotos de tipo Foto y clave del nombre de guardado
  public fotos: Foto[] = [];                    
  private PHOTO_STORAGE = 'fotos';          

  //El constructor que termina guardando la plataforma sobre la que funciona
  //la aplicacion.
  constructor(private platform: Platform) { }

  //Este metodo trae las fotos del amacenamiento a la aplicacion
  public async cargarFotos() {
    //Nos aseguramos que si el array de fotos contiene o no algo
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.fotos = value ? JSON.parse(value) : [];
    //Si la plataforma es hibrida entonces se niega y realiza la condicion
    //Es decir entra si es un navegador 
    if (!this.platform.is('hybrid')) {
      for (const foto of this.fotos) {
        try {
          const readFile = await Filesystem.readFile({
            path: foto.filepath,
            directory: Directory.Data
          });
          //Prepara la URI para que el navegador sepa que es un archivo de imagen
          //y no una URL que debe seguir
          foto.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
        } catch (err) {
          console.warn('No se pudo leer el archivo en web:', foto.filepath, err);
        }
      }
    }
  }

  //Metodo para tomar una foto
  public async tomarFoto() {
    //Abrimos la camara para tomar la foto
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri, //Devuelve una URI
      source: CameraSource.Camera,  //Desde la camara    
      quality: 90 // Compresion de 90%
    });
    //Enviamos la foto al metodo readAsBase64 para que transorme a ese formato
    const base64Data = await this.readAsBase64(photo);
    //Creamos el nombre del archivo en vase al tiempo y hora de la creacion
    const fileName = new Date().getTime() + '.jpeg';
    //Enviamos la informacion del archivo y recibimos la URI
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });
    //Creamos un objeto Foto
    const savedFoto: Foto = {
      filepath: fileName,
      webviewPath: this.platform.is('hybrid') ? Capacitor.convertFileSrc((savedFile as any).uri) : photo.webPath //Verificamos nuevamente si es para web o hibrido
    };
    //Guardamos el archivo encima del array (Tipo pila)
    //Para que la nueva foto aparezca en primer lugar
    this.fotos.unshift(savedFoto);
    await Preferences.set({ key: this.PHOTO_STORAGE, value: JSON.stringify(this.fotos) });
  }
  //Metodo para eliminar una foto
    public async borrarFoto(photo: Foto, position: number) {
    this.fotos.splice(position, 1); //splice borra un archivo del array en la posicion que le damos
    await Preferences.set({ key: this.PHOTO_STORAGE, value: JSON.stringify(this.fotos) });

    try {
      await Filesystem.deleteFile({
        path: photo.filepath,
        directory: Directory.Data
      });
    } catch (err) {
      console.error('Error al borrar archivo:', err);
    }
  }


  private async readAsBase64(photo: Photo): Promise<string> {
  
  const response = await fetch(photo.webPath!);//Solicitamos la informacion del archivo
  const blob = await response.blob(); //Convertimos la respuesta a tipo blob
  //Devolvemos el resultado de el metodo convertBlobToBase64 con el objeto blob
  //para devolver un string de tipo base64
  return await this.convertBlobToBase64(blob) as string;
}

  
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = reader.result as string;         
      const base64 = dataUrl.split(',')[1];            
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}
