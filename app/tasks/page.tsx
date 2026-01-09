"use client"

import type React from "react"
import { useState, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, ChevronDown, ChevronUp, Check, ExternalLink, ShieldCheck } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { LionLogo } from "@/components/lion-logo"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { MonitorPlay, Share2, Camera, Clock, Gift, Copy } from "lucide-react"
import { formatCryptoValue } from "@/lib/utils"

export default function TasksPage() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [referralLink, setReferralLink] = useState("")
  const [discordVerifying, setDiscordVerifying] = useState(false)
  const [identityVerifying, setIdentityVerifying] = useState(false)
  const [showPrerequisiteDialog, setShowPrerequisiteDialog] = useState(false)

  useEffect(() => {
    // Generate referral link - you can customize this logic
    const savedReferralLink = localStorage.getItem("referralLink")
    if (savedReferralLink) {
      setReferralLink(savedReferralLink)
    } else {
      const randomRef = Math.random().toString(36).substring(2, 8)
      const newLink = `https://bitbee.app/register?ref=${randomRef}`
      setReferralLink(newLink)
      localStorage.setItem("referralLink", newLink)
    }
  }, [])

  // Function to mark a task as completed
  const completeTask = (taskId: string, reward: string) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId])

      toast({
        title: "任務完成!",
        description: `您獲得了 ${reward}`,
      })
    }
  }

  // Simulate Discord OAuth callback
  const handleDiscordCallback = async () => {
    if (!completedTasks.includes("identity")) {
      toast({
        title: "請先完成首要任務",
        description: "您需要先完成身分驗證才能進行其他任務",
        variant: "destructive",
      })
      return
    }

    setDiscordVerifying(true)

    try {
      // In a real app, this would verify the Discord OAuth callback
      // For now, we'll simulate the verification process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      completeTask("discord", "+5 $HONEY")

      toast({
        title: "Discord 驗證成功!",
        description: "您已成功加入社區並完成驗證",
      })
    } catch (error) {
      toast({
        title: "驗證失敗",
        description: "請確保您已加入 Discord 社區",
      })
    } finally {
      setDiscordVerifying(false)
    }
  }

  const handleIdentityVerification = async () => {
    setIdentityVerifying(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      completeTask("identity", "+10 $HONEY")

      toast({
        title: "身分驗證成功!",
        description: "您已成功完成身分驗證",
      })
    } catch (error) {
      toast({
        title: "驗證失敗",
        description: "請確保您已完成所有驗證步驟",
      })
    } finally {
      setIdentityVerifying(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-lion-face-light pb-16">
      {/* Header */}
      <header className="bg-gradient-to-r from-lion-orange to-lion-red text-white p-4 text-center shadow-md">
        <div className="flex items-center justify-center gap-2">
          <LionLogo size="sm" />
          <h1 className="text-2xl font-bold">任務中心</h1>
        </div>
      </header>

      {/* Tasks List */}
      <div className="flex-1 container max-w-md mx-auto px-4 pt-4 space-y-4 pb-4">
        {/* Task Cards */}
        <div className="space-y-4">
          <TaskCard
            id="identity"
            icon={<ShieldCheck className="h-5 w-5 text-white" />}
            title="首要任務: 證明你是人類"
            description="完成 twin3 身分驗證以獲得獎勵"
            reward="+10 $HONEY"
            isCompleted={completedTasks.includes("identity")}
            onComplete={() => completeTask("identity", "+10 $HONEY")}
            onIdentityCallback={handleIdentityVerification}
            isVerifying={identityVerifying}
          />

          {/* Discord Task */}
          <TaskCard
            id="discord"
            icon={<MessageSquare className="h-5 w-5 text-white" />}
            title="加入 Discord 社區"
            description="加入 BitBee 官方 Discord 社區"
            reward="+5 $HONEY"
            isCompleted={completedTasks.includes("discord")}
            onComplete={() => completeTask("discord", "+5 $HONEY")}
            onDiscordCallback={handleDiscordCallback}
            isVerifying={discordVerifying}
            completedTasks={completedTasks}
            onShowPrerequisite={() => setShowPrerequisiteDialog(true)}
          />

          {/* IMEI Tasks - Now Split */}
          <ImeiShareTask
            completedTasks={completedTasks}
            onShowPrerequisite={() => setShowPrerequisiteDialog(true)}
          />

          <ImeiVideoTask
            completedTasks={completedTasks}
            onShowPrerequisite={() => setShowPrerequisiteDialog(true)}
          />

          <ImeiBuyTask
            completedTasks={completedTasks}
            onShowPrerequisite={() => setShowPrerequisiteDialog(true)}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="tasks" />

      <AlertDialog open={showPrerequisiteDialog} onOpenChange={setShowPrerequisiteDialog}>
        <AlertDialogContent className="max-w-sm bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">請先完成首要任務</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-700">
              您需要先完成身分驗證才能進行其他任務
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-lion-orange hover:bg-lion-red text-white font-semibold">
              確定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface TaskCardProps {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  reward: string
  isCompleted?: boolean
  onComplete: () => void
  onDiscordCallback?: () => void
  onIdentityCallback?: () => void
  referralLink?: string
  isVerifying?: boolean
  completedTasks?: string[]
  onShowPrerequisite?: () => void
}

function TaskCard({
  id,
  icon,
  title,
  description,
  reward,
  isCompleted = false,
  onComplete,
  onDiscordCallback,
  onIdentityCallback,
  referralLink = "",
  isVerifying = false,
  completedTasks = [],
  onShowPrerequisite,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Toggle expanded state
  const toggleExpand = () => {
    if (!isCompleted) {
      setIsExpanded(!isExpanded)
    }
  }

  // Handle Discord join
  const handleDiscordJoin = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (id === "discord" && !completedTasks.includes("identity")) {
      if (onShowPrerequisite) {
        onShowPrerequisite()
      }
      return
    }

    window.open("https://discord.gg/zoo3", "_blank")

    if (id === "discord" && onDiscordCallback) {
      setTimeout(() => {
        onDiscordCallback()
      }, 2000)
    }
  }

  const handleIdentityVerify = (e: React.MouseEvent) => {
    e.stopPropagation()

    window.open("https://twin3.ai/verify", "_blank")

    if (id === "identity" && onIdentityCallback) {
      setTimeout(() => {
        onIdentityCallback()
      }, 2000)
    }
  }

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden
        ${isCompleted
          ? "border-green-300 bg-green-50"
          : isExpanded
            ? "border-lion-orange shadow-lion"
            : "border-lion-face-dark shadow-sm hover:shadow-lion"
        }`}
    >
      <div className="flex items-start p-4 cursor-pointer" onClick={toggleExpand}>
        <div
          className={`p-3 rounded-full mr-3 shadow-sm ${isCompleted ? "bg-green-500" : "bg-gradient-to-br from-lion-orange to-lion-red"
            }`}
        >
          {isCompleted ? <Check className="h-5 w-5 text-white" /> : icon}
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-lion-accent">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        <div className="flex flex-col items-end">
          <div className="bg-lion-face px-3 py-1 rounded-full text-lion-orange font-medium text-sm border border-lion-face-dark mb-1">
            {reward}
          </div>
          {!isCompleted && (
            <div className="text-gray-400">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && !isCompleted && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-gray-100 pt-3">
            {id === "identity" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">完成以下步驟以獲得獎勵：</p>

                <div className="space-y-2 bg-lion-face-light p-3 rounded-lg border border-lion-face">
                  <div className="flex items-start gap-2">
                    <div className="bg-lion-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-sm text-gray-700">點擊下方按鈕開始驗證</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-lion-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-sm text-gray-700">返回此頁面點擊「驗證完成」按鈕</p>
                  </div>
                </div>

                <Button
                  variant="teal"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleIdentityVerify}
                >
                  <ShieldCheck className="h-4 w-4" />
                  開始身分驗證
                </Button>

                <Button
                  variant="orange"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onIdentityCallback) {
                      onIdentityCallback()
                    }
                  }}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      驗證中...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      驗證完成
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  完成驗證後即可獲得 +10 $HONEY 獎勵 <br />
                  <span className="text-gray-400">verify powered by twin3</span>
                </p>
              </div>
            )}

            {id === "discord" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">完成以下步驟以獲得獎勵：</p>

                <div className="space-y-2 bg-lion-face-light p-3 rounded-lg border border-lion-face">
                  <div className="flex items-start gap-2">
                    <div className="bg-lion-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-sm text-gray-700">點擊下方按鈕加入 Discord 社區</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-lion-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-sm text-gray-700">返回此頁面點擊「驗證加入」按鈕</p>
                  </div>
                </div>

                <Button
                  variant="teal"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleDiscordJoin}
                >
                  <ExternalLink className="h-4 w-4" />
                  加入 Discord 社區
                </Button>

                <Button
                  variant="orange"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onDiscordCallback) {
                      onDiscordCallback()
                    }
                  }}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      驗證中...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      驗證加入
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">完成驗證後即可獲得 +5 $HONEY 獎勵</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed state */}
      {isCompleted && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-green-100 pt-3">
            <p className="text-sm text-green-600 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              任務已完成！
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

const GleamWidget = memo(() => {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = "https://widget.gleamjs.io/e.js"
    script.async = true
    script.type = "text/javascript"
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  return (
    <div className="mb-4 w-full overflow-hidden" style={{ minHeight: '400px' }}>
      <a className="e-widget no-button generic-loader" href="https://gleam.io/st1s5/task" rel="nofollow">
        TASK
      </a>
    </div>
  )
})
GleamWidget.displayName = "GleamWidget"

interface ImeiTaskProps {
  completedTasks: string[]
  onShowPrerequisite: () => void
}

function ImeiShareTask({ completedTasks, onShowPrerequisite }: ImeiTaskProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [state, setState] = useState({
    status: "idle",
    url: "",
    platform: "facebook"
  })

  const reward = formatCryptoValue(0.00000109) + " WBTC"
  const isCompleted = state.status === "completed"

  const handleSubmit = () => {
    // Simulate API call
    setState((prev) => ({ ...prev, status: "pending" }))
    toast({
      title: "提交成功",
      description: "您的回報已收到，將於 5-7 個工作天內完成審核。",
    })
  }

  const handleResubmit = () => {
    setState((prev) => ({ ...prev, status: "idle" }))
  }

  const handleCopyText = async () => {
    const text = "義美食品，堅持好品質！現在參加 BitBee 專屬活動，完成指定任務即可獲得加密貨幣獎勵！快來跟我一起參加吧！ #義美 #BitBee #堅持好品質"

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        toast({
          title: "複製成功",
          description: "活動文案已複製到剪貼簿",
        })
      } else {
        // Fallback
        const textArea = document.createElement("textarea")
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        toast({
          title: "複製成功",
          description: "活動文案已複製到剪貼簿",
        })
      }
    } catch (err) {
      toast({
        title: "複製失敗",
        description: "無法複製文字，請手動選取複製",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${isCompleted ? "border-green-300 bg-green-50" : isExpanded ? "border-lion-orange shadow-lion" : "border-lion-face-dark shadow-sm hover:shadow-lion"}`}>
      <div
        className="flex items-start p-4 cursor-pointer"
        onClick={() => {
          if (!completedTasks.includes("identity")) {
            onShowPrerequisite()
            return
          }
          setIsExpanded(!isExpanded)
        }}
      >
        <div className={`p-3 rounded-full mr-3 shadow-sm ${isCompleted ? "bg-green-500" : "bg-red-600"}`}>
          {isCompleted ? <Check className="h-5 w-5 text-white" /> : <Gift className="h-5 w-5 text-white" />}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lion-accent">義美活動: 分享活動辦法</h3>
          <p className="text-sm text-gray-600">分享活動文案至社群媒體</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-lion-face px-3 py-1 rounded-full text-lion-orange font-medium text-sm border border-lion-face-dark mb-1">
            +{reward}
          </div>
          {!isCompleted && <div className="text-gray-400">{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>}
        </div>
      </div>

      {isExpanded && !isCompleted && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-gray-100 pt-3 space-y-4">
            {/* Event Banner */}
            <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
              <div className="aspect-[1080/360] bg-gray-200 w-full flex items-center justify-center text-gray-400">
                <span className="text-sm">活動 Banner 版位 (1080 x 360)</span>
              </div>
            </div>

            {/* Campaign Details & Copy */}
            <div className="mb-4 p-3 bg-white rounded border border-gray-100 text-sm text-gray-600 space-y-2">
              <p className="font-medium text-gray-800">活動文案：</p>
              <p>義美食品，堅持好品質！現在參加 BitBee 專屬活動，完成指定任務即可獲得加密貨幣獎勵！快來跟我一起參加吧！ #義美 #BitBee #堅持好品質</p>
              <div className="flex gap-2 pt-2">
                <a href="#" className="text-blue-600 hover:underline text-xs flex items-center">
                  查看活動詳情 <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 mb-4" onClick={handleCopyText}>
              <Copy className="h-4 w-4 mr-2" />
              複製文案
            </Button>

            <p className="text-sm text-gray-600 mb-2">請將上述文案分享至「公開」社群，並回填貼文網址：</p>
            <p className="text-xs text-red-600 mb-2">(連結錯誤將視為無效，無法獲得獎勵，請確認後送出。)</p>

            {state.status === 'idle' ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    className="text-sm border rounded-md px-2 bg-white"
                    value={state.platform}
                    onChange={(e) => setState(prev => ({ ...prev, platform: e.target.value }))}
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="threads">Threads</option>
                    <option value="line">LINE</option>
                    <option value="x">X (Twitter)</option>
                  </select>
                  <Input
                    placeholder="貼文連結 URL"
                    className="h-9"
                    value={state.url}
                    onChange={(e) => setState(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSubmit}
                  disabled={!state.url}
                >
                  提交驗證
                </Button>
              </div>
            ) : (
              <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">審核中 (預計 5-7 個工作天)</span>
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={handleResubmit} className="text-xs h-7 text-yellow-700 hover:text-yellow-900 hover:bg-yellow-100">
                    重新提交
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ImeiVideoTask({ completedTasks, onShowPrerequisite }: ImeiTaskProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [state, setState] = useState({
    status: "idle",
    email: "",
    limit: 3500,
    currentCount: 1
  })

  const reward = formatCryptoValue(0.00000109) + " WBTC"
  const isCompleted = state.status === "completed"

  const handleSubmit = () => {
    if (state.currentCount >= state.limit) {
      toast({ title: "任務已結束", description: "本任務已達參與人數上限", variant: "destructive" })
      return
    }
    if (!state.email) {
      toast({ title: "請填寫 Email", description: "您需要填寫 Email 才能領取獎勵", variant: "destructive" })
      return
    }
    setState((prev) => ({ ...prev, status: "completed" }))
    toast({ title: "任務完成!", description: `您獲得了 +${reward}` })
  }

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${isCompleted ? "border-green-300 bg-green-50" : isExpanded ? "border-lion-orange shadow-lion" : "border-lion-face-dark shadow-sm hover:shadow-lion"}`}>
      <div
        className="flex items-start p-4 cursor-pointer"
        onClick={() => {
          if (!completedTasks.includes("identity")) {
            onShowPrerequisite()
            return
          }
          setIsExpanded(!isExpanded)
        }}
      >
        <div className={`p-3 rounded-full mr-3 shadow-sm ${isCompleted ? "bg-green-500" : "bg-red-600"}`}>
          {isCompleted ? <Check className="h-5 w-5 text-white" /> : <Gift className="h-5 w-5 text-white" />}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lion-accent">義美活動: 觀看宣傳影片</h3>
          <p className="text-sm text-gray-600">完整觀看影片並填寫 Email</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-lion-face px-3 py-1 rounded-full text-lion-orange font-medium text-sm border border-lion-face-dark mb-1">
            +{reward}
          </div>
          {!isCompleted && <div className="text-gray-400">{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>}
        </div>
      </div>

      {isExpanded && !isCompleted && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-gray-100 pt-3 space-y-4">
            <p className="text-sm text-gray-600 mb-3">完整觀看影片並填寫 Email 即可獲得獎勵。</p>
            <GleamWidget />
            <div className="space-y-3">
              <Input
                placeholder="請輸入您的 Email 以領取獎勵"
                value={state.email}
                onChange={(e) => setState((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Button
                size="sm"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={handleSubmit}
                disabled={!state.email}
              >
                領取獎勵
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ImeiBuyTask({ completedTasks, onShowPrerequisite }: ImeiTaskProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [state, setState] = useState({
    status: "idle",
    url: "",
    platform: "instagram",
    limit: 300,
    currentCount: 1
  })

  const reward = formatCryptoValue(0.00000549) + " WBTC"
  const isCompleted = state.status === "completed"

  const handleSubmit = () => {
    setState((prev) => ({ ...prev, status: "pending" }))
    toast({
      title: "提交成功",
      description: "您的回報已收到，將於 5-7 個工作天內完成審核。",
    })
  }

  const handleResubmit = () => {
    setState((prev) => ({ ...prev, status: "idle" }))
  }

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${isCompleted ? "border-green-300 bg-green-50" : isExpanded ? "border-lion-orange shadow-lion" : "border-lion-face-dark shadow-sm hover:shadow-lion"}`}>
      <div
        className="flex items-start p-4 cursor-pointer"
        onClick={() => {
          if (!completedTasks.includes("identity")) {
            onShowPrerequisite()
            return
          }
          setIsExpanded(!isExpanded)
        }}
      >
        <div className={`p-3 rounded-full mr-3 shadow-sm ${isCompleted ? "bg-green-500" : "bg-red-600"}`}>
          {isCompleted ? <Check className="h-5 w-5 text-white" /> : <Gift className="h-5 w-5 text-white" />}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lion-accent">義美活動: 購買商品拍照分享</h3>
          <p className="text-sm text-gray-600">購買義美商品合照並公開分享</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-lion-face px-3 py-1 rounded-full text-lion-orange font-medium text-sm border border-lion-face-dark mb-1">
            +{reward}
          </div>
          {!isCompleted && <div className="text-gray-400">{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>}
        </div>
      </div>

      {isExpanded && !isCompleted && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-gray-100 pt-3 space-y-4">
            <p className="text-sm text-gray-600 mb-2">購買義美商品合照並公開分享，回填貼文網址。</p>
            <p className="text-xs text-red-600 mb-3">(連結錯誤將視為無效，無法獲得獎勵，請確認後送出。)</p>

            {state.status === 'idle' ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    className="text-sm border rounded-md px-2 bg-white"
                    value={state.platform}
                    onChange={(e) => setState(prev => ({ ...prev, platform: e.target.value }))}
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="threads">Threads</option>
                    <option value="line">LINE</option>
                    <option value="x">X (Twitter)</option>
                  </select>
                  <Input
                    placeholder="貼文連結 URL"
                    className="h-9"
                    value={state.url}
                    onChange={(e) => setState(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleSubmit}
                  disabled={!state.url}
                >
                  提交驗證
                </Button>
              </div>
            ) : (
              <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">審核中 (預計 5-7 個工作天)</span>
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={handleResubmit} className="text-xs h-7 text-yellow-700 hover:text-yellow-900 hover:bg-yellow-100">
                    重新提交
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
