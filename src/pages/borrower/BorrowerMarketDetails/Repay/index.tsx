import React, { ChangeEvent, useMemo, useState } from "react"
import { minTokenAmount } from "@wildcatfi/wildcat-sdk"

import { Button } from "../../../../components/ui-components"
import { RepayModal } from "../Modals"
import {
  useApprove,
  useProcessUnpaidWithdrawalBatch,
  useRepay,
  useRepayOutstandingDebt,
} from "../hooks/useVaultDetailActions"
import { RepayProps } from "./interface"
import {
  MARKET_PARAMS_DECIMALS,
  TOKEN_FORMAT_DECIMALS,
} from "../../../../utils/formatters"
import { DetailsInput } from "../../../../components/ui-components/DetailsInput"
import { SDK_ERRORS_MAPPING } from "../../../../utils/forms/errors"

const Repay = ({ marketAccount }: RepayProps) => {
  const { market } = marketAccount
  const [repayAmount, setRepayAmount] = useState("0")

  const { mutate: repay, isLoading: isRepayAmountLoading } =
    useRepay(marketAccount)

  const {
    mutate: repayAndProcessUnpaidWithdrawalBatch,
    isLoading: isLoadingUnpaidWithdrawalBatch,
  } = useProcessUnpaidWithdrawalBatch(marketAccount.market)

  const {
    mutate: repayOutstandingDebt,
    isLoading: isRepayOutstandingDebtLoading,
  } = useRepayOutstandingDebt(marketAccount)

  const { mutate: approve, isLoading: isApproving } = useApprove(
    marketAccount.market.underlyingToken,
    marketAccount.market,
  )

  const [error, setError] = useState<string | undefined>()

  const handleRepayAmountChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.target
    setRepayAmount(value || "0")

    if (value === "" || value === "0") {
      setError(undefined)
      return
    }

    const repayTokenAmount =
      marketAccount.market.underlyingToken.parseAmount(value)

    const repayStep = marketAccount.checkRepayStep(repayTokenAmount)

    if (repayStep.status !== "Ready") {
      setError(SDK_ERRORS_MAPPING.repay[repayStep.status])
      return
    }

    setError(undefined)
  }

  const { outstandingDebt, underlyingToken } = market

  const repayTokenAmount = useMemo(
    () => marketAccount.market.underlyingToken.parseAmount(repayAmount),
    [repayAmount],
  )
  const repayStep = marketAccount.checkRepayStep(repayTokenAmount)

  const isLoading =
    isRepayAmountLoading ||
    isRepayOutstandingDebtLoading ||
    isApproving ||
    isLoadingUnpaidWithdrawalBatch

  const repayDisabled = repayTokenAmount.raw.isZero() || !!error || isLoading

  const repayOutstandingDisabled =
    outstandingDebt.raw.isZero() ||
    !marketAccount.canRepayOutstanding ||
    isLoading

  const handleApprove = () => {
    if (repayStep?.status === "InsufficientAllowance") {
      approve(repayTokenAmount)
    }
  }

  const handleRepay = () => {
    if (!market.unpaidWithdrawalBatchExpiries.length) {
      repay(repayTokenAmount)
    } else {
      const { length } = market.unpaidWithdrawalBatchExpiries
      const repayAmountValue = minTokenAmount(
        market.outstandingDebt,
        market.underlyingToken.getAmount(marketAccount.underlyingApproval),
      )

      repayAndProcessUnpaidWithdrawalBatch({
        tokenAmount: repayAmountValue,
        maxBatches: length,
      })
    }
  }

  const newMarketReserve = market.totalAssets.add(repayTokenAmount)

  return (
    <>
      <DetailsInput
        market={market}
        decimalScale={MARKET_PARAMS_DECIMALS.maxTotalSupply}
        className="w-full"
        placeholder="00,000.00"
        onChange={handleRepayAmountChange}
        helperText="Borrowed"
        error={!!error}
        errorText={error}
        helperValue={`${outstandingDebt.format(TOKEN_FORMAT_DECIMALS, true)}`}
      />
      <div className="w-44 flex flex-col gap-y-1.5">
        {repayStep.status === "InsufficientAllowance" ? (
          <Button
            variant="green"
            className="w-full"
            onClick={handleApprove}
            disabled={isApproving}
          >
            Approve
          </Button>
        ) : (
          <RepayModal
            disabled={repayDisabled}
            newMarketReserve={newMarketReserve.format(TOKEN_FORMAT_DECIMALS)}
            repayAmount={repayAmount}
            isLoading={isLoading}
            tokenSymbol={underlyingToken.symbol}
            repay={handleRepay}
          />
        )}
        <Button
          disabled={repayOutstandingDisabled}
          variant="green"
          className="w-full px-2 whitespace-nowrap"
          onClick={repayOutstandingDebt}
        >
          Repay To Minimum Reserves
        </Button>
      </div>
    </>
  )
}

export default Repay
