import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationStatistics } from './application-statistics';

describe('ApplicationStatistics', () => {
  let component: ApplicationStatistics;
  let fixture: ComponentFixture<ApplicationStatistics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationStatistics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationStatistics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
