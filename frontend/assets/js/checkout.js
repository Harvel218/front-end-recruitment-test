class FormValidate {
  constructor (form, options = { classError: 'error' }) {
    this.options = options
    this.form = form
    this.errorMsg = form.querySelector('.ErrorMsg')
  }

  getFields () {
    const inputs = [
      ...this.form.querySelectorAll(
        'input:not(:disabled):not([type="submit"]), select:not(:disabled), textarea:not(:disabled)'
      ),
    ]
    const result = []

    for (const el of inputs) {
      if (el.willValidate) {
        result.push(el)
      }
    }

    return result
  }

  prepareElements () {
    const elements = this.getFields()

    for (const el of elements) {
      let eventName = 'change'
      el.addEventListener(eventName, (e) => this.testInput(e.target))
    }
  }

  testInput (input) {
    const valid = input.checkValidity()
    this.markFieldAsError(input, !valid)
    return valid
  }

  markFieldAsError (field, show) {
    if (show) {
      field.closest('.form__row--data-entry').classList.add('error')
      field.closest('.form__row--data-entry').classList.remove('validated')
    } else {
      field.closest('.form__row--data-entry').classList.remove('error')
      field.closest('.form__row--data-entry').classList.add('validated')
    }
  }

  bindSubmit () {
    this.form.querySelector('.js-checkout-submit').addEventListener('click', (e) => {
      e.preventDefault()

      const elements = this.getFields()

      for (const el of elements) {
        this.markFieldAsError(el, !el.checkValidity())
      }

      if (this.checkFormErrors()) {
        this.sendData(this.form)
      }
    })
  }

  checkFormErrors () {
    const fields = this.getFields()
    const errors = []
    for (const field of fields) {
      const error = field.closest('.error')
      errors.push(error)
    }

    if (errors.every((el) => el === null)) {
      return true
    } else {
      return false
    }
  }

  sendData (form) {
    const url = '/order'
    const data = this.getEnteredData()
    data.resources = form.name
    this.form.querySelector('.js-checkout-submit').disabled = true
    fetch (url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => response.json()).then((data) => {
      const values = Object.keys(data).map((key) => data[key]).flat()
      const message = values.map((value) => {
        return `<span>${value}</span>`
      })

      const popup = document.querySelector('.js-popup')

      popup.innerHTML = message.toString().replace(/\,/g,'')

      if (popup.classList.contains('active')) {
        popup.classList.remove('active')
        setTimeout(() => {
          popup.classList.add('active')
        }, 250)
      } else {
        popup.classList.add('active')
      }
    }).catch((error) => {
      console.error(error)
    })
    this.form.querySelector('.js-checkout-submit').disabled = false
  }

  getEnteredData () {
    const elements = this.getFields()

    const result = {}
    for (const el of elements) {
      result[el.name] = el.value
    }
    return result
  }

  init () {
    this.prepareElements ()
    this.bindSubmit ()
  }
}

function runValidator () {
  const willBeValidated = document.querySelectorAll('.js-checkout-form')
  if (willBeValidated) {
    for (const formEl of willBeValidated) {
      const cfg = {}
      const form = new FormValidate(formEl, cfg)

      form.init()
    }
  }
}

runValidator()
