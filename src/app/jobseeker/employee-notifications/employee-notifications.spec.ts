import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeNotifications } from './employee-notifications';

describe('EmployeeNotifications', () => {
  let component: EmployeeNotifications;
  let fixture: ComponentFixture<EmployeeNotifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeNotifications]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeNotifications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
