import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';

import {
  SplitBill,
  SplitBillParticipant
} from '../../../models/split-bill';

import { SplitBillService } from '../../../services/split-bill';

interface Settlement {
  from: string;
  to: string;
  amount: number;
}
interface ExpenseCategory {
  categoryId: number;
  categoryName: string;
}

@Component({
  selector: 'app-split-bill',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './split-bill.html',
  styleUrl: './split-bill.css'
})
export class SplitBillComponent implements OnInit {

  // ==========================================
  // Bills
  // ==========================================

  splitBills: SplitBill[] = [];
expenseCategories: ExpenseCategory[] = [];
  showPanel = false;
  isEditing = false;

  editingId: number | null = null;

  userId = Number(localStorage.getItem('userId'));

  currentUserName =
    localStorage.getItem('fullName') || '';

  splitBill: SplitBill =
    this.createEmptyBill();


  // ==========================================
  // Summary
  // ==========================================

  totalBills = 0;
  totalAmount = 0;
  activeBills = 0;

  totalYouOwe = 0;
  totalYouShouldReceive = 0;
  totalPending = 0;

  Math = Math;


  // ==========================================
  // Filters
  // ==========================================

  searchText = '';

  statusFilter = 'All';

  splitTypeFilter = 'All';


  // ==========================================
  // Constructor
  // ==========================================

 constructor(
  private splitBillService: SplitBillService,
  private categoryService: CategoryService,
    private cdr: ChangeDetectorRef

) {}


  // ==========================================
  // Init
  // ==========================================

ngOnInit(): void {

  this.loadExpenseCategories();

  this.loadSplitBills();

}

// ==========================================
// Load Expense Categories
// ==========================================

loadExpenseCategories(): void {

  this.categoryService
    .getExpenseCategories()
    .subscribe({

      next: (categories: any[]) => {

        this.expenseCategories =
          categories.map(category => ({

            categoryId:
              category.categoryId,

            categoryName:
              category.categoryName

          }));

        console.log(
          'Expense categories:',
          this.expenseCategories
        );

      },

      error: (err) => {

        console.error(
          'Error loading expense categories:',
          err
        );

        alert(
          'Unable to load expense categories.'
        );

      }

    });

}
  // ==========================================
  // Empty Bill
  // ==========================================

  createEmptyBill(): SplitBill {

    return {

      billName: '',

      totalAmount: 0,

      billDate:
        new Date()
          .toISOString()
          .split('T')[0],

      categoryId: null,

      splitType: 'Equal',

      paidBy: '',

      participants: [

        {
          participantName: '',
          amountOwed: 0,
          amountPaid: 0
        },

        {
          participantName: '',
          amountOwed: 0,
          amountPaid: 0
        }

      ]

    };

  }


  // ==========================================
  // Current User Participant
  // ==========================================

  getCurrentUserParticipant(
    bill: SplitBill
  ): SplitBillParticipant | undefined {

    const currentUser =
      this.currentUserName
        .trim()
        .toLowerCase();

    return bill.participants.find(
      participant =>

        participant.participantName
          .trim()
          .toLowerCase() === currentUser
    );

  }


  // ==========================================
  // Get Payer
  // ==========================================

  getPayer(
    bill: SplitBill
  ): SplitBillParticipant | undefined {

    if (!bill.paidBy?.trim()) {
      return undefined;
    }

    const payerName =
      bill.paidBy
        .trim()
        .toLowerCase();

    return bill.participants.find(
      participant =>

        participant.participantName
          .trim()
          .toLowerCase() === payerName
    );

  }

  isPayer(
  bill: SplitBill,
  participant: SplitBillParticipant
): boolean {

  if (!bill.paidBy) {
    return false;
  }

  return (
    bill.paidBy.trim().toLowerCase() ===
    participant.participantName.trim().toLowerCase()
  );

}
getParticipantRemaining(
  bill: SplitBill,
  participant: SplitBillParticipant
): number {

  // The person who paid the bill
  // does not owe their own share again.
  if (this.isPayer(bill, participant)) {
    return 0;
  }

  return this.getRemainingAmount(participant);
}

  // ==========================================
  // Remaining Amount
  // ==========================================

  getRemainingAmount(
    participant: SplitBillParticipant
  ): number {

    const owed =
      Number(
        participant.amountOwed || 0
      );

    const paid =
      Number(
        participant.amountPaid || 0
      );

    return Math.max(

      Math.round(
        (owed - paid) * 100
      ) / 100,

      0

    );

  }


