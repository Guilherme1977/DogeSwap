import React from 'react'
import { Currency, Pair } from '@pancakeswap/sdk'
import { Button, ChevronDownIcon, Flex, Text, useModal } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { CurrencyLogo, DoubleCurrencyLogo } from '../Logo'

import { RowBetween } from '../Layout/Row'
import { Input as NumericalInput } from './NumericalInput'

const InputRow = styled.div<{ selected: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`
const CurrencySelectButton = styled(Button).attrs({ variant: 'text', scale: 'sm' })`
  padding: 0 0.5rem;
`
const LabelRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
`
const InputPanel = styled.div<{ hideInput?: boolean }>`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 1;
`
const Container = styled.div<{ hideInput: boolean }>`
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.input};
  box-shadow: ${({ theme }) => theme.shadows.inset};
`

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
}

export default function CurrencyInputPanel({
                                             value,
                                             onUserInput,
                                             onMax,
                                             showMaxButton,
                                             label,
                                             onCurrencySelect,
                                             currency,
                                             disableCurrencySelect = false,
                                             hideBalance = false,
                                             pair = null, // used for double token logo
                                             hideInput = false,
                                             otherCurrency,
                                             id,
                                             showCommonBases,
                                           }: CurrencyInputPanelProps) {
  const currentCurrency = currency || {
    address: '0x6D98aC849Df87ce5Cb1b15CC25DF6199B252BE65',
    chainId: 56,
    decimals: 9,
    name: 'DogeBoys',
    symbol: 'DogeBoys',
  }
  const currectOtherCurrency = otherCurrency || {
    address: '0x6D98aC849Df87ce5Cb1b15CC25DF6199B252BE65',
    chainId: 56,
    decimals: 9,
    name: 'DogeBoys',
    symbol: 'DogeBoys',
  }
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currentCurrency ?? undefined)
  const { t } = useTranslation()
  const translatedLabel = label || t('Input')

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      onCurrencySelect={onCurrencySelect}
      selectedCurrency={currentCurrency}
      otherSelectedCurrency={currectOtherCurrency}
      showCommonBases={showCommonBases}
    />,
  )
  return (
    <InputPanel id={id}>
      <Container hideInput={hideInput}>
        {!hideInput && (
          <LabelRow>
            <RowBetween>
              <Text fontSize="14px">{translatedLabel}</Text>
              {account && (
                <Text onClick={onMax} fontSize="14px" style={{ display: 'inline', cursor: 'pointer' }}>
                  {!hideBalance && !!currentCurrency && selectedCurrencyBalance
                    ? t('Balance: %amount%', { amount: selectedCurrencyBalance?.toSignificant(6) ?? '' })
                    : ' -'}
                </Text>
              )}
            </RowBetween>
          </LabelRow>
        )}
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableCurrencySelect}>
          {!hideInput && (
            <>
              <NumericalInput
                className="token-amount-input"
                value={value}
                onUserInput={(val) => {
                  onUserInput(val)
                }}
              />
              {account && currentCurrency && showMaxButton && label !== 'To' && (
                <Button onClick={onMax} scale="sm" variant="text">
                  MAX
                </Button>
              )}
            </>
          )}
          <CurrencySelectButton
            selected={!!currentCurrency}
            className="open-currency-select-button"
            onClick={() => {
              if (!disableCurrencySelect) {
                onPresentCurrencyModal()
              }
            }}
          >
            <Flex alignItems="center" justifyContent="space-between">
              {pair ? (
                <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={16} margin/>
              ) : currentCurrency ? (
                <CurrencyLogo currency={currentCurrency} size="24px" style={{ marginRight: '8px' }}/>
              ) : null}
              {pair ? (
                <Text id="pair">
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </Text>
              ) : (
                <Text id="pair">
                  {(currentCurrency && currentCurrency.symbol && currentCurrency.symbol.length > 20
                    ? `${currentCurrency.symbol.slice(0, 4)}...${currentCurrency.symbol.slice(
                      currentCurrency.symbol.length - 5,
                      currentCurrency.symbol.length,
                    )}`
                    : currentCurrency?.symbol) || t('Select a currency')}
                </Text>
              )}
              {!disableCurrencySelect && <ChevronDownIcon/>}
            </Flex>
          </CurrencySelectButton>
        </InputRow>
      </Container>
    </InputPanel>
  )
}
