import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update email and password correctly', () => {
    component.email = 'test@example.com';
    component.password = '12345';
    expect(component.email).toBe('test@example.com');
    expect(component.password).toBe('12345');
  });

  it('should call onLogin without errors', () => {
    spyOn(window, 'alert');
    component.email = 'user@test.com';
    component.password = 'pass';
    component.onLogin();
    expect(window.alert).toHaveBeenCalledWith('Bienvenido user@test.com');
  });
});
