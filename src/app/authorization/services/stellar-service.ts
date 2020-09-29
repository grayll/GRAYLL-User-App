import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { callbackify } from 'util';
import axios from 'axios';
// import { calcBindingFlags } from '@angular/core/src/view/util';
// import { resolve } from 'path';
// import { reject } from 'q';
import { Observable, Subject } from 'rxjs';
var StellarSdk = require('stellar-sdk');
import * as moment from 'moment';
import { AuthService } from 'src/app/shared/services/auth.service';
var naclutil = require('tweetnacl-util');
const bip39 = require('bip39')
const nacl = require('tweetnacl')
const scrypt = require('scrypt-async');


@Injectable({
    providedIn: 'root' 
  })
export class StellarService {   
    
    interruptStep = 0;
    dkLen = 32;    
    logN = 16;
    blockSize = 8;
    horizon: any
    grxAsset: any
    nativeAsset: any

    //account: Subject:any;    
    prices: Subject<number[]>
    accountData: any;
    userAccount: any;
    allOffers: any[] = [];
    trades: any[] = [];
    account: any

    public constructor() {        
        this.horizon = new StellarSdk.Server(environment.horizon_url)  
        this.grxAsset = new StellarSdk.Asset(environment.ASSET, environment.ASSET_ISSUER)
        this.nativeAsset = StellarSdk.Asset.native()
        if (!this.allOffers){
            this.allOffers = []
        }
    }

    resetServiceData(){
        this.horizon = null
        this.accountData = null
        this.userAccount = null
        this.allOffers = []
        this.trades = []
        this.account = null
        this.horizon = new StellarSdk.Server(environment.horizon_url)  
    }

    public observePrices(): Observable<number[]> {
        if (!this.prices){
            this.prices = new Subject<number[]>()
        }
        return this.prices.asObservable()
    }

    public publishPrices(pricesValue: number[]):void{
        if (!this.prices){
            this.prices = new Subject<number[]>()
        }
        
        this.prices.next(pricesValue)
    }

