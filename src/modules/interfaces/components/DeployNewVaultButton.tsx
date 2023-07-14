import React, { useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightAddon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spinner,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAccount, useToken } from "wagmi";
import { useEthersSigner } from "../../common/hooks/useEthersSigner";
import { useIsOpen } from "../../common/hooks";
import { useController } from "../hooks/useController";
import { Token, TokenAmount } from "@wildcatfi/wildcat-sdk";
import { parseUnits } from "ethers/lib/utils";

interface NewVaultValues {
  asset?: string;
  namePrefix?: string;
  symbolPrefix?: string;
  borrower?: string;
  controller?: string;
  maxTotalSupply?: number;
  annualInterestBips?: number;
  penaltyFeeBips?: number;
  gracePeriod?: number;
  liquidityCoverageRatio?: number;
  interestFeeBips?: number;
  feeRecipient?: string;
}

export function DeployNewVaultButton() {
  const controller = useController();

  const signer = useEthersSigner();

  const { address } = useAccount();

  const { isOpen, handleOpen, handleClose } = useIsOpen();

  const { register, handleSubmit, formState, watch, setValue } = useForm({
    defaultValues: {
      asset: undefined,
      namePrefix: undefined,
      symbolPrefix: undefined,
      borrower: undefined,
      controller: undefined,
      maxTotalSupply: 0,
      annualInterestBips: 0,
      penaltyFeeBips: 0,
      gracePeriod: 0,
      liquidityCoverageRatio: 0,
      interestFeeBips: 0,
      feeRecipient: undefined,
    } as NewVaultValues,
  });

  useEffect(() => {
    if (controller?.address) {
      setValue("controller", controller?.address);
    }
  }, [controller, setValue]);

  const assetWatch = watch("asset");

  const {
    data: assetData,
    isLoading: assetDataLoading,
    isError: assetDataError,
  } = useToken({
    address: assetWatch as `0x${string}`,
    enabled: typeof assetWatch !== "undefined" && assetWatch.length === 42,
  });

  const { mutate: deployNewVault, isLoading: isDeploying } = useMutation({
    mutationFn: async (values: NewVaultValues) => {
      if (!signer || !controller || !assetData) {
        console.log({ signer, controller, assetData });
        return;
      }

      const asset = new Token(
        assetData.address,
        assetData.name,
        assetData.symbol,
        assetData.decimals,
        signer
      );

      const maxTotalSupply = new TokenAmount(
        parseUnits(
          values.maxTotalSupply as unknown as string,
          assetData.decimals
        ),
        asset
      );

      await controller.deployVault({
        asset,
        namePrefix: values.namePrefix as string,
        symbolPrefix: values.symbolPrefix as string,
        borrower: address as `0x${string}`,
        maxTotalSupply,
        annualInterestBips: Number(values.annualInterestBips) * 100,
        penaltyFeeBips: Number(values.penaltyFeeBips) * 100,
        gracePeriod: values.gracePeriod as number,
        liquidityCoverageRatio: Number(values.liquidityCoverageRatio) * 100,
        interestFeeBips: Number(values.interestFeeBips) * 100,
        feeRecipient: values.feeRecipient as `0x${string}`,
      });
    },
    onError: function (error) {
      console.log(error);
      window.alert((error as Error).message ?? "Error deploying vault");
    },
  });

  const onSubmit = useCallback(
    (data: NewVaultValues) => deployNewVault(data),
    [deployNewVault]
  );

  return (
    <Box>
      <Button
        type="button"
        onClick={handleOpen}
        colorScheme="blue"
        isDisabled={
          typeof signer === "undefined" || typeof controller === "undefined"
        }
      >
        Deploy New Vault
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="sm"
        scrollBehavior="inside"
      >
        <ModalOverlay />

        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>
            <Text fontWeight="bold">New Vault</Text>
          </ModalHeader>
          <ModalBody>
            <form method="post" onSubmit={handleSubmit(onSubmit)}>
              <Box as="fieldset" disabled={formState.isSubmitting}>
                <FormControl
                  isInvalid={
                    typeof formState.errors.asset !== "undefined" ||
                    assetDataError
                  }
                >
                  <FormLabel htmlFor="asset">Underlying Asset</FormLabel>
                  <InputGroup>
                    <Input
                      placeholder="address"
                      {...register("asset", {
                        required: true,
                        minLength: {
                          value: 42,
                          message: "Address is not formatted correctly",
                        },
                      })}
                    />
                    {assetDataLoading ? (
                      <InputRightAddon children={<Spinner size="xs" />} />
                    ) : null}
                  </InputGroup>
                  <FormErrorMessage>
                    {formState.errors.asset && formState.errors.asset.message}
                    {assetDataError && "Error loading asset metadata"}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  mt={2}
                  isInvalid={typeof formState.errors.namePrefix !== "undefined"}
                >
                  <FormLabel htmlFor="namePrefix">
                    Issued Vault Token Name Prefix
                  </FormLabel>
                  <Input
                    placeholder="Token"
                    {...register("namePrefix", {
                      required: true,
                      minLength: {
                        value: 4,
                        message: "Name prefix must be at least 4 characters",
                      },
                    })}
                  />
                  <FormErrorMessage>
                    {formState.errors.namePrefix &&
                      formState.errors.namePrefix.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  mt={2}
                  isInvalid={
                    typeof formState.errors.symbolPrefix !== "undefined"
                  }
                >
                  <FormLabel htmlFor="symbolPrefix">
                    Issued Vault Token Symbol Prefix
                  </FormLabel>
                  <Input
                    placeholder="XYZ"
                    {...register("symbolPrefix", {
                      required: true,
                      minLength: {
                        value: 3,
                        message: "Symbol prefix must be at least 3 characters",
                      },
                    })}
                  />
                  <FormErrorMessage>
                    {formState.errors.symbolPrefix &&
                      formState.errors.symbolPrefix.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl mt={2}>
                  <FormLabel htmlFor="maxTotalSupply">
                    Maximum Amount to Borrow
                  </FormLabel>
                  <Input {...register("maxTotalSupply")} />
                </FormControl>

                <FormControl mt={2}>
                  <FormLabel htmlFor="annualInterestBips">
                    Annual Interest Rate (APR)
                  </FormLabel>
                  <InputGroup>
                    <NumberInput
                      defaultValue={0.01}
                      min={0}
                      max={100}
                      step={0.01}
                    >
                      <NumberInputField {...register("annualInterestBips")} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <InputRightAddon children="%" />
                  </InputGroup>
                </FormControl>

                <FormControl mt={2}>
                  <FormLabel htmlFor="penaltyFeeBips">
                    Penalty Fee Rate
                  </FormLabel>
                  <InputGroup>
                    <NumberInput
                      defaultValue={0.01}
                      min={0}
                      max={100}
                      step={0.01}
                    >
                      <NumberInputField {...register("penaltyFeeBips")} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <InputRightAddon children="%" />
                  </InputGroup>
                </FormControl>

                <FormControl mt={2}>
                  <FormLabel htmlFor="interestFeeBips">Interest Fee</FormLabel>
                  <InputGroup>
                    <NumberInput
                      defaultValue={0.01}
                      min={0}
                      max={100}
                      step={0.01}
                    >
                      <NumberInputField {...register("interestFeeBips")} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <InputRightAddon children="%" />
                  </InputGroup>
                </FormControl>

                <FormControl
                  mt={2}
                  isInvalid={typeof formState.errors.controller !== "undefined"}
                >
                  <FormLabel htmlFor="controller">
                    Lender Contoller (Whitelister)
                  </FormLabel>
                  <Input
                    placeholder="address"
                    isReadOnly
                    {...register("controller")}
                  />
                  <FormErrorMessage>
                    {formState.errors.controller &&
                      formState.errors.controller.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl mt={2}>
                  <FormLabel htmlFor="liquidityCoverageRatio">
                    Liquidity Coverage Ratio
                  </FormLabel>
                  <InputGroup>
                    <NumberInput
                      defaultValue={0.01}
                      min={0}
                      max={100}
                      step={0.01}
                    >
                      <NumberInputField
                        {...register("liquidityCoverageRatio")}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <InputRightAddon children="%" />
                  </InputGroup>
                </FormControl>

                <FormControl mt={2}>
                  <FormLabel htmlFor="gracePeriod">
                    Grace Period (Hours)
                  </FormLabel>
                  <Input {...register("gracePeriod")} />
                </FormControl>

                <FormControl
                  mt={2}
                  isInvalid={
                    typeof formState.errors.feeRecipient !== "undefined"
                  }
                >
                  <FormLabel htmlFor="feeRecipient">Fee Recipient</FormLabel>
                  <Input
                    placeholder="address"
                    {...register("feeRecipient", {
                      required: true,
                      minLength: {
                        value: 42,
                        message: "Address is not formatted correctly",
                      },
                    })}
                  />
                  <FormErrorMessage>
                    {formState.errors.feeRecipient &&
                      formState.errors.feeRecipient.message}
                  </FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  mt={4}
                  w="100%"
                  isLoading={isDeploying}
                  disabled={
                    isDeploying ||
                    Object.values(formState.errors).length > 0 ||
                    !assetData ||
                    !controller
                  }
                >
                  Submit
                </Button>
              </Box>
            </form>
          </ModalBody>

          <ModalFooter borderTop="1px solid #cccccc" mt={4}>
            <Button type="button" w="100%">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
