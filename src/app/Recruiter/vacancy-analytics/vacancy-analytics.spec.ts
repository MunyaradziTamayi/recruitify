import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacancyAnalytics } from './vacancy-analytics';

describe('VacancyAnalytics', () => {
  let component: VacancyAnalytics;
  let fixture: ComponentFixture<VacancyAnalytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacancyAnalytics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VacancyAnalytics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