    loadAccount(address: string){
        return this.horizon.loadAccount(address)
    }

    
    generateKeyPair(): any {
        const pair = StellarSdk.Keypair.random();
        // console.log('sec key:', pair.secret())
        // console.log('pub key:', pair.publicKey())         
        return pair
    }

 
    getNetworkPassPhrase() {
        if (environment.horizon_url.includes("horizon-testnet")){
            return  StellarSdk.Networks.TESTNET
        } else {
            return  StellarSdk.Networks.PUBLIC
        }
    }
    cancelOffers(accSeed: string, offers:any, userData:any): Promise<any> {
        return new Promise((resolve, reject) => {
            let source = StellarSdk.Keypair.fromSecret(accSeed); 
            this.horizon.loadAccount(source.publicKey()).then(account => {                
                let tx = new StellarSdk.TransactionBuilder(account, {fee: StellarSdk.BASE_FEE, networkPassphrase:this.getNetworkPassPhrase()})                            
                
                //tx.addOperation(offers[0].cachedOffer)
                tx.setTimeout(180)
                offers.forEach(offer => {
                    tx.addOperation(offer.cachedOffer)
                })
                tx.build().sign(source)
                // let xdr = tx.toXDR('base64')   
                // console.log('cancelOffer xdr', xdr)     
                this.horizon.submitTransaction(tx).then( res => {
                    // console.log('cancel offer:', offers)
                    // console.log('cancel userData:', userData)
                    // if (assetType === 'XLM'){                    
                    //     userData.OpenOrdersXLM -= realAmount
                    // } else {
                    //     userData.OpenOrdersGRX -= realAmount
                    // }   
                    // console.log('cancel userData 1:', userData)       
                    resolve(res)
                }).catch( err => {
                    reject(err)
                    //console.log('cancellOffer error: ', err)
                })
            })
        })
    }
    cancelOffer(accSeed: string, offer:any, userData:any, realAmount:any, assetType:string): Promise<any> {
        return new Promise((resolve, reject) => {
            let source = StellarSdk.Keypair.fromSecret(accSeed); 
            
           // this.horizon.loadAccount(source.publicKey()).then(account => { 
                let tx = new StellarSdk.TransactionBuilder(this.account, 
                    {fee: StellarSdk.BASE_FEE, networkPassphrase:this.getNetworkPassPhrase()})
                    .addOperation(offer)
                    .setTimeout(180).build()                
                tx.sign(source)
                // let xdr = tx.toXDR('base64')   
                // console.log('cancelOffer xdr', xdr)     
                this.horizon.submitTransaction(tx).then( res => {                   
                    // console.log('cancel userData:', userData)
                    // if (assetType === 'XLM'){                    
                    //     userData.OpenOrdersXLM -= realAmount
                    // } else {
                    //     userData.OpenOrdersGRX -= realAmount
                    // }   
                    // console.log('cancel userData 1:', userData)       
                    resolve(res)
                }).catch( err => {
                    reject(err)
                    //console.log('cancellOffer error: ', err)
                })
            //})
        })
    }
    cancelOfferForAll(accSeed: string, offer:any): Promise<any> {
        return new Promise((resolve, reject) => {
            let source = StellarSdk.Keypair.fromSecret(accSeed); 
            let tx = new StellarSdk.TransactionBuilder(this.account, 
                {fee: StellarSdk.BASE_FEE, networkPassphrase:this.getNetworkPassPhrase()})
                .addOperation(offer)
                .setTimeout(180).build()                
            tx.sign(source)
            let xdr = tx.toXDR('base64')   
            //console.log('cancelOffer xdr', xdr)     
            this.horizon.submitTransaction(tx).then( res => { 
                resolve(res)
            }).catch( err => {
                reject(err)
                //console.log('cancellOffer error: ', err)
            })
        })
    }
    sellOrder(accSeed: string, p: string, amount: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let source = StellarSdk.Keypair.fromSecret(accSeed);            
            //this.horizon.loadAccount(source.publicKey()).then(account => {                
                // 3. Create a transaction builder
                let tx = new StellarSdk.TransactionBuilder(this.account, 
                    {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})
                
                .addOperation(StellarSdk.Operation.manageSellOffer({                     
                    selling: this.grxAsset,    
                    buying: new StellarSdk.Asset.native(),            
                    amount: amount,
                    price: p                     
                }))
                .addMemo(StellarSdk.Memo.text('grayll-sell'))
                // 6. Build and sign transaction with both source and destination keypairs
                .setTimeout(180).build()
                tx.sign(source)
                
                // 7. Submit transaction to network
                //let xdr = tx.toXDR('base64')   
                //console.log('submitTransaction xdr', xdr)     
                //console.log('submit tx', tx.toXDR())                
                this.horizon.submitTransaction(tx).then( res => {
                    resolve(res)
                }).catch( err => {
                    reject(err)                    
                })
            // }).catch ( e => {                
            //     console.log('sellOrder1: ', e)
            //     reject(e)
            // })
        })        
    }
    parseXdr(xdr){
        return StellarSdk.xdr.TransactionResult.fromXDR(xdr, 'base64')
    }
    async getCancelOfferXdr(publicKey: string, offer:any) {        
        const account = await this.horizon.loadAccount(publicKey)
        let tx = new StellarSdk.TransactionBuilder(account, 
            {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})
            .addOperation(offer)
            .setTimeout(180).build()       
        return tx.toXDR('base64')                      
    }
    async getCancelOfferXdrs(publicKey: string, offers:any[]) {        
        const account = await this.horizon.loadAccount(publicKey)
        let tx = new StellarSdk.TransactionBuilder(account, {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})
        offers.forEach(offer => tx = tx.addOperation(offer))
        tx = tx.setTimeout(180).build()       
        return tx.toXDR('base64')                            
    }
    async getBuyOfferXdr(publicKey: string, p: string, amount: string) {        
        const account = await this.horizon.loadAccount(publicKey)
        let tx = new StellarSdk.TransactionBuilder(account, 
            {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})
        .addOperation(StellarSdk.Operation.manageBuyOffer({ 
            buying: this.grxAsset, 
            selling: new StellarSdk.Asset.native(),             
            buyAmount: amount,
            price: p                        
        }))
        .setTimeout(180).build()       
        return tx.toXDR('base64')                      
    }
    async getSellOfferXdr(publicKey: string, p: string, amount: string) {        
        const account = await this.horizon.loadAccount(publicKey)
        let tx = new StellarSdk.TransactionBuilder(account, 
            {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})
            .addOperation(StellarSdk.Operation.manageSellOffer({                     
                selling: this.grxAsset,    
                buying: new StellarSdk.Asset.native(),            
                amount: amount,
                price: p                     
            }))
        .setTimeout(180).build()       
        return tx.toXDR('base64')                      
    }
    async validateAccount1(publicKey){
        try {
            const account = await this.horizon.loadAccount(publicKey)
            var trusted = account.balances.some( balance => {
                return balance.asset_code === environment.ASSET &&
                    balance.asset_issuer === environment.ASSET_ISSUER;
            });
            
            if (!trusted){
                return -2
            }
            return 0
        } catch(e){
            return -1
        }
    }
    validateAccount(publicKey){
        return new Promise(resolve => {
            try {
                this.horizon.loadAccount(publicKey).then(account =>{                    
                    var trusted = account.balances.some( balance => {
                        return balance.asset_code === environment.ASSET &&
                            balance.asset_issuer === environment.ASSET_ISSUER;
                    });
                    
                    if (!trusted){
                        resolve(-2)
                    }
                    resolve(0)
                })            
                
            } catch(e){
                resolve(-1)
            }
        })        
    }
    async getWithdrawXdr(publicKey: string, dest: string, amount: string, asset: any, memo: string) {        
        const account = await this.horizon.loadAccount(publicKey)
        var trusted = account.balances.some( balance=> {
            return balance.asset_code === environment.ASSET &&
                   balance.asset_issuer === environment.ASSET_ISSUER;
          });
        
        if (!trusted){
            return 'not trusted'
        }
        let tx = new StellarSdk.TransactionBuilder(account, 
        {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})
        .addOperation(StellarSdk.Operation.payment({ 
            destination: dest,
            asset: asset,
            amount: amount,
        }))
        .addMemo(StellarSdk.Memo.text(memo))        
        .setTimeout(180).build()                    
        return tx.toXDR('base64')                      
    }
    async payLoanXdr(publicKey: string, dest: string, amount: string, asset: any, memo: string) {        
        const account = await this.horizon.loadAccount(publicKey)
       
        let tx = new StellarSdk.TransactionBuilder(account, 
        {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})
        .addOperation(StellarSdk.Operation.payment({ 
            destination: dest,
            asset: asset,
            amount: amount,
        }))
        .addOperation(StellarSdk.Operation.setOptions({
            highThreshold: 0,
            medThreshold: 0,
        }))
        .addOperation(StellarSdk.Operation.setOptions({           
            signer:{
                ed25519PublicKey: environment.XLM_LOAN_ADDRESS,
                weight: 0                       
            }
        }))
        .addMemo(StellarSdk.Memo.text(memo))        
        .setTimeout(0).build()                    
        return tx.toXDR('base64')                      
    }
    async mergeAccount(publicKey: string, dest: string) {        
        const account = await this.horizon.loadAccount(publicKey)       
        let tx = new StellarSdk.TransactionBuilder(account, 
        {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})
        .addOperation(StellarSdk.Operation.changeTrust({ 
            asset: this.grxAsset,                    
            source: publicKey,
            limit:0
        })) 
        .addOperation(StellarSdk.Operation.accountMerge({ 
            destination: dest,  
            source:publicKey,          
        }))        
        .setTimeout(0).build()                    
        return tx.toXDR('base64')                      
    }

    sendAsset(accSeed: string, dest: string, amount: string, asset: any, memo: string): Promise<any> {
        return new Promise((resolve, reject) => {
           let source = StellarSdk.Keypair.fromSecret(accSeed);   
           
                                                      
                let tx = new StellarSdk.TransactionBuilder(this.account, 
                    {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})               
                .addOperation(StellarSdk.Operation.payment({ 
                    destination: dest,
                    asset: asset,
                    amount: amount,
                }))
                .addMemo(StellarSdk.Memo.text(memo))
                // 6. Build and sign transaction with both source and destination keypairs
                .setTimeout(180).build()
                tx.sign(source)                
                let xdr = tx.toXDR('base64')
                //console.log('Tx xdr', xdr)            
                this.horizon.submitTransaction(tx).then( resp => {
                    //console.log('resp: ', resp.hash);
                    // this.horizon.operations()          
                    // .forTransaction(resp.hash)
                    // .call()
                    // .then(function (opResult) {
                    //     console.log('opResult:', opResult);              
                    // })
                    // .catch(function (err) {
                    //     console.error(err);
                    // });
                    resolve(resp.hash)
                }).catch(err => {
                    console.log('err: ', err);                    
                    reject(err)
                })                
            // })
            // .catch(error => {
            //     console.log('loadAccount error: ', error);             
            //     reject(error)                
            // }) 
        })     
    }
    sendAssetPayoffLoan(accSeed: string, dest: string, amount: string, asset: any, memo: string): Promise<any> {
        return new Promise((resolve, reject) => {
           let source = StellarSdk.Keypair.fromSecret(accSeed);            
           this.horizon.loadAccount(source.publicKey())
           .then( account => {      
               console.log('sendAsset- account:', account)                                        
                let tx = new StellarSdk.TransactionBuilder(account, 
                    {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})               
                .addOperation(StellarSdk.Operation.payment({ 
                    destination: dest,
                    asset: asset,
                    amount: amount,
                }))
                .addMemo(StellarSdk.Memo.text(memo))
                // 6. Build and sign transaction with both source and destination keypairs
                .setTimeout(180).build()
               // tx.sign(source)
                
                let xdr = tx.toXDR('base64')   
                //console.log('Tx xdr', xdr)            
                // this.horizon.submitTransaction(tx).then( resp => {
                //     console.log('resp: ', resp);
                //     resolve(resp.ledger)
                // }).catch(err => {
                //     console.log('err: ', err);                    
                //     reject(err)
                // })                
            })
            .catch(function(error) {
                //console.log('loadAccount error: ', error);             
                reject(error)                
            }) 
        })     
    }

    buyOrder(accSeed: string, p: string, amount: string): Promise<any> {
        //console.log('buy: ', p, amount)
        return new Promise((resolve, reject) => {
            let source = StellarSdk.Keypair.fromSecret(accSeed);            
                //this.horizon.loadAccount(source.publicKey()).then(account => {                
                // 3. Create a transaction builder
                
                let tx = new StellarSdk.TransactionBuilder(this.account, 
                    {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})                
                .addOperation(StellarSdk.Operation.manageBuyOffer({ 
                    buying: this.grxAsset, 
                    selling: new StellarSdk.Asset.native(),             
                    buyAmount: amount,
                    price: p                        
                }))               
                .setTimeout(180).build()
                tx.sign(source)
                
                // 7. Submit transaction to network
                let xdr = tx.toXDR('base64')
                //console.log('submitTransaction xdr', xdr)                 
                this.horizon.submitTransaction(tx).then( res => {                    
                    resolve(res)
                }).catch( err => {                   
                    reject(err)
                })
            // })
            // .catch( e => {
            //     console.log('buyOrder: ', e)
            //     reject(e)               
            // })  
        })             
    }
    parseAsset(asset) {
        if (asset.type === 'native' || asset.asset_type === 'native') {
          return StellarSdk.Asset.native();
        } else {
          let issuer = asset.issuer || asset.asset_issuer
          return new StellarSdk.Asset(asset.assetCode, issuer);
        }
      }
    parseClaimedOffer(offersClaimed, grxXlmP, xlmP, userMetaStore:any){
        var time = moment().subtract(1, 'seconds').local().format('DD/MM/YYYY HH:mm:ss')
        offersClaimed.forEach(item => {
            // buy GRX sold XLM
            if (+item.amountSold > 0 || +item.amountBought > 0){
                let type = ''
                let asset = 'GRX'
                let amount = ''
                let totalxlm = ''
                if (item.assetSold.type === "native" ){                
                    if (item.assetBought.type === environment.ASSET){
                        //userData.totalGRX = +userData.totalGRX + +item.amountBought
                        type = 'BUY' 
                        asset = item.assetBought.asset                
                    } else {
                        type = 'SELL' 
                    }
                    userMetaStore.XLM = Number(userMetaStore.XLM) + +item.amountSold
                    userMetaStore.GRX = Number(userMetaStore.GRX) - +item.amountBought
                    amount = item.amountBought
                    totalxlm = item.amountSold
                } else if(item.assetSold.assetCode && item.assetSold.assetCode === environment.ASSET) { // sell grx buy xlm
                    if (item.assetBought.type === 'native'){                    
                        type = 'SELL' 
                    } else {
                        type = 'BUY'
                    }
                    userMetaStore.XLM = Number(userMetaStore.XLM) - +item.amountBought
                    userMetaStore.GRX = Number(userMetaStore.GRX) + +item.amountSold
                    amount = item.amountSold
                    totalxlm = item.amountBought
                }
                let url = 'https://stellar.expert/explorer/public/'
                if (environment.horizon_url.includes('testnet')){
                    url = 'https://stellar.expert/explorer/testnet/'
                }
                url = url+'ledger/'+item.offerId               

                let trade = {time: time, type:type, asset:asset, amount:amount, filled:'100%', xlmp: grxXlmP, 
                totalxlm: totalxlm, priceusd: grxXlmP*xlmP, totalusd: +totalxlm*xlmP, index:0, url:url}

                //this.trades.unshift(trade)

                // amountBought: "999.9999999"
                // amountSold: "402.8755023"
                // assetBought: {type: "credit_alphanum4", assetCode: "GRXT", issuer: "GAKXWUADYNO67NQ6ET7PT2DSLE5QGGDTNZZRESXCWWYYA2UCLOYT7AKR"}
                // assetSold: {type: "native", assetCode: "XLM", issuer: undefined}
                // offerId: "2567143"
            }            
        })
    } 
    parseXdrOffer(off, grxP:number, xlmP:number,index: number, userMetaStore:any, isBuy: boolean){        

        // console.log('txenvobj offer:', off.value()[0].value().value().success().offer().value().offerId().low)
        // console.log('txenvobj sell:', off.value()[0].value().value().success().offer().value().selling().switch().name)
        // console.log('txenvobj buy:', off.value()[0].value().value().success().offer().value().buying().switch().name)
        // console.log('txenvobj amout:', off.value()[0].value().value().success().offer().value().amount().low)
        // console.log('txenvobj price n:', off.value()[0].value().value().success().offer().value().price().n)

        let type = 'BUY'
        if (!isBuy){
            type = 'SELL'
        }
        let asset = 'GRX'        
        let amountXlm = off.amount().low/10000000

        let amount = amountXlm*off.price().n()/off.price().d()

        let time = moment().subtract(1, 'seconds').local().format('DD/MM/YYYY HH:mm:ss')
        let price = {n:off.price().n(), d:off.price().d()}
        let offerId = off.offerId().low    
        
        var cachedOffer
        let offerData
        if (type == 'SELL'){
            let  selling= this.grxAsset;
            let  buying = this.nativeAsset;
            let grxXlmP = off.price().n()/off.price().d()
            cachedOffer = StellarSdk.Operation.manageSellOffer({
                buying: buying,
                selling: selling,
                amount: '0',
                price:price,
                offerId: offerId,                           
            });
            userMetaStore.OpenOrdersGRX = +userMetaStore.OpenOrdersGRX + amount
            offerData = {time: time, type:type, asset:asset, amount:amount, xlmp: grxXlmP, 
              totalxlm: amountXlm, priceusd: grxXlmP*xlmP, totalusd: amountXlm*xlmP, 
              cachedOffer: cachedOffer, index:index,  realAmount: amount, assetType:'GRX'}
        } else {   
            let grxXlmP = off.price().d()/off.price().n()         
            let buying = this.grxAsset;
            let selling = this.nativeAsset;            
            cachedOffer = StellarSdk.Operation.manageBuyOffer({
                buying: buying,
                selling: selling,
                buyAmount: '0',    
                price:price,
                offerId: offerId,                  
            });            
            userMetaStore.OpenOrdersXLM = +userMetaStore.OpenOrdersXLM + amountXlm
          
            offerData = {time: time, type:type, asset:asset, amount:amount, xlmp: grxXlmP, 
              totalxlm: amountXlm, priceusd: grxXlmP*xlmP, totalusd: amountXlm*xlmP, 
              cachedOffer: cachedOffer, index:index, realAmount: amountXlm, assetType:'XLM'}
        }       
        
        return offerData       
        
        // return {time: time, type:type, asset:asset, amount:of.amount/grxXlmP, xlmp: grxXlmP, 
        // totalxlm: of.amount, priceusd: grxXlmP*xlmP, totalusd: of.amount*xlmP, cachedOffer: cachedOffer, index:index}
    }
    parseOffer(of, grxP:number, xlmP:number,index: number, userMetaStore:any){        
        let type = 'BUY'
        let asset
        
        if (of.buying.type == 'native' || of.buying.asset_type == 'native'){
            type = 'SELL'
            asset = of.selling.assetCode
        } else {
            asset = of.buying.assetCode
        }
        let time = moment().subtract(1, 'seconds').local().format('DD/MM/YYYY HH:mm:ss')
        let buying = this.parseAsset(of.buying);
        let selling = this.parseAsset(of.selling);
        var cachedOffer
        let offerData
        if (type == 'SELL'){
            let grxXlmP = of.price.n/of.price.d
            cachedOffer = StellarSdk.Operation.manageSellOffer({
                buying: buying,
                selling: selling,
                amount: '0',
                price: of.price,
                offerId: of.offerId               
            });
            userMetaStore.OpenOrdersGRX = +userMetaStore.OpenOrdersGRX + +of.amount
            offerData = {time: time, type:type, asset:asset, amount:of.amount, xlmp: grxXlmP, 
              totalxlm: of.amount*grxXlmP, priceusd: grxXlmP*xlmP, totalusd: of.amount*grxXlmP*xlmP, 
              cachedOffer: cachedOffer, index:index,  realAmount: +of.amount, assetType:'GRX'}
        } else {
            let grxXlmP = of.price.d/of.price.n
            cachedOffer = StellarSdk.Operation.manageBuyOffer({
                buying: buying,
                selling: selling,
                buyAmount: '0',
                price: of.price,
                offerId: of.offerId                
            });            
            userMetaStore.OpenOrdersXLM = +userMetaStore.OpenOrdersXLM + +of.amount
            offerData = {time: time, type:type, asset:asset, amount:of.amount/grxXlmP, xlmp: grxXlmP, 
              totalxlm: of.amount, priceusd: grxXlmP*xlmP, totalusd: of.amount*xlmP, 
              cachedOffer: cachedOffer, index:index, realAmount: +of.amount, assetType:'XLM'}
        }  
        
        return offerData       
        
        // return {time: time, type:type, asset:asset, amount:of.amount/grxXlmP, xlmp: grxXlmP, 
        // totalxlm: of.amount, priceusd: grxXlmP*xlmP, totalusd: of.amount*xlmP, cachedOffer: cachedOffer, index:index}
    }
    // // https://horizon-testnet.stellar.org/accounts/GCLPAXUV7XWZNLJQIQ3723ZBA2WFQHEGBQ3TFDUPRL733FDM5HV7KPOO/offers
    getOffer(account: string, limit: number, nextURL: string){
        let url = `${environment.horizon_url}/accounts/${account}/offers?limit=${limit}&order=desc`
        if (nextURL){
            url = nextURL
        }
        return axios.get(url)       
    }
    getPayment(account: string, limit: number, nextURL: string){
        let url = `${environment.horizon_url}/accounts/${account}/payments?limit=${limit}&order=desc`
        if (nextURL){
            url = nextURL
        }
        return axios.get(url)        
    }
    getNetworkHistory(account: string, limit: number, nextURL: string){
        let url = `https://horizon.stellar.org/accounts/${account}/operations?limit=${limit}&order=asc`
        if (nextURL){
            url = nextURL
        }
        return axios.get(url)        
    }
    getTrade(account: string, limit: number, nextURL: string){
        let url = `${environment.horizon_url}/accounts/${account}/trades?limit=${limit}&order=desc`
        if (nextURL){
            url = nextURL
        }
        return axios.get(url)  
    }
    
    verifyPublicKey(secretKey, publicKey): boolean{
        let source = StellarSdk.Keypair.fromSecret(secretKey);     
       
        if (source.publicKey() != publicKey){
            
            return false
        }
        
        return true
    }
    // Each account can set its own threshold values. By default all thresholds levels are set to 0, and the master key is set to weight 1. 
    // The Set Options operation allows you to change the weight of the master key and to add other signing keys with different weights.
    // https://www.stellar.org/developers/guides/concepts/multi-sig.html
    trustAsset(accSeed: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let source = StellarSdk.Keypair.fromSecret(accSeed);                    
            this.horizon.loadAccount(source.publicKey()).then( account => {                
                // 3. Create a transaction builder
                let tx = new StellarSdk.TransactionBuilder(account, 
                    {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})
                
                // 4. Add CHANGE_TRUST operation to establish trustline
                .addOperation(StellarSdk.Operation.changeTrust({ 
                    asset: this.grxAsset,                    
                    source: source.publicKey(),
                }))  
                .addOperation(StellarSdk.Operation.setOptions({  
                    medThreshold: 4,                               
                    highThreshold: 5, // make sure to have enough weight to add up to the high threshold!
                    homeDomain: 'grayll.io', 
                    signer:{
                        ed25519PublicKey: environment.XLM_LOAN_ADDRESS,
                        weight: 10                        
                    }
                }))           
                .setTimeout(0)
                .build()
                tx.sign(source)  
                let xdr = tx.toXDR('base64') 
                // console.log('xdr:', xdr)   
                // console.log('trustAsset')         
                this.horizon.submitTransaction(tx).then( res => {
                    //console.log('submitTransaction res:', res)
                    resolve(res)
                }).catch( e => {
                    //console.log('submitTransaction e:', e)
                    reject(e)
                })
            }).catch( err => {
                console.log('getaccount err:', err)                
                reject(err)
            })
        })
    }

    removeTrustAsset(accSeed: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let source = StellarSdk.Keypair.fromSecret(accSeed);                    
            this.horizon.loadAccount(source.publicKey()).then( account => {                
                // 3. Create a transaction builder
                let tx = new StellarSdk.TransactionBuilder(account, 
                    {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})
                
                // 4. Add CHANGE_TRUST operation to establish trustline
                .addOperation(StellarSdk.Operation.changeTrust({ 
                    asset: this.grxAsset,                    
                    source: source.publicKey(),
                    limit:0
                }))  
                .addOperation(StellarSdk.Operation.accountMerge({  
                    lowThreshold: 4,                               
                    highThreshold: 5 // make sure to have enough weight to add up to the high threshold!
                  }))              
                                
                .setTimeout(0)
                .build()
                tx.sign(source)  
                let xdr = tx.toXDR('base64') 
                console.log('xdr:', xdr)   
                console.log('trustAsset')         
                this.horizon.submitTransaction(tx).then( res => {
                    //console.log('submitTransaction res:', res)
                    resolve(res)
                }).catch( e => {
                    //console.log('submitTransaction e:', e)
                    reject(e)
                })
            }).catch( err => {
                console.log('getaccount err:', err)                
                reject(err)
            })
        })
    }
    TestHomeDomain(accSeed: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let source = StellarSdk.Keypair.fromSecret(accSeed);                    
            this.horizon.loadAccount(source.publicKey()).then( account => {                
                // 3. Create a transaction builder
                let tx = new StellarSdk.TransactionBuilder(account, 
                    {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})
                
                // 4. Add CHANGE_TRUST operation to establish trustline                
                .addOperation(StellarSdk.Operation.setOptions({
                    homeDomain: 'grayll1.io',
                }))           
                .setTimeout(0)
                .build()
                tx.sign(source)  
                    
                this.horizon.submitTransaction(tx).then( res => {
                    console.log('submitTransaction res:', res)
                    resolve(res)
                }).catch( e => {
                    console.log('TestHomeDomain e:', e)
                    reject(e)
                })
            }).catch( err => {
                console.log('TestHomeDomain e:', err)                
                reject(err)
            })
        })
    }
    addSigner(accSeed: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let source = StellarSdk.Keypair.fromSecret(accSeed);                    
            this.horizon.loadAccount(source.publicKey()).then( account => {                
                // 3. Create a transaction builder
                let tx = new StellarSdk.TransactionBuilder(account, 
                    {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})                               
                .addOperation(StellarSdk.Operation.setOptions({
                    high_threshold: 5,
                    signer:{
                        ed25519PublicKey: environment.XLM_LOAN_ADDRESS,
                        weight: 10                        
                    }
                }))
                              
                // 6. Build and sign transaction with both source and destination keypairs
                .setTimeout(180)
                //.setNetworkPassphrase(StellarSdk.Networks.MAINNET)
                .build()
                tx.sign(source)                
                this.horizon.submitTransaction(tx).then( res => {
                    //console.log('submitTransaction res:', res)
                    resolve(res)
                }).catch( e => {
                    //console.log('submitTransaction e:', e)
                    reject(e)
                })
            }).catch( err => {
                    
                reject(err)
            })
        })
    }

    
    getAccountBalance1(publicKey: string, cb){
        // this.horizon.accounts().accountId(publicKey).call()
        // .then( 
        this.horizon.loadAccount(publicKey).then(
            res => {                               
                
                let xlm = 0
                let grx = 0
                res.balances.forEach(b => {
                    if (b.asset_type === "credit_alphanum4" && b.asset_code === environment.ASSET){
                        grx = b.balance
                    } else if (b.asset_type === 'native'){
                        xlm = b.balance
                    }
                });
                // console.log('balance:', xlm);               
                // console.log('balance:', grx);               
                cb({xlm:xlm, grx:grx})
            },
            err => {
                cb({err: err})
               
            }
        )
    }
    checkTrustline(publicKey: string){        
        return new Promise((resolve, reject) => {
            this.horizon.loadAccount(publicKey).then(                
                res => {    
                    console.log(res)                    
                    res.balances.forEach(b => {
                        if (b.asset_type === "credit_alphanum4" && b.asset_code === environment.ASSET){
                            resolve(true)
                        } 
                    });                             
                    resolve(false)
                },
                err => {
                    reject(false)
                    console.log(err)
                }
            )
        })
    }
    getAccountBalance(publicKey: string){        
        return new Promise((resolve, reject) => {
            this.horizon.loadAccount(publicKey).then(  
                    
                res => {
                    this.account = res
                    //console.log(res.home_domain)                
                    let xlm = 0
                    let grx = 0
                    
                    res.balances.forEach(b => {
                        if (b.asset_type === "credit_alphanum4" && b.asset_code === environment.ASSET){
                            grx = b.balance
                        } else if (b.asset_type === 'native'){
                            xlm = b.balance
                        }
                    });  
                    if (res.balances.length == 1){
                        resolve({xlm:xlm})
                    }  else {                    
                        resolve({xlm:xlm, grx:grx})
                    }
                },
                err => {
                    reject(err)
                   
                }
            )
        })
    }
    getBlFromAcc(account: any, cb){                    
        let xlm = 0
        let grx = 0
        account.balances.forEach(b => {
            if (b.asset_type === "credit_alphanum4" && b.asset_code === environment.ASSET){
                grx = b.balance
            } else if (b.asset_type === 'native'){
                xlm = b.balance
            }
        });
        // console.log('balance:', xlm);               
        // console.log('balance:', grx);               
        cb({xlm:xlm, grx:grx})
       
    }
    getAccountData(publicKey: string): Promise<any>{
        return new Promise((resolve, reject) => {
            this.horizon.loadAccount(publicKey)
            .then( 
                res => {                              
                    
                    this.accountData = res; 
                    resolve(res)              
                },
                err => {
                    resolve(err)                    
                }
            )
        })
    }

    getCurrentGrxPrice(cb){
        axios.get(environment.price_grx_url).then(
            res => {
               
                if (res.data._embedded.records.length > 0){
                    let price = res.data._embedded.records[0].price.d/res.data._embedded.records[0].price.n
                    cb({p:price})
                } else {
                    
                    cb({p:0.04})
                }
            }
        ).catch(err =>{
            cb({err:err})
        })
    }
    getCurrentXlmPrice(cb){
        axios.get(environment.price_xlm_url).then(
            res => {
                //console.log(res.data)
                if (res.data._embedded.records.length > 0){                    
                    let price = res.data._embedded.records[0].price.n/res.data._embedded.records[0].price.d
                   // console.log('getCurrentXlmPrice :', price)
                    cb({p:price})
                } else {
                    //console.log('getCurrentXlmPrice 1')
                    cb({p:0})
                }
            }
        ).catch(err =>{
            cb({err:err})
        })
    }
    getCurrentGrxPrice1(){
        return new Promise((resolve, reject) => {
            axios.get(environment.price_grx_url).then(
                res => {
                    console.log(res.data)
                    if (res.data._embedded.records.length > 0){
                        let price = res.data._embedded.records[0].price.d/res.data._embedded.records[0].price.n
                        resolve(price)
                    } else {
                        resolve(0)
                    }
                }
            ).catch(err =>{
                reject(err)
            })
        })
        
    }
    getCurrentXlmPrice1(){

        return new Promise((resolve, reject) => {
            axios.get(environment.price_xlm_url).then(
                res => {
                    
                    if (res.data._embedded.records.length > 0){                    
                        let price = res.data._embedded.records[0].price.n/res.data._embedded.records[0].price.d
                       
                        resolve(price)
                    } else {
                        resolve(0)
                    }
                }
            ).catch(err =>{
                reject(err)
            })
        })
        
    }

    getAccountFromFed(fed){
      return new Promise((resolve, reject) => {
        StellarSdk.FederationServer.resolve(fed)
      .then(federationRecord => {
      //  console.log(federationRecord)
        resolve(federationRecord.account_id)
      })
      .catch(err => {
         // console.error(err)
          reject(err)
        }); 
      })         
    }

    getFedFromAccount(acc){
        return new Promise((resolve, reject) => {
          StellarSdk.FederationServer.resolveAccountId(acc)
        .then(fed => {
          console.log(fed)
          resolve(fed)
        })
        .catch(err => {
           console.error(err)
            reject(err)
          }); 
        })         
      }

    makeSeedAndRecoveryPhrase(userid, callback) {
        // Stellar seeds are 32 bytes long, but having a 24-word recovery phrase is not great. 
        // 16 bytes is enough with the scrypt step below
        const seed = nacl.randomBytes(16)        
        const recoveryPhrase = bip39.entropyToMnemonic(seed);
        scrypt(seed, userid, this.logN,
        this.blockSize, this.dkLen, this.interruptStep, (res) => {
            const keypair = StellarSdk.Keypair.fromRawEd25519Seed(res);            
            callback({keypair, recoveryPhrase})
        });       
    }


    recoverKeypairFromPhrase(userid, recoveryPhrase, callback) {
        const hexString = bip39.mnemonicToEntropy(recoveryPhrase);
        const seed = Uint8Array.from(Buffer.from(hexString, 'hex'));        
        scrypt(seed, userid, this.logN,
        this.blockSize, this.dkLen, this.interruptStep, (res) => {
            const keypair = StellarSdk.Keypair.fromRawEd25519Seed(res);
            callback(keypair)
        });
    }

    encryptSecretKey1(password, secretKey, callback) {
        const Salt = naclutil.encodeBase64(nacl.randomBytes(32));
        const nonce = new Uint8Array(24);
        scrypt(password, Salt, this.logN, this.blockSize, this.dkLen, this.interruptStep, (derivedKey) => {
            const EnSecretKey = naclutil.encodeBase64(
                nacl.secretbox(secretKey, nonce, naclutil.decodeBase64(derivedKey))
            );
            callback({ EnSecretKey, Salt });
        }, 'base64');
    }

    decryptSecretKey1(password, enSecretKeyBundle, callback) {
        const nonce = new Uint8Array(24);
        scrypt(
            password,
            enSecretKeyBundle.Salt,
            this.logN,
            this.blockSize,
            this.dkLen,
            this.interruptStep,
            (derivedKey) => {
            const secretKey = nacl.secretbox.open(naclutil.decodeBase64(
                enSecretKeyBundle.EnSecretKey), nonce, naclutil.decodeBase64(derivedKey)
            );
            secretKey ? callback(secretKey) : callback('');
        }, 'base64');
    }

    encryptSecretKey(password,  secretKey, defaultSalt, callback) {
        var secretBox = require('secret-box')
        let Salt = defaultSalt
        if (defaultSalt == ''){
            Salt = naclutil.encodeBase64(nacl.randomBytes(32));
        }
        //const nonce = new Uint8Array(24);
        //console.log('encryptSecretKey-secretKey:', secretKey)
        scrypt(password, Salt, this.logN, this.blockSize, 126, this.interruptStep, (derivedKey) => {            
            const EnSecretKey = naclutil.encodeBase64(secretBox.encrypt(new Buffer(secretKey), new Buffer(derivedKey)))
            callback({ EnSecretKey, Salt });
        }, 'base64');
    }
    
    decryptSecretKey(password, enSecretKeyBundle, callback) {       
        if (enSecretKeyBundle){
            var secretBox = require('secret-box')
            scrypt(
                password,
                enSecretKeyBundle.Salt,
                this.logN,
                this.blockSize,
                126,
                this.interruptStep,
                (derivedKey) => {
                    //const secretKey = secretBox.decrypt(new Buffer(naclutil.decodeBase64(enSecretKeyBundle.EnSecretKey)), new Buffer(derivedKey)) 
                    const secretKey = secretBox.decrypt(new Buffer(naclutil.decodeBase64(enSecretKeyBundle.EnSecretKey)), new Buffer(derivedKey))              
                    //let secretKeyStr =  this.SecretBytesToString(secretKey)     
                    //console.log('decryptSecretKey-secretKeyStr:', secretKeyStr)
                    secretKey ? callback(secretKey) : callback('');
            }, 'base64');
        }        
    }

    hashPassword(password, callback){
        const salt = naclutil.encodeBase64(nacl.randomBytes(32));
               
        scrypt(password, salt,  {
            N: 16384,
            r: 8,
            p: 1,
            dkLen: 16,
            encoding: 'hex'
        }, (derivedKey) => {            
            callback(salt+derivedKey)
        })
    }

    verifyPassword(hashPass, password, callback){
        const salt = hashPass.substring(0, 44);
        const hash = hashPass.substr(-44);
              
        scrypt(password, salt,  {
            N: 16384,
            r: 8,
            p: 1,
            dkLen: 16,
            encoding: 'hex'
        }, (derivedKey) => {
            if (derivedKey == hash){
                callback(true)
            } else {
                callback(false)
            }
        })        
    }
    SecretBytesToString = function (u8) { 
        return StellarSdk.StrKey.encodeEd25519SecretSeed(Buffer.from(u8))       
    }
    StringToSecretBytes = function (secretKey) { 
        return StellarSdk.StrKey.decodeEd25519SecretSeed(secretKey)       
    }
    ToBase64 = function (u8) {
        return btoa(String.fromCharCode.apply(null, u8));
    }
    
    FromBase64 = function (str) {
        return atob(str).split('').map(function (c) { return c.charCodeAt(0); });
    }   
}