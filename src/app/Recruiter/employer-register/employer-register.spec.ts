import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerRegister } from './employer-register';

describe('EmployerRegister', () => {
  let component: EmployerRegister;
  let fixture: ComponentFixture<EmployerRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
