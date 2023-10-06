import { cn } from "src/utils/cn";
import Button from "src/components/Button";
import { ButtonSize } from "src/components/Button";
import Tag, { TagSize } from "src/components/Tag";
import { useIntl } from "src/hooks/useIntl";
import BuildingLine from "src/icons/BuildingLine";
import CheckLine from "src/icons/CheckLine";
import User3Line from "src/icons/User3Line";
import { PayoutSettingsDisplayType, ProfileType } from "./types";
import Callout from "src/components/Callout";
import Input from "src/components/FormInput";
import { Controller, useFormContext } from "react-hook-form";
import Card from "src/components/Card";
import BankLine from "src/icons/BankLine";
import BitcoinLine from "src/icons/BitcoinLine";
import IBANParser from "iban";
import LockFill from "src/icons/LockFill";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import ErrorWarningLine from "src/icons/ErrorWarningLine";
import ProfileRadioGroup from "./ProfileRadioGroup";
import GithubLogo from "src/icons/GithubLogo";
import StarknetIcon from "src/assets/icons/Starknet";
import EthereumIcon from "src/assets/icons/Ethereum";
import OptimismIcon from "src/assets/icons/Optimism";
import DollarIcon from "src/assets/icons/Dollar";
import AptosIcon from "src/assets/icons/Aptos";
import Chip from "src/components/Chip/Chip";
import Flex from "src/components/Utils/Flex";
import Box from "src/components/Utils/Box";

const ETHEREUM_ADDRESS_OR_ENV_DOMAIN_REGEXP =
  /(^0x[a-fA-F0-9]{40}$)|(^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?$)/gi;
const BIC_REGEXP = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i;

type Props = {
  payoutSettingsValid?: boolean;
  saveButtonDisabled: boolean;
  unsavedChanges: boolean;
};

