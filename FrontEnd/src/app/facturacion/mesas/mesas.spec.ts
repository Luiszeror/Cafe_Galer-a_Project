import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mesas3DComponent} from './mesas';

describe('Mesas', () => {
  let component: Mesas3DComponent;
  let fixture: ComponentFixture<Mesas3DComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mesas3DComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mesas3DComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
