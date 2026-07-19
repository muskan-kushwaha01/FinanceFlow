import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeComponent } from './income';

describe('IncomeComponent', () => {
  let component: IncomeComponent;
  let fixture: ComponentFixture<IncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});