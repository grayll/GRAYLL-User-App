import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { callbackify } from 'util';
import axios from 'axios';
import { calcBindingFlags } from '@angular/core/src/view/util';
import { resolve } from 'path';
import { reject } from 'q';
var StellarSdk = require('stellar-sdk');
var naclutil = require('tweetnacl-util');
const bip39 = require('bip39')
const nacl = require('tweetnacl')
const scrypt = require('scrypt-async');

@Injectable()
export class StellarService {   
    // public wallet: any;
    // public input: any;
    // public output: string;
    interruptStep = 0;
    dkLen = 32;    
    logN = 16;
    blockSize = 8;
    horizon: any
    grxAsset: any
    nativeAsset: any
    

    public constructor() {        
        this.horizon = new StellarSdk.Server(environment.horizon_url)  
        this.grxAsset = new StellarSdk.Asset(environment.ASSET, environment.ASSET_ISSUER)
        this.nativeAsset = StellarSdk.Asset.native()
    }

    // setNetwork(){
    //     if (environment.production){
    //        //StellarSdk.Network.usePublicNetwork();
    //        //StellarSdk.Networks.MAINNET
    //         this.horizon = new StellarSdk.Server('https://horizon.stellar.org');
    //         console.log('use main net 1')
    //     } else {
    //        //StellarSdk.Network.useTestNetwork()
    //        //StellarSdk.Network.usePublicNetwork();
    //        //StellarSdk.Networks.MAINNET
    //         this.horizon = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    //         console.log('use test net 1')
    //     }    
    //     this.grxAsset = new StellarSdk.Asset(environment.ASSET, environment.ASSET_ISSUER)
    // }

    generateKeyPair(): any {
        const pair = StellarSdk.Keypair.random();
        console.log('sec key:', pair.secret())
        console.log('pub key:', pair.publicKey())         
        return pair
    }

 
    getNetworkPassPhrase():any {
        if (environment.horizon_url.includes("horizon-testnet")){
            return  StellarSdk.Networks.TESTNET
        } else {
            return  StellarSdk.Networks.PUBLIC
        }
    }

