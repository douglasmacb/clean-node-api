import { EmailValidation } from './email-validation'
import { EmailValidator } from '../../protocols'
import { Validation } from './validation'

interface SutTypes {
  sut: Validation
  emailValidatorStub: EmailValidator
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidator()
  const sut = new EmailValidation('email', emailValidatorStub)

  return {
    sut,
    emailValidatorStub
  }
}

describe('SignUp Controller', () => {
  test('Should call EmailValidator with correct email', () => {
    const { sut, emailValidatorStub } = makeSut()

    const isValid = jest.spyOn(emailValidatorStub, 'isValid')
    sut.validate({ email: 'any_email@mail.com' })
    expect(isValid).toHaveBeenCalledWith('any_email@mail.com')
  })

  test('Should throws if EmailValidator throws', () => {
    const { sut, emailValidatorStub } = makeSut()

    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })
    expect(sut.validate).toThrow()
  })
})