export default function PayoutInfoSidePanel({ payoutSettingsValid, saveButtonDisabled, unsavedChanges }: Props) {
  const { T } = useIntl();
  const {
    watch,
    control,
    formState: { touchedFields },
    clearErrors,
    trigger,
  } = useFormContext();

  const profileType = watch("profileType");
  const payoutSettingsType = watch("payoutSettingsType");
  const IBANValue = watch("IBAN");
  const BICValue = watch("BIC");

  return (
    <div className="flex h-full min-h-0 flex-col justify-between overflow-y-auto">
      <div className="mx-2 mb-1 flex min-h-0 flex-col gap-6 px-4 pt-4 scrollbar-thin scrollbar-thumb-white/12 scrollbar-thumb-rounded scrollbar-w-1.5">
        {/* <Tag size={TagSize.Medium}>
          <div
            className={cn({
              "text-orange-500": !payoutSettingsValid,
            })}
          >
            {payoutSettingsValid ? (
              <div className="flex flex-row items-center gap-1">
                <CheckLine /> {T("profile.form.payoutSettingsValidTag")}
              </div>
            ) : (
              T("profile.form.payoutSettingsRequiredTag")
            )}
          </div>
        </Tag> */}
        <ProfileRadioGroup
          name="profileType"
          label={T("profile.form.profileType")}
          requiredForPayment={true}
          options={[
            {
              value: ProfileType.Individual,
              label: T("profile.form.profileTypeIndividual"),
              icon: <User3Line className="text-xl" />,
            },
            {
              value: ProfileType.Company,
              label: T("profile.form.profileTypeCompany"),
              icon: <BuildingLine className="text-xl" />,
            },
          ]}
        />
        <Card padded={false} className="p-6" withBg={false}>
          <Box className="pb-6">
            <Tag size={TagSize.Medium}>
              <div
                className={cn({
                  "text-orange-500": !payoutSettingsValid,
                })}
              >
                {payoutSettingsValid ? (
                  <div className="flex flex-row items-center gap-1">
                    <CheckLine /> {T("profile.form.contactSettingsValidTag")}
                  </div>
                ) : (
                  <>
                    <ErrorWarningLine className="mr-1 text-orange-500" />
                    {T("profile.missing.contact")}
                  </>
                )}
              </div>
            </Tag>
          </Box>

          {profileType === ProfileType.Company && (
            <div className="flex flex-col">
              <Callout>{T("profile.form.companyNeedsInvoiceCallout")}</Callout>
              <div className="flex w-full flex-row gap-5 pt-5">
                <Input
                  label={T("profile.form.companyName")}
                  name="companyName"
                  placeholder={T("profile.form.companyName")}
                  requiredForPayment={true}
                />
                <Input
                  label={T("profile.form.identificationNumber")}
                  name="identificationNumber"
                  placeholder={T("profile.form.identificationNumber")}
                  requiredForPayment={true}
                />
              </div>
              <div className="flex w-full flex-row gap-5">
                <Input
                  label={T("profile.form.companyOwnerFirstName")}
                  name="firstname"
                  placeholder={T("profile.form.companyOwnerFirstName")}
                  requiredForPayment={true}
                />
                <Input
                  label={T("profile.form.companyOwnerLastName")}
                  name="lastname"
                  placeholder={T("profile.form.companyOwnerLastName")}
                  requiredForPayment={true}
                />
              </div>
            </div>
          )}
          {profileType === ProfileType.Individual && (
            <div className="flex w-full flex-row gap-5">
              <Input
                label={T("profile.form.firstname")}
                name="firstname"
                placeholder={T("profile.form.firstname")}
                requiredForPayment={true}
              />
              <Input
                label={T("profile.form.lastname")}
                name="lastname"
                placeholder={T("profile.form.lastname")}
                requiredForPayment={true}
              />
            </div>
          )}
          <div>
            <Input
              label={T("profile.form.address")}
              name="address"
              placeholder={T("profile.form.address")}
              requiredForPayment={true}
            />
            <div className="flex flex-row gap-5">
              <Input
                label={T("profile.form.postCode")}
                name="postCode"
                placeholder={T("profile.form.postCode")}
                requiredForPayment={true}
              />
              <Input
                label={T("profile.form.city")}
                name="city"
                placeholder={T("profile.form.city")}
                requiredForPayment={true}
              />
              <Input
                label={T("profile.form.country")}
                name="country"
                placeholder={T("profile.form.country")}
                requiredForPayment={true}
              />
            </div>
          </div>
          {profileType === ProfileType.Company && (
            <div className="mb-6 flex w-fit flex-row gap-3 font-medium text-neutral-300">
              <ProfileRadioGroup
                name="payoutSettingsType"
                label={T("profile.form.payoutSettingsType")}
                requiredForPayment={true}
                options={[
                  {
                    value: PayoutSettingsDisplayType.BankAddress,
                    label: T("profile.form.bankWire"),
                    icon: <BankLine className="text-xl" />,
                  },
                  {
                    value: PayoutSettingsDisplayType.EthereumIdentity,
                    label: T("profile.form.cryptoWire"),
                    icon: <BitcoinLine className="text-xl" />,
                  },
                ]}
              />
            </div>
          )}
          {payoutSettingsType === PayoutSettingsDisplayType.EthereumIdentity && (
            <Input
              label={T("profile.form.ethIdentity")}
              name="ethIdentity"
              placeholder={T("profile.form.ethIdentityPlaceholder")}
              options={{
                pattern: {
                  value: ETHEREUM_ADDRESS_OR_ENV_DOMAIN_REGEXP,
                  message: T("profile.form.invalidCryptoSettings"),
                },
              }}
              requiredForPayment={true}
            />
          )}
          {payoutSettingsType === PayoutSettingsDisplayType.BankAddress && (
            <div className="flex flex-row gap-5">
              <Controller
                control={control}
                name="IBAN"
                render={({ field: { onChange, value, onBlur } }) => {
                  return (
                    <Input
                      label={T("profile.form.iban")}
                      name="IBAN"
                      placeholder={T("profile.form.iban")}
                      options={{
                        required: { value: !!BICValue, message: T("profile.form.ibanRequired") },
                        validate: value => {
                          return !value?.trim() || IBANParser.isValid(value) || T("profile.form.ibanInvalid");
                        },
                      }}
                      requiredForPayment={true}
                      value={value && IBANParser.printFormat(value)}
                      onChange={onChange}
                      onBlur={() => {
                        if (touchedFields.BIC) {
                          trigger("BIC");
                        }
                        onBlur();
                      }}
                      onFocus={() => clearErrors("IBAN")}
                    />
                  );
                }}
              />
              <Controller
                control={control}
                name="BIC"
                render={({ field: { onChange, value, onBlur } }) => {
                  return (
                    <Input
                      label={T("profile.form.bic")}
                      name="BIC"
                      placeholder={T("profile.form.bic")}
                      options={{
                        pattern: { value: BIC_REGEXP, message: T("profile.form.bicInvalid") },
                        required: {
                          value: !!IBANValue?.trim(),
                          message: T("profile.form.bicRequired"),
                        },
                      }}
                      requiredForPayment={true}
                      value={value}
                      onChange={onChange}
                      onBlur={() => {
                        if (touchedFields.IBAN) {
                          trigger("IBAN");
                        }
                        onBlur();
                      }}
                      onFocus={() => clearErrors("BIC")}
                    />
                  );
                }}
              />
            </div>
          )}
        </Card>

        <Card padded={false} className="p-6" withBg={false}>
          <Box className="pb-6">
            <Tag size={TagSize.Medium}>
              <div
                className={cn({
                  "text-orange-500": !payoutSettingsValid,
                })}
              >
                {payoutSettingsValid ? (
                  <div className="flex flex-row items-center gap-1">
                    <CheckLine /> {T("profile.form.payoutSettingsValidTag")}
                  </div>
                ) : (
                  <>
                    <ErrorWarningLine className="mr-1 text-orange-500" />
                    {T("profile.missing.payment")}
                  </>
                )}
              </div>
            </Tag>
          </Box>

          <Input
            label={
              <Flex className="items-center gap-1">
                <Chip content={<EthereumIcon className="h-3" />} />
                {T("profile.form.ethIdentity")}
              </Flex>
            }
            name="ethIdentity"
            placeholder={T("profile.form.ethIdentityPlaceholder")}
            options={{
              pattern: {
                value: ETHEREUM_ADDRESS_OR_ENV_DOMAIN_REGEXP,
                message: T("profile.form.invalidCryptoSettings"),
              },
            }}
            requiredForPayment={true}
            inputProps={{ autoFocus: true }}
          />
          <Input
            label={
              <Flex className="items-center gap-1">
                <Chip content={<StarknetIcon className="h-4" />} />
                {T("profile.form.starkIdentity")}
              </Flex>
            }
            name="starkIdentity"
            placeholder={T("profile.form.starkIdentityPlaceholder")}
            options={{
              pattern: {
                value: ETHEREUM_ADDRESS_OR_ENV_DOMAIN_REGEXP,
                message: T("profile.form.invalidCryptoSettings"),
              },
            }}
            requiredForPayment={true}
          />
          <Input
            label={
              <Flex className="items-center gap-1">
                <Chip content={<OptimismIcon className="h-4" />} />
                {T("profile.form.optimismIdentity")}
              </Flex>
            }
            name="optimismIdentity"
            placeholder={T("profile.form.optimismIdentityPlaceholder")}
            options={{
              pattern: {
                value: ETHEREUM_ADDRESS_OR_ENV_DOMAIN_REGEXP,
                message: T("profile.form.invalidCryptoSettings"),
              },
            }}
            requiredForPayment={true}
          />
          <Input
            label={
              <Flex className="items-center gap-1">
                <Chip content={<AptosIcon className="h-4 bg-white" />} />
                {T("profile.form.aptosIdentity")}
              </Flex>
            }
            name="aptosIdentity"
            placeholder={T("profile.form.aptosIdentityPlaceholder")}
            options={{
              pattern: {
                value: ETHEREUM_ADDRESS_OR_ENV_DOMAIN_REGEXP,
                message: T("profile.form.invalidCryptoSettings"),
              },
            }}
            requiredForPayment={true}
          />
        </Card>

        <div className="flex flex-col items-center gap-4 p-4 text-center font-walsheim text-greyscale-400">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/8 text-xl leading-5">
            <LockFill />
          </div>
          <ReactMarkdown className="whitespace-pre-wrap text-sm">{T("profile.form.privacyNotice")}</ReactMarkdown>
        </div>
      </div>
      <div className="flex flex-row items-center justify-between border-t border-greyscale-50/8 bg-white/2 px-8 py-5">
        <Tag size={TagSize.Medium}>
          {unsavedChanges ? (
            <div className="flex flex-row items-center gap-1 text-spacePurple-300">
              <ErrorWarningLine /> {T("profile.form.saveStatus.unsaved")}
            </div>
          ) : (
            <>
              <CheckLine />
              {T("profile.form.saveStatus.saved")}
            </>
          )}
        </Tag>
        <Button
          size={ButtonSize.Md}
          htmlType="submit"
          data-testid="profile-form-submit-button"
          disabled={saveButtonDisabled}
        >
          {T("profile.form.send")}
        </Button>
      </div>
    </div>
  );
}
