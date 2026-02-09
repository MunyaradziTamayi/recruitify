import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateCvViewer } from './candidate-cv-viewer';

describe('CandidateCvViewer', () => {
  let component: CandidateCvViewer;
  let fixture: ComponentFixture<CandidateCvViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateCvViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateCvViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
