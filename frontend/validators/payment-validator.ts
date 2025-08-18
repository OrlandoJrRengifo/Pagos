// PATRÓN COMPORTAMIENTO: Chain of Responsibility
// Valida los datos del formulario de pago antes de enviarlos al backend

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

abstract class ValidationHandler {
  protected nextHandler?: ValidationHandler

  setNext(handler: ValidationHandler): ValidationHandler {
    this.nextHandler = handler
    return handler
  }

  handle(data: any): ValidationResult {
    const result = this.validate(data)

    if (!result.isValid || !this.nextHandler) {
      return result
    }

    const nextResult = this.nextHandler.handle(data)
    return {
      isValid: result.isValid && nextResult.isValid,
      errors: [...result.errors, ...nextResult.errors],
    }
  }

  protected abstract validate(data: any): ValidationResult
}

class RequiredFieldsValidator extends ValidationHandler {
  protected validate(data: any): ValidationResult {
    const errors: string[] = []
    const requiredFields = ["ordenId", "usuarioId", "metodoPagoId", "subTotal", "descuento"]

    requiredFields.forEach((field) => {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
        errors.push(`El campo ${field} es requerido`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

class NumericFieldsValidator extends ValidationHandler {
  protected validate(data: any): ValidationResult {
    const errors: string[] = []
    const numericFields = ["ordenId", "usuarioId", "metodoPagoId", "subTotal", "descuento"]

    numericFields.forEach((field) => {
      if (data[field] !== undefined && isNaN(Number(data[field]))) {
        errors.push(`El campo ${field} debe ser un número válido`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

class BusinessRulesValidator extends ValidationHandler {
  protected validate(data: any): ValidationResult {
    const errors: string[] = []

    if (data.subTotal !== undefined && data.subTotal < 0) {
      errors.push("El subtotal no puede ser negativo")
    }

    if (data.descuento !== undefined && data.descuento < 0) {
      errors.push("El descuento no puede ser negativo")
    }

    if (data.moneda && data.moneda.length !== 3) {
      errors.push("La moneda debe tener exactamente 3 caracteres")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

export class PaymentValidationChain {
  private chain: ValidationHandler

  constructor() {
    // Configurar la cadena de validación
    const requiredValidator = new RequiredFieldsValidator()
    const numericValidator = new NumericFieldsValidator()
    const businessValidator = new BusinessRulesValidator()

    requiredValidator.setNext(numericValidator).setNext(businessValidator)
    this.chain = requiredValidator
  }

  validate(data: any): ValidationResult {
    return this.chain.handle(data)
  }
}