  // ==========================================
  // User Balance
  //
  // Positive = You should receive
  // Negative = You owe
  // Zero     = Settled
  // ==========================================

  getUserBalance(
    bill: SplitBill
  ): number {

    const currentUserParticipant =
      this.getCurrentUserParticipant(bill);

    if (!currentUserParticipant) {
      return 0;
    }

    const currentUser =
      this.currentUserName
        .trim()
        .toLowerCase();

    const payer =
      bill.paidBy
        ?.trim()
        .toLowerCase();


    // ==========================================
    // YOU PAID THE BILL
    // ==========================================

    if (
      payer &&
      currentUser === payer
    ) {

      let amountToReceive = 0;

      bill.participants.forEach(
        participant => {

          const participantName =
            participant.participantName
              .trim()
              .toLowerCase();

          // Do not include yourself
          if (
            participantName === payer
          ) {
            return;
          }

          amountToReceive +=
            this.getRemainingAmount(
              participant
            );

        }
      );

      return Math.round(
        amountToReceive * 100
      ) / 100;

    }


    // ==========================================
    // SOMEONE ELSE PAID
    // ==========================================

    const amountToOwe =
      this.getRemainingAmount(
        currentUserParticipant
      );

    return -Math.round(
      amountToOwe * 100
    ) / 100;

  }


  // ==========================================
  // Balance Label
  // ==========================================

  getUserBalanceLabel(
    bill: SplitBill
  ): string {

    const balance =
      this.getUserBalance(bill);

    if (balance > 0.01) {

      return 'You should receive';

    }

    if (balance < -0.01) {

      return 'You owe';

    }

    return 'Settled';

  }


  // ==========================================
  // Settlement Calculation
  // ==========================================

  getSettlement(
    bill: SplitBill
  ): Settlement[] {

    const settlements: Settlement[] = [];

    const payer =
      this.getPayer(bill);

    if (!payer) {
      return settlements;
    }


    const payerName =
      payer.participantName
        .trim()
        .toLowerCase();


    bill.participants.forEach(
      participant => {

        const participantName =
          participant.participantName
            .trim()
            .toLowerCase();


        // Payer doesn't owe themselves
        if (
          participantName === payerName
        ) {
          return;
        }


        const remaining =
          this.getRemainingAmount(
            participant
          );


        if (remaining > 0.01) {

          settlements.push({

            from:
              participant.participantName,

            to:
              payer.participantName,

            amount:
              Math.round(
                remaining * 100
              ) / 100

          });

        }

      }
    );


    return settlements;

  }


  // ==========================================
  // Filtered Bills
  // ==========================================

  get filteredSplitBills(): SplitBill[] {

    return this.splitBills.filter(
      bill => {

        const billName =
          bill.billName || '';


        const searchMatch =
          billName
            .toLowerCase()
            .includes(
              this.searchText
                .toLowerCase()
            );


        const statusMatch =
          this.statusFilter === 'All' ||
          this.getBillStatus(bill) ===
            this.statusFilter;


        const splitTypeMatch =
          this.splitTypeFilter === 'All' ||
          bill.splitType ===
            this.splitTypeFilter;


        return (
          searchMatch &&
          statusMatch &&
          splitTypeMatch
        );

      }
    );

  }

addCurrentUser(): void {

  if (this.isCurrentUserAdded()) {
    return;
  }

  const name =
    this.currentUserName.trim();

  if (!name) {
    alert('Unable to identify the logged-in user.');
    return;
  }

  this.splitBill.participants.unshift({

    participantName: name,

    amountOwed: 0,

    amountPaid: 0

  });

  if (
    this.splitBill.splitType === 'Equal'
  ) {

    this.calculateEqualSplit();

  }

}
isCurrentUserAdded(): boolean {

  const currentUser =
    this.currentUserName
      .trim()
      .toLowerCase();

  return this.splitBill.participants.some(
    participant =>
      participant.participantName
        .trim()
        .toLowerCase() === currentUser
  );

}
  // ==========================================
  // Load Bills
  // ==========================================

  // ==========================================
// Load Bills
// ==========================================

loadSplitBills(): void {

  console.log('Loading split bills for user:', this.userId);

  this.splitBillService
    .getSplitBills(this.userId)
    .subscribe({

      next: (data) => {

        console.log('Split bills received:', data);

        // Create a new array reference
        this.splitBills = [...data];

        // Calculate all summary values
        this.calculateOverview();

        // Force Angular to update the UI
        this.cdr.detectChanges();

        console.log('Summary updated:', {
          totalBills: this.totalBills,
          totalAmount: this.totalAmount,
          activeBills: this.activeBills,
          totalYouOwe: this.totalYouOwe,
          totalYouShouldReceive:
            this.totalYouShouldReceive,
          totalPending: this.totalPending
        });

      },

      error: (err) => {

        console.error(
          'GET SPLIT BILLS ERROR:',
          err
        );

        // Also refresh UI in case error state changes anything
        this.cdr.detectChanges();

      }

    });

}


