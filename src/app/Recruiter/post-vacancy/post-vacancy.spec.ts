import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostVacancy } from './post-vacancy';

describe('PostVacancy', () => {
  let component: PostVacancy;
  let fixture: ComponentFixture<PostVacancy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostVacancy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostVacancy);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
