import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacancyDetails } from './vacancy-details';

describe('VacancyDetails', () => {
  let component: VacancyDetails;
  let fixture: ComponentFixture<VacancyDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacancyDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VacancyDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
