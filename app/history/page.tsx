"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowDown, ArrowUp, Search, Filter, Calendar, Download, CreditCard, BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser, getUserAccounts, getAccountTransactions } from "@/lib/auth"
import type { Account, Transaction } from "@/types"

export default function HistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [dateRange, setDateRange] = useState("all")

  useEffect(() => {
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

    if (userAccounts.length > 0) {
      const defaultAccount = userAccounts[0].id
      setSelectedAccount(defaultAccount)

      // Get transactions for the first account
      const accountTransactions = getAccountTransactions(defaultAccount)
      setTransactions(accountTransactions)
      setFilteredTransactions(accountTransactions)
    }

    setLoading(false)
  }, [router, dateRange, filterType, searchTerm])

  useEffect(() => {
    if (selectedAccount) {
      const accountTransactions = getAccountTransactions(selectedAccount)
      setTransactions(accountTransactions)
      applyFilters(accountTransactions, searchTerm, filterType, dateRange)
    }
  }, [selectedAccount, searchTerm, filterType, dateRange])

  const applyFilters = (transactionsToFilter: Transaction[], search: string, type: string, date: string) => {
    let filtered = [...transactionsToFilter]

    // Apply search filter
    if (search) {
      filtered = filtered.filter((t) => t.description.toLowerCase().includes(search.toLowerCase()))
    }

    // Apply type filter
    if (type !== "all") {
      filtered = filtered.filter((t) => t.type === type)
    }

    // Apply date filter
    const now = new Date()
    if (date === "today") {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date)
        return transactionDate.toDateString() === now.toDateString()
      })
    } else if (date === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date)
        return transactionDate >= weekAgo
      })
    } else if (date === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date)
        return transactionDate >= monthAgo
      })
    }

    setFilteredTransactions(filtered)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    applyFilters(transactions, value, filterType, dateRange)
  }

  const handleFilterType = (value: string) => {
    setFilterType(value)
    applyFilters(transactions, searchTerm, value, dateRange)
  }

  const handleDateRange = (value: string) => {
    setDateRange(value)
    applyFilters(transactions, searchTerm, filterType, value)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-capitec-red border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your transaction history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 bg-capitec-red px-4 py-3 shadow-sm">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="ml-4 text-xl font-bold text-white">Transaction History</h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Transaction History</CardTitle>
                <Button variant="outline" size="sm" className="text-capitec-blue">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger className="border-capitec-blue/30 focus:ring-capitec-red">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - R {account.balance.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions"
                      className="pl-8 border-capitec-blue/30 focus-visible:ring-capitec-red"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Filter:</span>
                  </div>

                  <Tabs defaultValue="all" className="w-auto" value={filterType} onValueChange={handleFilterType}>
                    <TabsList className="bg-muted/50 h-8">
                      <TabsTrigger value="all" className="text-xs h-7 px-3">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="credit" className="text-xs h-7 px-3">
                        Income
                      </TabsTrigger>
                      <TabsTrigger value="debit" className="text-xs h-7 px-3">
                        Expenses
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Tabs defaultValue="all" className="w-auto" value={dateRange} onValueChange={handleDateRange}>
                    <TabsList className="bg-muted/50 h-8">
                      <TabsTrigger value="all" className="text-xs h-7 px-3">
                        All Time
                      </TabsTrigger>
                      <TabsTrigger value="today" className="text-xs h-7 px-3">
                        Today
                      </TabsTrigger>
                      <TabsTrigger value="week" className="text-xs h-7 px-3">
                        This Week
                      </TabsTrigger>
                      <TabsTrigger value="month" className="text-xs h-7 px-3">
                        This Month
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="rounded-md border">
                  {filteredTransactions.length > 0 ? (
                    <div className="divide-y">
                      {filteredTransactions.map((transaction) => {
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
                                  <ArrowDown className="h-5 w-5 text-green-600" />
                                ) : (
                                  <ArrowUp className="h-5 w-5 text-slate-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{transaction.description}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-muted-foreground">{dateDisplay}</p>
                                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                                    {transaction.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p
                              className={`font-medium ${
                                transaction.type === "credit" ? "text-green-600" : "text-slate-900"
                              }`}
                            >
                              {transaction.type === "credit" ? "+" : ""}
                              {`R ${Math.abs(transaction.amount).toFixed(2)}`}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">No transactions found</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Try adjusting your search or filter to find what you're looking for.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
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
              <ArrowLeft className="mb-1 h-5 w-5 rotate-45" />
              <span className="text-xs">Payments</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-2 text-capitec-blue" asChild>
            <Link href="/insights">
              <BarChart3 className="mb-1 h-5 w-5" />
              <span className="text-xs">Insights</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-2 text-capitec-red" asChild>
            <Link href="/history">
              <Calendar className="mb-1 h-5 w-5" />
              <span className="text-xs">History</span>
            </Link>
          </Button>
        </div>
      </nav>
    </div>
  )
}

