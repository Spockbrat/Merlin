'use strict'

exports.handle = (client) => {
  // Create steps
  const sayHello = client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().helloSent)
    },

    prompt() {
      client.addResponse('welcome')
      client.addResponse('provide/documentation', {
        documentation_link: 'http://docs.init.ai',
      })
      client.addResponse('provide/instructions')

      client.updateConversationState({
        helloSent: true
      })

      client.done()
    }
  })

  const untrained = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addResponse('apology/untrained')
      client.done()
    }
  })

  const collectRetailer = client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().retailer)
    },

    extractInfo() {
      const retailer = client.getFirstEntityWithRole(client.getMessagePart(), 'retailer')

      if (retailer) {
        client.updateConversationState({
          retailer: retailer,
        })

        console.log('User wants information related to:', retailer.value)
      }
    },

    prompt() {
      client.addResponse('prompt/retailer')
      client.done()
    },
  })

  const collectProduct = client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().product)
    },

    prompt() {
      // Need to ask user for product type
      client.done()
    },

  })

  const provideRegulations = client.createStep({
    satisfied() {
      return false
    },

    prompt () {
      //Need to provide regulations
      client.done()
    },
  })

  client.runFlow({
    classifications: {
      // map inbound message classifications to names of streams
    },
    streams: {
      main: 'greeting',
      greeting: [sayHello],
      getRegulations: [collectRetailer, collectProduct, provideRegulations],
    }
    autoResponses: {
      // configure responses to be automatically sent as predicted by the machine learning model
    },
    streams: {
      main: 'onboarding',
      onboarding: [sayHello],
      end: [untrained],
    },
  })
}
