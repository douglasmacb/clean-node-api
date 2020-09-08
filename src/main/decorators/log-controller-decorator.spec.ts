import { LogControllerDecorator } from './log-controller-decorator'
import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols'
import { serverError } from '../../presentation/helpers/http/http-helper'
import { LogErrorRepository } from '../../data/protocols/db/log/log-error-repository'

interface SutTypes {
  sut: LogControllerDecorator
  controllerStub: Controller
  logErrorRepositoryStub: LogErrorRepository
}

const makeController = (): Controller => {
  class ControllerStub implements Controller {
    async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
      const httpResponse: HttpResponse = {
        statusCode: 200,
        body: {
          email: 'any_email@email.com',
          name: 'any_name',
          password: 'any_password',
          passwordConfirmation: 'any_password'
        }
      }
      return new Promise(resolve => resolve(httpResponse))
    }
  }

  return new ControllerStub()
}

const makeSut = (): SutTypes => {
  const controllerStub = makeController()
  const logErrorRepositoryStub = makeLogErrorRepository()
  const sut = new LogControllerDecorator(controllerStub, logErrorRepositoryStub)
  return {
    sut,
    controllerStub,
    logErrorRepositoryStub
  }
}

const makeFakeRequest = (): HttpRequest => {
  return ({
    body: {
      email: 'any_email@email.com',
      name: 'any_name',
      password: 'any_password',
      passwordConfirmation: 'any_password'
    }
  })
}

const makeLogErrorRepository = (): LogErrorRepository => {
  class LogErrorRepositoryStub implements LogErrorRepository {
    async logError (stack: string): Promise<void> {
      return new Promise(resolve => resolve())
    }
  }
  return new LogErrorRepositoryStub()
}

describe('LogController Decorator', () => {
  test('Should call controller handle', async () => {
    const { sut } = makeSut()
    const handleSpy = jest.spyOn(sut, 'handle')

    await sut.handle(makeFakeRequest())
    expect(handleSpy).toHaveBeenCalledWith(makeFakeRequest())
  })

  test('Should call LogErrorRepository with correct error if controller returns a server error', async () => {
    const { sut, controllerStub, logErrorRepositoryStub } = makeSut()

    jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(new Promise(resolve => resolve(makeFakeServerError())))
    const logSpy = jest.spyOn(logErrorRepositoryStub, 'logError')
    await sut.handle(makeFakeRequest())
    expect(logSpy).toHaveBeenCalledWith('any_stack')
  })
})

const makeFakeServerError = (): HttpResponse => {
  const fakeError = new Error()
  fakeError.stack = 'any_stack'
  return serverError(fakeError)
}
