"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { LionLogo } from "@/components/lion-logo"
import { useLiff } from "@/app/liff-provider"
import { Card } from "@/components/ui/card"

export default function SurveysPage() {
  const { isLoggedIn, profile } = useLiff()
  const router = useRouter()
  const [secureHash, setSecureHash] = useState("")
  const [extUserId, setExtUserId] = useState("")
  const [appId, setAppId] = useState("8619")
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const savedUid = localStorage.getItem("exchangeUid")
    
    // Determine user ID
    const userId = profile?.userId || savedUid || "mock_bitbee_user_id_123"
    setExtUserId(userId)

    // Fetch secure_hash and app_id
    fetch(`/api/cpx/secure-hash?ext_user_id=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch hash")
        return res.json()
      })
      .then(data => {
        setSecureHash(data.secure_hash)
        if (data.app_id && data.app_id !== "12345") {
          setAppId(data.app_id)
        }
        setIsInitializing(false)
      })
      .catch(err => {
        console.error(err)
        setError(true)
        setIsInitializing(false)
      })
  }, [profile])

  useEffect(() => {
    if (extUserId && !isInitializing) {
      const script1 = {
        div_id: "multiside",
        theme_style: 2, // 2 for sidebar
        order_by: 1, // 1 for best score
        display_mode: 3 
      };

      const config = {
        general_config: {
          app_id: Number(appId) || 8619,
          ext_user_id: extUserId,
          secure_hash: secureHash,
          subid_1: "",
          subid_2: "",
        },
        style_config: {
          text_color: "#2b2b2b",
          survey_box: {
            topbar_background_color: "#1DA05E",
            box_background_color: "white",
            rounded_borders: true,
            stars_filled: "#ffaf20",
            stars_empty: "rgb(221 221 221)",
            accent_color_small_box: "#1DA05E",
            place_stars_bottom_small_box: true
          },  
        },
        script_config: [script1],
        debug: false,
        useIFrame: true,    
        iFramePosition: 3 // 3 = center
      };

      // @ts-ignore
      window.config = config;

      // Inject CPX script tag v2.0
      const mainScript = document.createElement("script")
      mainScript.src = "https://cdn.cpx-research.com/assets/js/script_tag_v2.0.js"
      mainScript.async = true
      document.body.appendChild(mainScript)

      return () => {
        if (document.body.contains(mainScript)) {
          document.body.removeChild(mainScript)
        }
      }
    }
  }, [secureHash, extUserId, appId, isInitializing])

  return (
    <div className="flex flex-col min-h-screen bg-lion-face-light pb-16">
      <header className="bg-gradient-to-r from-lion-orange to-lion-red text-white p-4 text-center shadow-md relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 px-10">
          <LionLogo size="sm" className="flex-shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold truncate">完成問卷賺 Honey</h1>
        </div>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4 space-y-4 flex flex-col items-center">
        <Card className="w-full bg-white p-4 rounded-xl border border-lion-orange/20 shadow-sm mb-4">
          <p className="text-sm text-gray-700 leading-relaxed text-center">
            完成 CPX Research 問卷後，獎勵將自動入帳。點擊下方問卷牆即可開始填寫！
          </p>
        </Card>

        {isInitializing ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lion-orange"></div>
            <span className="ml-2 text-lion-orange font-medium">載入中...</span>
          </div>
        ) : error ? (
          <div className="w-full text-center py-20 bg-red-50 rounded-xl border border-red-100">
            <p className="text-red-500 font-medium mb-4">載入問卷失敗，請稍後再試</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-lion-orange hover:bg-lion-red transition-colors text-white rounded-full font-medium"
            >
              重新整理
            </button>
          </div>
        ) : (
          <div className="flex justify-center items-center py-4 my-2 w-full">
            {/* Target Div specified by CPX config */}
            <div style={{ height: "469px", width: "348px" }} id="multiside" className="relative shadow-sm rounded-xl overflow-hidden bg-white/50"></div>
          </div>
        )}
      </main>

      <BottomNavigation activeTab="tasks" />
    </div>
  )
}
