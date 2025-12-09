import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Create certs directory if it doesn't exist
const certsDir = './certs';
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

// Generate self-signed certificate using Node.js
const forge = require('node-forge');

const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{
  name: 'commonName',
  value: 'localhost'
}, {
  name: 'countryName',
  value: 'US'
}, {
  shortName: 'ST',
  value: 'State'
}, {
  name: 'localityName',
  value: 'City'
}, {
  name: 'organizationName',
  value: 'Test'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.sign(keys.privateKey);

const pem = {
  private: forge.pki.privateKeyToPem(keys.privateKey),
  public: forge.pki.publicKeyToPem(keys.publicKey),
  cert: forge.pki.certificateToPem(cert)
};

fs.writeFileSync('./certs/key.pem', pem.private);
fs.writeFileSync('./certs/cert.pem', pem.cert);

console.log('Self-signed certificate generated successfully!');