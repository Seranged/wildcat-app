import React, { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { VaultInfo } from "./VaultInfo"
import { Button, Chip, Spinner } from "../../../components/ui-components"
import { useWalletConnect } from "../../../hooks/useWalletConnect"
import { useCurrentNetwork } from "../../../hooks/useCurrentNetwork"
import { VaultDeposit } from "./VaultDeposit"
import { useGetMarket, useGetMarketAccount } from "../../../hooks/useGetMarket"
import WithdrawalRequests from "./WithdrawalRequests"
import { ServiceAgreementCard } from "../../../components/ServiceAgreementCard"
import PaymentHistory from "../../../components/PaymentHistory"
import { BackArrow } from "../../../components/ui-components/icons"

export function LenderMarketDetails() {
  const navigate = useNavigate()
  const { isConnected } = useWalletConnect()
  const { isWrongNetwork } = useCurrentNetwork()

  const { marketAddress } = useParams()
  const { data: market, isLoadingInitial: isMarketLoading } =
    useGetMarket(marketAddress)
  const { data: marketAccount, isLoadingInitial: isMarketAccountLoading } =
    useGetMarketAccount(market)

  const isLoading = isMarketLoading || isMarketAccountLoading

  const handleClickMyMarkets = () => {
    navigate("/lender/active-vaults")
  }

  if (!isConnected || isWrongNetwork) {
    return <div />
  }

  if (isLoading) {
    return <Spinner isLoading={isLoading} />
  }

  if (!market || !marketAccount) {
    return <div>Market not found</div>
  }

  return (
    <div className="flex flex-col">
      <button
        className="flex items-center gap-x-2 px-0 mb-8"
        onClick={handleClickMyMarkets}
      >
        <BackArrow />
        <p className="text-xs font-normal underline">My Markets</p>
      </button>
      <div className="flex justify-between items-center">
        <div className="w-full flex items-center justify-between mb-8">
          <div className="text-green text-2xl font-bold">{market.name}</div>
          <div className="flex ">
            <Chip className="h-auto justify-center p-1 ml-4 mr-3 bg-tint-11">
              {market.underlyingToken.symbol}
            </Chip>
            <Button variant="blue" className="pl-1 w-16">
              Add
            </Button>
          </div>
        </div>
      </div>

      <VaultDeposit market={market} />
      <WithdrawalRequests market={market} />
      <PaymentHistory market={market} />
      <VaultInfo market={market} />

      <ServiceAgreementCard
        className="mt-10"
        title="Wildcat Service Agreement"
        description="You agreed to the Wildcat Service Agreement on 12-Sept-2023"
      />
    </div>
  )
}
