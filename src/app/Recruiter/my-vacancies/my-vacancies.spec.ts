import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyVacancies } from './my-vacancies';

describe('MyVacancies', () => {
  let component: MyVacancies;
  let fixture: ComponentFixture<MyVacancies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyVacancies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyVacancies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
