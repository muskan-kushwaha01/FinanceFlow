import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SplitBill } from '../models/split-bill';

@Injectable({
  providedIn: 'root'
})
export class SplitBillService {

  private apiUrl =
    'https://localhost:7144/api/SplitBills';

  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // GET ALL
  // ==========================================

  getSplitBills(
    userId: number
  ): Observable<SplitBill[]> {

    return this.http.get<SplitBill[]>(
      `${this.apiUrl}?userId=${userId}`
    );

  }


  // ==========================================
  // GET ONE
  // ==========================================

  getSplitBill(
    id: number,
    userId: number
  ): Observable<SplitBill> {

    return this.http.get<SplitBill>(
      `${this.apiUrl}/${id}?userId=${userId}`
    );

  }


  // ==========================================
  // CREATE
  // ==========================================

  addSplitBill(
    userId: number,
    bill: SplitBill
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}?userId=${userId}`,
      bill
    );

  }


  // ==========================================
  // UPDATE
  // ==========================================

  updateSplitBill(
    id: number,
    bill: SplitBill,
    userId: number
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}?userId=${userId}`,
      bill
    );

  }


  // ==========================================
  // DELETE
  // ==========================================

  deleteSplitBill(
    id: number,
    userId: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}?userId=${userId}`
    );

  }

}