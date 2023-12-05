import SafeAppsSDK, {
  BaseTransaction,
  Web3TransactionReceiptObject,
} from "@safe-global/safe-apps-sdk"
import { useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"

export type GnosisSafeHook = {
  isConnectedToSafe: boolean
  sdk?: SafeAppsSDK
  getTransactionHash(safeTxHash: string): Promise<string>
  waitForTransaction(txHash: string): Promise<Web3TransactionReceiptObject>
  sendTransactions(transactions: BaseTransaction[]): Promise<{
    safeTxHash: string
    txHash: string
    wait: () => Promise<Web3TransactionReceiptObject>
  }>
}

export function useGnosisSafeSDK(): GnosisSafeHook {
  const { isConnected, connector, address } = useAccount()
  const [sdk, setSdk] = useState<SafeAppsSDK | undefined>(undefined)
  const isConnectedToSafe = useMemo(
    () => isConnected && connector?.name === "Safe",
    [isConnected, address],
  )
  useEffect(() => {
    console.log(`useGnosisSafeSDK :: Connected to safe: ${isConnectedToSafe}`)
    if (isConnectedToSafe && !sdk) {
      if (!connector) throw Error("No connector found")
      setSdk(new SafeAppsSDK(connector!.options))
    }
    return undefined
  }, [isConnectedToSafe])

  const getTransactionHash = async (safeTxHash: string) => {
    if (!sdk) throw Error("No sdk found")
    return sdk.txs
      .getBySafeTxHash(safeTxHash)
      .then((resp) => resp.txHash ?? safeTxHash)
      .catch((err) => {
        console.log(`useGnosisSafeSDK :: Error getting tx hash`)
        console.log(err)
        return safeTxHash
      })
  }

  const waitForTransaction = async (txHash: string) => {
    if (!sdk) throw Error("No sdk found")
    return sdk.eth.getTransactionReceipt([txHash]).then((tx) => {
      // We set the tx hash to the one requested, as some provider assert this
      if (tx) {
        tx.transactionHash = txHash
      }
      return tx
    })
  }

  const sendTransactions = async (transactions: BaseTransaction[]) => {
    if (!sdk) throw Error("No sdk found")
    const { safeTxHash } = await sdk.txs.send({ txs: transactions })
    const txHash = await getTransactionHash(safeTxHash)
    return {
      safeTxHash,
      txHash,
      wait: () => waitForTransaction(txHash),
    }
  }

  return {
    isConnectedToSafe,
    sdk,
    getTransactionHash,
    waitForTransaction,
    sendTransactions,
  }
}
