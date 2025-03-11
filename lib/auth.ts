// This is a simplified auth system for demo purposes
// In a real app, you would use a proper authentication system with a backend

import type { User, Account, Transaction, Beneficiary } from "@/types"

// Initial demo data
const initialUsers: User[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah@example.com",
    username: "sarah",
    password: "Password123", // In a real app, passwords would be hashed
    phoneNumber: "071 234 5678",
    idNumber: "8901235678901",
  },
  {
    id: "2",
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    username: "john",
    password: "Password123",
    phoneNumber: "082 345 6789",
    idNumber: "9001235678901",
  },
]

const initialAccounts: Account[] = [
  {
    id: "1",
    userId: "1",
    name: "Global One Account",
    accountNumber: "1234567890",
    balance: 24560.75,
    type: "current",
    maskedNumber: "**** **** **** 4587",
  },
  {
    id: "2",
    userId: "1",
    name: "Savings Account",
    accountNumber: "0987654321",
    balance: 15200.3,
    type: "savings",
    maskedNumber: "**** **** **** 3456",
  },
  {
    id: "3",
    userId: "2",
    name: "Global One Account",
    accountNumber: "5678901234",
    balance: 18750.45,
    type: "current",
    maskedNumber: "**** **** **** 7890",
  },
]

const initialTransactions: Transaction[] = [
  {
    id: "1",
    accountId: "1",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    description: "Woolworths",
    amount: -245.8,
    type: "debit",
    category: "shopping",
  },
  {
    id: "2",
    accountId: "1",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    description: "Salary Deposit",
    amount: 18500.0,
    type: "credit",
    category: "income",
  },
  {
    id: "3",
    accountId: "1",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    description: "Netflix Subscription",
    amount: -159.0,
    type: "debit",
    category: "entertainment",
  },
  {
    id: "4",
    accountId: "1",
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    description: "Uber Ride",
    amount: -87.5,
    type: "debit",
    category: "transport",
  },
  {
    id: "5",
    accountId: "1",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    description: "Transfer to John",
    amount: -500.0,
    type: "debit",
    category: "transfer",
  },
]

const initialBeneficiaries: Beneficiary[] = [
  {
    id: "1",
    userId: "1",
    name: "John Smith",
    accountNumber: "5678901234",
    bankName: "FNB",
    branchCode: "250655",
    reference: "John",
  },
  {
    id: "2",
    userId: "1",
    name: "Sarah Johnson",
    accountNumber: "0987654321",
    bankName: "Nedbank",
    branchCode: "198765",
    reference: "Sarah",
  },
]

// Initialize local storage with demo data if it doesn't exist
export const initializeStorage = () => {
  if (typeof window === "undefined") return

  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(initialUsers))
  }

  if (!localStorage.getItem("accounts")) {
    localStorage.setItem("accounts", JSON.stringify(initialAccounts))
  } else {
    // Check if Sarah has a savings account, if not add one
    const accounts = JSON.parse(localStorage.getItem("accounts") || "[]") as Account[]
    const sarahId = "1" // Sarah's user ID
    const hasSavingsAccount = accounts.some((account) => account.userId === sarahId && account.type === "savings")

    if (!hasSavingsAccount) {
      const newSavingsAccount: Account = {
        id: Date.now().toString(),
        userId: sarahId,
        name: "Savings Account",
        accountNumber: "0987654321",
        balance: 15200.3,
        type: "savings",
        maskedNumber: "**** **** **** 3456",
      }

      accounts.push(newSavingsAccount)
      localStorage.setItem("accounts", JSON.stringify(accounts))
    }
  }

  if (!localStorage.getItem("transactions")) {
    localStorage.setItem("transactions", JSON.stringify(initialTransactions))
  }

  if (!localStorage.getItem("beneficiaries")) {
    localStorage.setItem("beneficiaries", JSON.stringify(initialBeneficiaries))
  }

  // Initialize biometric enrollment for demo purposes
  // This will make biometric authentication active by default for Sarah
  if (typeof window !== "undefined") {
    localStorage.setItem("biometric_enrolled_1", "true")
    localStorage.setItem("biometric_username", "sarah")
  }
}

// Auth functions
// Check if biometric authentication is available on the device
export const isBiometricAvailable = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false

  // For demo purposes, always return true to simulate biometric availability
  return true

  // In a real mobile app, you would use platform-specific APIs
  // This is a simplified check for web browsers that support WebAuthn
  /*
if (window.PublicKeyCredential) {
  try {
    // Check if platform authenticator is available
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch (error) {
    console.error("Error checking biometric availability:", error)
    return false
  }
}
return false
*/
}

// Store biometric enrollment status for a user
export const enrollBiometric = (userId: string): void => {
  if (typeof window === "undefined") return

  try {
    // In a real app, you would register the biometric credential with the server
    // For our demo, we'll just store a flag in localStorage
    localStorage.setItem(`biometric_enrolled_${userId}`, "true")

    // Also store the username for biometric login
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: any) => u.id === userId)
    if (user) {
      localStorage.setItem("biometric_username", user.username)
    }
  } catch (error) {
    console.error("Error enrolling biometric:", error)
  }
}

