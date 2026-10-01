import type { OperationalFailureCode } from './types'
export class ProviderFailure extends Error {
  constructor(readonly code:OperationalFailureCode, message:string,readonly httpStatus?:number){super(message)}
}
export const failureCode=(error:unknown,fallback:OperationalFailureCode):OperationalFailureCode=>error instanceof ProviderFailure?error.code:fallback
