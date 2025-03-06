export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
  phoneNumber: string
  idNumber: string
  profileImage?: string
}

export interface Account {
  id: string
  userId: string
  name: string
  accountNumber: string
  balance: number
  type: "current" | "savings" | "investment" | "credit"
  maskedNumber: string
}

export interface Transaction {
  id: string
  accountId: string
  date: string
  description: string
  amount: number
  type: "credit" | "debit"
  category: "shopping" | "income" | "entertainment" | "transport" | "transfer" | "other"
}

export interface Beneficiary {
  id: string
  userId: string
  name: string
  accountNumber: string
  bankName: string
  branchCode: string
  reference: string
}

export interface UpcomingPayment {
  id: string
  name: string
  date: string
  amount: string
}

