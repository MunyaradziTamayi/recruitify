import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualifiedCandidates } from './qualified-candidates';

describe('QualifiedCandidates', () => {
  let component: QualifiedCandidates;
  let fixture: ComponentFixture<QualifiedCandidates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualifiedCandidates]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualifiedCandidates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
