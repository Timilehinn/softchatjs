export enum Errors {
  USER_NOT_INITIATED = 'Unable to call method, call (initializeUser) method first, Err callingfunction: ',
  CONVERSATION_NOT_PREPARED = 'Method newConversation() on conversation was not called'
}

export const buildError = (error: keyof typeof Errors, funcName: string) => {
  return Errors[error]+funcName
}

