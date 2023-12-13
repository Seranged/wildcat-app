import React, { useState } from "react"

import { BatchStatus } from "@wildcatfi/wildcat-sdk"
import { Chip } from "../../../../components/ui-components"
import { ThisCycleTable } from "./WithdrawalsTable/ThisCycleTable"
import { PrevCycleTable } from "./WithdrawalsTable/PrevCycleTable"
import { useGetWithdrawals } from "./hooks/useGetWithdrawals"
import { ExpandMore } from "../../../../components/ui-components/icons"
import {
  timestampToDateFormatted,
  TOKEN_FORMAT_DECIMALS,
} from "../../../../utils/formatters"
import type { LenderWithdrawalRequestsProps } from "./interface"
import { ClaimTable } from "./ClaimableTable"
import { useGetMarketWithdrawals } from "../../../../hooks/useGetMarketWithdrawals"

const LenderWithdrawalRequests = ({
  market,
}: LenderWithdrawalRequestsProps) => {
  const { data } = useGetWithdrawals(market)
  const { data: batches } = useGetMarketWithdrawals({ market, enabled: true })

  const [thisCycle, setThisCycle] = useState(false)
  const [prevCycle, setPrevCycle] = useState(false)
  const [openClaimTable, setOpenClaimTable] = useState(false)

  const toggleAccordion = (index: number) => {
    if (index === 1) {
      setThisCycle(!thisCycle)
    } else if (index === 2) {
      setPrevCycle(!prevCycle)
    } else if (index === 3) {
      setOpenClaimTable(!openClaimTable)
    }
  }

  const { underlyingToken } = market

  const expiredTotalAmount = data.expiredTotalPendingAmount
  const activeTotalAmount = data.activeTotalPendingAmount
  const totalAmount = expiredTotalAmount.add(activeTotalAmount)
  const filteredWithdrawals = data.expiredPendingWithdrawals.filter(
    (withdrawal) => withdrawal.availableWithdrawalAmount.raw.isZero() === false,
  )

  const cycleStart = data.activeWithdrawal?.requests[0]?.blockTimestamp
  const cycleEnd =
    cycleStart !== undefined ? cycleStart + market.withdrawalBatchDuration : 0

  const claimableBatches = batches.map((batch) => ({
    ...batch,
    withdrawals: batch.withdrawals.filter(
      (withdrawal) => !withdrawal.availableWithdrawalAmount.raw.isZero(),
    ),
  }))

  return (
    <div className="mb-14">
      <div className="flex justify-between items-center mb-8">
        <div className="text-base font-bold">Lender Withdrawal Requests</div>
        <div className="flex gap-x-7 items-center">
          <Chip
            color={cycleStart ? "green" : "red"}
            className="w-fit !h-6 text-white"
          >
            {cycleStart ? "Ongoing Cycle" : "No Cycle"}
          </Chip>
          {cycleStart && (
            <div className="flex gap-x-2">
              <div className="inline text-black text-xs font-bold">Start</div>
              <div className="text-black text-xs">
                {timestampToDateFormatted(cycleStart)}
              </div>
            </div>
          )}
          {cycleStart && (
            <div className="flex gap-x-2">
              <div className="inline text-black text-xs font-bold">End</div>
              <div className="text-black text-xs">
                {timestampToDateFormatted(cycleEnd)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 pr-6">
        <div className="inline text-black text-xs font-bold">
          Open Withdrawal Requests
        </div>
        <Chip className="w-30 flex justify-center">
          {totalAmount.format(TOKEN_FORMAT_DECIMALS, true)}
        </Chip>
      </div>
      <div className="h-12 flex justify-between items-center bg-tint-10 px-6">
        <div className="inline text-black text-xs font-bold">
          Requests Made In This Cycle
        </div>
        <div className="flex gap-x-4 items-center">
          {thisCycle ? (
            <ExpandMore
              className="transform rotate-180"
              onClick={() => toggleAccordion(1)}
            />
          ) : (
            <ExpandMore onClick={() => toggleAccordion(1)} />
          )}
          <Chip className="w-30 flex justify-center">
            {activeTotalAmount.format(TOKEN_FORMAT_DECIMALS, true)}
          </Chip>
        </div>
      </div>

      {thisCycle && (
        <ThisCycleTable
          withdrawals={data?.activeWithdrawal ? [data.activeWithdrawal] : []}
          underlyingToken={underlyingToken}
        />
      )}

      <div className="h-12 flex justify-between items-center bg-tint-10 px-6 mt-6">
        <div className="inline text-black text-xs font-bold">
          Outstanding From Previous Cycles
        </div>
        <div className="flex gap-x-4 items-center">
          {prevCycle ? (
            <ExpandMore
              className="transform rotate-180"
              onClick={() => toggleAccordion(2)}
            />
          ) : (
            <ExpandMore onClick={() => toggleAccordion(2)} />
          )}
          <Chip className="w-30 flex justify-center">
            {expiredTotalAmount.format(TOKEN_FORMAT_DECIMALS, true)}
          </Chip>
        </div>
      </div>
      {prevCycle && (
        <PrevCycleTable
          withdrawals={data?.expiredPendingWithdrawals}
          underlyingToken={underlyingToken}
        />
      )}

      <div className="flex justify-between items-center mt-14 mb-4 pr-6">
        <div className="inline text-black text-xs font-bold">
          Claimable Withdrawal Requests
        </div>
        <Chip className="w-30 flex justify-center">
          {data.totalClaimableAmount.format(TOKEN_FORMAT_DECIMALS)}{" "}
          {market.underlyingToken.symbol}
        </Chip>
      </div>
      <div className="flex flex-col w-full gap-4">
        {claimableBatches.map((batch) => {
          const cycleStartBatch = batch?.requests[0]?.blockTimestamp
          const cycleEndBatch =
            cycleStart !== undefined
              ? cycleStart + market.withdrawalBatchDuration
              : 0
          const expiredPendingWithdrawals = batch.withdrawals.filter(
            (w) => w.status !== BatchStatus.Pending,
          )
          const totalClaimableAmount = expiredPendingWithdrawals.reduce(
            (acc, w) => acc.add(w.availableWithdrawalAmount),
            market.underlyingToken.getAmount(0),
          )
          if (totalClaimableAmount.raw.isZero()) return null
          return (
            <div className="flex flex-col w-full">
              <div className="h-12 flex justify-between items-center bg-tint-10 px-6">
                <div className="inline text-black text-xs font-bold">
                  {timestampToDateFormatted(cycleStartBatch)} -{" "}
                  {timestampToDateFormatted(cycleEndBatch)}
                </div>
                <div className="flex gap-x-4 items-center">
                  {openClaimTable ? (
                    <ExpandMore
                      className="transform rotate-180"
                      onClick={() => toggleAccordion(3)}
                    />
                  ) : (
                    <ExpandMore onClick={() => toggleAccordion(3)} />
                  )}
                  <Chip className="w-30 flex justify-center">
                    {totalClaimableAmount.format(TOKEN_FORMAT_DECIMALS)}{" "}
                    {market.underlyingToken.symbol}
                  </Chip>
                </div>
              </div>
              {openClaimTable && (
                <ClaimTable filteredWithdrawals={batch.withdrawals} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LenderWithdrawalRequests
