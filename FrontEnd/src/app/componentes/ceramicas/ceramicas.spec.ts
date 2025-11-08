import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CeramicasComponent } from './ceramicas';

describe('ceramicas', () => {
  let component: CeramicasComponent ;
  let fixture: ComponentFixture<CeramicasComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CeramicasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CeramicasComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