// Check if a user has enrolled biometric authentication
export const isBiometricEnrolled = (userId: string): boolean => {
  if (typeof window === "undefined") return false

  try {
    return localStorage.getItem(`biometric_enrolled_${userId}`) === "true"
  } catch (error) {
    console.error("Error checking biometric enrollment:", error)
    return false
  }
}

// Add this function to check if any user has enrolled biometrics
export const isAnyUserBiometricEnrolled = (): boolean => {
  if (typeof window === "undefined") return false

  try {
    // Check if biometric_username exists in localStorage
    return !!localStorage.getItem("biometric_username")
  } catch (error) {
    console.error("Error checking biometric enrollment:", error)
    return false
  }
}

// Perform biometric authentication
export const authenticateWithBiometric = async (): Promise<User | null> => {
  if (typeof window === "undefined") return null

  try {
    // Check if biometric is enrolled
    const biometricUsername = localStorage.getItem("biometric_username")
    if (!biometricUsername) {
      throw new Error("No biometric enrollment found. Please enroll biometrics in your profile settings first.")
    }

    // Simulate biometric verification prompt
    const isAuthenticated = await simulateBiometricPrompt()

    if (isAuthenticated) {
      // If authenticated, log in the user
      return login(biometricUsername, "", true) // The true flag indicates biometric login
    }

    return null
  } catch (error) {
    console.error("Biometric authentication error:", error)
    throw error // Re-throw to allow handling in the UI
  }
}

// Simulate a biometric prompt (in a real app, this would be handled by the platform)
const simulateBiometricPrompt = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // In a real app, this would show the native biometric prompt
    // For our demo, we'll use a confirm dialog
    const confirmed = window.confirm(
      "Simulate Biometric Authentication\n\nPlace your finger on the sensor or look at the camera",
    )

    // Simulate a slight delay for realism
    setTimeout(() => {
      resolve(confirmed)
    }, 1000)
  })
}

// Update the login function to support biometric authentication
export const login = (username: string, password: string, isBiometric = false): User | null => {
  if (typeof window === "undefined") return null

  const users = JSON.parse(localStorage.getItem("users") || "[]") as User[]

  let user

  if (isBiometric) {
    // For biometric login, we only need to check the username
    user = users.find((u) => u.username === username)
  } else {
    // For regular login, check both username and password
    user = users.find((u) => u.username === username && u.password === password)
  }

  if (user) {
    // Store current user in session storage (cleared when browser is closed)
    sessionStorage.setItem("currentUser", JSON.stringify(user))
    return user
  }

  return null
}

// Enhanced logout function with optional callback
export const logout = (callback?: () => void): void => {
  if (typeof window === "undefined") return

  // Clear user session
  sessionStorage.removeItem("currentUser")

  // Execute callback if provided
  if (callback) {
    callback()
  }
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  const userJson = sessionStorage.getItem("currentUser")
  if (!userJson) return null

  return JSON.parse(userJson) as User
}

export const register = (user: Omit<User, "id">): User => {
  if (typeof window === "undefined") throw new Error("Cannot register on server")

  const users = JSON.parse(localStorage.getItem("users") || "[]") as User[]

  // Check if username or email already exists
  if (users.some((u) => u.username === user.username)) {
    throw new Error("Username already exists")
  }

  if (users.some((u) => u.email === user.email)) {
    throw new Error("Email already exists")
  }

  const newUser: User = {
    ...user,
    id: Date.now().toString(),
  }

  users.push(newUser)
  localStorage.setItem("users", JSON.stringify(users))

  // Create accounts for the new user
  const accounts = JSON.parse(localStorage.getItem("accounts") || "[]") as Account[]

  // Create a current account
  const newCurrentAccount: Account = {
    id: Date.now().toString(),
    userId: newUser.id,
    name: "Global One Account",
    accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
    balance: 5000, // Give them some starting money
    type: "current",
    maskedNumber: "**** **** **** " + Math.floor(1000 + Math.random() * 9000).toString(),
  }

  // Create a savings account
  const newSavingsAccount: Account = {
    id: (Date.now() + 1).toString(),
    userId: newUser.id,
    name: "Savings Account",
    accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
    balance: 2500, // Give them some starting money
    type: "savings",
    maskedNumber: "**** **** **** " + Math.floor(1000 + Math.random() * 9000).toString(),
  }

  accounts.push(newCurrentAccount, newSavingsAccount)
  localStorage.setItem("accounts", JSON.stringify(accounts))

  return newUser
}

// Account functions
export const getUserAccounts = (userId: string): Account[] => {
  if (typeof window === "undefined") return []

  const accounts = JSON.parse(localStorage.getItem("accounts") || "[]") as Account[]
  return accounts.filter((account) => account.userId === userId)
}

