//import * as StellarSdk from '../../../../node_modules/stellar-sdk/dist/stellar-sdk.min.js';
//import * as argon2 from 'argon2'
import { Injectable } from '@angular/core';
const StellarSdk = require('stellar-sdk');
const nacl = require('tweetnacl')
const scrypt = require('scrypt-async');
var naclutil = require('tweetnacl-util');

@Injectable()
export class StellarService {   
    public wallet: any;
    public input: any;
    public output: string;
    interruptStep = 0;
    dkLen = 32;    
    logN = 16;
    blockSize = 8;

    public constructor() { 
        
      
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
        const Salt = naclutil.encodeBase64(nacl.randomBytes(32));
        const nonce = new Uint8Array(24);
        
        
        scrypt(password, Salt, this.logN, this.blockSize, this.dkLen, this.interruptStep, (derivedKey) => {
            const EncryptedSecretKey = naclutil.encodeBase64(
                nacl.secretbox(secretKey, nonce, naclutil.decodeBase64(derivedKey))
            );
            callback({ Salt, EncryptedSecretKey });
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