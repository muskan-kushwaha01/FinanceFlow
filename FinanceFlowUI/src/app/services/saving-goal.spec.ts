import { TestBed } from '@angular/core/testing';

import { SavingGoal } from './saving-goal';

describe('SavingGoal', () => {
  let service: SavingGoal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavingGoal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