export const getAccountById = (accountId: string): Account | null => {
  if (typeof window === "undefined") return null

  const accounts = JSON.parse(localStorage.getItem("accounts") || "[]") as Account[]
  return accounts.find((account) => account.id === accountId) || null
}

// Transaction functions
export const getAccountTransactions = (accountId: string): Transaction[] => {
  if (typeof window === "undefined") return []

  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]") as Transaction[]
  return transactions
    .filter((transaction) => transaction.accountId === accountId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const addTransaction = (transaction: Omit<Transaction, "id">): Transaction => {
  if (typeof window === "undefined") throw new Error("Cannot add transaction on server")

  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]") as Transaction[]

  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
  }

  transactions.push(newTransaction)
  localStorage.setItem("transactions", JSON.stringify(transactions))

  // Update account balance
  const accounts = JSON.parse(localStorage.getItem("accounts") || "[]") as Account[]
  const accountIndex = accounts.findIndex((a) => a.id === transaction.accountId)

  if (accountIndex !== -1) {
    accounts[accountIndex].balance += transaction.amount
    localStorage.setItem("accounts", JSON.stringify(accounts))
  }

  return newTransaction
}

// Beneficiary functions
export const getUserBeneficiaries = (userId: string): Beneficiary[] => {
  if (typeof window === "undefined") return []

  const beneficiaries = JSON.parse(localStorage.getItem("beneficiaries") || "[]") as Beneficiary[]
  return beneficiaries.filter((beneficiary) => beneficiary.userId === userId)
}

export const addBeneficiary = (beneficiary: Omit<Beneficiary, "id">): Beneficiary => {
  if (typeof window === "undefined") throw new Error("Cannot add beneficiary on server")

  const beneficiaries = JSON.parse(localStorage.getItem("beneficiaries") || "[]") as Beneficiary[]

  const newBeneficiary: Beneficiary = {
    ...beneficiary,
    id: Date.now().toString(),
  }

  beneficiaries.push(newBeneficiary)
  localStorage.setItem("beneficiaries", JSON.stringify(beneficiaries))

  return newBeneficiary
}

// Transfer money
export const transferMoney = (
  fromAccountId: string,
  toAccountId: string | null,
  beneficiaryId: string | null,
  amount: number,
  reference: string,
) => {
  if (typeof window === "undefined") throw new Error("Cannot transfer money on server")
  if (amount <= 0) throw new Error("Amount must be greater than 0")

  const accounts = JSON.parse(localStorage.getItem("accounts") || "[]") as Account[]
  const fromAccountIndex = accounts.findIndex((a) => a.id === fromAccountId)

  if (fromAccountIndex === -1) throw new Error("From account not found")
  if (accounts[fromAccountIndex].balance < amount) throw new Error("Insufficient funds")

  // Deduct from source account
  accounts[fromAccountIndex].balance -= amount

  // Add debit transaction to source account
  addTransaction({
    accountId: fromAccountId,
    date: new Date().toISOString(),
    description: reference || "Transfer",
    amount: -amount,
    type: "debit",
    category: "transfer",
  })

  // If transferring to another account in the system
  if (toAccountId) {
    const toAccountIndex = accounts.findIndex((a) => a.id === toAccountId)

    if (toAccountIndex !== -1) {
      // Add to destination account
      accounts[toAccountIndex].balance += amount

      // Add credit transaction to destination account
      addTransaction({
        accountId: toAccountId,
        date: new Date().toISOString(),
        description: reference || "Transfer received",
        amount: amount,
        type: "credit",
        category: "transfer",
      })
    }
  }

  // If transferring to a beneficiary (in a real app, this would involve an external API call)
  if (beneficiaryId) {
    const beneficiaries = JSON.parse(localStorage.getItem("beneficiaries") || "[]") as Beneficiary[]
    const beneficiary = beneficiaries.find((b) => b.id === beneficiaryId)

    if (!beneficiary) throw new Error("Beneficiary not found")

    // In a real app, you would make an API call to transfer to an external account
    console.log(`Transferred R${amount} to beneficiary ${beneficiary.name} at ${beneficiary.bankName}`)
  }

  localStorage.setItem("accounts", JSON.stringify(accounts))

  return { success: true }
}

// Add updateUserProfile function to auth.ts
export const updateUserProfile = (userId: string, updatedData: Partial<Omit<User, "id" | "password" | "username">>) => {
  if (typeof window === "undefined") throw new Error("Cannot update profile on server")

  const users = JSON.parse(localStorage.getItem("users") || "[]") as User[]
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) throw new Error("User not found")

  // Update user data
  const updatedUser = {
    ...users[userIndex],
    ...updatedData,
  }

  users[userIndex] = updatedUser

  // Save to localStorage
  localStorage.setItem("users", JSON.stringify(users))

  // Update current user in session storage
  sessionStorage.setItem("currentUser", JSON.stringify(updatedUser))

  return updatedUser
}

