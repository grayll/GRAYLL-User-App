//import * as StellarSdk from '../../../../node_modules/stellar-sdk/dist/stellar-sdk.min.js';
//import * as argon2 from 'argon2'
import { Injectable } from '@angular/core';
const StellarSdk = require('stellar-sdk');
const nacl = require('tweetnacl')
const scrypt = require('scrypt-async');
var naclutil = require('tweetnacl-util');

@Injectable()
export class StellarService {

    private stellarServer: any;
    public wallet: any;
    public input: any;
    public output: string;
    dkLen = 32;
    interruptStep = 0;

    public constructor() {
        
        this.stellarServer = new StellarSdk.Server("https://horizon.stellar.org");
        // this.wallet = {
        //     xlmValue: 0,
        //     usdValue: 0
        // };
        // this.input = {
        //     secretKey: "",
        //     recipient: "GDY755UX53Z67465WLKDIWESIF3CI62AKL2DE7WDOEA5AHJF72NMSGXU",
        //     amount: "10.1234567"
        // };
    }

    generateKeyPair(): any {
        const pair = StellarSdk.Keypair.random();
        console.log('sec key:', pair.secret())
        console.log('pub key:', pair.publicKey())         
        return pair
    }

    generateKeyPairNacl(): any {       
        let pair = nacl.box.keyPair()    
         console.log('key secret:', naclutil.encodeBase64(pair.secretKey))
         console.log('key public:', naclutil.encodeBase64(pair.publicKey))
        return pair
    }

    encryptSecretKey(password, secretKey, callback) {
        const salt = naclutil.encodeBase64(nacl.randomBytes(32));
        const nonce = new Uint8Array(24);
        const logN = 16;
        const blockSize = 8;
        
        scrypt(password, salt, logN, blockSize, this.dkLen, this.interruptStep, (derivedKey) => {
            const encryptedSecretKey = naclutil.encodeBase64(
                nacl.secretbox(secretKey, nonce, naclutil.decodeBase64(derivedKey))
            );
            callback({ salt, logN, blockSize, encryptedSecretKey });
            }, 'base64');
    }

    decryptSecretKey(password, encryptedSecretKeyBundle, callback) {
        const nonce = new Uint8Array(24);
        scrypt(
            password,
            encryptedSecretKeyBundle.salt,
            encryptedSecretKeyBundle.logN,
            encryptedSecretKeyBundle.blockSize,
            this.dkLen,
            this.interruptStep,
            (derivedKey) => {
            const secretKey = nacl.secretbox.open(naclutil.decodeBase64(
                encryptedSecretKeyBundle.encryptedSecretKey), nonce, naclutil.decodeBase64(derivedKey)
            );
            secretKey ? callback(secretKey) : callback('Decryption failed!');
        }, 'base64');
    }

    hashPassword(password, callback){
        const salt = naclutil.encodeBase64(nacl.randomBytes(32));
        console.log('salt.len: ', salt)
        const nonce = new Uint8Array(24);
        const logN = 16;
        const blockSize = 8;
        scrypt(password, salt, logN, blockSize, this.dkLen, this.interruptStep, (derivedKey) => {
            console.log('derivedKey.len: ', derivedKey)
            callback(salt+derivedKey)
        }, "base64")
    }

    verifyPassword(hashPass, password, callback){
        const salt = hashPass.substring(0, 44);
        const hash = hashPass.substr(-44);
        console.log('salt: ', salt)
        const nonce = new Uint8Array(24);
        const logN = 16;
        const blockSize = 8;
        scrypt(password, salt, logN, blockSize, this.dkLen, this.interruptStep, (derivedKey) => {
            console.log('derivedKey: ', derivedKey)
            console.log('hash: ', hash)
            if (derivedKey == hash){
                callback(true)
            } else {
                callback(false)
            }
           
        }, "base64")
    }
    ToString = function (u8) { 
        return StellarSdk.StrKey.encodeEd25519SecretSeed(Buffer.from(u8))       
    }
    ToBase64 = function (u8) {
        return btoa(String.fromCharCode.apply(null, u8));
    }
    
    FromBase64 = function (str) {
        return atob(str).split('').map(function (c) { return c.charCodeAt(0); });
    }


   
}