  // ==========================================
  // Calculate Overview
  // ==========================================

  calculateOverview(): void {

    this.totalBills =
      this.splitBills.length;


    this.totalAmount =
      this.splitBills.reduce(

        (sum, bill) =>

          sum +
          Number(
            bill.totalAmount || 0
          ),

        0

      );


    // ==========================================
    // Active Bills
    // ==========================================

    this.activeBills =
      this.splitBills.filter(
        bill =>

          bill.participants.some(
            participant =>

              this.getRemainingAmount(
                participant
              ) > 0.01

          )

      ).length;


    this.totalYouOwe = 0;

    this.totalYouShouldReceive = 0;

    this.totalPending = 0;


    // ==========================================
    // Calculate User Amounts
    // ==========================================

    this.splitBills.forEach(
      bill => {

        const balance =
          this.getUserBalance(bill);


        // ======================================
        // You Owe
        // ======================================

        if (
          balance < -0.01
        ) {

          this.totalYouOwe +=
            Math.abs(balance);

        }


        // ======================================
        // You Should Receive
        // ======================================

        if (
          balance > 0.01
        ) {

          this.totalYouShouldReceive +=
            balance;

        }


        // ======================================
        // Pending
        //
        // Pending is the amount relevant
        // to YOU for this bill.
        // ======================================

        this.totalPending +=
          Math.abs(balance);

      }
    );


    // ==========================================
    // Round Values
    // ==========================================

    this.totalYouOwe =
      Math.round(
        this.totalYouOwe * 100
      ) / 100;


    this.totalYouShouldReceive =
      Math.round(
        this.totalYouShouldReceive * 100
      ) / 100;


    this.totalPending =
      Math.round(
        this.totalPending * 100
      ) / 100;


    this.totalAmount =
      Math.round(
        this.totalAmount * 100
      ) / 100;
      this.cdr.detectChanges();

  }


  // ==========================================
  // Open Add Panel
  // ==========================================

  openAddPanel(): void {

    this.isEditing = false;

    this.editingId = null;

    this.splitBill =
      this.createEmptyBill();

    this.showPanel = true;

  }


  // ==========================================
  // Open Edit Panel
  // ==========================================

  openEditPanel(
    bill: SplitBill
  ): void {

    this.isEditing = true;

    this.editingId =
      bill.splitBillId ?? null;


    this.splitBill = {

      ...bill,

      participants:
        bill.participants.map(
          participant => ({
            ...participant
          })
        )

    };


    this.showPanel = true;

  }


  // ==========================================
  // Close Panel
  // ==========================================

  closePanel(): void {

    this.showPanel = false;

    this.isEditing = false;

    this.editingId = null;

  }


  // ==========================================
  // Add Participant
  // ==========================================

  addParticipant(): void {

    this.splitBill.participants.push({

      participantName: '',

      amountOwed: 0,

      amountPaid: 0

    });


    if (
      this.splitBill.splitType ===
      'Equal'
    ) {

      this.calculateEqualSplit();

    }

  }


  // ==========================================
  // Remove Participant
  // ==========================================

  removeParticipant(
    index: number
  ): void {

    if (
      this.splitBill.participants.length <= 1
    ) {

      return;

    }


    this.splitBill.participants.splice(
      index,
      1
    );


    if (
      this.splitBill.splitType ===
      'Equal'
    ) {

      this.calculateEqualSplit();

    }

  }


  // ==========================================
  // Split Type Changed
  // ==========================================

  onSplitTypeChange(): void {

    if (
      this.splitBill.splitType ===
      'Equal'
    ) {

      this.calculateEqualSplit();

    }

  }


  // ==========================================
  // Calculate Equal Split
  // ==========================================

