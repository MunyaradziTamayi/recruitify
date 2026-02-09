import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerLogin } from './employer-login';

describe('EmployerLogin', () => {
  let component: EmployerLogin;
  let fixture: ComponentFixture<EmployerLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
