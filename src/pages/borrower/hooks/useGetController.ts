import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { getController, Signer } from "@wildcatfi/wildcat-sdk"

import { useEthersSigner } from "../../../modules/hooks"
import { useCurrentNetwork } from "../../../hooks/useCurrentNetwork"

export const GET_CONTROLLER_FOR_BORROWER_KEY = "controllerForBorrower"

export const useGetController = () => {
  const { address } = useAccount()
  const signer = useEthersSigner()
  const { isWrongNetwork } = useCurrentNetwork()

  async function getControllerForBorrower() {
    const controller = await getController(signer as Signer, address as string)
    return controller
  }

  return useQuery({
    queryKey: [GET_CONTROLLER_FOR_BORROWER_KEY, address],
    queryFn: getControllerForBorrower,
    enabled: !!address && !!signer && !isWrongNetwork,
    refetchOnMount: false,
  })
}
