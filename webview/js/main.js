const vscode = acquireVsCodeApi();

const messages = [
  {
    role: 'system',
    content: "You're a superpowerful ai that knows every programming language and framework. You write api documentation in markdown, you will be provided with a endpoint, a request example in whatever language or framework that user wants, and the response in whatever language or framework that user wants and you will generate the documentation for them.",
  },
  {
    role: 'system',
    content: "The documentation will be written for a generic consumer of the api, so you don't need to worry about the specifics of the api, just the general concepts.",
  },
  {
    role: 'system',
    content: "The example of how to consume the api will be written to use fetch.",
  }
];

document.addEventListener('alpine:init', () => {
  Alpine.store('apiDocGenieStore', {
    token: '',
    form: {
      endpoint: '',
      request: '',
      response: '',
      keywords: '',
    },
  });


  Alpine.data('apiDocGenie', () => {
    const store = Alpine.store('apiDocGenieStore');

    return {
      form: store.form,
      creatingDocumentation: false,
      documentation: '',
      // Generate markdown documentation
      // based on the form data
      generarDocumentation() {
        if (!store.token) {
          vscode.postMessage({
            type: 'apiDocGenie:askSettings',
            payload: {
              info: "You need to provide an OpenAI API key, enter it in the settings openaiToken",
            }
          });
          return;
        }

        this.creatingDocumentation = true;
        const endpoint = this.form.endpoint;
        const request = this.form.request;
        const response = this.form.response;
        const token = store.token;
  
        const userMessages = [
          {
            role: 'user',
            content: `endpoint: ${endpoint ? endpoint : '/generic-endpoint'}`,
          },
          {
            role: 'user',
            content: `request example or how it is built: ${request}`,
          },
          {
            role: 'user',
            content: `response example or how it is built: ${response}`,
          }
        ];

        if (this.form.keywords) {
          userMessages.push({
            role: 'user',
            content: `use this keywords to build the description: ${this.form.keywords}`,
          });
        }
  
        fetch("https://api.openai.com/v1/chat/completions", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [...messages, ...userMessages],
            temperature: 0.0,
            stop: ['\ninfo:']
          })
        })
          .then((response) => response.json())
          .then((data) => {
            this.creatingDocumentation = false;
            this.documentation = data.choices[0].message.content;

            vscode.postMessage({
              type: 'apiDocGenie:showDocumentation',
              payload: {
                documentation: this.documentation,
              }
            });
          })
          .catch((error) => {
            this.creatingDocumentation = false;
            vscode.postMessage({
              type: 'apiDocGenie:showError',
              payload: {
                error: "Error generating documentation",
              }
            });
          });
      },
    };
  });
});

window.addEventListener('message', (event) => {
  const data = event.data;
  const store = Alpine.store('apiDocGenieStore');
  
  switch (data.type) {
    case 'apiDocGenie:token':
      store.token = data.payload.token;
    break;

    case 'apiDocGenie:addToEndpoint':
      store.form.endpoint = data.payload.text;
    break;

    case 'apiDocGenie:addToRequest':
      store.form.request = data.payload.text;
    break;

    case 'apiDocGenie:addToResponse':
      store.form.response = data.payload.text;
    break;
    
    default:
    break;
  }
});