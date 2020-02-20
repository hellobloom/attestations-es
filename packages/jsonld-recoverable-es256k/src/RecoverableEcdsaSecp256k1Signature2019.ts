const jsonld = require('jsonld')
const jsigs = require('jsonld-signatures')

import {ISigner, IVerifier, RecoverableEcdsaSecp256k1KeyClass2019} from './RecoverableEcdsaSecp256k1KeyClass2019'

const {LinkedDataSignature} = jsigs.suites

export {LinkedDataSignature}

const requiredKeyType = 'RecoverableEcdsaSecp256k1VerificationKey2019'
const proofSignatureKey = 'jws'
const proofRecoveryKey = 'recoveryId'

export class RecoverableEcdsaSecp256k1Signature2019 extends LinkedDataSignature {
  private alg: string
  private LDKeyClass: any

  private signer: ISigner
  private verifier: IVerifier

  // private verificationMethod: string | undefined

  private key: RecoverableEcdsaSecp256k1KeyClass2019

  /**
   * @param linkedDataSigantureType {string} The name of the signature suite.
   * @param linkedDataSignatureVerificationKeyType {string} The name verification key type for the signature suite.
   *
   * @param alg {string} JWS alg provided by subclass.
   * @param [LDKeyClass] {LDKeyClass} provided by subclass or subclass
   *   overrides `getVerificationMethod`.
   *
   *
   * This parameter is required for signing:
   *
   *
   * @param [date] {string|Date} signing date to use if not passed.
   * @param [key] {LDKeyPair} an optional crypto-ld KeyPair.
   * @param [useNativeCanonize] {boolean} true to use a native canonize
   *   algorithm.
   */
  constructor({key, date, useNativeCanonize}: {key: RecoverableEcdsaSecp256k1KeyClass2019; date?: any; useNativeCanonize?: boolean}) {
    super({
      type: 'EcdsaSecp256k1Signature2019',
      LDKeyClass: RecoverableEcdsaSecp256k1KeyClass2019,
      date,
      useNativeCanonize,
    })
    this.alg = key.alg
    this.LDKeyClass = RecoverableEcdsaSecp256k1KeyClass2019

    const publicKey = key.publicNode()
    this.verificationMethod = publicKey.id
    this.key = key
    this.verifier = key.verifier()
    this.signer = key.signer()
  }

  /**
   * Produces a linked data signature.
   *
   * @param verifyData {Uint8Array}.
   * @param proof {object}
   *
   * @returns {Promise<{object}>} the proof containing the signature value.
   */
  public async sign({verifyData, proof}: any) {
    if (!(this.signer && typeof this.signer.sign === 'function')) {
      throw new Error('A signer API has not been specified.')
    }
    const {jws, recoveryId} = await this.signer.sign({
      data: verifyData,
    })

    proof[proofSignatureKey] = jws
    proof[proofRecoveryKey] = recoveryId
    return proof
  }

  /**
   * Verifies a linked data signature
   *
   * @param verifyData {Uint8Array}.
   * @param verificationMethod {object}.
   * @param document {object} the document the proof applies to.
   * @param proof {object} the proof to be verified.
   * @param purpose {ProofPurpose}
   * @param documentLoader {function}
   * @param expansionMap {function}
   *
   * @returns {Promise<{boolean}>} Resolves with the verification result.
   */
  public async verifySignature({verifyData, verificationMethod, proof}: any) {
    let {verifier} = this

    if (!verifier) {
      const key = await this.LDKeyClass.from(verificationMethod)
      verifier = key.verifier(key, this.alg, this.type)
    }

    const result = await verifier.verify({
      data: Buffer.from(verifyData),
      signature: proof[proofSignatureKey],
      recoveryId: proof[proofRecoveryKey],
    })

    console.log({result})

    return typeof result === 'string'
  }

  /** ensure there is a way to verify */
  public async assertVerificationMethod({verificationMethod}: any) {
    if (!jsonld.hasValue(verificationMethod, 'type', requiredKeyType)) {
      throw new Error(`Invalid key type. Key type must be "${requiredKeyType}".`)
    }
  }

  /** used by linked data signatures and vc libraries */
  public async getVerificationMethod({proof, documentLoader}: any) {
    if (this.key) {
      return this.key.publicNode()
    }

    const verificationMethod = await super.getVerificationMethod({
      proof,
      documentLoader,
    })

    await this.assertVerificationMethod({verificationMethod})
    return verificationMethod
  }

  /** used by linked data signatures and vc libraries */
  public async matchProof({proof, document, purpose, documentLoader, expansionMap}: any) {
    if (
      !(await super.matchProof({
        proof,

        document,
        purpose,

        documentLoader,
        expansionMap,
      }))
    ) {
      return false
    }
    if (!this.key) {
      // no key specified, so assume this suite matches and it can be retrieved
      return true
    }

    const {verificationMethod} = proof

    // only match if the key specified matches the one in the proof
    if (typeof verificationMethod === 'object') {
      return verificationMethod.id === this.key.id
    }
    return verificationMethod === this.key.id
  }
}
