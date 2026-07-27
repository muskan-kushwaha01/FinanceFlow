import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingGoals } from './saving-goals';

describe('SavingGoals', () => {
  let component: SavingGoals;
  let fixture: ComponentFixture<SavingGoals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingGoals],
    }).compileComponents();

    fixture = TestBed.createComponent(SavingGoals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
