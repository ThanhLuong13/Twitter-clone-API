import express from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import httpStatus from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/schemas/Errors.schema'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req)
    const errors = validationResult(req)
    // Khong co loi
    if (errors.isEmpty()) {
      return next()
    }
    const errorsObj = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorsObj) {
      const { msg } = errorsObj[key]
      // Tra ve loi khong phai do Validate
      if (msg instanceof ErrorWithStatus && msg.status !== httpStatus.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.errors[key] = errorsObj[key]
    }
    // Loi do Validate
    next(entityError)
  }
}
