import express from 'express';
import{ethers} from 'ethers';
import {Address} from "cluster";
import { Pool } from '@uniswap/v3-sdk';
import { CurrencyAmount, Token } from '@uniswap/sdk-core';
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { abi as QuoterABI } from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import JSBI from 'jsbi'

const app = express()
const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/FIjF_hzb7IBQG88Wbh2Nxitk27tRWfXX");

//https://github.com/Uniswap/v3-periphery/blob/main/deploys.md
const poolAddress = '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8';
const quoterAdderss = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
console.log(`Contract created:`)


interface Immutables {
    factory: String,
    token0: string,
    token1: string,
    fee: number,
    tickSpacing: number,
    maxLiquidityPerTick: Number;
}

interface State {
    liquidity: ethers.BigNumber;
    sqrtPriceX96: ethers.BigNumber;
    tick: number;
    observationIndex: number;  
    observationCardinality: number;  
    observationCardinalityNext: number;  
    feeProtocol: number;  
    unlocked: boolean;
}

async function getPoolImmutables(){
    console.log('fetching immutables')
    const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
    await Promise.all([
        poolContract.factory(),
        poolContract.token0(),      
        poolContract.token1(),      
        poolContract.fee(),      
        poolContract.tickSpacing(),      
        poolContract.maxLiquidityPerTick(),
    ])

    const immutables : Immutables = {
        factory,
        token0,
        token1,
        fee,
        tickSpacing,
        maxLiquidityPerTick,
    }
    console.log('Immutables Fetched')
    return immutables;
}

async function getPoolState(){
    console.log('fetching pool state')
    const [liquidity, slot] = await Promise.all([
        poolContract.liquidity(),
        poolContract.slot0(),
    ])

    const PoolState : State = {
        liquidity,
        sqrtPriceX96: slot[0],
        tick: slot[1],
        observationIndex: slot[2],    
        observationCardinality: slot[3],    
        observationCardinalityNext: slot[4],    
        feeProtocol: slot[5],    
        unlocked: slot[6],
    }

    return PoolState;
}

async function main() {
    const [immutables, state] = await Promise.all([
        getPoolImmutables(),
        getPoolState(),
    ])

    const sqrtPriceX96 = JSBI.BigInt(state.sqrtPriceX96)
    const price = JSBI.multiply(sqrtPriceX96, sqrtPriceX96)
    const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96))
    const Q192 = JSBI.exponentiate(Q96, JSBI.BigInt(2))

    const convertedPrice = JSBI.divide(price, Q192)

    console.log(JSBI.toNumber(convertedPrice).toFixed(18))
    
    // const TokenA = new Token(3, immutables.token0, 6, "USDC", "USD Coin")
    // const TokenB = new Token(3, immutables.token1, 18, "WETH", "Wrapped Ether")

    // const poolExample = new Pool(
    //     TokenA,
    //     TokenB,
    //     immutables.fee,
    //     state.sqrtPriceX96.toString(),
    //     state.liquidity.toString(),
    //     state.tick
    // );
    


    // console.log(quotedAmountOut.toString()/(10**18))

    // const price = JSBI.toNumber(poolExample.sqrtRatioX96) ** 2 / 2 ** 192;
    // // console.log("token 0 price: ", price)
    // try{
    //     const convertedDenom = poolExample.token0Price.numerator;
    //     console.log( convertedDenom)
    // }catch(e){
    //     console.log(e)
    // }





}

main()

app.listen(3000, () => {
    console.log(`Express server running on port 3000`)
})