import { HttpRequest, HttpResponse, Controller, EmailValidator } from '../../protocols'
import { badRequest } from '../../helpers/http-helper'
import { MissingParamError, InvalidParamError } from '../../errors'

export class LoginController implements Controller {
  private readonly emailValidator: EmailValidator

  constructor (emailValidator: EmailValidator) {
    this.emailValidator = emailValidator
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const { email, password } = httpRequest.body

    if (!email) {
      return new Promise(resolve => resolve(badRequest(new MissingParamError('email'))))
    }
    if (!password) {
      return new Promise(resolve => resolve(badRequest(new MissingParamError('password'))))
    }
    const isValid = this.emailValidator.isValid(email)

    if (!isValid) {
      return new Promise(resolve => resolve(badRequest(new InvalidParamError('email'))))
    }
  }
}
