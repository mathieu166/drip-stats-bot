import * as dbService from './dbService.js'

export async function getDripPriceChartData(ranges) {
  var client
  try {
    client = await dbService.client2()
    await client.connect()
    var dbo = client.db(process.env.DB_NAME)

    return await dbo.collection(dbService.DRIP_PRICE).aggregate(
      [
        {
          "$group": {
            "_id": {
              "year": "$year",
              "month": "$month",
              "day": "$day",
              "hour": "$hour"
            },
            "open": {
              "$first": "$dripBnbRatio"
            },
            "high": {
              "$max": "$dripBnbRatio"
            },
            "low": {
              "$min": "$dripBnbRatio"
            },
            "close": {
              "$last": "$dripBnbRatio"
            }
          }
        },
        {
          "$project": {
            "open": "$open",
            "close": "$close",
            "low": "$low",
            "high": "$high",
            "volume": "0",
            "timestamp": {
              "$convert": {
                "input": {
                  "$dateFromParts": {
                    "year": "$_id.year",
                    "month": "$_id.month",
                    "day": "$_id.day",
                    "hour": "$_id.hour",
                    "timezone": "America/New_York"
                  }
                },
                "to": "long"
              }
            }
          }
        },
        {
          "$sort": {
            "timestamp": 1.0
          }
        }
      ],
      {
        "allowDiskUse": true
      }
    ).toArray()

  } catch (e) {
    console.error('getDripPriceChartData error: ' + e.message)
  } finally {
    client.close()
  }

}

export async function getDripDepositsCount(ranges) {
  var client
  try {
    client = await dbService.client()
    await client.connect()
    var dbo = client.db(process.env.DB_NAME)

    var counts = []
    var sum = 0
    for (let i = 0; i < ranges.length; i++) {
      if (i != ranges.length - 1) {
        counts[i] = await dbo.collection(dbService.DRIP_ACCOUNT_STAT).count({ deposits: { $gte: ranges[i], $lt: ranges[i + 1] } })
      } else {
        counts[i] = await dbo.collection(dbService.DRIP_ACCOUNT_STAT).count({ deposits: { $gte: ranges[i] } })
      }
      sum += counts[i]
    }

    return { ranges: ranges, results: counts, sum: sum }
  } catch (e) {
    console.error('getDripDepositsCount error: ' + e.message)
  } finally {
    client.close()
  }

}

export async function getDripAcountReservoirHistory(address, conditions) {
  var client
  try {
    client = await dbService.client()
    await client.connect()
    var dbo = client.db(process.env.DB_NAME)
    const reservoir = dbo.collection(dbService.DRIP_ACCOUNT_RESERVOIR)
    const match = { $match: { customerAddress: { $regex: address, $options: 'i' }, ...conditions } }
    const aggregate = {
      $group: {
        _id: '$transactionHash',
        customerAddress: { $max: '$customerAddress' },
        ethReinvested: { $max: '$ethReinvested' },
        ethWithdrawn: { $max: '$ethWithdrawn' },
        incomingeth: { $max: '$incomingeth' },
        tokensMinted: { $max: '$tokensMinted' },
        tokensBurned: { $max: '$tokensBurned' },
        ethEarned: { $max: '$ethEarned' },
        bnbBalance: { $max: '$bnbBalance' },
        tokenBalance: { $max: '$tokenBalance' },
        timestamp: { $max: '$timestamp' },

        events: { $push: '$event' },
        //Leader board
        tokens: { $max: '$tokens' },
        soldTokens: { $max: '$soldTokens' },
        invested: { $max: '$invested' }
      }
    }
    const sort = { $sort: { timestamp: -1 } }

    return await reservoir.aggregate([match, aggregate, sort]).toArray()

  } catch (e) {
    console.error('getDripDepositsCount error: ' + e.message)
  } finally {
    client.close()
  }

}

export async function getDripReservoirDailyAprs(limit) {
  var client
  try {
    client = await dbService.client()
    await client.connect()
    var dbo = client.db(process.env.DB_NAME)

    limit = limit || 30

    return await dbo.collection(dbService.DRIP_RESERVOIR_DAILY_APR)
      .find().sort({ year: -1, month: -1, day: -1 }).limit(limit).toArray()
  } catch (e) {
    console.error('getDripReservoirDailyAprs error: ' + e.message)
    throw e
  } finally {
    await client.close()
  }

}

