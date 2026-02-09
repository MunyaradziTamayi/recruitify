import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerDashboard } from './employer-dashboard';

describe('EmployerDashboard', () => {
  let component: EmployerDashboard;
  let fixture: ComponentFixture<EmployerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
