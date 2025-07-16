export class ValidateOptions {
  validateAll(options) {
    options.forEach((option) => {
      const { value, type, instance } = option;

      if (type === "instance") {
        this.validateInstance(value, instance);
      } else if (type === "array") {
        this.validateArray(value);
      } else if (type === "object") {
        this.validateObject(value);
      } else if (type === "function") {
        this.validateFunction(value);
      } else {
        throw new Error(`Cannot validate: ${type}`);
      }
    });
  }

  validateInstance(element, instance) {
    if (typeof instance !== "function") {
      throw new Error(
        `Invalid class reference: ${instance?.name} is not a constructor.`
      );
    }

    if (!(element instanceof instance)) {
      throw new Error(
        `Element must be an instance of ${instance.name}. Got: ${element?.constructor?.name}`
      );
    }
  }

  validateArray(array) {
    if (!Array.isArray(array)) {
      throw new Error(`${array} must be an array.`);
    }
  }

  validateObject(object) {
    if (typeof object !== "object" || object === null) {
      throw new Error(`${object} must be a valid object.`);
    }
  }

  validateFunction(func) {
    if (typeof func !== "function") {
      throw new Error(`${func} must be a valid function.`);
    }
  }
}
