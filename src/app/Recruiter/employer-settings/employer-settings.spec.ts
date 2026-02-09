import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerSettings } from './employer-settings';

describe('EmployerSettings', () => {
  let component: EmployerSettings;
  let fixture: ComponentFixture<EmployerSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