export async function getDripAccountAirdrops(address) {
  var client
  try {
    client = await dbService.client()
    await client.connect()
    var dbo = client.db(process.env.DB_NAME)

    return await dbo.collection(dbService.DRIP_AIRDROP).find({ to: { $regex: address, $options: 'i' } }).sort({ timestamp: -1 }).toArray()
  } catch (e) {
    console.error('getDripAccountAirdrops error: ' + e.message)
  } finally {
    client.close()
  }

}

function selectAccountLeaderboards(dbo, query, limit, sorts){
  const fields = {
    "$addFields": {
      "wg": {
        "$divide": [
          {
            "$add": [
              "$rolls",
              "$direct_bonus",
              "$match_bonus"
            ]
          },
          "$deposits"
        ]
      },
      "g": {
        "$divide": [
          {
            "$subtract": [
              "$max_payout",
              "$total_payouts"
            ]
          },
          "$max_payout"
        ]
      },
      "sw": {
        "$multiply": [
          1,
          {
            "$min": [
              1,
              {
                "$divide": [
                  "$airdrops_total",
                  "$deposits"
                ]
              }
            ]
          }
        ]
      },
      "total_bonus":{
        "$add": [
          "$direct_bonus",
          "$match_bonus"
        ]
      }
    }
  }

  const nn = {
    "$addFields": {
      "nn": {
        "$cond": [
          { "$lt": ["$net_deposits", 0] },
          {
            "$abs":
            {
              "$divide": [
                "$deposits",
                {
                  "$subtract": [
                    { "$multiply": [100, "$net_deposits"] },
                    "$deposits"
                  ]
                }
              ]
            }
          },
          1
        ]
      }, 
      "b": {
          "$cond": [
              {"$lt": ["$br34p_balance", 2]},
              {"$abs": 
                  {
                      "$divide": [
                          "$br34p_balance",
                           10
                      ]
                  }
              },
              1
          ]
      }
    }
  }

  const score = {
    "$addFields": {
      "score": {
        "$multiply": [
          "$nn", "$b",
          {
            "$multiply": [
              10000,
              {
                "$add": [
                  "$wg",
                  "$g",
                  "$sw"
                ]
              }
            ]
          }
        ]
      }
    }
  }

  const reverseOrder = sorts?{ $sort: sorts }:{$sort: {score: -1}}

  const teamWallet = { $match: { referrals: { $gte: 5 } } }
  const devWallet = { $match: { _id: {$ne: '0xe8e9720e39e13854657c165CF4eB10b2dfE33570'}}}
  var pipeline = []
  pipeline.push(teamWallet)
  pipeline.push(devWallet)
  pipeline.push(fields)
  pipeline.push(nn)
  pipeline.push(score)


  if (query) {
    pipeline.push({ $match: query })
  }

  pipeline.push(reverseOrder)

  return dbo.collection(dbService.DRIP_ACCOUNT_STAT).aggregate(pipeline).limit(limit||20).toArray()
}

export async function getDripAccountLeaderboards(query, limit, sorts) {
  var client
  try {
    client = await dbService.client()
    await client.connect()
    var dbo = client.db(process.env.DB_NAME)

    return await selectAccountLeaderboards(dbo, query, limit, sorts)
  } catch (e) {
    console.error('getDripAccountAirdrops error: ' + e.message)
  } finally {
    client.close()
  }

}

export async function getActiveAds() {
  var client
  try {
    client = await dbService.client()
    await client.connect()
    var dbo = client.db(process.env.DB_NAME)

    let campaign = await dbo.collection(dbService.DRIP_CAMPAIGN).find({ is_active: true}).sort({campaign_id: -1}).limit(1).toArray()
    const teamWallets = campaign[0].ads.map(a => a.team_wallet.toLowerCase())
    
    var query = {address: {$in: teamWallets}}
    const accounts = await selectAccountLeaderboards(dbo, query)
    for(let wallet of campaign[0].ads){
      const account = accounts.find(a=>a.address === wallet.team_wallet.toLowerCase())
      if(account){
        wallet.account = account
      }
    }

    return campaign
  } catch (e) {
    console.error('getActiveAds error: ' + e.message)
  } finally {
    client.close()
  }
}