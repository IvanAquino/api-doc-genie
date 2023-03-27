# API Doc Genie

API Doc Genie is a Visual Studio Code extension that streamlines the process of creating API documentation by automatically generating comprehensive and well-structured Markdown files for your API endpoints.

![Interface](https://raw.githubusercontent.com/IvanAquino/api-doc-genie/main/docs/interface.png)

## Video demo

[Youtube](https://youtu.be/m_jCK_3OhJQ)

## Features

* Automatically generate API documentation in Markdown format
* Use the context menu to select code and add it to different fields (endpoint, request example, response example)
* Generate request and response examples or add code to validate requests and build responses
* Easy integration with your existing API projects

## Getting Started

### Installation

1. Open Visual Studio Code
2. Press `Ctrl+P` (`Cmd+P` on macOS) to open the Quick Open dialog
3. Type `ext install api-doc-genie` and press `Enter`
4. Restart Visual Studio Code

### Configuration

To use API Doc Genie, you need to configure your OpenAI API token:

1. Go to File > Preferences > Settings (or press `Ctrl+,` / `Cmd+,`)
2. Search for "API Doc Genie" in the search bar
3. Enter your OpenAI API token in the `api-doc-genie.openaiToken` field: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxx`
4. Save your settings

## Usage

1. Right-click on the selected code in your API project
2. Choose the "API Doc Genie" command from the context menu
3. Select the appropriate option to add the code to the endpoint, request example, or response example
4. API Doc Genie will generate the API documentation in Markdown format


## Contributing

If you want to contribute to this project, feel free to submit issues, open pull requests, or contact the maintainers.

## License

API Doc Genie is licensed under the [MIT License](./LICENSE).