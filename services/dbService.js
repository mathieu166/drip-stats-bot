
import Mongo from 'mongodb'

export const DRIP_STORE = 'DripStore'
export const DRIP_ACCOUNT_STAT = 'DripAccountStat'
export const DRIP_ACCOUNT_RESERVOIR = 'DripAccountReservoir'
export const DRIP_AIRDROP = 'DripAccountAirdrop'
export const DRIP_PRICE = 'DripPrice'
export const DRIP_RESERVOIR_DAILY_APR = 'DripReservoirDailyApr'
export const DRIP_CAMPAIGN = 'DripCampaign'

export async function client() {
  var replacements = { "%DB_USER%": process.env.DB_USER, "%DB_PASSWORD%": process.env.DB_PASSWORD, "%DB_HOST%": process.env.DB_HOST, "%DB_NAME%": process.env.DB_NAME }
  var uri = 'mongodb+srv://%DB_USER%:%DB_PASSWORD%@%DB_HOST%/%DB_NAME%?retryWrites=true&w=majority'
  uri = uri.replace(/%\w+%/g, function (all) {
    return replacements[all] || all;
  });
  return new Mongo.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
}

export async function client2() {
  var replacements = { "%DB_USER%": process.env.DB_USER, "%DB_PASSWORD%": process.env.DB_PASSWORD, "%DB_HOST%": process.env.DB_HOST2, "%DB_NAME%": process.env.DB_NAME }
  var uri = 'mongodb+srv://%DB_USER%:%DB_PASSWORD%@%DB_HOST%/%DB_NAME%?retryWrites=true&w=majority'
  uri = uri.replace(/%\w+%/g, function (all) {
    return replacements[all] || all;
  });
  return new Mongo.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
}

