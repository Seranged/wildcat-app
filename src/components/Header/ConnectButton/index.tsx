import { RiWallet3Line, RiCloseLine } from "react-icons/ri"
import { useCallback, useEffect, useMemo } from "react"
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
} from "wagmi"
import { Dialog, Modal } from "react-aria-components"

import { Button } from "../../ui-components"
import { useWalletConnectModalStore } from "../../../store/useWalletConnectModalStore"
import { NETWORKS } from "../../../config/networks"
import { useCurrentNetwork } from "../../../hooks/useCurrentNetwork"

function ConnectButton() {
  const { isOpen, setIsWalletModalOpen } = useWalletConnectModalStore()

  const { connectors, connect, isLoading, pendingConnector } = useConnect()
  const { address, isConnected } = useAccount()
  const { switchNetwork } = useSwitchNetwork()
  const { disconnect } = useDisconnect()
  const { isWrongNetwork } = useCurrentNetwork()

  useEffect(() => {
    if (isConnected && !isWrongNetwork) {
      setIsWalletModalOpen(false)
    }
  }, [isConnected, isWrongNetwork])

  const openModal = useCallback(() => {
    if (!isOpen) {
      setIsWalletModalOpen(true)
    }
  }, [isOpen])

  const closeModal = useCallback(() => {
    if (isOpen) {
      setIsWalletModalOpen(false)
    }
  }, [isOpen])

  const getButtonText = useCallback(() => {
    if (isConnected && isWrongNetwork) {
      return "Wrong Network"
    }
    if (isConnected && address) {
      return `${address.slice(0, 2)}..${address.slice(-4, address.length)}`
    }
    return "Connect"
  }, [isConnected, address, isWrongNetwork])

  const shortenedAddress = useMemo(
    () =>
      address
        ? `${address.slice(0, 2)}..${address.slice(-4, address.length)}`
        : null,
    [address],
  )

  return (
    <>
      <Button className="rounded-sm" onClick={openModal} variant="silver">
        <div className="flex items-center gap-2">
          <span className="text-black text-xs">{getButtonText()}</span>
          <RiWallet3Line className="w-5" />
        </div>
      </Button>
      <Modal isDismissable isOpen={isOpen} onOpenChange={setIsWalletModalOpen}>
        <Dialog className="bg-sand w-80 p-6 rounded-sm flex flex-col">
          <div className="flex items-center justify-center mb-6 relative">
            <p className="text-2xl font-medium select-none">
              {isConnected ? "Account" : " Select Wallet"}
            </p>
            <RiCloseLine
              className="absolute w-6 right-0 top-0"
              onClick={closeModal}
            />
          </div>
          <div className="flex items-center flex-col gap-1">
            {isConnected && isWrongNetwork && (
              <Button
                variant="black"
                className="w-full"
                onClick={() => switchNetwork?.(NETWORKS.Sepolia.chainId)}
              >
                Switch to Sepolia
              </Button>
            )}
            {isConnected ? (
              <>
                <p>{shortenedAddress}</p>

                <Button
                  variant="black"
                  className="w-full"
                  onClick={() => disconnect()}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <>
                {connectors.map((connector) => (
                  <Button
                    disabled={!connector.ready}
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    variant="black"
                    className="w-full"
                  >
                    {connector.name}
                    {!connector.ready && " (unsupported)"}
                    {isLoading &&
                      connector.id === pendingConnector?.id &&
                      " (connecting)"}
                  </Button>
                ))}
              </>
            )}
          </div>

          {!isWrongNetwork && (
            <div className="mt-6">
              <Button variant="black" className="w-full" onClick={closeModal}>
                Close
              </Button>
            </div>
          )}
        </Dialog>
      </Modal>
    </>
  )
}

export default ConnectButton
