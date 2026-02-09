import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateProfileView } from './candidate-profile-view';

describe('CandidateProfileView', () => {
  let component: CandidateProfileView;
  let fixture: ComponentFixture<CandidateProfileView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateProfileView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateProfileView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
