import {
  genValidateFn,
  genAsyncValidateFn,
  Utils,
  EthUtils,
  VPV1,
  VPProofV1,
  AtomicVCV1,
  AtomicVCSubjectV1,
  AtomicVCProofV1,
  BaseVCRevocationV1,
  ValidateFn,
} from '@bloomprotocol/attestations-common'
// import {keyUtils} from '@transmute/es256k-jws-ts'
// import {EcdsaSecp256k1KeyClass2019, EcdsaSecp256k1Signature2019} from '@transmute/lds-ecdsa-secp256k1-2019'
// import EthWallet from 'ethereumjs-wallet'

// const jsigs = require('jsonld-signatures')
// const {AuthenticationProofPurpose, AssertionProofPurpose} = jsigs.purposes

const stripOwnerFromDID = (value: string) => value.substr(0, value.length - 6)

const isValidDIDOwner = (value: any) => {
  if (typeof value !== 'string') return false

  return EthUtils.isValidDID(stripOwnerFromDID(value))
}

export const validateCredentialSubject = genValidateFn<AtomicVCSubjectV1>({
  '@type': Utils.isNotEmptyString,
  '@id': EthUtils.isValidDID,
})

const isValidOrArrayOf = <T>(validateFn: ValidateFn<T>) => (data: any): data is T => {
  if (Array.isArray(data)) {
    return data.every(Utils.isValid(validateFn))
  } else {
    return Utils.isValid(validateFn)(data)
  }
}

const validateCredentialRevocation = genValidateFn<BaseVCRevocationV1>({
  '@context': Utils.isNotEmptyString,
})

const validateCredentialProof = genValidateFn<AtomicVCProofV1>({
  type: Utils.isNotEmptyString,
  created: Utils.isValidRFC3339DateTime,
  proofPurpose: (value: any) => value === 'assertionMethod',
  verificationMethod: isValidDIDOwner,
  jws: Utils.isNotEmptyString,
})

const isCredentialProofValid = async (_: any, __: any) => {
  return true

  // try {
  //   const {didDocument} = await EthUtils.resolveDID(stripOwnerFromDID(value.verificationMethod))
  //   const publicKey = didDocument.publicKey[0]
  //   // TODO: Recover public key from JWS
  //   const issuerPublicKey = EthWallet.fromPrivateKey(
  //     Buffer.from('efca4cdd31923b50f4214af5d2ae10e7ac45a5019e9431cc195482d707485378', 'hex'),
  //   ).getPublicKeyString()

  //   const publicKeyJwk = await keyUtils.publicJWKFromPublicKeyHex(issuerPublicKey)

  //   const res = await jsigs.verify(data, {
  //     suite: new EcdsaSecp256k1Signature2019({
  //       key: new EcdsaSecp256k1KeyClass2019({
  //         id: publicKey.id,
  //         controller: publicKey.controller,
  //         publicKeyJwk: publicKeyJwk,
  //       }),
  //     }),
  //     compactProof: false,
  //     documentLoader: EthUtils.documentLoader,
  //     purpose: new AssertionProofPurpose(),
  //     expansionMap: false, // TODO: remove this
  //   })

  //   return res.verified === true
  // } catch {
  //   return false
  // }
}

export const validateVerifiableCredential = genAsyncValidateFn<AtomicVCV1>({
  '@context': Utils.isArrayOfNonEmptyStrings,
  id: Utils.isUndefinedOr(Utils.isNotEmptyString),
  type: [Utils.isArrayOfNonEmptyStrings, (value: any) => value[0] === 'VerifiableCredential'],
  issuer: EthUtils.isValidDID,
  issuanceDate: Utils.isValidRFC3339DateTime,
  expirationDate: Utils.isUndefinedOr(Utils.isValidRFC3339DateTime),
  credentialSubject: [
    isValidOrArrayOf(validateCredentialSubject),
    // TODO: validate rest of credentialSubject based on the `type` array
  ],
  revocation: Utils.isValid(validateCredentialRevocation),
  proof: [Utils.isValid(validateCredentialProof), isCredentialProofValid],
})

const validateProof = genValidateFn<VPProofV1>({
  type: Utils.isNotEmptyString,
  created: Utils.isValidRFC3339DateTime,
  proofPurpose: (value: any) => value === 'authentication',
  verificationMethod: isValidDIDOwner,
  challenge: Utils.isNotEmptyString,
  domain: Utils.isNotEmptyString,
  jws: Utils.isNotEmptyString,
})

const isPresentationProofValid = async (_: any, __: any) => {
  return true

  // try {
  //   const {didDocument} = await EthUtils.resolveDID(stripOwnerFromDID(value.verificationMethod))
  //   const publicKey = didDocument.publicKey[0]

  //   // TODO: Recover public key from JWS
  //   const holderPublicKey = EthWallet.fromPrivateKey(
  //     Buffer.from('c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', 'hex'),
  //   ).getPublicKeyString()

  //   const publicKeyJwk = await keyUtils.publicJWKFromPublicKeyHex(holderPublicKey)

  //   const res = await jsigs.verify(data, {
  //     suite: new EcdsaSecp256k1Signature2019({
  //       key: new EcdsaSecp256k1KeyClass2019({
  //         id: publicKey.id,
  //         controller: publicKey.controller,
  //         publicKeyJwk: publicKeyJwk,
  //       }),
  //     }),
  //     documentLoader: EthUtils.documentLoader,
  //     purpose: new AuthenticationProofPurpose({
  //       challenge: data.proof.challenge,
  //       domain: data.proof.domain,
  //     }),
  //     compactProof: false,
  //     expansionMap: false, // TODO: remove this
  //   })

  //   return res.verified === true
  // } catch {
  //   return false
  // }
}

export const validateVerifiablePresentationV1 = genAsyncValidateFn<VPV1<AtomicVCV1>>({
  '@context': Utils.isArrayOfNonEmptyStrings,
  type: [Utils.isArrayOfNonEmptyStrings, (value: any) => value[0] === 'VerifiablePresentation'],
  verifiableCredential: Utils.isAsyncArrayOf(Utils.isAsyncValid(validateVerifiableCredential)),
  holder: [EthUtils.isValidDID],
  proof: [Utils.isValid(validateProof), isPresentationProofValid],
})
