"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CreditCard,
  BarChart3,
  Calendar,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Film,
  Car,
  Send,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser, getUserAccounts, getAccountTransactions } from "@/lib/auth"
import type { Account, Transaction } from "@/types"

// Import chart components
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartTooltipItem } from "@/components/ui/chart"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export default function InsightsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("month")

  // Derived data for charts
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [spendingTrendData, setSpendingTrendData] = useState<any[]>([])
  const [incomeVsExpenseData, setIncomeVsExpenseData] = useState<any[]>([])

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

      // Process data for charts
      processChartData(accountTransactions, timeframe)
    }

    setLoading(false)
  }, [router, timeframe])

  useEffect(() => {
    if (selectedAccount) {
      const accountTransactions = getAccountTransactions(selectedAccount)
      setTransactions(accountTransactions)
      processChartData(accountTransactions, timeframe)
    }
  }, [selectedAccount, timeframe])

  const processChartData = (transactions: Transaction[], timeframe: string) => {
    // Filter transactions based on timeframe
    const now = new Date()
    let filteredTransactions = [...transactions]

    if (timeframe === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      filteredTransactions = filteredTransactions.filter((t) => {
        const transactionDate = new Date(t.date)
        return transactionDate >= weekAgo
      })
    } else if (timeframe === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      filteredTransactions = filteredTransactions.filter((t) => {
        const transactionDate = new Date(t.date)
        return transactionDate >= monthAgo
      })
    } else if (timeframe === "year") {
      const yearAgo = new Date()
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      filteredTransactions = filteredTransactions.filter((t) => {
        const transactionDate = new Date(t.date)
        return transactionDate >= yearAgo
      })
    }

    // Process category data for pie chart
    const categoryMap = new Map<string, number>()

    filteredTransactions.forEach((t) => {
      if (t.type === "debit" && t.amount < 0) {
        const category = t.category
        const amount = Math.abs(t.amount)

        if (categoryMap.has(category)) {
          categoryMap.set(category, categoryMap.get(category)! + amount)
        } else {
          categoryMap.set(category, amount)
        }
      }
    })

    const categoryChartData = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Number.parseFloat(value.toFixed(2)),
    }))

    setCategoryData(categoryChartData)

    // Process spending trend data for line chart
    const dateMap = new Map<string, { spending: number; income: number }>()

    // Initialize dates based on timeframe
    if (timeframe === "week") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString("en-ZA", { weekday: "short" })
        dateMap.set(dateStr, { spending: 0, income: 0 })
      }
    } else if (timeframe === "month") {
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })
        dateMap.set(dateStr, { spending: 0, income: 0 })
      }
    } else if (timeframe === "year") {
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const dateStr = date.toLocaleDateString("en-ZA", { month: "short" })
        dateMap.set(dateStr, { spending: 0, income: 0 })
      }
    }

    // Fill in actual data
    filteredTransactions.forEach((t) => {
      const transactionDate = new Date(t.date)
      let dateStr

      if (timeframe === "week") {
        dateStr = transactionDate.toLocaleDateString("en-ZA", { weekday: "short" })
      } else if (timeframe === "month") {
        dateStr = transactionDate.toLocaleDateString("en-ZA", { day: "numeric", month: "short" })
      } else if (timeframe === "year") {
        dateStr = transactionDate.toLocaleDateString("en-ZA", { month: "short" })
      }

      if (dateMap.has(dateStr!)) {
        const current = dateMap.get(dateStr!)!

        if (t.type === "debit" && t.amount < 0) {
          current.spending += Math.abs(t.amount)
        } else if (t.type === "credit" && t.amount > 0) {
          current.income += t.amount
        }

        dateMap.set(dateStr!, current)
      }
    })

    const trendChartData = Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      spending: Number.parseFloat(data.spending.toFixed(2)),
      income: Number.parseFloat(data.income.toFixed(2)),
    }))

    setSpendingTrendData(trendChartData)

    // Process income vs expense data for bar chart
    let totalIncome = 0
    let totalExpense = 0

    filteredTransactions.forEach((t) => {
      if (t.type === "credit" && t.amount > 0) {
        totalIncome += t.amount
      } else if (t.type === "debit" && t.amount < 0) {
        totalExpense += Math.abs(t.amount)
      }
    })

    setIncomeVsExpenseData([
      { name: "Income", amount: Number.parseFloat(totalIncome.toFixed(2)) },
      { name: "Expenses", amount: Number.parseFloat(totalExpense.toFixed(2)) },
    ])
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "shopping":
        return <ShoppingBag className="h-4 w-4" />
      case "entertainment":
        return <Film className="h-4 w-4" />
      case "transport":
        return <Car className="h-4 w-4" />
      case "transfer":
        return <Send className="h-4 w-4" />
      case "income":
        return <DollarSign className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const COLORS = ["#E4002B", "#00205B", "#FF8042", "#0088FE", "#00C49F", "#FFBB28"]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-capitec-red border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your financial insights...</p>
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
          <h1 className="ml-4 text-xl font-bold text-white">Financial Insights</h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-full sm:w-[250px] border-capitec-blue/30 focus:ring-capitec-red">
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

            <Tabs defaultValue="month" className="w-full sm:w-auto" value={timeframe} onValueChange={setTimeframe}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-capitec-red" />
                  Income vs Expenses
                </CardTitle>
                <CardDescription>Summary of your income and expenses for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Chart>
                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={incomeVsExpenseData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <ChartTooltip>
                                    <ChartTooltipContent>
                                      <ChartTooltipItem
                                        label={payload[0].name}
                                        value={`R ${payload[0].value}`}
                                        color={payload[0].name === "Income" ? "#00C49F" : "#E4002B"}
                                      />
                                    </ChartTooltipContent>
                                  </ChartTooltip>
                                )
                              }
                              return null
                            }}
                          />
                          <Bar dataKey="amount" fill="#8884d8">
                            {incomeVsExpenseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.name === "Income" ? "#00C49F" : "#E4002B"} />
                            ))}
                          </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </Chart>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-green-50 p-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Total Income</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-700">
                      R {incomeVsExpenseData.find((d) => d.name === "Income")?.amount.toFixed(2) || "0.00"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-red-50 p-3">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-600">Total Expenses</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-red-700">
                      R {incomeVsExpenseData.find((d) => d.name === "Expenses")?.amount.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-capitec-red" />
                  Spending by Category
                </CardTitle>
                <CardDescription>Breakdown of your expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Chart>
                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <ChartTooltip>
                                    <ChartTooltipContent>
                                      <ChartTooltipItem
                                        label={payload[0].name}
                                        value={`R ${payload[0].value}`}
                                        color={COLORS[payload[0].dataKey % COLORS.length]}
                                      />
                                    </ChartTooltipContent>
                                  </ChartTooltip>
                                )
                              }
                              return null
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </Chart>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Top Categories</h4>
                  <div className="space-y-2">
                    {categoryData.slice(0, 3).map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <span className="text-sm font-medium">R {category.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-capitec-red" />
                Spending Trends
              </CardTitle>
              <CardDescription>Your spending and income patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Chart>
                  <ChartContainer>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={spendingTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <ChartTooltip>
                                  <ChartTooltipContent>
                                    <p className="font-medium">{label}</p>
                                    {payload.map((entry, index) => (
                                      <ChartTooltipItem
                                        key={index}
                                        label={entry.name === "spending" ? "Spending" : "Income"}
                                        value={`R ${entry.value}`}
                                        color={entry.name === "spending" ? "#E4002B" : "#00C49F"}
                                      />
                                    ))}
                                  </ChartTooltipContent>
                                </ChartTooltip>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="spending" stroke="#E4002B" name="Spending" />
                        <Line type="monotone" dataKey="income" stroke="#00C49F" name="Income" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </Chart>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-capitec-blue" />
                    <span className="text-sm font-medium text-capitec-blue">Average Daily Spending</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-capitec-blue">
                    R{" "}
                    {(
                      spendingTrendData.reduce((acc, curr) => acc + curr.spending, 0) / spendingTrendData.length
                    ).toFixed(2)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-capitec-blue" />
                    <span className="text-sm font-medium text-capitec-blue">Highest Spending Day</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-capitec-blue">
                    {spendingTrendData.length > 0
                      ? spendingTrendData.reduce((max, curr) => (curr.spending > max.spending ? curr : max)).date
                      : "N/A"}
                  </p>
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
          <Button variant="ghost" className="flex flex-col items-center py-2 text-capitec-red" asChild>
            <Link href="/insights">
              <BarChart3 className="mb-1 h-5 w-5" />
              <span className="text-xs">Insights</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-2 text-capitec-blue" asChild>
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

