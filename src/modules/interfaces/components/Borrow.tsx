import { useMemo } from "react";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { DeployNewVaultButton } from "./DeployNewVaultButton";
import { BorrowVault } from "./BorrowVault";
import { VaultAccount } from "@wildcatfi/wildcat-sdk";

export interface Props {
  allVaults: VaultAccount[];
}

export function Borrow({ allVaults }: Props) {
  const { address } = useAccount();

  console.log(`Rendering Borrow`)

  const userVaults = useMemo(() => {
    const res = allVaults.filter((vault) => vault.isBorrower);
    return res;
  }, [allVaults]);

  const shortenedAddress = useMemo(() => {
    return address
      ? `${address.slice(0, 2)}..${address.slice(-4, address.length)}`
      : null;
  }, [address]);

  return (
    <Box>
      <Flex alignItems="center" justifyContent="space-between">
        {address ? (
          <Text fontSize="lg" fontWeight="bold">
            Active Vaults for Borrower {shortenedAddress}
          </Text>
        ) : (
          <Text fontSize="lg" fontWeight="bold">
            Connect Wallet to View Active Vaults
          </Text>
        )}

        <DeployNewVaultButton />
      </Flex>

      {userVaults.length ? (
        <VStack spacing={4} align="stretch" mt={6}>
          {userVaults.map((vaultAccount, idx) => (
            <BorrowVault
              key={`${vaultAccount.vault}_${vaultAccount.vault.controller}_${idx}`}
              vaultAccount={vaultAccount}
            />
          ))}
        </VStack>
      ) : (
        <Box borderRadius="md" border="1px solid #cccccc" p={4} mt={4}>
          <Box fontWeight="bold" fontSize="bold">
            <Text display="inline" mr={2}>
              No vaults for Borrower {shortenedAddress}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}