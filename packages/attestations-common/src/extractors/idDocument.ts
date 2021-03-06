import * as B from './base'
import {IBaseAttIDDocData, IBaseAttIDDoc} from '../AttestationData'

type TSingleLevelProps = keyof NonNullable<IBaseAttIDDocData> &
  Exclude<keyof NonNullable<IBaseAttIDDocData>, 'biographic' | 'classification' | 'facematch_result' | 'images'>

const singleLevelProps: Array<TSingleLevelProps> = ['date', 'name', 'country', 'document_type', 'authentication_result']
const biographicFields: Array<keyof NonNullable<IBaseAttIDDocData['biographic']> | 'biographic.name'> = [
  'age',
  'dob',
  'expiration_date',
  'biographic.name',
  'gender',
]
const classificationFields: Array<keyof NonNullable<IBaseAttIDDocData['classification']>> = [
  'classification_method',
  'id_type_name',
  'id_class',
  'id_class_name',
  'country_code',
  'issue_date',
  'issuer_name',
  'issue_type',
  '@provider_specific',
]
const facematchResultFields: Array<keyof NonNullable<IBaseAttIDDocData['facematch_result']>> = ['is_match', 'score', 'transaction_id']

export const extractIDDoc = (
  a: IBaseAttIDDoc,
  valType: string,
):
  | IBaseAttIDDocData['facematch_result']
  | IBaseAttIDDocData['biographic']
  | IBaseAttIDDocData['classification']
  | string
  | number
  | null => {
  if (!a.data) {
    return null
  }

  const d = B.getFirst(a.data)

  if (!d) {
    return null
  }

  if (valType === 'object') return d

  // Top level accessors + tests
  if (singleLevelProps.indexOf(valType as any) !== -1 && valType in d) {
    const singleLevelPropVal = d[valType as TSingleLevelProps]
    if (!singleLevelPropVal) {
      return null
    } else if (typeof singleLevelPropVal !== 'string') {
      return B.getNameString(singleLevelPropVal)
    } else {
      return singleLevelPropVal
    }
  }

  // Biographic
  if (valType === 'biographic') return d.biographic || null

  if (biographicFields.indexOf(valType as any) !== -1) {
    if (!d.biographic) {
      return null
    }

    // handle corner case of extracting biographic.name since `name` is also at top level
    if (valType === 'biographic.name' && d.biographic['name']) {
      return B.getNameString(d.biographic['name'])
    }

    if (!(valType in d.biographic)) {
      return null
    }

    return d.biographic[valType as keyof IBaseAttIDDocData['biographic']]
  }

  // Classification
  if (valType === 'classification') return d.classification || null

  if (classificationFields.indexOf(valType as any) !== -1) {
    if (!d.classification || !(valType in d.classification)) {
      return null
    }

    return d.classification[valType as keyof IBaseAttIDDocData['classification']]
  }

  // Facematch result
  if (valType === 'facematch_result') return d.facematch_result || null

  if (facematchResultFields.indexOf(valType as any) !== -1) {
    if (!d.facematch_result || !(valType in d.facematch_result)) {
      return null
    }
    return d.facematch_result[valType as keyof IBaseAttIDDocData['facematch_result']]
  }

  return null
}
