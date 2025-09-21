import { TestBed } from '@angular/core/testing';

import { ServicioFotos } from './servicio-fotos.service';

describe('ServicioFotos', () => {
  let service: ServicioFotos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioFotos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
