import get from './get.js'

export default async function getDepositCounts(ranges) {
  return await get('queryDeposits', 'ranges=' + JSON.stringify(ranges))
}
