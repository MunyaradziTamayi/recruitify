import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerNotifications } from './employer-notifications';

describe('EmployerNotifications', () => {
  let component: EmployerNotifications;
  let fixture: ComponentFixture<EmployerNotifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerNotifications]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerNotifications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
