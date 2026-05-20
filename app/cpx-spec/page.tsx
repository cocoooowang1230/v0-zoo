import Image from "next/image"

export const metadata = {
  title: "BitBee × CPX Research 整合規格書 v2.0",
  description: "BitBee 與 CPX Research 問卷平台整合的完整技術與 UI/UX 規格書，包含系統架構、獎勵邏輯、後台設定步驟。",
}

export default function CpxSpecPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-4xl">🐝</span>
            <span className="text-3xl font-bold">BitBee × CPX Research</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">整合規格書</h1>
          <p className="text-orange-100 text-sm">版本 v2.0 ・ 2026-05-20 ・ Prototype 完成，等待工程團隊接上正式資料庫</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-14">

        {/* Section 1: 背景 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-orange-500 pl-4 mb-4">一、產品背景與目標</h2>
          <p className="text-gray-600 mb-4">BitBee 是一個讓使用者完成任務賺取 Honey（可兌換 BTC 等值獎勵）的平台。本次整合 CPX Research 問卷平台，在 BitBee 任務中心新增「問卷任務」模組，讓使用者透過填寫市調問卷賺取 Honey。</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "💰", title: "多元賺幣管道", desc: "讓使用者除了每日簽到外，有更多方式賺取 Honey" },
              { icon: "📊", title: "平台分潤收入", desc: "每份完成問卷，平台抽成 30% 作為營運收入" },
              { icon: "🔒", title: "信任感與黏著度", desc: "透明的獎勵規則與安慰獎機制，強化使用者信任" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: 系統架構 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-orange-500 pl-4 mb-4">二、系統架構總覽</h2>
          <Image src="/images/spec-flow.png" alt="系統架構流程圖" width={800} height={450} className="rounded-xl shadow-md w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { status: "status=1", label: "完成問卷 ✅", color: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-700", desc: "CPX 同時發送 Postback + Redirect，Honey 進入 14 天 Pending 期" },
              { status: "status=screenout", label: "不符資格 😅", color: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700", desc: "CPX 發送安慰獎 Postback + Redirect，Honey 立即入帳，不走 Pending" },
              { status: "status=2", label: "作弊扣款 ❌", color: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700", desc: "CPX 事後打第二次 Postback，系統扣除該筆 Pending Honey" },
            ].map((item) => (
              <div key={item.status} className={`rounded-xl p-4 border ${item.color}`}>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${item.badge}`}>{item.status}</span>
                <h3 className="font-bold text-gray-800 mt-2 mb-1">{item.label}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: CPX 後台設定 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-orange-500 pl-4 mb-6">三、CPX 後台設定步驟</h2>
          <Image src="/images/spec-cpx-setup.png" alt="CPX 後台設定說明" width={800} height={400} className="rounded-xl shadow-md w-full mb-8" />

          {[
            {
              step: 1,
              tab: "REWARD SETTINGS",
              title: "設定獎勵貨幣與匯率",
              fields: [
                { label: "Currency Name (Singular)", value: "honey" },
                { label: "Currency Name (Plural)", value: "honey" },
                { label: "Currency Factor", value: "300（1 USD = 300 Honey）" },
                { label: "Currency Factor for Bonus", value: "300（Screen Out 安慰獎，0% 平台抽成）" },
              ],
              note: "Currency Factor 決定了 CPX 在它們自己的網站上顯示給使用者的 Honey 數字，以及 Postback 帶來的 amount_local 數值。"
            },
            {
              step: 2,
              tab: "POSTBACK SETTINGS",
              title: "設定問卷完成通知 URL",
              fields: [
                { label: "Main Postback URL", value: "https://v0-zoo-3-2-zoo-3.vercel.app/api/cpx/postback?status={status}&trans_id={trans_id}&user_id={user_id}&amount_local={amount_local}&amount_usd={amount_usd}&secure_hash={secure_hash}" },
                { label: "Postback Url Screen Out", value: "https://v0-zoo-3-2-zoo-3.vercel.app/api/cpx/postback?status=screenout&trans_id={trans_id}&user_id={user_id}&amount_local={amount_local}&amount_usd={amount_usd}&secure_hash={secure_hash}" },
              ],
              note: "Main Postback URL 必填。CPX 會在背景向此 URL 發送通知，這是真正的發獎觸發點。大括號內的文字是 CPX 提供的佔位符，請勿修改。"
            },
            {
              step: 3,
              tab: "REDIRECT SETTINGS",
              title: "設定完成後跳轉回 BitBee",
              fields: [
                { label: "Redirect Type", value: "Basic after close the User Message" },
                { label: "Redirect Url（完成問卷）", value: "https://v0-zoo-3-2-zoo-3.vercel.app/rewards?cpx_status=success&reward={amount_local}" },
                { label: "Redirect Url（Screen Out）", value: "https://v0-zoo-3-2-zoo-3.vercel.app/rewards?cpx_status=screenout&reward={amount_local}" },
              ],
              note: "選擇 'Basic after close the User Message' 讓使用者先看到 CPX 的完成提示，再點擊關閉後被導回 BitBee。{amount_local} 會自動帶入 Honey 數量。"
            },
          ].map((section) => (
            <div key={section.step} className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-white text-orange-500 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{section.step}</span>
                <div>
                  <p className="text-xs text-orange-100 font-mono">{section.tab}</p>
                  <h3 className="text-white font-bold">{section.title}</h3>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {section.fields.map((field) => (
                  <div key={field.label}>
                    <p className="text-xs text-gray-400 mb-0.5">{field.label}</p>
                    <p className="text-sm font-mono bg-gray-50 rounded px-3 py-2 text-gray-700 break-all">{field.value}</p>
                  </div>
                ))}
                <div className="mt-4 bg-orange-50 border border-orange-100 rounded-lg px-4 py-3">
                  <p className="text-xs text-orange-700">💡 {section.note}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Section 4: UI/UX */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-orange-500 pl-4 mb-4">四、UI/UX 設計規格</h2>

          <h3 className="text-lg font-bold text-gray-700 mb-3">4.1 任務中心 — 問卷卡片設計</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">卡片元素</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">顯示內容</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">設計目的</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { el: "⏱ 作答時間", content: "約 N 分鐘", purpose: "讓使用者在點擊前預估時間成本，自主決策" },
                  { el: "🍯 最高可獲得", content: "N Honey（橘色大字）", purpose: "顯示使用者實際可拿到的 70% 份額，誠實不誇大" },
                  { el: "📌 注意文字", content: "完成並通過驗證後，14 天後可提領", purpose: "提前設定期望，避免做完問卷找不到錢而客訴" },
                  { el: "🟠 開始按鈕", content: "開始問卷（橘色圓角）", purpose: "清楚 CTA，與 BitBee 品牌色一致" },
                ].map((row) => (
                  <tr key={row.el} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{row.el}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{row.content}</td>
                    <td className="px-4 py-3 text-gray-500">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-bold text-gray-700 mb-3">4.2 獎勵歷史 — 三種 CPX 紀錄狀態</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              {
                title: "完成問卷",
                type: "CPX 問卷任務",
                amount: "+ 245 $HONEY",
                badge: "驗證中 (14天後解鎖)",
                badgeColor: "bg-orange-100 text-orange-600",
                amountColor: "text-yellow-500",
                desc: "橘色標籤代表等待中，讓使用者知道錢在哪、何時能拿",
              },
              {
                title: "Screen Out",
                type: "CPX 問卷 (安慰獎)",
                amount: "+ N $HONEY",
                badge: "已入帳",
                badgeColor: "bg-green-100 text-green-600",
                amountColor: "text-yellow-500",
                desc: "綠色代表已完成，正向回饋降低被踢出的挫折感",
              },
              {
                title: "作弊扣款",
                type: "CPX 問卷任務（扣除）",
                amount: "- N $HONEY",
                badge: "已扣除",
                badgeColor: "bg-red-100 text-red-600",
                amountColor: "text-red-500",
                desc: "紅色明確標示扣除，透明化操作",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b">
                  <p className="text-xs font-bold text-gray-500">{item.title}</p>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{item.type}</p>
                      <p className="text-xs text-gray-400 mt-0.5">2026-05-20 16:00</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`font-bold text-sm ${item.amountColor}`}>{item.amount}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${item.badgeColor}`}>{item.badge}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3 pt-3 border-t">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-bold text-gray-700 mb-3">4.3 使用者心理旅程設計</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">設計決策</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">解決的心理痛點</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { decision: "卡片顯示「約 N 分鐘」", pain: "做了 20 分鐘才發現問卷要 1 小時 → 憤怒放棄" },
                  { decision: "卡片顯示「14 天後可提領」", pain: "做完問卷立刻去提領，發現不能提 → 誤以為被詐騙" },
                  { decision: "Screen Out 後立即顯示「安慰獎 已入帳」", pain: "白做了 3 分鐘被踢出 → 完全沒補償 → 憤怒不再使用" },
                  { decision: "獎勵頁即時刷新紀錄", pain: "做完問卷，等半天不知道錢在哪 → 客訴" },
                  { decision: "14 天 Pending 保護機制", pain: "作弊者做完立刻領走 → 平台被 CPX 退款後血本無歸" },
                ].map((row) => (
                  <tr key={row.decision} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">✅ {row.decision}</td>
                    <td className="px-4 py-3 text-gray-500">⚠️ {row.pain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: 獎勵計算 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-orange-500 pl-4 mb-4">五、獎勵邏輯與規則</h2>
          <Image src="/images/spec-reward.png" alt="獎勵計算邏輯" width={800} height={400} className="rounded-xl shadow-md w-full mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4">💰 分潤計算公式</h3>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 mb-4">
                使用者 Honey<br />
                = floor(payout_publisher_usd<br />
                {"  "}× 0.7<br />
                {"  "}× 300)
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">CPX 付給平台</span><span className="font-medium">$1.17 USD</span></div>
                <div className="flex justify-between"><span className="text-gray-500">平台抽成 (30%)</span><span className="font-medium text-gray-400">- $0.35</span></div>
                <div className="flex justify-between border-t pt-2"><span className="font-bold">使用者獲得</span><span className="font-bold text-orange-500">245 Honey</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4">🔐 14 天 Pending 狀態機</h3>
              <div className="space-y-3">
                {[
                  { from: "做完問卷", to: "🟠 驗證中", note: "立刻看到，不能提領" },
                  { from: "14 天後", to: "🟢 可提領", note: "自動解鎖，可提 BTC" },
                  { from: "CPX 退款 (status=2)", to: "🔴 已扣除", note: "作弊保護，直接扣除" },
                ].map((item) => (
                  <div key={item.from} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400 w-28 text-xs">{item.from}</span>
                    <span className="text-gray-300">→</span>
                    <span className="font-medium text-gray-800">{item.to}</span>
                    <span className="text-xs text-gray-400">({item.note})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: 工程師 TODO */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-orange-500 pl-4 mb-4">六、工程師待實作清單</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-700">
            ⚠️ Prototype 已完成所有前端 UI 與後端 API 邏輯框架。以下為工程師接手後需要完成的資料庫接入工作。
          </div>
          <div className="space-y-3">
            {[
              { id: "01", title: "防重複發獎", desc: "在 /api/cpx/postback 加入 DB 查詢，確認 trans_id 是否已處理過，避免重複發獎。", file: "app/api/cpx/postback/route.ts" },
              { id: "02", title: "寫入 Pending 紀錄", desc: "status=1 時，將問卷紀錄寫入資料庫，狀態設為 PENDING，並更新使用者的 pending_honey 欄位。", file: "app/api/cpx/postback/route.ts" },
              { id: "03", title: "寫入 Screen Out 紀錄", desc: "status=screenout 時，直接寫入 DB，狀態設為 AVAILABLE，將 amount_local 加入 available_honey（不走 pending）。", file: "app/api/cpx/postback/route.ts" },
              { id: "04", title: "作弊扣款邏輯", desc: "status=2 時，找到對應的 trans_id，將其改為 REVERSED，並從使用者的 pending_honey 中扣除。", file: "app/api/cpx/postback/route.ts" },
              { id: "05", title: "14 天自動解鎖排程", desc: "建立 Cron Job，每天執行，將 PENDING 且超過 14 天的紀錄批次更新為 AVAILABLE。", file: "新建 Cron Job" },
              { id: "06", title: "前端換成讀取 API", desc: "目前前端讀取 localStorage（Prototype 用）。上線前改成呼叫 GET /api/user/rewards 從 DB 讀取。", file: "app/rewards/page.tsx" },
              { id: "07", title: "ext_user_id 綁定真實使用者", desc: "傳給 CPX 的 ext_user_id 需改成讀取已登入使用者的真實 ID，確保 Postback 能對應正確使用者帳號。", file: "app/tasks/page.tsx" },
            ].map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4">
                <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded h-fit">{item.id}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.desc}</p>
                  <span className="text-[10px] font-mono bg-orange-50 text-orange-600 px-2 py-0.5 rounded">{item.file}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: 環境變數 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-orange-500 pl-4 mb-4">七、Vercel 環境變數設定</h2>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
            🔒 正式上線前，請在 Vercel 後台的 Settings → Environment Variables 填入以下變數，並從程式碼中移除 Hardcode 的預設值。
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-3">
              {[
                { key: "CPX_APP_ID", value: "33041" },
                { key: "CPX_SECURE_HASH", value: "MxgZIaVqej23sLYIJeQxl7NNxPyPFeH1" },
              ].map((env) => (
                <div key={env.key} className="flex gap-4 items-center">
                  <span className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded text-gray-700 w-48">{env.key}</span>
                  <span className="font-mono text-sm text-gray-500">{env.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-400 text-xs pt-6 border-t pb-10">
          BitBee × CPX Research 整合規格書 v2.0 ・ 2026-05-20
          <br />本文件由 BitBee 產品團隊與 AI 協作整理產出。
        </footer>
      </div>
    </div>
  )
}
