import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenedOutCandidates } from './screened-out-candidates';

describe('ScreenedOutCandidates', () => {
  let component: ScreenedOutCandidates;
  let fixture: ComponentFixture<ScreenedOutCandidates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenedOutCandidates]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenedOutCandidates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
