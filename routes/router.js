import * as dripService from '../services/dripService.js'
import queryUtils from './query-utils.js';
import express from 'express'
const router = express.Router()

router.get('/queryPrice', async function (req, res, next) {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET');
  res.append('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // const limit = req.query.limit
    const response = await dripService.getDripPriceChartData()
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /querPrice`, err.message);
    next(err);
  }
});

router.get('/queryDeposits', async function (req, res, next) {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET');
  res.append('Access-Control-Allow-Headers', 'Content-Type');

  try {
    if (!req.query.ranges) {
      throw new Error('Ranges parameter expected')
    }
    const ranges = JSON.parse(req.query.ranges)
    const response = await dripService.getDripDepositsCount(ranges)

    res.json(response);
  } catch (err) {
    console.error(`Error while executing /queryDeposits`, err.message);
    next(err);
  }
});

router.get('/queryReservoirHistory', async function (req, res, next) {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET');
  res.append('Access-Control-Allow-Headers', 'Content-Type');

  try {
    if (!req.query.address) {
      throw new Error('Address parameter expected')
    }

    const address = req.query.address
    const response = await dripService.getDripAcountReservoirHistory(address)
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /queryReservoirHistory`, err.message);
    next(err);
  }
});

router.get('/queryReservoirAprs', async function (req, res, next) {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET');
  res.append('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const limit = req.query.limit
    const response = await dripService.getDripReservoirDailyAprs(limit)
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /queryReservoirAprs`, err.message);
    next(err);
  }
});

router.get('/queryAirdrops', async function (req, res, next) {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET');
  res.append('Access-Control-Allow-Headers', 'Content-Type');

  try {
    if (!req.query.address) {
      throw new Error('Address parameter expected')
    }

    const address = req.query.address
    const response = await dripService.getDripAccountAirdrops(address)
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /queryAirdrops`, err.message);
    next(err);
  }
});

router.get('/queryAccountsLeaderboard', async function (req, res, next) {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET');
  res.append('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const query = {}

    const limit = parseInt(req.query.limit || 20)
    const deposits = req.query.deposits
    const deposits_oper = req.query.deposits_oper
    const score = req.query.score
    const score_oper = req.query.score_oper
    const address = req.query.address
    const depositsBetween = req.query.deposits_between
    const sorts = req.query.sort
    const sort_dir = req.query.sort_dir

    if(address){
      query.address = address.toLowerCase()
    }else if (deposits_oper && deposits) {
      query.deposits = {}
      query.deposits[queryUtils.comparison(deposits_oper)] = parseFloat(deposits)
    }else if (score_oper && score) {
      query.score = {}
      query.score[queryUtils.comparison(score_oper)] = parseFloat(score)
    } else if (depositsBetween){
      query.deposits = {}
      const values = depositsBetween.split(',')
      query.deposits["$gte"] = parseFloat(values[0])
      query.deposits["$lte"] = parseFloat(values[1])
    }
    
    var sort = {}
    if(!sorts){
      var sortDir = sort_dir || -1
      sort.score = parseInt(sortDir, 10)
    }else{
      // field, dir, field, dir
      const sortFields = sorts.split(',')

      for(let i = 0; i < sortFields.length; i=i+2){
        sort[sortFields[i]] = parseInt(sortFields[i+1])
      }

    }
    
    const response = await dripService.getDripAccountLeaderboards(query, limit, sort)
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /queryAccountsLeaderboard`, err.message);
    next(err);
  }
});

router.get('/queryActiveAds', async function (req, res, next) {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET');
  res.append('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const response = await dripService.getActiveAds()
    res.json(response);
  } catch (err) {
    console.error(`Error while executing /queryActiveAds`, err.message);
    next(err);
  }
});

export default router
