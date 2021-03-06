import * as B from './base'
import {IBaseAttGender} from '../AttestationData'

export const extractGender = (a: B.MaybeDS<IBaseAttGender>, valType: string): string | null => {
  switch (valType) {
    case 'gender':
      if (typeof a === 'string') {
        return a
      } else if (typeof a === 'object' && typeof a.data === 'string') {
        return a.data
      }
      break
    default:
      return null
  }
  return null
}
