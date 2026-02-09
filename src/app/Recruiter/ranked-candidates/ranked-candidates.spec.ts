import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankedCandidates } from './ranked-candidates';

describe('RankedCandidates', () => {
  let component: RankedCandidates;
  let fixture: ComponentFixture<RankedCandidates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankedCandidates]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RankedCandidates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
