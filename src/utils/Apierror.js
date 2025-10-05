class Apierror extends Error{
    constructor(
        statuscode,
        message="Something went wrong",
        error=[],
        stack=""
    ){
      super(message)
      this.statuscode=statuscode
      this.data =null
      this.message=message
      this.error=error
      if(stack){
        this.stack=stack
      }
      Error.captureStackTrace(constructor,this.constructor)
    }
}
export {Apierror}