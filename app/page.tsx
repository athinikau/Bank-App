"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield, CreditCard, BarChart3, Send, Clock, Bell, Menu, LogOut, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getCurrentUser,
  getUserAccounts,
  getAccountTransactions,
  logout,
  initializeStorage,
  isBiometricAvailable,
  isBiometricEnrolled,
} from "@/lib/auth"
import type { Account, Transaction, User as UserType, UpcomingPayment } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function BankingApp() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricEnrolled, setBiometricEnrolled] = useState(false)

  useEffect(() => {
    // Initialize demo data
    initializeStorage()

    // Check if user is logged in
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    setUser(currentUser)

    // Get user accounts
    const userAccounts = getUserAccounts(currentUser.id)
    setAccounts(userAccounts)

    // Get transactions for the first account
    if (userAccounts.length > 0) {
      const accountTransactions = getAccountTransactions(userAccounts[0].id)
      setTransactions(accountTransactions)
    }

    // Check biometric availability and enrollment
    const checkBiometric = async () => {
      try {
        const available = await isBiometricAvailable()
        setBiometricAvailable(available)

        if (available && currentUser) {
          const enrolled = isBiometricEnrolled(currentUser.id)
          setBiometricEnrolled(enrolled)
        }
      } catch (error) {
        console.error("Error checking biometric:", error)
      }
    }

    checkBiometric()
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    logout(() => {
      router.push("/auth/login")
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-capitec-red border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
            <h1 className="text-xl font-bold text-capitec-red">Capitec Banking</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link href="/profile">
                {user?.profileImage ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage} alt={user.firstName} />
                    <AvatarFallback className="bg-capitec-red text-white">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-red-600"
              onClick={handleLogout}
              aria-label="Sign Out"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Hello, {user?.firstName}</h2>
              <Button
                variant="outline"
                size="sm"
                className="text-capitec-blue border-capitec-blue hover:bg-capitec-blue/10"
              >
                <Shield className="mr-2 h-4 w-4" />
                Security Center
              </Button>
            </div>

            {accounts.length > 0 ? (
              <Card className="overflow-hidden bg-white rounded-xl">
                <CardContent className="p-0">
                  <div className="bg-capitec-red p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/80">{accounts[0].name}</p>
                        <p className="text-2xl font-bold">R {accounts[0].balance.toFixed(2)}</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-white/90" />
                    </div>
                    <p className="mt-1 text-xs text-white/70">{accounts[0].maskedNumber}</p>
                  </div>
                  <div className="grid grid-cols-3 divide-x">
                    <Link
                      href="/transfer"
                      className="flex flex-col items-center justify-center p-4 text-center transition-colors hover:bg-muted"
                    >
                      <Send className="mb-1 h-5 w-5 text-capitec-red" />
                      <span className="text-xs font-medium">Transfer</span>
                    </Link>
                    <Link
                      href="/insights"
                      className="flex flex-col items-center justify-center p-4 text-center transition-colors hover:bg-muted"
                    >
                      <BarChart3 className="mb-1 h-5 w-5 text-capitec-red" />
                      <span className="text-xs font-medium">Insights</span>
                    </Link>
                    <Link
                      href="/history"
                      className="flex flex-col items-center justify-center p-4 text-center transition-colors hover:bg-muted"
                    >
                      <Clock className="mb-1 h-5 w-5 text-capitec-red" />
                      <span className="text-xs font-medium">History</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-4">
                <p>No accounts found. Please contact customer support.</p>
              </Card>
            )}
          </section>

          <section>
            <Tabs defaultValue="transactions">
              <TabsList className="grid w-full grid-cols-2 bg-white border">
                <TabsTrigger
                  value="transactions"
                  className="data-[state=active]:bg-capitec-red data-[state=active]:text-white"
                >
                  Recent Transactions
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="data-[state=active]:bg-capitec-red data-[state=active]:text-white"
                >
                  Upcoming Payments
                </TabsTrigger>
              </TabsList>
              <TabsContent value="transactions" className="mt-4">
                <Card className="rounded-xl">
                  <CardContent className="p-0">
                    <TransactionList transactions={transactions} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="upcoming" className="mt-4">
                <Card className="rounded-xl">
                  <CardContent className="p-0">
                    <UpcomingPaymentsList />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
      <nav className="sticky bottom-0 border-t bg-white p-2 md:hidden">
        <div className="grid grid-cols-4 gap-1">
          <Button variant="ghost" className="flex flex-col items-center py-2 text-capitec-blue" asChild>
            <Link href="/">
              <CreditCard className="mb-1 h-5 w-5" />
              <span className="text-xs">Accounts</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-2 text-capitec-blue" asChild>
            <Link href="/transfer">
              <Send className="mb-1 h-5 w-5" />
              <span className="text-xs">Payments</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-2 text-capitec-blue" asChild>
            <Link href="/insights">
              <BarChart3 className="mb-1 h-5 w-5" />
              <span className="text-xs">Insights</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-2 text-capitec-blue" asChild>
            <Link href="/history">
              <Clock className="mb-1 h-5 w-5" />
              <span className="text-xs">History</span>
            </Link>
          </Button>
        </div>
      </nav>
    </div>
  )
}

function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>No transactions found.</p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {transactions.map((transaction) => {
        const transactionDate = new Date(transaction.date)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        let dateDisplay = transactionDate.toLocaleDateString()
        if (transactionDate.toDateString() === today.toDateString()) {
          dateDisplay = `Today, ${transactionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        } else if (transactionDate.toDateString() === yesterday.toDateString()) {
          dateDisplay = `Yesterday, ${transactionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        } else {
          dateDisplay = `${transactionDate.toLocaleDateString("en-ZA", { month: "short", day: "numeric" })}, ${transactionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        }

        return (
          <div key={transaction.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  transaction.type === "credit" ? "bg-green-100" : "bg-slate-100"
                }`}
              >
                {transaction.type === "credit" ? (
                  <BarChart3 className="h-5 w-5 text-green-600" />
                ) : (
                  <CreditCard className="h-5 w-5 text-slate-600" />
                )}
              </div>
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{dateDisplay}</p>
              </div>
            </div>
            <p className={`font-medium ${transaction.type === "credit" ? "text-green-600" : "text-slate-900"}`}>
              {transaction.type === "credit" ? "+" : ""}
              {`R ${Math.abs(transaction.amount).toFixed(2)}`}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function UpcomingPaymentsList() {
  const payments: UpcomingPayment[] = [
    {
      id: "1",
      name: "Car Insurance",
      date: "Apr 01",
      amount: "R 1,250.00",
    },
    {
      id: "2",
      name: "Mortgage Payment",
      date: "Apr 05",
      amount: "R 8,500.00",
    },
    {
      id: "3",
      name: "Gym Membership",
      date: "Apr 07",
      amount: "R 399.00",
    },
    {
      id: "4",
      name: "Internet Bill",
      date: "Apr 15",
      amount: "R 799.00",
    },
  ]

  return (
    <div className="divide-y">
      {payments.map((payment) => (
        <div key={payment.id} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium">{payment.name}</p>
              <p className="text-xs text-muted-foreground">Due {payment.date}</p>
            </div>
          </div>
          <p className="font-medium text-slate-900">{payment.amount}</p>
        </div>
      ))}
    </div>
  )
}

