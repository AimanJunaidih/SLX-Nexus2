export type RebateType = 'Subscription (Monthly)' | 'Subscription (Yearly)' | 'Device' | 'Outstanding';

export interface RebateInputs {
  rebateType: RebateType;
  units: number;
  participants: number;
  outstandingBalance?: number;
  includeSST: boolean;
}

export interface RebateCalculations {
  totalClaimValue: number;
  invoiceBeforeDeduction: number;
  hrdfCoverage: number;
  remainingBalance1: number;
  invoiceAfterDeduction: number;
  monthsCovered: number | null;
  remainingBalance2: number | null;
}

const CLAIM_PER_PARTICIPANT = 1399;
const DEVICE_RATE = 1399;

const MONTHLY_BASE = 99;
const MONTHLY_SST = 106.92;

const YEARLY_BASE = 1089;
const YEARLY_SST = 1176.12;

export function calculateRebate(inputs: RebateInputs): RebateCalculations {
  const { rebateType, units, participants, outstandingBalance = 0, includeSST } = inputs;

  const totalClaimValue = participants * CLAIM_PER_PARTICIPANT;
  let invoiceBeforeDeduction = 0;
  let hrdfCoverage = 0;
  let remainingBalance1 = 0;
  let invoiceAfterDeduction = 0;
  let monthsCovered: number | null = null;
  let remainingBalance2: number | null = null;

  switch (rebateType) {
    case 'Subscription (Monthly)': {
      const rate = includeSST ? MONTHLY_SST : MONTHLY_BASE;
      invoiceBeforeDeduction = units * rate;
      hrdfCoverage = Math.min(totalClaimValue, invoiceBeforeDeduction);
      remainingBalance1 = totalClaimValue - hrdfCoverage;
      invoiceAfterDeduction = invoiceBeforeDeduction - hrdfCoverage;

      if (remainingBalance1 >= invoiceBeforeDeduction && invoiceBeforeDeduction > 0) {
        const additionalMonths = Math.floor(remainingBalance1 / invoiceBeforeDeduction);
        monthsCovered = 1 + additionalMonths;
        remainingBalance2 = remainingBalance1 - (additionalMonths * invoiceBeforeDeduction);
      } else {
        monthsCovered = hrdfCoverage >= invoiceBeforeDeduction && invoiceBeforeDeduction > 0 ? 1 : 0;
        remainingBalance2 = remainingBalance1;
      }
      break;
    }
    case 'Subscription (Yearly)': {
      const rate = includeSST ? YEARLY_SST : YEARLY_BASE;
      invoiceBeforeDeduction = units * rate;
      hrdfCoverage = Math.min(totalClaimValue, invoiceBeforeDeduction);
      remainingBalance1 = totalClaimValue - hrdfCoverage;
      invoiceAfterDeduction = invoiceBeforeDeduction - hrdfCoverage;
      // Months covered and remaining balance 2 are left blank for yearly
      break;
    }
    case 'Device': {
      invoiceBeforeDeduction = units * DEVICE_RATE;
      hrdfCoverage = Math.min(totalClaimValue, invoiceBeforeDeduction);
      remainingBalance1 = totalClaimValue - hrdfCoverage;
      invoiceAfterDeduction = invoiceBeforeDeduction - hrdfCoverage;
      break;
    }
    case 'Outstanding': {
      invoiceBeforeDeduction = outstandingBalance;
      hrdfCoverage = Math.min(totalClaimValue, invoiceBeforeDeduction);
      remainingBalance1 = totalClaimValue - hrdfCoverage;
      invoiceAfterDeduction = invoiceBeforeDeduction - hrdfCoverage;
      break;
    }
  }

  return {
    totalClaimValue,
    invoiceBeforeDeduction,
    hrdfCoverage,
    remainingBalance1,
    invoiceAfterDeduction,
    monthsCovered,
    remainingBalance2,
  };
}
