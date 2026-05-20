import { NextResponse } from "next/server"
import crypto from "crypto"

// Exchange rate mapping (e.g. 1 USD = 300 Honey, user gets 70%)
const USD_TO_HONEY_RATE = 300
const USER_REWARD_PERCENTAGE = 0.7

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const extUserId = searchParams.get("ext_user_id")

    if (!extUserId) {
      return NextResponse.json({ error: "Missing ext_user_id" }, { status: 400 })
    }

    const appId = process.env.CPX_APP_ID || "33041" 
    const secureHashKey = process.env.CPX_SECURE_HASH || "MxgZIaVqej23sLYIJeQxl7NNxPyPFeH1"

    // Generate MD5 Hash: md5(ext_user_id + "-" + secure_hash_key)
    const hashString = `${extUserId}-${secureHashKey}`
    const secureHash = crypto.createHash("md5").update(hashString).digest("hex")

    // Extract headers (Important for CPX API targeting)
    let ipUser = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1"
    
    // Clean up IP if it's a list (e.g., "client_ip, proxy_ip")
    if (ipUser.includes(",")) {
      ipUser = ipUser.split(",")[0].trim()
    }
    
    // Handle localhost IPv6 loopback
    let isLocalhost = false;
    if (ipUser === "::1" || ipUser === "127.0.0.1") {
        isLocalhost = true;
        // Spoof IP for testing since CPX requires a real public IP
        ipUser = "49.216.174.15";
    }

    const userAgent = request.headers.get("user-agent") || ""

    // Build the request to CPX API
    const cpxApiUrl = new URL("https://live-api.cpx-research.com/api/get-surveys.php")
    cpxApiUrl.searchParams.set("app_id", appId)
    cpxApiUrl.searchParams.set("ext_user_id", extUserId)
    cpxApiUrl.searchParams.set("output_method", "api")
    cpxApiUrl.searchParams.set("ip_user", ipUser)
    cpxApiUrl.searchParams.set("user_agent", userAgent)
    cpxApiUrl.searchParams.set("limit", "12")
    cpxApiUrl.searchParams.set("secure_hash", secureHash)

    const response = await fetch(cpxApiUrl.toString())
    
    if (!response.ok) {
        throw new Error(`CPX API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Transform CPX API response to include Honey calculations
    if (data.status === "success" && data.surveys && data.surveys.length > 0) {
        // CPX returns surveys array
        const formattedSurveys = data.surveys.map((survey: any) => {
            // payout = already converted to Honey by CPX (e.g. 351 Honey)
            // payout_publisher_usd = real USD amount CPX pays us (e.g. 1.17 USD)
            const publisherUsd = parseFloat(survey.payout_publisher_usd || 0)
            const rewardHoney = Math.floor(publisherUsd * USER_REWARD_PERCENTAGE * USD_TO_HONEY_RATE)
            return {
                id: survey.id,
                loi: survey.loi,
                amount_usd: publisherUsd.toFixed(2),
                reward_honey: rewardHoney,
                payout: survey.payout,
                href: survey.href,
                tags: survey.webcam ? ["webcam"] : []
            }
        })

        return NextResponse.json({
            status: "success",
            surveys: formattedSurveys
        })
    }

    // Fallback for localhost if no surveys returned from real API
    if (isLocalhost) {
        return NextResponse.json({
            status: "success",
            isMock: true,
            surveys: [
                {
                    id: "cpx_mock_001",
                    loi: 6,
                    amount_usd: "1.00",
                    reward_honey: Math.floor(1.00 * USER_REWARD_PERCENTAGE * USD_TO_HONEY_RATE),
                    payout: "0.70",
                    href: "https://demo.cpx-research.com/",
                    tags: ["hot", "webcam"]
                },
                {
                    id: "cpx_mock_002",
                    loi: 12,
                    amount_usd: "2.50",
                    reward_honey: Math.floor(2.50 * USER_REWARD_PERCENTAGE * USD_TO_HONEY_RATE),
                    payout: "1.75",
                    href: "https://demo.cpx-research.com/",
                    tags: []
                },
                {
                    id: "cpx_mock_003",
                    loi: 4,
                    amount_usd: "0.50",
                    reward_honey: Math.floor(0.50 * USER_REWARD_PERCENTAGE * USD_TO_HONEY_RATE),
                    payout: "0.35",
                    href: "https://demo.cpx-research.com/",
                    tags: ["quick"]
                }
            ]
        })
    }

    // Pass through whatever CPX returned if no surveys found (could be empty or error)
    return NextResponse.json({
      status: "success",
      surveys: []
    })

  } catch (error) {
    console.error("[CPX API Error]:", error)
    return NextResponse.json({ error: "Failed to fetch surveys" }, { status: 500 })
  }
}