  calculateEqualSplit(): void {

    if (
      this.splitBill.splitType !==
      'Equal' ||
      this.splitBill.participants.length === 0
    ) {

      return;

    }


    const total =
      Number(
        this.splitBill.totalAmount || 0
      );


    const count =
      this.splitBill.participants.length;


    if (
      total <= 0 ||
      count <= 0
    ) {

      return;

    }


    const amount =
      total / count;


    const roundedAmount =
      Math.round(
        amount * 100
      ) / 100;


    this.splitBill.participants.forEach(
      participant => {

        participant.amountOwed =
          roundedAmount;

      }
    );


    // ==========================================
    // Handle rounding difference
    // ==========================================

    const totalOwed =
      this.splitBill.participants.reduce(

        (sum, participant) =>

          sum +
          Number(
            participant.amountOwed || 0
          ),

        0

      );


    const difference =
      Math.round(
        (total - totalOwed) * 100
      ) / 100;


    if (
      Math.abs(difference) > 0
    ) {

      this.splitBill.participants[0]
        .amountOwed =

        Math.round(

          (
            Number(
              this.splitBill.participants[0]
                .amountOwed || 0
            ) +
            difference
          ) * 100

        ) / 100;

    }

  }


  // ==========================================
  // Total Participant Amount
  // ==========================================

  getParticipantsTotal(): number {

    return Math.round(

      this.splitBill.participants
        .reduce(

          (sum, participant) =>

            sum +
            Number(
              participant.amountOwed || 0
            ),

          0

        ) * 100

    ) / 100;

  }


  // ==========================================
  // Unequal Split Validation
  // ==========================================

  isUnequalAmountValid(): boolean {

    const total =
      this.getParticipantsTotal();


    const billTotal =
      Number(
        this.splitBill.totalAmount || 0
      );


    return Math.abs(
      total - billTotal
    ) < 0.01;

  }


  // ==========================================
  // Set Payer's Own Share as Paid
  // ==========================================

  markPayerOwnSharePaid(): void {

    if (
      !this.splitBill.paidBy?.trim()
    ) {

      return;

    }


    const payerName =
      this.splitBill.paidBy
        .trim()
        .toLowerCase();


    const payer =
      this.splitBill.participants.find(

        participant =>

          participant.participantName
            .trim()
            .toLowerCase() ===
          payerName

      );


    if (!payer) {
      return;
    }


    // The payer already paid the whole bill,
    // so their own share is considered settled.

    payer.amountPaid =
      Number(
        payer.amountOwed || 0
      );

  }


  // ==========================================
  // Validate Paid By
  // ==========================================

  validatePayer(): boolean {

    if (
      !this.splitBill.paidBy?.trim()
    ) {

      alert(
        'Please select who paid the bill.'
      );

      return false;

    }


    const payerName =
      this.splitBill.paidBy
        .trim()
        .toLowerCase();


    const payerExists =
      this.splitBill.participants.some(

        participant =>

          participant.participantName
            .trim()
            .toLowerCase() ===
          payerName

      );


    if (!payerExists) {

      alert(
        'The person who paid must be one of the participants.'
      );

      return false;

    }


    return true;

  }


  // ==========================================
  // Save Bill
  // ==========================================

  saveSplitBill(): void {

    // ==========================================
    // Bill Name
    // ==========================================

    if (
      !this.splitBill.billName?.trim()
    ) {

      alert(
        'Please enter a bill name.'
      );

      return;

    }
    if (
  this.splitBill.categoryId === null ||
  this.splitBill.categoryId === undefined
) {

  alert(
    'Please select an expense category.'
  );

  return;

}


    // ==========================================
    // Total Amount
    // ==========================================

    if (
      !this.splitBill.totalAmount ||
      this.splitBill.totalAmount <= 0
    ) {

      alert(
        'Please enter a valid total amount.'
      );

      return;

    }


    // ==========================================
    // Bill Date
    // ==========================================

    if (
      !this.splitBill.billDate
    ) {

      alert(
        'Please select a bill date.'
      );

      return;

    }


    // ==========================================
    // Participants
    // ==========================================

    if (
      !this.splitBill.participants ||
      this.splitBill.participants.length === 0
    ) {

      alert(
        'Please add at least one participant.'
      );

      return;

    }


    // ==========================================
    // Participant Names
    // ==========================================

    const emptyParticipant =
      this.splitBill.participants.some(

        participant =>
          !participant.participantName?.trim()

      );


    if (emptyParticipant) {

      alert(
        'Please enter all participant names.'
      );

      return;

    }


    // ==========================================
    // Validate Payer
    // ==========================================

    if (!this.validatePayer()) {
      return;
    }


    // ==========================================
    // Equal Split
    // ==========================================

    if (
      this.splitBill.splitType ===
      'Equal'
    ) {

      this.calculateEqualSplit();

    }


    // ==========================================
    // Unequal Split
    // ==========================================

    if (
      this.splitBill.splitType ===
      'Unequal'
    ) {

      if (
        !this.isUnequalAmountValid()
      ) {

        alert(
          'The participant amounts must equal the total bill amount.'
        );

        return;

      }

    }


    // ==========================================
    // Payer Already Paid Their Own Share
    // ==========================================

    this.markPayerOwnSharePaid();


    // ==========================================
    // UPDATE
    // ==========================================

    if (
      this.isEditing &&
      this.editingId
    ) {

      this.splitBillService
        .updateSplitBill(

          this.editingId,

          this.splitBill,

          this.userId

        )
        .subscribe({

          next: (response) => {

            console.log(
              'UPDATE RESPONSE:',
              response
            );


            alert(

              response.message ||
              'Split bill updated successfully.'

            );


            this.closePanel();

            this.loadSplitBills();

          },


          error: (err) => {

            console.error(
              'UPDATE SPLIT BILL ERROR:',
              err
            );


            alert(

              err.error?.message ||
              'Unable to update split bill.'

            );

          }

        });

      return;

    }


    // ==========================================
    // CREATE
    // ==========================================

    this.splitBillService
      .addSplitBill(

        this.userId,

        this.splitBill

      )
      .subscribe({

        next: (response) => {

          console.log(
            'CREATE RESPONSE:',
            response
          );


          alert(

            response.message ||
            'Split bill created successfully.'

          );


          this.closePanel();

          this.loadSplitBills();

        },


        error: (err) => {

          console.error(
            'CREATE SPLIT BILL ERROR:',
            err
          );


          alert(

            err.error?.message ||
            'Unable to create split bill.'

          );

        }

      });

  }


