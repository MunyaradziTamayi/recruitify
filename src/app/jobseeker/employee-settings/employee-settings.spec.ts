import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSettings } from './employee-settings';

describe('EmployeeSettings', () => {
  let component: EmployeeSettings;
  let fixture: ComponentFixture<EmployeeSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
