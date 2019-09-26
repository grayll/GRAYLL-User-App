import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { callbackify } from 'util';
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
        } else {
            StellarSdk.Network.useTestNetwork()
            this.horizon = new StellarSdk.Server('https://horizon-testnet.stellar.org');
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

    async trustAsset(accSeed:string) {

        let source = StellarSdk.Keypair.fromSecret(accSeed);
        //let dest = StellarSdk.Keypair.fromSecret('receiver secret key');

        // Keypair for the destination account can be generated using StellarSdk.Keypair.random().
        // let assetCode = 'COOL';
        // let assetIssuerAddress = 'GANQDVASPYIVJF7YJNFZJ6DPXEWKI57NRYVSC7WYM6ZAL5J7FVPXS3NU';

        // 2. Load current source account state from Horizon server
        let sourceAccount = await this.horizon.loadAccount(source.publicKey());

        const fee = await this.horizon.fetchBaseFee();
        // 3. Create a transaction builder
        let builder = new StellarSdk.TransactionBuilder(sourceAccount, {fee});

        // 4. Add CHANGE_TRUST operation to establish trustline
        builder.addOperation(StellarSdk.Operation.changeTrust({ 
            asset: this.grxAsset,
            amount: '',
            source: this.grxAsset.issuer,
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
        let tx = builder.setTimeout(180).build()
        tx.sign(source)
        //tx.sign(dest)

        // 7. Submit transaction to network
        let txResult = await this.horizon.submitTransaction(tx)
        console.log(txResult);
    }

    makeSeedAndRecoveryPhrase(userid, callback) {
        // Stellar seeds are 32 bytes long, but having a 24-word recovery phrase is not great. 
        // 16 bytes is enough with the scrypt step below
        const seed = nacl.randomBytes(16)
        console.log('seed:', seed)
        const recoveryPhrase = bip39.entropyToMnemonic(seed);
        scrypt(seed, userid, this.logN,
        this.blockSize, this.dkLen, this.interruptStep, (res) => {
            const keypair = StellarSdk.Keypair.fromRawEd25519Seed(res);
            console.log('pubkey:', keypair.publicKey())
            console.log('seckey:', keypair.secret())
            callback({keypair, recoveryPhrase})
        });       
    }

    recoverKeypairFromPhrase(userid, recoveryPhrase, callback) {
        const hexString = bip39.mnemonicToEntropy(recoveryPhrase);
        const seed = Uint8Array.from(Buffer.from(hexString, 'hex'));
        console.log('seed1:', seed)
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