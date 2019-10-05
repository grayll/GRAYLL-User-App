import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { callbackify } from 'util';
import axios from 'axios';
import { calcBindingFlags } from '@angular/core/src/view/util';
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
    

    public constructor() { 
        if (environment.production){
            StellarSdk.Network.usePublicNetwork();
            this.horizon = new StellarSdk.Server('https://horizon.stellar.org');
            console.log('use main net')
        } else {
            StellarSdk.Network.useTestNetwork()
            this.horizon = new StellarSdk.Server('https://horizon-testnet.stellar.org');
            console.log('use test net')
        }    
        this.grxAsset = new StellarSdk.Asset(environment.ASSET, environment.ASSET_ISSUER)
    }

    setNetwork(){
        if (environment.production){
           // StellarSdk.Network.usePublicNetwork();
            this.horizon = new StellarSdk.Server('https://horizon.stellar.org');
            console.log('use main net 1')
        } else {
           // StellarSdk.Network.useTestNetwork()
            this.horizon = new StellarSdk.Server('https://horizon-testnet.stellar.org');
            console.log('use test net 1')
        }    
        this.grxAsset = new StellarSdk.Asset(environment.ASSET, environment.ASSET_ISSUER)
    }

    generateKeyPair(): any {
        const pair = StellarSdk.Keypair.random();
        console.log('sec key:', pair.secret())
        console.log('pub key:', pair.publicKey())         
        return pair
    }

    // generateKeyPairNacl(): any {       
    //     let pair = nacl.box.keyPair()    
    //      console.log('key secret:', naclutil.encodeBase64(pair.secretKey))
    //      console.log('key public:', naclutil.encodeBase64(pair.publicKey))
    //     return pair
    // }
    getNetworkPassPhrase():any {
        if (environment.production){
            return  StellarSdk.Networks.MAINNET
        } else {
            return  StellarSdk.Networks.TESTNET
        }
    }

    async sellOrder(accSeed: string, p: number, amount: number) {
        let source = StellarSdk.Keypair.fromSecret(accSeed);
        await this.horizon.accounts()
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
                buying: new StellarSdk.Asset.native(),
                selling: this.grxAsset,                
                amount: amount,
                price: p,
                offerId: 0,             
            }))

            // 6. Build and sign transaction with both source and destination keypairs
            .setTimeout(180).build()
            tx.sign(source)
            
            // 7. Submit transaction to network
            return this.horizon.submitTransaction(tx)
        })
    }

    async buyOrder(accSeed: string, p: number, amount: number) {
        let source = StellarSdk.Keypair.fromSecret(accSeed);
        await this.horizon.accounts()
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
                offerId: 0,             
            }))


            // Note that source parameter contains a public key of our destination account
            //because we perform this operation on behalf of the destination account.
            // 5. Add PAYMENT operation to transfer your custom asset
            // builder.addOperation(StellarSdk.Operation.payment({ 
            //     destination: dest.publicKey(),
            //     asset: this.grxAsset,
            //     amount: '10'
            // }))

            // 6. Build and sign transaction with both source and destination keypairs
            .setTimeout(180).build()
            tx.sign(source)
            
            // 7. Submit transaction to network
            return this.horizon.submitTransaction(tx)
        })
        .catch( err => {
            console.log(err)
        })       
    }

    async sendAsset(accSeed: string, dest: string, amount: number, asset: any, memo: string) {
        let source = StellarSdk.Keypair.fromSecret(accSeed);
        await this.horizon.accounts()
        .accountId(source.publicKey())
        .call()
        .then(({ sequence }) => {
            const account = new StellarSdk.Account(source.publicKey(), sequence)
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
            
            // 7. Submit transaction to network
            return this.horizon.submitTransaction(tx)
        })
        .catch( err => {
            console.log(err)
        })       
    }

    async trustAsset(accSeed: string) {
        let source = StellarSdk.Keypair.fromSecret(accSeed);
        await this.horizon.accounts()
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
            .addOperation(StellarSdk.Operation.changeTrust({ 
                asset: this.grxAsset,
                // amount: '',
                // source: this.grxAsset.issuer,
            }))


            // Note that source parameter contains a public key of our destination account
            //because we perform this operation on behalf of the destination account.
            // 5. Add PAYMENT operation to transfer your custom asset
            // builder.addOperation(StellarSdk.Operation.payment({ 
            //     destination: dest.publicKey(),
            //     asset: this.grxAsset,
            //     amount: '10'
            // }))

            // 6. Build and sign transaction with both source and destination keypairs
            .setTimeout(180).build()
            tx.sign(source)
            //tx.sign(dest)

            // 7. Submit transaction to network
            return this.horizon.submitTransaction(tx)
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