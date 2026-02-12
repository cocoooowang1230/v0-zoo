"use client"

import { useState, useEffect } from "react"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatCryptoValue } from "@/lib/utils"
import { AlertCircle, ArrowRight, Check } from "lucide-react"

interface WithdrawalModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    uid: string
    balances: {
        USDT: number
        BTC: number
    }
}

export function WithdrawalModal({ open, onOpenChange, uid, balances, hasKyc = false }: WithdrawalModalProps & { hasKyc?: boolean }) {
    const [currency, setCurrency] = useState<"USDT" | "BTC">("USDT")
    const [amount, setAmount] = useState("")
    const [targetCurrency, setTargetCurrency] = useState<"TWD" | "Other">("TWD")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [kycError, setKycError] = useState(false)

    // Exchange Rates
    const RATES = {
        USDT_TO_TWD: 31.3,
        BTC_TO_TWD: 2850000,
        BTC_TO_USDT: 91054, // Approx 2,850,000 / 31.3
    }



    // Reset state when opening
    useEffect(() => {
        if (open) {
            setAmount("")
            setError("")
            setSuccess(false)
            setShowConfirm(false)
            setKycError(false)
        }
    }, [open])

    const getAvailableBalance = () => {
        return balances[currency]
    }

    const getEquivalentTwd = (val: number, curr: "USDT" | "BTC") => {
        const rate = curr === "USDT" ? RATES.USDT_TO_TWD : RATES.BTC_TO_TWD
        return Math.floor(val * rate)
    }

    const getEquivalentUsdtValue = (val: number, curr: "USDT" | "BTC") => {
        if (curr === "USDT") return val
        return val * RATES.BTC_TO_USDT
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setAmount(val)
        setError("")

        // Basic validation on type
        if (val && Number.isNaN(Number(val))) {
            setError("請輸入有效數字")
            return
        }
    }

    const validate = () => {
        const numAmount = Number(amount)
        const balance = getAvailableBalance()

        if (!amount || Number.isNaN(numAmount) || numAmount <= 0) {
            setError("請輸入有效金額")
            return false
        }

        if (numAmount > balance) {
            setError(`金額超過可用餘額`)
            return false
        }



        return true
    }

    const handleInitialSubmit = () => {
        if (validate()) {
            setShowConfirm(true)
        }
    }

    const handleFinalConfirm = () => {
        if (!hasKyc) {
            setKycError(true)
            setShowConfirm(false)
            return
        }

        // Simulate API call: ZOO sends UID, Currency, Amount to ZONE
        console.log(`Sending withdrawal request: UID=${uid}, Currency=${currency}, Amount=${amount}`)

        setTimeout(() => {
            // Mock backend response: Success
            setSuccess(true)
            setShowConfirm(false)
        }, 1000)
    }

    const calculatedTwd = amount && !Number.isNaN(Number(amount))
        ? getEquivalentTwd(Number(amount), currency)
        : 0

    if (kycError) {
        return (
            <AlertDialog open={open} onOpenChange={onOpenChange}>
                <AlertDialogContent className="bg-white max-w-sm rounded-xl">
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                            <AlertCircle className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">提現失敗</h2>
                        <p className="text-gray-600">
                            請前往 ZONE Wallet App 的「錢包」完成 KYC 身分驗證
                        </p>
                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => window.open('https://www.zonewallet.io', '_blank')}
                        >
                            前往 ZONE Wallet App
                        </Button>
                        <Button
                            className="w-full bg-lion-orange hover:bg-lion-red text-white"
                            onClick={() => {
                                setKycError(false)
                                setShowConfirm(false)
                            }}
                        >
                            返回
                        </Button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        )
    }

    if (success) {
        return (
            <AlertDialog open={open} onOpenChange={onOpenChange}>
                <AlertDialogContent className="bg-white max-w-sm rounded-xl">
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                            <Check className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">提領成功！</h2>
                        <p className="text-gray-600">
                            {amount} {currency} 已轉入你的 ZONE Wallet
                        </p>
                        <Button
                            className="w-full mt-4 bg-lion-orange hover:bg-lion-red text-white"
                            onClick={() => onOpenChange(false)}
                        >
                            完成
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => window.open('https://www.zonewallet.io', '_blank')}
                        >
                            前往 ZONE Wallet App 查看
                        </Button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        )
    }

    if (showConfirm) {
        return (
            <AlertDialog open={open} onOpenChange={onOpenChange}>
                <AlertDialogContent className="bg-white max-w-sm rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>確認提現</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-gray-600">
                            確認提取 <span className="font-bold text-black">{amount} {currency}</span> 至你的 ZONE Wallet 嗎？
                        </p>

                    </div>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirm(false)}>
                            取消
                        </Button>
                        <Button className="bg-lion-orange hover:bg-lion-red text-white" onClick={handleFinalConfirm}>
                            確認提現
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white max-w-md rounded-xl overflow-hidden">
                <AlertDialogHeader className="bg-gray-50 -mx-6 -mt-6 p-4 border-b">
                    <AlertDialogTitle className="text-center text-lg">提現</AlertDialogTitle>
                </AlertDialogHeader>

                <div className="space-y-6 pt-4">
                    {/* From Section */}
                    <div className="space-y-2">
                        <div className="flex rounded-md shadow-sm">
                            <div className="relative">
                                <select
                                    className="rounded-l-md border border-r-0 h-12 pl-3 pr-8 bg-gray-50 text-sm focus:ring-2 focus:ring-lion-orange focus:outline-none appearance-none font-medium w-[100px]"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as "USDT" | "BTC")}
                                >
                                    <option value="USDT">USDT</option>
                                    <option value="BTC">BTC</option>
                                </select>
                                <div className="absolute right-2 top-3.5 pointer-events-none text-gray-400 text-xs">
                                    ▼
                                </div>
                            </div>
                            <Input
                                placeholder="0.00"
                                value={amount}
                                onChange={handleAmountChange}
                                className={`rounded-none rounded-r-md h-12 border-l px-4 text-right text-lg font-bold ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                        </div>

                        <div className="flex justify-between items-center px-1">
                            <span className="text-xs text-gray-500">
                                可用餘額: {currency === "USDT" ? formatCryptoValue(balances.USDT) : formatCryptoValue(balances.BTC)} {currency}
                            </span>
                            {error ? (
                                <span className="text-xs text-red-500">{error}</span>
                            ) : null}
                        </div>
                    </div>


                </div>

                <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>
                        取消
                    </AlertDialogCancel>
                    <Button
                        className="bg-lion-orange hover:bg-lion-red text-white"
                        disabled={!amount || !!error}
                        onClick={handleInitialSubmit}
                    >
                        確認提現
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