  // ==========================================
  // Mark Participant Paid
  // ==========================================

  markParticipantPaid(
    bill: SplitBill,
    participant: SplitBillParticipant
  ): void {

    const remaining =
      this.getRemainingAmount(
        participant
      );


    if (
      remaining <= 0.01
    ) {

      return;

    }


    const previousAmount =
      Number(
        participant.amountPaid || 0
      );


    participant.amountPaid =
      Math.min(

        previousAmount +
        remaining,

        Number(
          participant.amountOwed || 0
        )

      );


    this.splitBillService
      .updateSplitBill(

        bill.splitBillId!,

        bill,

        this.userId

      )
      .subscribe({

        next: (response) => {

          console.log(
            'PAYMENT UPDATE RESPONSE:',
            response
          );


          alert(

            response.message ||
            `${participant.participantName} marked as paid.`

          );


          this.loadSplitBills();

        },


        error: (err) => {

          console.error(
            'Error marking participant as paid:',
            err
          );


          // Restore previous amount
          participant.amountPaid =
            previousAmount;


          alert(

            err.error?.message ||
            'Unable to mark payment as completed.'

          );

        }

      });

  }


  // ==========================================
  // Delete Bill
  // ==========================================

  deleteSplitBill(
    id: number
  ): void {

    if (
      !confirm(
        'Are you sure you want to delete this split bill?'
      )
    ) {

      return;

    }


    this.splitBillService
      .deleteSplitBill(

        id,

        this.userId

      )
      .subscribe({

        next: (response) => {

          alert(

            response.message ||
            'Split bill deleted successfully.'

          );


          this.loadSplitBills();

        },


        error: (err) => {

          console.error(
            'DELETE SPLIT BILL ERROR:',
            err
          );


          alert(

            err.error?.message ||
            'Unable to delete split bill.'

          );

        }

      });

  }


  // ==========================================
  // Bill Status
  // ==========================================

  getBillStatus(
  bill: SplitBill
): string {

  const payer = this.getPayer(bill);

  if (!payer) {
    return 'Pending';
  }

  const remaining =
    bill.participants.reduce(

      (sum, participant) =>

        sum +
        this.getParticipantRemaining(
          bill,
          participant
        ),

      0

    );

  return remaining <= 0.01
    ? 'Settled'
    : 'Pending';

}


  // ==========================================
  // Check If Current User Is Payer
  // ==========================================

  isCurrentUserPayer(
    bill: SplitBill
  ): boolean {

    return (

      bill.paidBy
        ?.trim()
        .toLowerCase() ===

      this.currentUserName
        .trim()
        .toLowerCase()

    );

  }


  // ==========================================
  // Current User Pending Amount
  // ==========================================

  getCurrentUserPendingAmount(
    bill: SplitBill
  ): number {

    return Math.abs(
      this.getUserBalance(bill)
    );

  }

}