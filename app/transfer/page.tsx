"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser, getUserAccounts, getUserBeneficiaries, transferMoney } from "@/lib/auth"
import type { Account, Beneficiary } from "@/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TransferPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [transferType, setTransferType] = useState("own")
  const [fromAccount, setFromAccount] = useState("")
  const [toAccount, setToAccount] = useState("")
  const [beneficiary, setBeneficiary] = useState("")
  const [amount, setAmount] = useState("")
  const [reference, setReference] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    // Get user accounts
    const userAccounts = getUserAccounts(currentUser.id)
    setAccounts(userAccounts)

    if (userAccounts.length > 0) {
      setFromAccount(userAccounts[0].id)

      // Set initial toAccount if there's more than one account
      if (userAccounts.length > 1) {
        setToAccount(userAccounts[1].id)
      }
    }

    // Get user beneficiaries
    const userBeneficiaries = getUserBeneficiaries(currentUser.id)
    setBeneficiaries(userBeneficiaries)

    setLoading(false)
  }, [router])

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form
    if (!fromAccount) {
      setError("Please select a source account")
      return
    }

    if (transferType === "own" && !toAccount) {
      setError("Please select a destination account")
      return
    }

    if (transferType === "beneficiary" && !beneficiary) {
      setError("Please select a beneficiary")
      return
    }

    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    const transferAmount = Number.parseFloat(amount)

    // Check if user has enough funds
    const sourceAccount = accounts.find((a) => a.id === fromAccount)
    if (!sourceAccount || sourceAccount.balance < transferAmount) {
      setError("Insufficient funds")
      return
    }

    setSubmitting(true)

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Process transfer
      transferMoney(
        fromAccount,
        transferType === "own" ? toAccount : null,
        transferType === "beneficiary" ? beneficiary : null,
        transferAmount,
        reference,
      )

      setSuccess("Transfer completed successfully")
      setAmount("")
      setReference("")

      // Refresh account data
      const currentUser = getCurrentUser()
      if (currentUser) {
        const updatedAccounts = getUserAccounts(currentUser.id)
        setAccounts(updatedAccounts)
      }

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "An error occurred during transfer")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
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
      <header className="sticky top-0 z-10 bg-capitec-red px-4 py-3 shadow-sm">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="ml-4 text-xl font-bold text-white">Transfer Money</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-md">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-capitec-blue">New Transfer</CardTitle>
              <CardDescription>Transfer money to accounts or beneficiaries</CardDescription>
            </CardHeader>
            <form onSubmit={handleTransfer}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50 text-green-600 border-green-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>Transfer Type</Label>
                  <RadioGroup
                    defaultValue="own"
                    className="grid grid-cols-2 gap-4"
                    value={transferType}
                    onValueChange={setTransferType}
                  >
                    <div>
                      <RadioGroupItem value="own" id="own" className="peer sr-only" />
                      <Label
                        htmlFor="own"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-capitec-red [&:has([data-state=checked])]:border-capitec-red"
                      >
                        <CreditCard className="mb-3 h-6 w-6 text-capitec-blue" />
                        Own Accounts
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="beneficiary" id="beneficiary" className="peer sr-only" />
                      <Label
                        htmlFor="beneficiary"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-capitec-red [&:has([data-state=checked])]:border-capitec-red"
                      >
                        <User className="mb-3 h-6 w-6 text-capitec-blue" />
                        Beneficiary
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-account">From Account</Label>
                  <Select
                    value={fromAccount}
                    onValueChange={(value) => {
                      setFromAccount(value)
                      // Reset toAccount if it's the same as the new fromAccount
                      if (toAccount === value) {
                        const otherAccount = accounts.find((account) => account.id !== value)
                        if (otherAccount) {
                          setToAccount(otherAccount.id)
                        } else {
                          setToAccount("")
                        }
                      }
                    }}
                    disabled={submitting}
                  >
                    <SelectTrigger id="from-account" className="border-capitec-blue/30 focus:ring-capitec-red">
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
                </div>

                {transferType === "own" ? (
                  <div className="space-y-2">
                    <Label htmlFor="to-account">To Account</Label>
                    <Select
                      value={toAccount}
                      onValueChange={setToAccount}
                      disabled={submitting || accounts.filter((account) => account.id !== fromAccount).length === 0}
                    >
                      <SelectTrigger id="to-account" className="border-capitec-blue/30 focus:ring-capitec-red">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts
                          .filter((account) => account.id !== fromAccount)
                          .map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} - R {account.balance.toFixed(2)}
                            </SelectItem>
                          ))}
                        {accounts.filter((account) => account.id !== fromAccount).length === 0 && (
                          <SelectItem value="none" disabled>
                            No other accounts available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {accounts.filter((account) => account.id !== fromAccount).length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        You need at least two accounts to transfer between your own accounts.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="beneficiary">Beneficiary</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="beneficiary-search"
                        placeholder="Search beneficiaries"
                        className="pl-8 border-capitec-blue/30 focus-visible:ring-capitec-red"
                        disabled={submitting}
                      />
                    </div>
                    <div className="mt-2 rounded-md border">
                      <div className="divide-y">
                        {beneficiaries.length > 0 ? (
                          beneficiaries.map((ben) => (
                            <div
                              key={ben.id}
                              className={`flex items-center gap-3 p-3 hover:bg-muted cursor-pointer ${
                                beneficiary === ben.id ? "bg-capitec-red/10" : ""
                              }`}
                              onClick={() => setBeneficiary(ben.id)}
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-capitec-red/10">
                                <User className="h-5 w-5 text-capitec-red" />
                              </div>
                              <div>
                                <p className="font-medium">{ben.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Bank: {ben.bankName} ****{ben.accountNumber.slice(-4)}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-muted-foreground">No beneficiaries found</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-muted-foreground">R</span>
                    </div>
                    <Input
                      id="amount"
                      type="text"
                      placeholder="0.00"
                      className="pl-8 border-capitec-blue/30 focus-visible:ring-capitec-red"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    placeholder="Add a reference (optional)"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="border-capitec-blue/30 focus-visible:ring-capitec-red"
                    disabled={submitting}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-capitec-red hover:bg-capitec-red/90" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    "Transfer Now"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}

