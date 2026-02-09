import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacancyApplicants } from './vacancy-applicants';

describe('VacancyApplicants', () => {
  let component: VacancyApplicants;
  let fixture: ComponentFixture<VacancyApplicants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacancyApplicants]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VacancyApplicants);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