    sellOrder(accSeed: string, p: string, amount: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let source = StellarSdk.Keypair.fromSecret(accSeed);
            this.horizon.accounts()
            .accountId(source.publicKey())
            .call()
            .then(({ sequence }) => {
                const account = new StellarSdk.Account(source.publicKey(), sequence)
                // 2. Load current source account state from Horizon server
                // let sourceAccount = this.horizon.loadAccount(source.publicKey());

                
                // 3. Create a transaction builder
                let tx = new StellarSdk.TransactionBuilder(account, 
                    {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})

                // 4. Add CHANGE_TRUST operation to establish trustline
                .addOperation(StellarSdk.Operation.manageSellOffer({                     
                    selling: this.grxAsset,    
                    buying: new StellarSdk.Asset.native(),            
                    amount: amount,
                    price: p,
                    //offerId: 0,             
                }))

                // 6. Build and sign transaction with both source and destination keypairs
                .setTimeout(180).build()
                tx.sign(source)
                
                // 7. Submit transaction to network
                console.log('submit tx')
                this.horizon = new StellarSdk.Server(environment.horizon_url)  
                this.horizon.submitTransaction(tx).then( res => {
                    resolve(res)
                }).catch( err => {
                    reject(err)
                    console.log('sellOrder: ', err)
                })
            }).catch ( e => {
                //reject(e)
                console.log('sellOrder1: ', e)
                reject(e)
            })
        })        
    }

    buyOrder(accSeed: string, p: string, amount: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let source = StellarSdk.Keypair.fromSecret(accSeed);
            this.horizon.accounts()
            .accountId(source.publicKey())
            .call()
            .then(({ sequence }) => {
                const account = new StellarSdk.Account(source.publicKey(), sequence)
                // 2. Load current source account state from Horizon server
                // let sourceAccount = this.horizon.loadAccount(source.publicKey());

                
                // 3. Create a transaction builder
                let tx = new StellarSdk.TransactionBuilder(account, 
                    {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})

                // 4. Add CHANGE_TRUST operation to establish trustline
                .addOperation(StellarSdk.Operation.manageBuyOffer({ 
                    buying: this.grxAsset, 
                    selling: new StellarSdk.Asset.native(),             
                    buyAmount: amount,
                    price: p,
                    //offerId: 0,             
                }))

                // 6. Build and sign transaction with both source and destination keypairs
                .setTimeout(180).build()
                tx.sign(source)
                
                // 7. Submit transaction to network
                console.log('submit tx')
                this.horizon.submitTransaction(tx).then( res => {
                    resolve(res)
                }).catch( err => {
                    console.log('buyOrder: ', err)
                    reject(err)
                })
            })
            .catch( e => {
                console.log('buyOrder: ', e)
                reject(e)
                //reject(err)
            })  
        })             
    }
    // https://horizon-testnet.stellar.org/accounts/GCLPAXUV7XWZNLJQIQ3723ZBA2WFQHEGBQ3TFDUPRL733FDM5HV7KPOO/offers
    getOffer(account: string, limit: number, offet: number): Promise<any>{
        return new Promise( (resolve, reject) => {
            axios.get(`${environment.horizon_url}/accounts/${account}/offers`).then( res => {

            }).catch( e => {
                console.log(e)
                //reject(e)
            })
        })
    }
    getTrade(account: string, limit: number, offet: number): Promise<any>{
        return new Promise( (resolve, reject) => {
            // GCLPAXUV7XWZNLJQIQ3723ZBA2WFQHEGBQ3TFDUPRL733FDM5HV7KPOO
            axios.get(`${environment.horizon_url}/accounts/${account}/trades`).then( res => {
                
            }).catch( e => {
                console.log(e)
                reject(e)
            })
        })
    }

    sendAsset(accSeed: string, dest: string, amount: string, asset: any, memo: string): Promise<any> {

        return new Promise((resolve, reject) => {
            let source = StellarSdk.Keypair.fromSecret(accSeed);
            // this.horizon.accounts()
            // .accountId(source.publicKey())
            // .call()
            // .then(({ sequence }) => {
            this.horizon.loadAccount(source.publicKey()).then( account => {
                console.log('account:', account)
                // const account = new StellarSdk.Account(source.publicKey(), sequence)
                // 2. Load current source account state from Horizon server
                // let sourceAccount = this.horizon.loadAccount(source.publicKey());

                
                // 3. Create a transaction builder
                let tx = new StellarSdk.TransactionBuilder(account, 
                    {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})

                
                // Note that source parameter contains a public key of our destination account
                //because we perform this operation on behalf of the destination account.
                // 5. Add PAYMENT operation to transfer your custom asset
                .addOperation(StellarSdk.Operation.payment({ 
                    destination: dest,
                    asset: asset,
                    amount: amount,
                }))
                .addMemo(StellarSdk.Memo.text(memo))

                // 6. Build and sign transaction with both source and destination keypairs
                .setTimeout(180).build()
                tx.sign(source)
                
                this.horizon.submitTransaction(tx).then( resp => {
                    console.log('resp: ', resp);
                    resolve(resp.ledger)
                }).catch(err => {
                    reject(err)
                })                
            })
            .catch( err => {
                reject(err)                
            }) 
        })     
    }

    trustAsset(accSeed: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let source = StellarSdk.Keypair.fromSecret(accSeed);
            // this.horizon.accounts()
            // .accountId(source.publicKey())
            // .call()
            // .then(({ sequence }) => {
            //     const account = new StellarSdk.Account(source.publicKey(), sequence)            
            this.horizon.loadAccount(source.publicKey()).then( account => {
                console.log('account:', account)
                // 2. Load current source account state from Horizon server
                // let sourceAccount = this.horizon.loadAccount(source.publicKey());

                
                // 3. Create a transaction builder
                let tx = new StellarSdk.TransactionBuilder(account, 
                    {fee: StellarSdk.BASE_FEE, networkPassphrase: this.getNetworkPassPhrase()})
                
                // 4. Add CHANGE_TRUST operation to establish trustline
                .addOperation(StellarSdk.Operation.changeTrust({ 
                    asset: this.grxAsset,                    
                    source: source.publicKey(),
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
                console.log('getaccount err:', err)                
                reject(err)
            })
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
            console.log('pubkey:', keypair.publicKey())
            console.log('seckey:', keypair.secret())
            callback({keypair, recoveryPhrase})
        });       
    }

    getAccountBalance(publicKey: string, cb){
        this.horizon.accounts().accountId(publicKey).call()
        .then( 
            res => {                                
                console.log(res);
                let xlm = 0
                let grx = 0
                res.balances.forEach(b => {
                    if (b.asset_type === "credit_alphanum4" && b.asset_code === environment.ASSET){
                        grx = b.balance
                    } else if (b.asset_type === 'native'){
                        xlm = b.balance
                    }
                }); 
                console.log('balance:', xlm);               
                console.log('balance:', grx);               
                cb({xlm:xlm, grx:grx})
            },
            err => {
                cb({err: err})
                console.log(err)
            }
        )
    }

    getCurrentGrxPrice(cb){
        axios.get(environment.price_grx_url).then(
            res => {
                console.log(res.data)
                if (res.data._embedded.records.length > 0){
                    let price = res.data._embedded.records[0].price.d/res.data._embedded.records[0].price.n
                    cb({p:price})
                } else {
                    console.log('getCurrentGrxPrice 1')
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
                console.log(res.data)
                if (res.data._embedded.records.length > 0){                    
                    let price = res.data._embedded.records[0].price.n/res.data._embedded.records[0].price.d
                    console.log('getCurrentXlmPrice :', price)
                    cb({p:price})
                } else {
                    console.log('getCurrentXlmPrice 1')
                    cb({p:0})
                }
            }
        ).catch(err =>{
            cb({err:err})
        })
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

    encryptSecretKey(password, secretKey, callback) {
        const Salt = naclutil.encodeBase64(nacl.randomBytes(32));
        const nonce = new Uint8Array(24);
        
        
        scrypt(password, Salt, this.logN, this.blockSize, this.dkLen, this.interruptStep, (derivedKey) => {
            const EnSecretKey = naclutil.encodeBase64(
                nacl.secretbox(secretKey, nonce, naclutil.decodeBase64(derivedKey))
            );
            callback({ EnSecretKey, Salt });
        }, 'base64');
    }

    decryptSecretKey(password, encryptedSecretKeyBundle, callback) {
        const nonce = new Uint8Array(24);
        scrypt(
            password,
            encryptedSecretKeyBundle.Salt,
            this.logN,
            this.blockSize,
            this.dkLen,
            this.interruptStep,
            (derivedKey) => {
            const secretKey = nacl.secretbox.open(naclutil.decodeBase64(
                encryptedSecretKeyBundle.EncryptedSecretKey), nonce, naclutil.decodeBase64(derivedKey)
            );
            secretKey ? callback(secretKey) : callback('Decryption failed!');
        }, 'base64');
    }

    hashPassword(password, callback){
        const salt = naclutil.encodeBase64(nacl.randomBytes(32));
        console.log('salt.len: ', salt)
        //const nonce = new Uint8Array(24);
        
        scrypt(password, salt,  {
            N: 16384,
            r: 8,
            p: 1,
            dkLen: 16,
            encoding: 'hex'
        }, (derivedKey) => {
            console.log('derivedKey.len: ', derivedKey)
            callback(salt+derivedKey)
        })
    }

    verifyPassword(hashPass, password, callback){
        const salt = hashPass.substring(0, 44);
        const hash = hashPass.substr(-44);
        console.log('salt: ', salt)
       
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