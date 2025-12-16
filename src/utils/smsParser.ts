
import { TransactionType } from '../types';

export interface ParsedSms {
  amount: number;
  type: TransactionType;
  date: number;
  accountNumber?: string;
  merchant?: string;
  originalBody: string;
}

// Common patterns for Indian banks (example)
// "Rs. 1000.00 debited from a/c **1234 on 12-12-24 to AMAZON..."
// "Credited Rs. 5000.00 to a/c XX1234..."
// "Spent Rs. 200.00 on CARD..."

export const parseSms = (body: string, date: number): ParsedSms | null => {
  const lowerBody = body.toLowerCase();
  
  // Basic filtering: must contain amount and transaction keywords
  if (!lowerBody.includes('debit') && 
      !lowerBody.includes('credit') && 
      !lowerBody.includes('spent') &&
      !lowerBody.includes('sent') &&
      !lowerBody.includes('received') &&
      !lowerBody.includes('paid')) {
    return null;
  }

  // Extract Amount: Look for "Rs.", "INR", or just number after "amt"
  // Regex for Amount: (?:Rs\.?|INR)\s*([\d,]+\.?\d*)
  const amountRegex = /(?:Rs\.?|INR|MRP)\s*([\d,]+\.?\d*)/i;
  const amountMatch = body.match(amountRegex);
  
  if (!amountMatch) return null;
  
  let amountStr = amountMatch[1].replace(/,/g, '');
  const amount = parseFloat(amountStr);
  
  if (isNaN(amount)) return null;

  // Determine Type
  let type = TransactionType.EXPENSE;
  if (lowerBody.includes('credit') || lowerBody.includes('received') || lowerBody.includes('deposited')) {
    type = TransactionType.INCOME;
  }
  // "credited to" usually means income, "credited back" might be refund (income)
  // "debited" is expense

  // Extract Account (Last 4 digits often)
  // "a/c no. XX1234", "ending 1234", "**1234"
  const accountRegex = /(?:a\/c|account|card)\s*(?:no\.?)?\s*(?:x+|[*]+)?(\d{3,4})/i;
  const accountMatch = body.match(accountRegex);
  const accountNumber = accountMatch ? accountMatch[1] : undefined;

  // Extract Merchant/Description
  // Usually after "at" or "to" or "via"
  // This is harder and heuristics based.
  let merchant = 'Unknown';
  if (type === TransactionType.EXPENSE) {
    const merchantMatch = body.match(/(?:at|to|via)\s+([A-Za-z0-9\s.*]+?)(?:\s+(?:on|date|ref|bal|available)|$)/i);
    if (merchantMatch) {
      merchant = merchantMatch[1].trim();
    } else {
        // Fallback: take a chunk or just use "SMS Transaction"
        merchant = "SMS Transaction";
    }
  } else {
    const sourceMatch = body.match(/(?:from|by)\s+([A-Za-z0-9\s]+?)(?:\s+(?:on|date|ref|bal)|$)/i);
    if (sourceMatch) {
      merchant = sourceMatch[1].trim();
    } else {
         merchant = "Deposit/Transfer";
    }
  }

  return {
    amount,
    type,
    date,
    accountNumber,
    merchant,
    originalBody: body
  };
};
